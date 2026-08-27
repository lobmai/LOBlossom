import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getMeaningfulUserAnswers } from "@/lib/coach-synthesize-answer";
import { COACH_MODEL } from "@/lib/coach-model";
import { getOpenAiApiKey } from "@/lib/openai-config";
import { sanitizeCoachMessage } from "@/lib/sanitize-coach-message";
import { isMeaningfulText } from "@/lib/answer-quality";
import type { CoachSession } from "@/types/record";

export const PolishedMyPointsSchema = z.object({
  polishedText: z
    .string()
    .describe("ユーザーが教えた内容だけを、復習用の自然な日本語に整えた文章"),
});

const POLISH_SYSTEM = `あなたはLOBlossomの文章整理係です。英語のレッスンで、学習者がAIコーチに「大事なこと」を教えてくれた発言を、あとから読み返す短いまとめに整えます。

【必ず守ること】
- ユーザーが実際に言った内容だけを使う。言っていない知識・ルール・例は足さない
- 間違いを正解に書き換えない。ユーザーがそう説明したなら、その内容のまま整える
- 会話ログのつなぎ合わせにしない。各文を単独で読んでも、何についての説明か分かるようにする
- 省略された主語・目的語（例：否定文、be動詞、am）は、ユーザーの発言から明らかに分かる範囲でのみ補う
- 「〜だよ」「〜んだよ」「〜かな」などの話し言葉は、まとめ向けの自然な文にする
- 2〜4文程度の短い日本語。評価コメントや「よくできました」は書かない
- 箇条書きにしない。句点「。」で文を区切る`;

export function getMyPointsSourceAnswers(
  session: CoachSession | null | undefined,
): string[] {
  if (!session) return [];
  return getMeaningfulUserAnswers(session);
}

export function buildMyPointsPolishInput(userAnswers: string[]): string {
  return [
    "【ユーザーが教えてくれた発言】",
    ...userAnswers.map((a, i) => `${i + 1}. ${a}`),
    "",
    "【出力】",
    "上記の発言だけを根拠に、復習用の自然な文章へ整える。",
  ].join("\n");
}

export async function polishMyPointsFromAnswers(
  userAnswers: string[],
): Promise<string | null> {
  const answers = userAnswers.map((a) => a.trim()).filter(Boolean);
  if (answers.length === 0) return null;

  const apiKey = getOpenAiApiKey();
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const response = await client.responses.parse({
    model: COACH_MODEL,
    instructions: POLISH_SYSTEM,
    input: buildMyPointsPolishInput(answers),
    text: {
      format: zodTextFormat(PolishedMyPointsSchema, "polished_my_points"),
    },
  });

  const parsed = response.output_parsed;
  const polished = sanitizeCoachMessage(parsed?.polishedText?.trim() ?? "");
  if (!isMeaningfulText(polished)) return null;
  return polished;
}
