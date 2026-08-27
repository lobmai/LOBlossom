import type { MyWordUserEntry, WordStatusCounts } from "@/types/my-words";
import { getDisplayedWordStatus } from "@/lib/my-words/display-status";
import { loadMyWords } from "@/lib/my-words/store";

/** 学習状態ごとの件数を集計（Phase3 UI 用） */
export function countWordsByStatus(
  entries: MyWordUserEntry[] = loadMyWords(),
): WordStatusCounts {
  const counts: WordStatusCounts = {
    new: 0,
    practicing: 0,
    learned: 0,
    weak: 0,
  };

  for (const entry of entries) {
    counts[getDisplayedWordStatus(entry)] += 1;
  }

  return counts;
}

/** 総単語数 */
export function countTotalWords(
  entries: MyWordUserEntry[] = loadMyWords(),
): number {
  return entries.length;
}
