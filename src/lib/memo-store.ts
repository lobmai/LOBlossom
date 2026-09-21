const STORAGE_KEY_PREFIX = "loblossom:memo:";

export type LessonMemoFields = {
  meaning: string;
  grammar: string;
  important: string;
  other: string;
};

const EMPTY_MEMO: LessonMemoFields = {
  meaning: "",
  grammar: "",
  important: "",
  other: "",
};

function memoKey(lessonId: string): string {
  return `${STORAGE_KEY_PREFIX}${lessonId}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** 旧・1文字列メモと、新・4項目JSONの両方を読む */
export function parseLessonMemo(raw: string | null): LessonMemoFields {
  if (!raw) return { ...EMPTY_MEMO };

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      const hasStructuredKey =
        "meaning" in obj ||
        "grammar" in obj ||
        "important" in obj ||
        "other" in obj ||
        "memoMeaning" in obj ||
        "memoGrammar" in obj ||
        "memoImportant" in obj ||
        "memoOther" in obj;
      if (hasStructuredKey) {
        return {
          meaning: asText(obj.meaning ?? obj.memoMeaning),
          grammar: asText(obj.grammar ?? obj.memoGrammar),
          important: asText(obj.important ?? obj.memoImportant),
          other: asText(obj.other ?? obj.memoOther),
        };
      }
    }
  } catch {
    // 旧形式のプレーンテキスト
  }

  return { ...EMPTY_MEMO, other: raw };
}

export function serializeLessonMemo(fields: LessonMemoFields): string {
  return JSON.stringify({
    meaning: fields.meaning,
    grammar: fields.grammar,
    important: fields.important,
    other: fields.other,
  });
}

export function emptyLessonMemo(): LessonMemoFields {
  return { ...EMPTY_MEMO };
}

/** レッスンごとの学習メモを読み込む（4項目。旧データは other へ） */
export function loadLessonMemoFields(lessonId: string): LessonMemoFields {
  if (!isBrowser()) return emptyLessonMemo();
  try {
    return parseLessonMemo(localStorage.getItem(memoKey(lessonId)));
  } catch {
    return emptyLessonMemo();
  }
}

/** レッスンごとの学習メモを保存する */
export function saveLessonMemoFields(
  lessonId: string,
  fields: LessonMemoFields,
): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.setItem(memoKey(lessonId), serializeLessonMemo(fields));
    return true;
  } catch {
    return false;
  }
}
