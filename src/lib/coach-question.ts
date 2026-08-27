import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getLessonById } from "@/lib/lessons/registry";
import { COACH_MODEL } from "@/lib/coach-model";
import { getOpenAiApiKey } from "@/lib/openai-config";
import type { AiEvaluation, LabeledAnswer } from "@/types/record";

export const CoachQuestionSchema = z.object({
  question: z.string(),
  keywords: z.array(z.string()).min(2).max(4),
});

export type CoachQuestionResult = z.infer<typeof CoachQuestionSchema>;

function buildQuestionSystemPrompt(taughtTopics: string[]): string {
  return `あなたはLOBlossomのAIコーチです。英語初学者向けに、レッスンで実際に教えた内容だけについて「自分の言葉で説明する」ための質問を1つ作ります。

【出題範囲 — レッスンで教えた内容だけ】
${taughtTopics.map((t) => `- ${t}`).join("\n")}

【質問の作り方】
- 質問は1つだけ、短く、具体的な日本語
- NG：レッスンで教えていない内容
- NG：複数のことを一度に要求する質問
- ユーザーのまとめと評価を参考に、弱いポイント1つに絞る

【keywords】
- 2〜4個。質問に答えるために必要な英単語・キーワード`;
}

function buildQuestionPrompt(
  lessonTitle: string,
  summaryEntries: LabeledAnswer[],
  aiEvaluation: AiEvaluation,
): string {
  const summary = summaryEntries
    .filter((a) => a.answer.trim() && a.id !== "unclear-choice")
    .map((a) => `・${a.label}：${a.answer}`)
    .join("\n");

  return `レッスン名：${lessonTitle}

【ユーザーのまとめ（Step3）】
${summary}

【AI評価（Step4）】
${aiEvaluation.overallMessage}`;
}

export async function generateCoachQuestion(
  lessonId: string,
  lessonTitle: string,
  summaryEntries: LabeledAnswer[],
  aiEvaluation: AiEvaluation,
): Promise<CoachQuestionResult> {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    throw new Error(`Unknown lessonId: ${lessonId}`);
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.parse({
    model: COACH_MODEL,
    instructions: buildQuestionSystemPrompt(lesson.taughtTopics),
    input: buildQuestionPrompt(lessonTitle, summaryEntries, aiEvaluation),
    text: {
      format: zodTextFormat(CoachQuestionSchema, "coach_question"),
    },
  });

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error("Failed to parse coach question");
  }

  return parsed;
}
