import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getLessonById } from "@/lib/lessons/registry";
import type { LessonSummaryConfig } from "@/lib/lessons/types";
import {
  POINTS_ID,
  UNCLEAR_CHOICE_ID,
  UNCLEAR_DETAIL_ID,
  USER_EXAMPLE_ID,
} from "@/lib/lessons/types";
import {
  getFinalSummarySections,
  getUnclearQuestionText,
} from "@/lib/summary-fields";
import {
  buildExplainToUnderstandPolicy,
  buildGrade5LearnerLanguagePolicy,
  buildUnknownQuestionAnswerLengthPolicy,
} from "@/lib/coach-explain-policy";
import { clipUnknownQuestionAnswer } from "@/lib/clip-unknown-question-answer";
import { sanitizeCoachMessage } from "@/lib/sanitize-coach-message";
import { COACH_MODEL } from "@/lib/coach-model";
import { logPerfElapsed, perfLog, startPerfTimer } from "@/lib/perf-log";
import { getValidUserExample } from "@/lib/answer-quality";
import {
  applyUserExampleCheck,
  buildUserExampleCheckInstructions,
} from "@/lib/user-example-check";
import { getOpenAiApiKey } from "@/lib/openai-config";
import {
  buildRubricPromptSection,
  buildStructuredEvalRulesSection,
} from "@/lib/coach-rubric/build-prompt";
import { normalizeStructuredEvaluation } from "@/lib/coach-rubric/normalize-eval";
import type { CoachRubric } from "@/lib/coach-rubric/types";
import type { AiEvaluation, LabeledAnswer } from "@/types/record";

const PolishedEntrySchema = z.object({
  id: z.string(),
  polishedAnswer: z
    .string()
    .nullable()
    .describe("意味を変えず読みやすく整えた文章。整え不要ならnull"),
});

export const CoachEvaluationSchema = z.object({
  overallMessage: z
    .string()
    .describe(
      "やさしい日本語での総評。2〜4文。できている点を中心に。無理に褒めすぎない",
    ),
  strengths: z
    .array(z.string())
    .describe("理解できている点。具体的に1件以上"),
  gaps: z
    .array(z.string())
    .describe(
      "一部不足している点。本当に不足があるときだけ。なければ空配列 []",
    ),
  misconceptions: z
    .array(z.string())
    .describe(
      "誤解している点。本当に誤解があるときだけ。なければ空配列 []",
    ),
  nextQuestion: z
    .string()
    .nullable()
    .describe("使わない。必ず null"),
  overallLevel: z
    .enum(["understood", "partial", "misconception", "insufficient"])
    .describe(
      "understood=十分理解、partial=一部不足、misconception=誤解あり、insufficient=判断不能",
    ),
  polishedEntries: z.array(PolishedEntrySchema),
  hasPolish: z.boolean(),
  unclearAdvice: z
    .string()
    .nullable()
    .describe("使わない。必ず null。疑問への回答は unknownQuestionAnswer に書く"),
  unknownQuestionAnswer: z
    .string()
    .nullable()
    .describe(
      "ユーザーが書いた「分からなかったところ」への回答。基本1〜2文。最大3文。新しい情報がないなら次の文を書かない。同じ意味の言い換え禁止。励まし・締め禁止。疑問がなければ必ず null",
    ),
  userExampleCheck: z
    .object({
      isCorrect: z
        .boolean()
        .describe(
          "英文として文法的に正しいなら true。好みや自然さだけで false にしない。レッスン文法を使っていないことだけで false にしない",
        ),
      correctedExample: z
        .string()
        .nullable()
        .describe(
          "isCorrect が false のときだけ、誤りを最小限直した正しい英文。true のときは必ず null",
        ),
      errorReason: z
        .string()
        .nullable()
        .describe(
          "isCorrect が false のときだけ、やさしい日本語で簡潔な理由。true のときは必ず null",
        ),
    })
    .nullable()
    .describe("自作例文の文法チェック。例文がなければ null"),
});

export type CoachEvaluationResult = z.infer<typeof CoachEvaluationSchema>;

function entryMap(entries: LabeledAnswer[]): Record<string, string> {
  return Object.fromEntries(entries.map((e) => [e.id, e.answer]));
}

function buildSummaryPrompt(
  lessonTitle: string,
  config: LessonSummaryConfig,
  summaryEntries: LabeledAnswer[],
): string {
  const map = entryMap(summaryEntries);
  const lines: string[] = [`レッスン名：${lessonTitle}`, ""];

  const meaningFields = config.meaningFields ?? [];
  if (meaningFields.length > 0) {
    for (const field of meaningFields) {
      lines.push(`【${field.label}】`);
      lines.push(map[field.id] ?? "（未入力）");
      lines.push("");
    }
  }

  if (meaningFields.length === 0 || config.meaningSentences.length > 0) {
    lines.push(`【${config.sectionLabels.meaning}】`);
    for (const s of config.meaningSentences) {
      lines.push(`（${s.kind}）英文：${s.sentence}`);
      lines.push(`ユーザーの意味：${map[s.id] ?? "（未入力）"}`);
      lines.push("");
    }
  }

  lines.push(`【${config.sectionLabels.usage}】`);
  for (const field of config.usageFields) {
    lines.push(`${field.label}：${map[field.id] ?? "（未入力）"}`);
  }
  lines.push("");

  for (const field of config.extraFields) {
    lines.push(`【${field.label}】`);
    lines.push(map[field.id] ?? "（未入力）");
    lines.push("");
  }

  const unclearChoice = map[UNCLEAR_CHOICE_ID];
  if (unclearChoice === "yes") {
    lines.push(`【${config.sectionLabels.unclear}】`);
    lines.push(map[UNCLEAR_DETAIL_ID] ?? "（未入力）");
  } else {
    lines.push(`【${config.sectionLabels.unclear}】なし`);
  }
  lines.push("");

  if (config.includePointsInTrajectory !== false) {
    lines.push(`【${config.sectionLabels.points}】`);
    lines.push(map[POINTS_ID] ?? "（未入力）");
    lines.push("");
  }

  lines.push(`【${config.sectionLabels.userExample}】`);
  for (const ex of config.userExampleFields) {
    lines.push(`${ex.label}：${map[ex.id] ?? "（未入力）"}`);
  }
  if (map[USER_EXAMPLE_ID]?.trim()) {
    lines.push(`（旧形式）${map[USER_EXAMPLE_ID]}`);
  }

  return lines.join("\n");
}

function getPolishFieldIds(
  config: LessonSummaryConfig,
  summaryEntries: LabeledAnswer[],
): string[] {
  const map = entryMap(summaryEntries);
  const ids = [
    ...config.meaningSentences.map((s) => s.id),
    ...(config.meaningFields ?? []).map((f) => f.id),
    ...config.usageFields.map((f) => f.id),
    ...config.extraFields.map((f) => f.id),
    ...(config.includePointsInTrajectory !== false ? [POINTS_ID] : []),
  ];
  if (map[UNCLEAR_CHOICE_ID] === "yes") {
    ids.push(UNCLEAR_DETAIL_ID);
  }
  return ids;
}

function buildUnknownQuestionInstructions(question: string | null): string {
  if (!question) {
    return [
      "【分からなかったところへの回答】",
      "- ユーザーは疑問を書いていない。unknownQuestionAnswer は必ず null",
      "- unclearAdvice も必ず null",
      "- 疑問への説明を作らない",
    ].join("\n");
  }
  return [
    "【分からなかったところへの回答】",
    "- ユーザーが次の疑問を書いた。unknownQuestionAnswer に、その疑問だけに直接答える",
    `- 疑問：${question}`,
    "- 評価（strengths / gaps / overallMessage）と混ぜない。答えは unknownQuestionAnswer だけに書く",
    "- overallMessage で「理解が不足しています」だけで終わらせない",
    "- 専門用語はなるべく避ける。使う場合は短い説明を添える",
    "- unclearAdvice は必ず null",
    "",
    buildExplainToUnderstandPolicy(),
    "",
    buildUnknownQuestionAnswerLengthPolicy(),
  ].join("\n");
}

function buildEvaluateInstructions(
  basePrompt: string,
  hasRubric: boolean,
  lessonId: string,
  originalExample: string | null,
  unclearQuestion: string | null,
): string {
  const exampleCheck = buildUserExampleCheckInstructions(
    lessonId,
    originalExample,
  );
  const unknownQuestion = buildUnknownQuestionInstructions(unclearQuestion);
  if (!hasRubric) {
    return [
      basePrompt,
      "",
      buildGrade5LearnerLanguagePolicy(),
      "",
      unknownQuestion,
      "",
      exampleCheck,
    ].join("\n");
  }
  return [
    basePrompt,
    "",
    buildStructuredEvalRulesSection(),
    "",
    "【構造化フィールドの出力】",
    "- strengths: 理解できている点（必ず1件以上）",
    "- gaps: 不足があるときだけ。なければ []",
    "- misconceptions: 誤解があるときだけ。なければ []",
    "- nextQuestion: 必ず null。追加の質問は作らない",
    "- overallLevel が understood のとき gaps=[] misconceptions=[] nextQuestion=null",
    "- 意味不明・1文字・質問と無関係な入力は overallLevel=insufficient、strengths=[]",
    "- overallMessage は strengths を要約したやさしい総評にもする",
    "",
    buildGrade5LearnerLanguagePolicy(),
    "",
    unknownQuestion,
    "",
    exampleCheck,
  ].join("\n");
}

function buildEvaluateInput(
  lessonTitle: string,
  config: LessonSummaryConfig,
  summaryEntries: LabeledAnswer[],
  rubric: CoachRubric | undefined,
): string {
  const summarySection = buildSummaryPrompt(lessonTitle, config, summaryEntries);
  if (!rubric) {
    return summarySection;
  }
  return [
    buildRubricPromptSection(rubric),
    "",
    "【ユーザーのまとめ】",
    summarySection,
  ].join("\n");
}

export async function evaluateSummary(
  lessonId: string,
  lessonTitle: string,
  summaryEntries: LabeledAnswer[],
): Promise<AiEvaluation> {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    throw new Error(`Unknown lessonId: ${lessonId}`);
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const filled = summaryEntries.filter((a) => a.answer.trim());
  if (filled.length === 0) {
    throw new Error("No summary entries provided");
  }

  const config = lesson.summary;
  const rubric = lesson.coach.rubric;
  const originalExample = getValidUserExample(entryMap(summaryEntries));
  const unclearQuestion = getUnclearQuestionText(summaryEntries);
  const client = new OpenAI({ apiKey });

  const response = await client.responses.parse({
    model: COACH_MODEL,
    instructions: buildEvaluateInstructions(
      lesson.coach.evaluateSystemPrompt,
      Boolean(rubric),
      lessonId,
      originalExample,
      unclearQuestion,
    ),
    input: buildEvaluateInput(lessonTitle, config, summaryEntries, rubric),
    text: {
      format: zodTextFormat(CoachEvaluationSchema, "coach_evaluation"),
    },
  });

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error("Failed to parse AI evaluation");
  }

  const overallMessage = sanitizeCoachMessage(parsed.overallMessage);
  const unknownQuestionAnswer = unclearQuestion
    ? clipUnknownQuestionAnswer(
        sanitizeCoachMessage(parsed.unknownQuestionAnswer?.trim() ?? ""),
      )
    : null;

  const polishIds = new Set(getPolishFieldIds(config, summaryEntries));

  const structured = normalizeStructuredEvaluation({
    strengths: parsed.strengths,
    gaps: parsed.gaps,
    misconceptions: parsed.misconceptions,
    nextQuestion: parsed.nextQuestion,
    overallLevel: parsed.overallLevel,
  });

  const exampleApplied = applyUserExampleCheck(
    originalExample,
    parsed.userExampleCheck,
  );

  const evaluation: AiEvaluation = {
    overallMessage,
    corrections: [],
    polishedEntries: parsed.polishedEntries.filter((p) => polishIds.has(p.id)),
    hasPolish: parsed.hasPolish,
    unclearAdvice: null,
    unknownQuestionAnswer,
    evaluatedAt: new Date().toISOString(),
    strengths: structured.strengths,
    gaps: structured.gaps,
    misconceptions: structured.misconceptions,
    nextQuestion: null,
    overallLevel: structured.overallLevel,
    userExampleCheck: exampleApplied.display,
  };

  return evaluation;
}

const FinalizeSchema = z.object({
  entries: z.array(
    z.object({
      id: z.string(),
      polishedAnswer: z.string(),
    }),
  ),
});

export type FinalizeResult = {
  finalSummary: LabeledAnswer[];
};

export async function finalizeSummary(
  lessonId: string,
  summaryEntries: LabeledAnswer[],
  aiEvaluation: AiEvaluation,
  coachAnswer: string | null,
  _exampleForTranslation?: string | null,
): Promise<FinalizeResult> {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    throw new Error(`Unknown lessonId: ${lessonId}`);
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const sectionDefs = getFinalSummarySections(lessonId);
  const fieldIds = sectionDefs.map((s) => s.id);
  const config = lesson.summary;

  const promptParts = [
    buildSummaryPrompt(lesson.meta.title, config, summaryEntries),
    "",
    "【AI評価】",
    aiEvaluation.overallMessage,
    "",
  ];

  if (coachAnswer?.trim()) {
    promptParts.push("【Step5：誰かに教えるつもりで書いた説明】");
    promptParts.push(coachAnswer.trim());
    promptParts.push("");
  }

  promptParts.push("【出力】");
  promptParts.push("- id: final-my-summary の1項目だけ");
  promptParts.push("- 復習ノートとして後から見返せる要点だけ。評価コメントは書かない");
  promptParts.push("- ユーザーの自作例文はまとめ本文に入れない");

  const client = new OpenAI({ apiKey });
  const openaiStartedAt = startPerfTimer();
  perfLog("finalize", "openai start");
  const response = await client.responses.parse({
    model: COACH_MODEL,
    instructions: lesson.coach.finalizeInstructions,
    input: promptParts.join("\n"),
    text: {
      format: zodTextFormat(FinalizeSchema, "final_summary"),
    },
  });
  logPerfElapsed("finalize", "openai", openaiStartedAt);

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error("Failed to parse final summary");
  }

  const labelFor = (id: string): string =>
    sectionDefs.find((s) => s.id === id)?.label ?? id;

  return {
    finalSummary: parsed.entries
      .filter((e) => fieldIds.includes(e.id) && e.polishedAnswer.trim())
      .map((e) => ({
        id: e.id,
        label: labelFor(e.id),
        answer: sanitizeCoachMessage(e.polishedAnswer),
      })),
  };
}
