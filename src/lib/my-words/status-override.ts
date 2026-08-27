import type { MyWordsSaveResult } from "@/types/my-words";
import type { UserStatusOverride } from "@/lib/my-words/display-status";
import { loadMyWords, saveMyWords } from "@/lib/my-words/store";

/**
 * 表示用の手動状態だけを書き込む。
 * mastery / 履歴 / 自動 status / nextReviewAt は変更しない。
 */
export function setUserStatusOverride(
  wordId: string,
  override: UserStatusOverride | null,
): MyWordsSaveResult {
  const entries = loadMyWords();
  const existing = entries.find((entry) => entry.wordId === wordId);
  if (!existing) {
    return { ok: false, error: "word not found" };
  }

  const updated = {
    ...existing,
    userStatusOverride: override,
  };

  return saveMyWords(
    entries.map((entry) => (entry.wordId === wordId ? updated : entry)),
  );
}
