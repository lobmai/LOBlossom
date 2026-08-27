import type { MyWordUserEntry, WordStatus } from "@/types/my-words";

/** 不正解率が weak 判定の閾値（50%超） */
const WEAK_INCORRECT_RATE_THRESHOLD = 0.5;

/** weak 判定に必要な最低復習回数 */
const WEAK_MIN_REVIEWS_FOR_RATE = 3;

/** learned 判定に必要な最低正解回数 */
const LEARNED_MIN_CORRECT_COUNT = 3;

/** learned 判定に必要な最低 masteryLevel */
const LEARNED_MIN_MASTERY_LEVEL = 2;

/** learned / weak 解除に必要な連続正解回数 */
const CONSECUTIVE_CORRECT_FOR_RECOVERY = 2;

/** weak 判定の連続不正解回数 */
const CONSECUTIVE_INCORRECT_FOR_WEAK = 2;

function isWeakByIncorrectRate(entry: MyWordUserEntry): boolean {
  const totalReviews = entry.correctCount + entry.incorrectCount;
  if (totalReviews < WEAK_MIN_REVIEWS_FOR_RATE) return false;
  return entry.incorrectCount / totalReviews > WEAK_INCORRECT_RATE_THRESHOLD;
}

function meetsLearnedCriteria(entry: MyWordUserEntry): boolean {
  return (
    entry.correctCount >= LEARNED_MIN_CORRECT_COUNT &&
    entry.consecutiveCorrect >= CONSECUTIVE_CORRECT_FOR_RECOVERY &&
    entry.lastReviewResult === "correct" &&
    entry.masteryLevel >= LEARNED_MIN_MASTERY_LEVEL
  );
}

function isWeakByConsecutiveIncorrect(entry: MyWordUserEntry): boolean {
  return entry.consecutiveIncorrect >= CONSECUTIVE_INCORRECT_FOR_WEAK;
}

/**
 * 学習状態を判定する
 * Phase7 以降、復習結果適用後に呼び出す
 *
 * @param entry 更新後のエントリ（counts / consecutive 系が最新）
 * @param previousStatus 更新前の status（learned → practicing 等の遷移判定用）
 */
export function computeWordStatus(
  entry: MyWordUserEntry,
  previousStatus: WordStatus = entry.status,
): WordStatus {
  if (entry.lastReviewedAt === null) {
    return "new";
  }

  if (isWeakByConsecutiveIncorrect(entry) || isWeakByIncorrectRate(entry)) {
    return "weak";
  }

  if (meetsLearnedCriteria(entry)) {
    return "learned";
  }

  if (
    previousStatus === "learned" &&
    entry.lastReviewResult === "incorrect"
  ) {
    return "practicing";
  }

  if (
    previousStatus === "weak" &&
    entry.consecutiveCorrect >= CONSECUTIVE_CORRECT_FOR_RECOVERY
  ) {
    return "practicing";
  }

  return "practicing";
}

/** エントリの status フィールドを再計算して返す */
export function updateWordStatus(entry: MyWordUserEntry): MyWordUserEntry {
  return {
    ...entry,
    status: computeWordStatus(entry, entry.status),
  };
}
