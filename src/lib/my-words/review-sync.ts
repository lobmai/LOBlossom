import type { MyWordsSaveResult, ReviewResult } from "@/types/my-words";
import { findWordMasterById } from "@/data/my-words/index";
import type { WordMasterEntry } from "@/types/my-words";
import {
  applyReviewResult,
  createInitialUserEntry,
} from "@/lib/my-words/merge";
import { getMyWordById, loadMyWords, saveMyWords } from "@/lib/my-words/store";

/** wordId に対応する教材マスター（通常 + 補助） */
export function resolveWordMaster(wordId: string): WordMasterEntry | null {
  return findWordMasterById(wordId);
}

/**
 * Special 復習結果を My Words へ反映（既存 applyReviewResult を利用）
 * 単語が未登録の場合はマスターから初期エントリを作成してから更新
 */
export function applyReviewResultToStore(
  wordId: string,
  result: ReviewResult,
  lessonNumber: number,
  now: Date = new Date(),
): MyWordsSaveResult {
  const entries = loadMyWords();
  const existing = getMyWordById(wordId);

  if (existing) {
    const updated = applyReviewResult(existing, result, now);
    return saveMyWords(
      entries.map((entry) => (entry.wordId === wordId ? updated : entry)),
    );
  }

  const master = resolveWordMaster(wordId);
  if (!master) {
    return { ok: false, error: "word master not found" };
  }

  const initial = createInitialUserEntry(master, lessonNumber, now);
  const updated = applyReviewResult(initial, result, now);
  return saveMyWords([...entries, updated]);
}
