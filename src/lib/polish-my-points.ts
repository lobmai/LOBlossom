import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getMyPointsUserAnswersFromSession } from "@/lib/coach-synthesize-answer";
import { COACH_MODEL } from "@/lib/coach-model";
import { getOpenAiApiKey } from "@/lib/openai-config";
import { logPerfElapsed, perfLog, startPerfTimer } from "@/lib/perf-log";
import { sanitizeCoachMessage } from "@/lib/sanitize-coach-message";
import { isMeaningfulText } from "@/lib/answer-quality";
import {
  POINTS_ID,
  type LessonSummaryConfig,
} from "@/lib/lessons/types";
import type { CoachSession, LabeledAnswer } from "@/types/record";

import {
  buildMyPointsNoteStylePolicy,
  toReviewNoteStyle,
} from "@/lib/my-points-note-style";

export type MyPointsSourceKind = "step3-points" | "step5-answers";

export const PolishedMyPointsSchema = z.object({
  polishedText: z
    .string()
    .describe(
      "復習ノート調の日本語。ユーザーが言った内容だけ。会話調（だね・だよ）禁止。新しい知識は入れない。短ければ短いまま",
    ),
});

const POLISH_SYSTEM = `あなたはLOBlossomの文章編集者です。学習者が「大事だと思ったこと」として話した内容を、本人の意味を保ったまま復習ノート向けに整えます。

あなたは要約係ではありません。本人の言葉を整える編集者です。レッスン内容を考えて説明してはいけません。
AIコーチとしてユーザーへ話しかけてはいけません。

【絶対に守ること】
- ユーザーが実際に言った内容だけを使う。言っていない知識・ルール・例・文法用語は足さない
- 大事だと思ったポイントを、別の内容へ置き換えない
- 間違いを正解に書き換えない。ユーザーがそう説明したなら、その内容のまま整える
- レッスンの正解や教科書的な説明へ作り替えない
- ユーザーが言っていない英語の語（who / which / that など）を足さない
- ユーザーが重視していないポイントを追加しない
- 短い発言を無理に長くしない。1文で足りるなら1文のまま
- 「！。」など不自然な句読点は直す。明らかな重複は整理する
- 評価コメントや「よくできました」は書かない
- 箇条書きにしない。句点「。」で文を区切る

${buildMyPointsNoteStylePolicy()}`;

export function getMyPointsSourceAnswers(
  session: CoachSession | null | undefined,
): string[] {
  if (!session) return [];
  return getMyPointsUserAnswersFromSession(session);
}

/** 未指定なら Step3 points 欄の有無に合わせる（今後の Lesson 用） */
export function resolveMyPointsSourceKind(
  config: LessonSummaryConfig,
): MyPointsSourceKind {
  if (config.myPointsSource) return config.myPointsSource;
  return config.includePointsInTrajectory !== false
    ? "step3-points"
    : "step5-answers";
}

export function collectMyPointsPolishSource(
  kind: MyPointsSourceKind,
  trajectoryEntries: LabeledAnswer[],
  coachSession: CoachSession | null | undefined,
): string[] {
  if (kind === "step3-points") {
    const points =
      trajectoryEntries.find((e) => e.id === POINTS_ID)?.answer.trim() ?? "";
    return isMeaningfulText(points) ? [points] : [];
  }
  return getMyPointsSourceAnswers(coachSession);
}

export function toStoredMyPointsFinal(
  text: string | null | undefined,
): string | null {
  const t = text?.trim() ?? "";
  if (!t || !isMeaningfulText(t)) return null;
  return t;
}

/** AIを使わず、本人の発言を句点でつなぐだけ */
export function fallbackMyPointsFromAnswers(
  userAnswers: string[],
): string | null {
  const cleaned = userAnswers
    .map((a) => a.trim().replace(/[。．.]+$/u, ""))
    .filter((a) => isMeaningfulText(a));
  if (cleaned.length === 0) return null;
  const joined = cleaned.join("。");
  const withStop = /[。！？]$/u.test(joined) ? joined : `${joined}。`;
  return toStoredMyPointsFinal(toReviewNoteStyle(withStop));
}

function latinWords(text: string): string[] {
  return (text.match(/[A-Za-z']+/g) ?? []).map((w) => w.toLowerCase());
}

/** 言っていない英語語の追加や、不必要な長文化を弾く */
export function isPolishedMyPointsAcceptable(
  userAnswers: string[],
  polished: string,
): boolean {
  const source = userAnswers.join(" ");
  const sourceLatin = new Set(latinWords(source));
  if (latinWords(polished).some((w) => !sourceLatin.has(w))) return false;

  const srcLen = source.replace(/\s+/g, "").length;
  const polLen = polished.replace(/\s+/g, "").length;
  if (srcLen > 0 && polLen > Math.max(srcLen * 2 + 20, srcLen + 40)) {
    return false;
  }
  return isMeaningfulText(polished);
}

export function buildMyPointsPolishInput(userAnswers: string[]): string {
  return [
    "【ユーザーが教えてくれた発言】",
    ...userAnswers.map((a, i) => `${i + 1}. ${a}`),
    "",
    "【出力】",
    "上記の発言だけを根拠に、本人の意味を保ったまま復習ノート調に整える。",
    "ユーザーへ話しかけない。「だね」「だよ」は使わない。発言にない知識や英語の語を足さない。短ければ短いまま。",
  ].join("\n");
}

export async function polishMyPointsFromAnswers(
  userAnswers: string[],
): Promise<string | null> {
  const answers = userAnswers.map((a) => a.trim()).filter(Boolean);
  const fallback = fallbackMyPointsFromAnswers(answers);
  if (answers.length === 0) return null;

  const apiKey = getOpenAiApiKey();
  if (!apiKey) return fallback;

  try {
    const client = new OpenAI({ apiKey });
    const openaiStartedAt = startPerfTimer();
    perfLog("polish", "openai start");
    const response = await client.responses.parse({
      model: COACH_MODEL,
      instructions: POLISH_SYSTEM,
      input: buildMyPointsPolishInput(answers),
      text: {
        format: zodTextFormat(PolishedMyPointsSchema, "polished_my_points"),
      },
    });
    logPerfElapsed("polish", "openai", openaiStartedAt);

    const parsed = response.output_parsed;
    const polished = toReviewNoteStyle(
      sanitizeCoachMessage(parsed?.polishedText?.trim() ?? ""),
    );
    if (
      isMeaningfulText(polished) &&
      isPolishedMyPointsAcceptable(answers, polished)
    ) {
      return polished;
    }
    return fallback;
  } catch {
    return fallback;
  }
}
