import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { COACH_MODEL } from "@/lib/coach-model";
import { getOpenAiApiKey } from "@/lib/openai-config";
import { logPerfElapsed, perfLog, startPerfTimer } from "@/lib/perf-log";

const TranslationSchema = z.object({
  translation: z.string().describe("自然で短い日本語訳だけ。解説は付けない"),
});

const TRANSLATE_SYSTEM = `あなたは英語学習教材の翻訳者です。
与えられた英文を、自然で短い日本語に訳してください。
教材として分かりやすい訳を優先します。

【出力】
- 翻訳結果の日本語だけを返す
- 「この文は〜という意味です」などの説明は付けない
- 解説・文法コメント・英語の繰り返しは不要
- 1文の英文なら、短い1文の日本語にする`;

/** 保存してよい日本語訳だけを残す。空や説明文は null */
export function normalizeExampleTranslation(
  raw: string | null | undefined,
): string | null {
  if (typeof raw !== "string") return null;
  let text = raw.trim();
  if (!text) return null;

  text = text.replace(/^["「『]+/, "").replace(/["」』]+$/, "").trim();
  text = text.replace(/^この文は[、,．.\s]*/, "");
  text = text.replace(/^意味[:：]\s*/, "");
  text = text.replace(/という意味です[。．.]?$/, "");
  text = text.trim();
  if (!text) return null;
  if (text.length > 200) return null;
  return text;
}

/** 既存訳を空文字で消さない */
export function mergeSavedExampleTranslation(
  existing: string | null | undefined,
  incoming: string | null | undefined,
): string | null | undefined {
  const next = normalizeExampleTranslation(incoming);
  if (next) return next;
  const prev = existing?.trim() ? existing.trim() : existing;
  return prev === undefined ? undefined : prev ?? null;
}

/** 同じ最終例文の保存済み訳があるときは再翻訳しない */
export function shouldTranslateFinalExample(
  userExampleFinal: string | null | undefined,
  userExampleJapanese: string | null | undefined,
  translatedFor?: string | null,
): boolean {
  const finalEnglish = userExampleFinal?.trim() ?? "";
  if (!finalEnglish) return false;
  const saved = userExampleJapanese?.trim() ?? "";
  if (!saved) return true;
  if (!translatedFor) return false;
  return translatedFor !== finalEnglish;
}

export function buildExampleTranslationPatch(
  finalEnglish: string | null | undefined,
  incomingTranslation: string | null | undefined,
): {
  userExampleJapanese?: string;
  userExampleJapaneseFor?: string;
} {
  const finalText = finalEnglish?.trim() ?? "";
  const japanese = normalizeExampleTranslation(incomingTranslation);
  if (!finalText || !japanese) return {};
  return {
    userExampleJapanese: japanese,
    userExampleJapaneseFor: finalText,
  };
}

function readModelTranslation(response: {
  output_parsed?: { translation?: string | null } | null;
  output_text?: string;
}): string | null {
  return (
    normalizeExampleTranslation(response.output_parsed?.translation) ??
    normalizeExampleTranslation(response.output_text)
  );
}

export async function translateUserExampleEnglish(
  english: string,
): Promise<string | null> {
  const source = english.trim();
  if (!source) return null;

  const apiKey = getOpenAiApiKey();
  if (!apiKey) return null;

  const startedAt = startPerfTimer();
  perfLog("translate-example", "openai start");
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.parse({
      model: COACH_MODEL,
      instructions: TRANSLATE_SYSTEM,
      input: `英文:\n${source}`,
      text: {
        format: zodTextFormat(TranslationSchema, "example_translation"),
      },
    });
    const translation = readModelTranslation(response);
    logPerfElapsed("translate-example", "openai", startedAt);
    return translation;
  } catch {
    logPerfElapsed("translate-example", "openai (failed)", startedAt);
    return null;
  }
}
