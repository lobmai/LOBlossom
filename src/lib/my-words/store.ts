import type { MyWordUserEntry, MyWordsSaveResult } from "@/types/my-words";

const STORAGE_KEY_MY_WORDS = "loblossom:my-words";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeParseMyWords(raw: string | null): MyWordUserEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as MyWordUserEntry[];
  } catch {
    return [];
  }
}

function writeJson(key: string, value: unknown): MyWordsSaveResult {
  if (!isBrowser()) {
    return { ok: false, error: "browser unavailable" };
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return { ok: false, error: "localStorage write failed" };
  }
}

/** ユーザーの My Words 一覧を読み込む */
export function loadMyWords(): MyWordUserEntry[] {
  if (!isBrowser()) return [];
  try {
    return safeParseMyWords(localStorage.getItem(STORAGE_KEY_MY_WORDS));
  } catch {
    return [];
  }
}

/** ユーザーの My Words 一覧を保存する */
export function saveMyWords(entries: MyWordUserEntry[]): MyWordsSaveResult {
  return writeJson(STORAGE_KEY_MY_WORDS, entries);
}

/** wordId で1件取得 */
export function getMyWordById(wordId: string): MyWordUserEntry | null {
  return loadMyWords().find((entry) => entry.wordId === wordId) ?? null;
}

/** localStorage のキー名（デバッグ・将来の移行用） */
export function getMyWordsStorageKey(): string {
  return STORAGE_KEY_MY_WORDS;
}

/** My Words をすべて削除（テスト・デバッグ用） */
export function clearMyWords(): MyWordsSaveResult {
  if (!isBrowser()) {
    return { ok: false, error: "browser unavailable" };
  }
  try {
    localStorage.removeItem(STORAGE_KEY_MY_WORDS);
    return { ok: true };
  } catch {
    return { ok: false, error: "localStorage remove failed" };
  }
}

/** 空の My Words ストアかどうか */
export function isMyWordsEmpty(): boolean {
  return loadMyWords().length === 0;
}
