const STORAGE_KEY_PREFIX = "loblossom:memo:";

function memoKey(lessonId: string): string {
  return `${STORAGE_KEY_PREFIX}${lessonId}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** レッスンごとの学習メモを読み込む */
export function loadLessonMemo(lessonId: string): string {
  if (!isBrowser()) return "";
  try {
    return localStorage.getItem(memoKey(lessonId)) ?? "";
  } catch {
    return "";
  }
}

/** レッスンごとの学習メモを保存する */
export function saveLessonMemo(lessonId: string, memo: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.setItem(memoKey(lessonId), memo);
    return true;
  } catch {
    return false;
  }
}
