import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getLessonById } from "@/lib/lessons/registry";
import { getCoachRubricForLesson } from "@/lib/coach-rubric";
import { buildRubricPromptSection } from "@/lib/coach-rubric/build-prompt";
import { applyRubricCoverageGate } from "@/lib/coach-teach-coverage";
import { sanitizeCoachMessage } from "@/lib/sanitize-coach-message";
import { COACH_MODEL } from "@/lib/coach-model";
import { getOpenAiApiKey } from "@/lib/openai-config";
import type { TeachEvaluateResult } from "@/types/record";
import { COACH_COMPLETE_CLOSING_MESSAGE } from "@/lib/coach-complete-celebration";

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
      "complete時は固定文「分かりやすい！教えてくれてありがとう！😊」のみ。言い返し不要",
    ),
  followUpQuestion: z
    .string()
    .nullable()
    .describe("followup時: 知らない人が聞く自然な質問を1つだけ"),
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

const TEACH_EVALUATE_SYSTEM = `あなたはLOBlossomのAIコーチです。英語を知らない人として、ユーザーから教えてもらい、理解度を確認します。

【役割】
- 先生として採点しない。「教えてもらった人」として反応する
- ユーザーの言葉を尊重し、必要以上に難しい言い換えをしない
- 小学5年生にも分かるやさしい日本語を使う

【追加質問 — 重要】
- 初回質問「いちばん大事なこと」への回答では、be動詞レッスンの重要項目（am/is/areの具体的な使い分け、否定文、疑問文）が説明されているか必ず確認する
- 「主語によって使い分ける」だけで、I→am / he,she→is / you,we,they→are 等の具体例がなければ **complete にしない**。followup で1つだけ聞く
- すでに説明できている内容は聞き直さない。未確認・不足している重要項目を1つだけ優先する
- 明らかな誤解、mustUnderstand未達、誤解があるとき followup
- 1回につき1テーマ・1質問だけ
- 本当にすべての重要項目が説明できているときだけ complete（追加質問0回でよい）
- 抽象的な質問NG（「詳しく説明して」等）

【complete の終わり方】
closingMessage は必ず次の1文だけ：
「分かりやすい！教えてくれてありがとう！😊」
ユーザーの内容を言い返さない。別の終了文を作らない。

【teach】
- followUpCount が既に1のとき、または追加質問への回答後は followup 禁止
- やさしい言葉で正しい内容を教える。ユーザーを行き止まりにしない

【意味不明な回答】
- 1文字、記号のみ、質問と無関係 → outcome=teach または followup せず teach（ただしクライアント pre-check 済み想定）`;

function buildTeachEvaluateInput(req: TeachEvaluateRequest): string {
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

  lines.push(
    "",
    "【出力ルール】",
    "- 初回回答で am/is/are に触れているが具体的な使い分け（I→am 等）がなければ followup",
    "- 否定文・疑問文が説明されていなければ complete にしない（未確認項目を1つ followup）",
    "- 追加質問は最大1回。追加質問への回答後は complete または teach のみ（followup 禁止）",
    "- followUpCount が 1、または追加質問への回答なら outcome は complete か teach のみ",
    "- followup のとき followUpQuestion は1つ、targetRubricPointId を rubric の id で返す",
    "- complete のとき closingMessage は「分かりやすい！教えてくれてありがとう！😊」のみ。followUpQuestion は null",
  );

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
  let targetRubricPointId = parsed.targetRubricPointId?.trim() || null;

  if (followUpCount >= 1 && outcome === "followup") {
    outcome = "complete";
    followUpQuestion = null;
  }

  if (
    targetRubricPointId &&
    rubricPointIds.size > 0 &&
    !rubricPointIds.has(targetRubricPointId)
  ) {
    targetRubricPointId = null;
  }

  if (outcome === "followup" && !followUpQuestion) {
    outcome = "teach";
  }

  return {
    outcome,
    paraphrase: parsed.paraphrase?.trim() || null,
    closingMessage:
      outcome === "complete"
        ? sanitizeCoachMessage(COACH_COMPLETE_CLOSING_MESSAGE)
        : parsed.closingMessage
          ? sanitizeCoachMessage(parsed.closingMessage)
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
  const response = await client.responses.parse({
    model: COACH_MODEL,
    instructions: TEACH_EVALUATE_SYSTEM,
    input: inputParts.join("\n"),
    text: {
      format: zodTextFormat(TeachEvaluateSchema, "teach_evaluate"),
    },
  });

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error("Failed to parse teach evaluation");
  }

  const enforced = enforceFollowUpLimitForTest(
    parsed,
    req.followUpCount,
    rubricPointIds,
  );

  const userTexts = [
    ...req.conversationHistory
      .filter((t) => t.role === "user")
      .map((t) => t.text),
    req.userAnswer,
  ];

  const gated = applyRubricCoverageGate(
    enforced,
    rubric ?? null,
    userTexts,
    {
      isInitialAnswer: !req.isFollowUpAnswer,
      isFollowUpAnswer: req.isFollowUpAnswer,
      activeRubricPointId: req.currentRubricPointId,
    },
    req.followUpCount,
  );

  if (req.isFollowUpAnswer && gated.outcome === "followup") {
    return {
      outcome: "complete",
      paraphrase: gated.paraphrase ?? null,
      closingMessage: sanitizeCoachMessage(COACH_COMPLETE_CLOSING_MESSAGE),
      followUpQuestion: null,
      targetRubricPointId: gated.targetRubricPointId ?? null,
      teachContent: null,
    };
  }

  return {
    outcome: gated.outcome,
    paraphrase: gated.paraphrase ?? null,
    closingMessage:
      gated.outcome === "complete"
        ? sanitizeCoachMessage(COACH_COMPLETE_CLOSING_MESSAGE)
        : gated.closingMessage ?? null,
    followUpQuestion: gated.followUpQuestion ?? null,
    targetRubricPointId: gated.targetRubricPointId ?? null,
    teachContent: gated.teachContent ?? null,
  };
}
