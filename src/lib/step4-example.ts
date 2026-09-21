import type { UserExampleCheck } from "@/types/record";
import {
  applyUserExampleCheck,
  type UserExamplePersistedFields,
} from "@/lib/user-example-check";
import {
  buildExampleTranslationPatch,
  mergeSavedExampleTranslation,
  shouldTranslateFinalExample,
} from "@/lib/translate-user-example";

export const TRANSLATE_EXAMPLE_API_PATH = "/api/coach/translate-example";

export type Step4ExampleInput = {
  originalExample: string | null | undefined;
  userExampleCheck: unknown;
  userExampleJapanese?: string | null;
  userExampleJapaneseFor?: string | null;
};

export type Step4TranslateRequest = {
  url: typeof TRANSLATE_EXAMPLE_API_PATH;
  body: { english: string };
};

export type Step4ExampleResolved = {
  fields: UserExamplePersistedFields;
  display: UserExampleCheck | null;
  finalEnglish: string;
  shouldTranslate: boolean;
  translateRequest: Step4TranslateRequest | null;
  displayedEnglish: string;
  displayedJapanese: string;
};

/**
 * Step4カードに出す最終英文と、翻訳対象を同じ値にする。
 * userExampleFinal が空でも、usable な check があれば applyUserExampleCheck で補完する。
 */
export function resolveStep4Example(
  input: Step4ExampleInput,
): Step4ExampleResolved {
  const applied = applyUserExampleCheck(
    input.originalExample,
    input.userExampleCheck,
  );
  const finalEnglish = applied.fields.userExampleFinal?.trim() ?? "";
  const savedJapanese = input.userExampleJapanese?.trim() ?? "";
  const shouldTranslate = shouldTranslateFinalExample(
    finalEnglish,
    input.userExampleJapanese,
    input.userExampleJapaneseFor,
  );

  return {
    fields: applied.fields,
    display: applied.display,
    finalEnglish,
    shouldTranslate,
    translateRequest:
      shouldTranslate && finalEnglish
        ? {
            url: TRANSLATE_EXAMPLE_API_PATH,
            body: { english: finalEnglish },
          }
        : null,
    displayedEnglish: finalEnglish,
    displayedJapanese: shouldTranslate ? "" : savedJapanese,
  };
}

/** 翻訳 API の成否を保存値・表示値に反映する。失敗時は既存訳を消さない */
export function applyStep4TranslationResult(
  input: Step4ExampleInput,
  translation: string | null | undefined,
): {
  userExampleFinal: string | null;
  userExampleJapanese: string | null;
  userExampleJapaneseFor: string | null;
  displayedEnglish: string;
  displayedJapanese: string;
  shouldTranslate: boolean;
  translateRequest: Step4TranslateRequest | null;
} {
  const resolved = resolveStep4Example(input);
  const existingJapanese = input.userExampleJapanese?.trim() || null;
  const existingFor = input.userExampleJapaneseFor?.trim() || null;

  if (!resolved.shouldTranslate) {
    const displayedJapanese = existingJapanese ?? "";
    return {
      userExampleFinal: resolved.fields.userExampleFinal,
      userExampleJapanese: existingJapanese,
      userExampleJapaneseFor: existingFor,
      displayedEnglish: resolved.displayedEnglish,
      displayedJapanese,
      shouldTranslate: false,
      translateRequest: null,
    };
  }

  const patch = buildExampleTranslationPatch(resolved.finalEnglish, translation);
  if (patch.userExampleJapanese) {
    return {
      userExampleFinal: resolved.fields.userExampleFinal,
      userExampleJapanese: patch.userExampleJapanese,
      userExampleJapaneseFor: patch.userExampleJapaneseFor ?? resolved.finalEnglish,
      displayedEnglish: resolved.displayedEnglish,
      displayedJapanese: patch.userExampleJapanese,
      shouldTranslate: true,
      translateRequest: resolved.translateRequest,
    };
  }

  const keptJapanese = mergeSavedExampleTranslation(existingJapanese, translation);
  const displayedJapanese = keptJapanese?.trim() ?? "";
  return {
    userExampleFinal: resolved.fields.userExampleFinal,
    userExampleJapanese: displayedJapanese ? displayedJapanese : keptJapanese ?? null,
    userExampleJapaneseFor: existingFor,
    displayedEnglish: resolved.displayedEnglish,
    displayedJapanese,
    shouldTranslate: true,
    translateRequest: resolved.translateRequest,
  };
}

/** EvaluateCoach と同じ順: final確定 → 翻訳判断 → 保存値 → 表示値 */
export function runStep4ExampleFlow(
  input: Step4ExampleInput,
  translation?: string | null,
): {
  userExampleFinal: string | null;
  userExampleJapanese: string | null;
  userExampleJapaneseFor: string | null;
  displayedEnglish: string;
  displayedJapanese: string;
  shouldTranslate: boolean;
  translateRequest: Step4TranslateRequest | null;
  canProceedWithoutJapanese: boolean;
} {
  const result = applyStep4TranslationResult(
    input,
    resolveStep4Example(input).shouldTranslate ? translation : undefined,
  );
  return {
    ...result,
    canProceedWithoutJapanese: Boolean(result.userExampleFinal),
  };
}
