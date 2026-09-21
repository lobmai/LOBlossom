import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getLessonById } from "@/lib/lessons/registry";
import { getCoachRubricForLesson } from "@/lib/coach-rubric";
import { buildRubricPromptSection } from "@/lib/coach-rubric/build-prompt";
import {
  applyMeaningCheckFollowUpGate,
  getLessonExampleSentences,
  MEANING_CHECK_OK_CLOSING,
} from "@/lib/meaning-check-follow-up";
import { sanitizeCoachMessage } from "@/lib/sanitize-coach-message";
import { COACH_MODEL } from "@/lib/coach-model";
import { getOpenAiApiKey } from "@/lib/openai-config";
import type { TeachEvaluateResult } from "@/types/record";
import {
  buildExplainToUnderstandPolicy,
  buildFollowUpQuestionPolicy,
} from "@/lib/coach-explain-policy";
import { logPerfElapsed, perfLog, startPerfTimer } from "@/lib/perf-log";

export const TeachEvaluateSchema = z.object({
  outcome: z
    .enum(["complete", "followup", "teach"])
    .describe(
      "complete=十分理解、followup=重要な不足が1つある、teach=これ以上追加質問しない",
    ),
  paraphrase: z
    .string()
    .nullable()
    .describe("ユーザーが教えてくれた内容を短く言い返す。complete/teach時"),
  closingMessage: z
    .string()
    .nullable()
    .describe(
      "complete時: 2問目正解なら「わかった！教えてくれてありがとう！😊」。言い返し不要",
    ),
  followUpSentence: z
    .string()
    .nullable()
    .describe(
      "followup時: そのレッスンで習った範囲の短い英文を1つ。未習文法は入れない",
    ),
  followUpQuestion: z
    .string()
    .nullable()
    .describe(
      "followup時: 「この文はどんな意味？」のみ。抽象質問は禁止",
    ),
  targetRubricPointId: z
    .string()
    .nullable()
    .describe("followup/teach時: rubric point id"),
  teachContent: z
    .string()
    .nullable()
    .describe("teach時: やさしい正しい説明（小学5年生向け）"),
});

export type TeachEvaluateRequest = {
  lessonId: string;
  initialQuestion: string;
  userAnswer: string;
  followUpCount: number;
  conversationHistory: { role: "coach" | "user"; text: string }[];
  isFollowUpAnswer: boolean;
  currentRubricPointId?: string;
};

const LESSON01_ID = "lesson-01-be-verb";

const TEACH_EVALUATE_SYSTEM_SHARED = `あなたはLOBlossomのAIコーチです。英語を知らない人として、ユーザーから教えてもらい、理解度を確認します。

【役割】
- 先生として採点しない。「教えてもらった人」として反応する
- ユーザーの言葉を尊重し、必要以上に難しい言い換えをしない
- 小学5年生にも分かるやさしい日本語を使う`;

const TEACH_EVALUATE_SYSTEM_LESSON01_RULES = `【1問目の見方】
- 初回質問「いちばん大事なこと」への回答では、be動詞レッスンの重要項目（am/is/areの具体的な使い分け、否定文、疑問文）を見る
- 「主語によって使い分ける」だけで、I→am / he,she→is / you,we,they→are 等の具体例がなくても、2問目は英文の意味確認にする
- 1問目の回答だけに英文を無理に合わせない`;

const TEACH_EVALUATE_SYSTEM_RUBRIC_RULES = `【1問目の見方】
- 初回質問への回答では、入力の評価基準（rubric）の重要項目を見る
- 評価基準に書かれた項目だけで判断する。別レッスンの内容は確認しない
- 1問目の回答だけに英文を無理に合わせない
- followup / teach の targetRubricPointId は、評価基準にある id だけを使う`;

const TEACH_EVALUATE_SYSTEM_TAIL = `【complete の終わり方】
2問目で英文の意味を大きく理解できていたら complete。
closingMessage は必ず次の1文だけ：
「わかった！教えてくれてありがとう！😊」
採点しない。「その意味でOK」「正解」は言わない。
ユーザーの内容を言い返さない。別の終了文を作らない。

【teach】
- followUpCount が既に1のとき、または2問目への回答後は followup 禁止
- ユーザーを行き止まりにしない
- 意味を大きく間違えていたときだけ、分からない人として「ここがまだよく分からないんだけど、〜っていう意味？」と短く聞く
- 新しい英文は出さない。3問目は出さない
- teachContent は共通の説明方針に従う
- 学習者に見せる文（teachContent / followUpQuestion / paraphrase）は小学5年生でも分かる言葉

${buildExplainToUnderstandPolicy()}

${buildFollowUpQuestionPolicy()}

【意味不明な回答】
- 1文字、記号のみ、質問と無関係 → outcome=teach または followup せず teach（ただしクライアント pre-check 済み想定）`;

/** @internal 回帰テスト用 */
export function getTeachEvaluateSystemPrompt(lessonId: string): string {
  const extra =
    lessonId === LESSON01_ID
      ? TEACH_EVALUATE_SYSTEM_LESSON01_RULES
      : TEACH_EVALUATE_SYSTEM_RUBRIC_RULES;
  return [TEACH_EVALUATE_SYSTEM_SHARED, extra, TEACH_EVALUATE_SYSTEM_TAIL].join(
    "\n\n",
  );
}

const TEACH_EVALUATE_INPUT_RULES_LESSON01 = [
  "- 1問目では be動詞レッスンの重要項目（am/is/are、I→am など）を見る",
  "- 2問目の英文は be動詞の範囲だけを使う。未習文法は入れない",
];

const TEACH_EVALUATE_INPUT_RULES_RUBRIC = [
  "- 1問目では評価基準の重要項目を見る",
  "- 評価基準にない別レッスンの項目は確認しない",
  "- 2問目の英文は、このレッスンで習った範囲だけを使う。未習文法は入れない",
];

const TEACH_EVALUATE_INPUT_RULES_SHARED = [
  "- 追加質問は最大1回。2問目への回答後は complete または teach のみ（followup 禁止）",
  "- followUpCount が 1、または2問目への回答なら outcome は complete か teach のみ",
  "- 初回回答（followUpCount 0）は followup。followUpSentence にそのレッスンの短い英文を1つ書く",
  "- followUpQuestion は「この文はどんな意味？」だけ。抽象質問は禁止",
  "- 2問目の回答は一字一句の和訳ではなく、意味を大きく理解していれば complete",
  "- complete のとき closingMessage は「わかった！教えてくれてありがとう！😊」のみ。followUpQuestion は null",
];

/** @internal 回帰テスト用 */
export function buildTeachEvaluateInput(req: TeachEvaluateRequest): string {
  const lines: string[] = [
    `【初回の質問】`,
    req.initialQuestion,
    "",
    `【今回のユーザー回答】`,
    req.userAnswer,
    "",
    `【追加質問済み回数】${req.followUpCount} / 1`,
    `【追加質問への回答か】${req.isFollowUpAnswer ? "はい" : "いいえ"}`,
  ];

  if (req.currentRubricPointId) {
    lines.push(`【確認中の rubric point】${req.currentRubricPointId}`);
  }

  if (req.conversationHistory.length > 0) {
    lines.push("", "【これまでの会話】");
    for (const turn of req.conversationHistory) {
      lines.push(`${turn.role === "coach" ? "AI" : "ユーザー"}：${turn.text}`);
    }
  }

  const lesson = getLessonById(req.lessonId);
  if (lesson?.taughtTopics.length) {
    lines.push("", "【このレッスンで習ったこと】");
    for (const topic of lesson.taughtTopics) {
      lines.push(`- ${topic}`);
    }
  }

  const exampleSentences = getLessonExampleSentences(req.lessonId);
  if (exampleSentences.length > 0) {
    lines.push("", "【このレッスンの英文例（参考。このまま使っても、近い短い文を作ってもよい）】");
    for (const sentence of exampleSentences.slice(0, 6)) {
      lines.push(`- ${sentence}`);
    }
  }

  const lessonRules =
    req.lessonId === LESSON01_ID
      ? TEACH_EVALUATE_INPUT_RULES_LESSON01
      : TEACH_EVALUATE_INPUT_RULES_RUBRIC;

  lines.push("", "【出力ルール】", ...lessonRules, ...TEACH_EVALUATE_INPUT_RULES_SHARED);

  return lines.join("\n");
}

/** @internal 回帰テスト用 */
export function enforceFollowUpLimitForTest(
  parsed: z.infer<typeof TeachEvaluateSchema>,
  followUpCount: number,
  rubricPointIds: Set<string>,
): TeachEvaluateResult {
  let outcome = parsed.outcome;
  let followUpQuestion = parsed.followUpQuestion?.trim() || null;
  let followUpSentence = parsed.followUpSentence?.trim() || null;
  let targetRubricPointId = parsed.targetRubricPointId?.trim() || null;

  if (followUpCount >= 1 && outcome === "followup") {
    outcome = "complete";
    followUpQuestion = null;
    followUpSentence = null;
  }

  if (
    targetRubricPointId &&
    rubricPointIds.size > 0 &&
    !rubricPointIds.has(targetRubricPointId)
  ) {
    targetRubricPointId = null;
  }

  return {
    outcome,
    paraphrase: parsed.paraphrase?.trim() || null,
    closingMessage:
      outcome === "complete"
        ? sanitizeCoachMessage(MEANING_CHECK_OK_CLOSING)
        : parsed.closingMessage
          ? sanitizeCoachMessage(parsed.closingMessage)
          : null,
    followUpSentence: followUpSentence
      ? sanitizeCoachMessage(followUpSentence)
      : null,
    followUpQuestion: followUpQuestion
      ? sanitizeCoachMessage(followUpQuestion)
      : null,
    targetRubricPointId,
    teachContent: parsed.teachContent
      ? sanitizeCoachMessage(parsed.teachContent)
      : null,
  };
}

export async function evaluateTeachAnswer(
  req: TeachEvaluateRequest,
): Promise<TeachEvaluateResult> {
  const lesson = getLessonById(req.lessonId);
  if (!lesson) {
    throw new Error(`Unknown lessonId: ${req.lessonId}`);
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const rubric = getCoachRubricForLesson(req.lessonId);
  const rubricPointIds = new Set(rubric?.points.map((p) => p.id) ?? []);

  const inputParts: string[] = [];
  if (rubric) {
    inputParts.push(buildRubricPromptSection(rubric));
    inputParts.push("");
  }
  inputParts.push(buildTeachEvaluateInput(req));

  const client = new OpenAI({ apiKey });
  const openaiStartedAt = startPerfTimer();
  perfLog("teach-evaluate", "openai start");
  const response = await client.responses.parse({
    model: COACH_MODEL,
    instructions: getTeachEvaluateSystemPrompt(req.lessonId),
    input: inputParts.join("\n"),
    text: {
      format: zodTextFormat(TeachEvaluateSchema, "teach_evaluate"),
    },
  });
  logPerfElapsed("teach-evaluate", "openai", openaiStartedAt);

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error("Failed to parse teach evaluation");
  }

  const enforced = enforceFollowUpLimitForTest(
    parsed,
    req.followUpCount,
    rubricPointIds,
  );

  const gated = applyMeaningCheckFollowUpGate(enforced, req.lessonId, {
    isFollowUpAnswer: req.isFollowUpAnswer,
    followUpCount: req.followUpCount,
  });

  return {
    outcome: gated.outcome,
    paraphrase: gated.paraphrase ?? null,
    closingMessage:
      gated.outcome === "complete"
        ? sanitizeCoachMessage(MEANING_CHECK_OK_CLOSING)
        : gated.closingMessage
          ? sanitizeCoachMessage(gated.closingMessage)
          : null,
    followUpSentence: gated.followUpSentence ?? null,
    followUpQuestion:
      gated.outcome === "followup" && gated.followUpQuestion
        ? sanitizeCoachMessage(gated.followUpQuestion)
        : null,
    targetRubricPointId: gated.targetRubricPointId ?? null,
    teachContent: gated.teachContent
      ? sanitizeCoachMessage(gated.teachContent)
      : null,
  };
}
