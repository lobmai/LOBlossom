import { getValidUserExample, isValidUserExample } from "@/lib/answer-quality";
import type { LabeledAnswer, UserExampleCheck } from "@/types/record";

export type UserExamplePersistedFields = {
  userExampleFinal: string | null;
  userExampleCorrectionReason: string | null;
  userExampleIsCorrect: boolean | null;
  /** Step4 で最終例文が確定したときに保存。失敗時は省略 */
  userExampleJapanese?: string | null;
};

const EMPTY_FIELDS: UserExamplePersistedFields = {
  userExampleFinal: null,
  userExampleCorrectionReason: null,
  userExampleIsCorrect: null,
};

/** Lesson ごとの例文チェックで考慮する文法。未登録の Lesson でも共通ルールは使う */
const LESSON_EXAMPLE_GRAMMAR_FOCUS: Record<string, string> = {
  "lesson-01-be-verb": "be動詞（am / is / are、否定、疑問）",
  "lesson-02-regular-verb": "一般動詞（3単現の s、don't / doesn't、Do / Does）",
  "lesson-03-present-perfect": "現在完了（have / has + 過去分詞、経験・完了・継続）",
  "lesson-04-relative-pronoun": "関係代名詞（who / which / that、前の名詞を後ろから説明する）",
  "lesson-05-subjunctive": "仮定法（If + 過去形 / would + 動詞の原形、現実とは違うことを想像する）",
};

export function getExampleGrammarFocus(lessonId: string): string | null {
  return LESSON_EXAMPLE_GRAMMAR_FOCUS[lessonId] ?? null;
}

export function getOriginalUserExample(
  entries: LabeledAnswer[] | Record<string, string>,
): string | null {
  if (Array.isArray(entries)) {
    return getValidUserExample(
      Object.fromEntries(entries.map((e) => [e.id, e.answer])),
    );
  }
  return getValidUserExample(entries);
}

function toStoredExample(text: string | null | undefined): string | null {
  const t = text?.trim() ?? "";
  if (!t || !isValidUserExample(t)) return null;
  return t;
}

function parseRawCheck(raw: unknown): UserExampleCheck | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.isCorrect !== "boolean") return null;

  if (
    o.correctedExample !== null &&
    o.correctedExample !== undefined &&
    typeof o.correctedExample !== "string"
  ) {
    return null;
  }
  if (
    o.errorReason !== null &&
    o.errorReason !== undefined &&
    typeof o.errorReason !== "string"
  ) {
    return null;
  }

  return {
    isCorrect: o.isCorrect,
    correctedExample:
      typeof o.correctedExample === "string" ? o.correctedExample : null,
    errorReason: typeof o.errorReason === "string" ? o.errorReason : null,
  };
}

/**
 * AI の例文チェックを安全な表示・保存用に正規化する。
 * 不完全な結果では final を作らず、原文を「修正版」扱いしない。
 */
export function applyUserExampleCheck(
  original: string | null | undefined,
  raw: unknown,
): {
  fields: UserExamplePersistedFields;
  display: UserExampleCheck | null;
} {
  const originalStored = toStoredExample(original);
  if (!originalStored) {
    return { fields: { ...EMPTY_FIELDS }, display: null };
  }

  const parsed = parseRawCheck(raw);
  if (!parsed) {
    return { fields: { ...EMPTY_FIELDS }, display: null };
  }

  if (parsed.isCorrect) {
    return {
      fields: {
        userExampleFinal: originalStored,
        userExampleCorrectionReason: null,
        userExampleIsCorrect: true,
      },
      display: {
        isCorrect: true,
        correctedExample: null,
        errorReason: null,
      },
    };
  }

  const correctedStored = toStoredExample(parsed.correctedExample);
  const reason = parsed.errorReason?.trim() || null;

  if (!correctedStored && !reason) {
    return { fields: { ...EMPTY_FIELDS }, display: null };
  }

  return {
    fields: {
      userExampleFinal: correctedStored,
      userExampleCorrectionReason: reason,
      userExampleIsCorrect: false,
    },
    display: {
      isCorrect: false,
      correctedExample: correctedStored,
      errorReason: reason,
    },
  };
}

/** 日本語訳の対象：確定例文があればそれを使い、なければ原文 */
export function pickExampleForTranslation(
  original: string | null | undefined,
  userExampleFinal: string | null | undefined,
): string | null {
  const fromFinal = toStoredExample(userExampleFinal);
  if (fromFinal) return fromFinal;
  return toStoredExample(original);
}

export function buildUserExampleCheckInstructions(
  lessonId: string,
  originalExample: string | null,
): string {
  const focus = getExampleGrammarFocus(lessonId);
  const lines = [
    "【自作例文チェック userExampleCheck】",
    originalExample
      ? `- 対象の英文：${originalExample}`
      : "- 自作例文がなければ userExampleCheck は null",
    "- isCorrect / correctedExample / errorReason を返す",
    "- 判定の第一基準は「英語として文法的に正しいか」",
    "- 文法ミス、このレッスンで学んだ文法の明確な誤用、意味が成立しない重大な問題だけを誤りとする",
    "- 文法的に正しい文を、好みや「より自然だから」という理由だけで書き換えない",
    "- isCorrect=true のとき correctedExample と errorReason は必ず null。原文を別の文にしない",
    "- isCorrect=false のときだけ、誤りを最小限直した正しい英文を correctedExample に入れる",
    "- errorReason はやさしい日本語で、どこが・なぜ間違いかを短く書く",
    "- このレッスンの文法を使っていないことだけで isCorrect=false にしない",
    "- 「英語として正しいか」と「レッスン内容を使えているか」は混ぜない",
  ];

  if (focus) {
    lines.push(`- このレッスンで学んだ文法（誤用の判定に使う）：${focus}`);
  }

  return lines.join("\n");
}

export function hasUsableUserExampleCheck(
  check: UserExampleCheck | null | undefined,
): check is UserExampleCheck {
  if (!check) return false;
  if (check.isCorrect) return true;
  return Boolean(check.correctedExample?.trim() || check.errorReason?.trim());
}
