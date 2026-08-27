import type {
  MyWordUserEntry,
  ReviewResult,
  ReviewUpdateResult,
} from "@/types/my-words";

/**
 * 復習間隔（日数）の定義
 * 将来アルゴリズムを変更する場合は、この配列または calculateNextReview のみ差し替える
 */
export const REVIEW_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30] as const;

export const MAX_MASTERY_LEVEL = REVIEW_INTERVALS_DAYS.length - 1;

/** 日付に指定日数を加算（UTC 日付ベース） */
function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + days);
  return result;
}

/** ISO 日時文字列に変換 */
function toIsoDateTime(date: Date): string {
  return date.toISOString();
}

/** Lesson 完了直後の nextReviewAt（翌日） */
export function getInitialNextReviewAt(now: Date = new Date()): string {
  return toIsoDateTime(addDays(now, REVIEW_INTERVALS_DAYS[1]));
}

/** masteryLevel に対応する復習間隔（日）を返す */
export function getReviewIntervalDays(masteryLevel: number): number {
  const clamped = Math.max(0, Math.min(masteryLevel, MAX_MASTERY_LEVEL));
  return REVIEW_INTERVALS_DAYS[clamped];
}

/**
 * 正解・不正解に応じて nextReviewAt と masteryLevel 等を計算
 * Phase7（Special 連携）以降で実際に呼び出す
 */
export function calculateNextReview(
  entry: MyWordUserEntry,
  result: ReviewResult,
  now: Date = new Date(),
): ReviewUpdateResult {
  const reviewedAt = toIsoDateTime(now);

  if (result === "correct") {
    const nextMastery = Math.min(entry.masteryLevel + 1, MAX_MASTERY_LEVEL);
    const nextReviewAt = toIsoDateTime(
      addDays(now, getReviewIntervalDays(nextMastery)),
    );

    return {
      masteryLevel: nextMastery,
      correctCount: entry.correctCount + 1,
      incorrectCount: entry.incorrectCount,
      consecutiveCorrect: entry.consecutiveCorrect + 1,
      consecutiveIncorrect: 0,
      lastReviewResult: "correct",
      lastReviewedAt: reviewedAt,
      nextReviewAt,
    };
  }

  const nextMastery = Math.max(entry.masteryLevel - 1, 0);
  const nextReviewAt = toIsoDateTime(addDays(now, REVIEW_INTERVALS_DAYS[0]));

  return {
    masteryLevel: nextMastery,
    correctCount: entry.correctCount,
    incorrectCount: entry.incorrectCount + 1,
    consecutiveCorrect: 0,
    consecutiveIncorrect: entry.consecutiveIncorrect + 1,
    lastReviewResult: "incorrect",
    lastReviewedAt: reviewedAt,
    nextReviewAt,
  };
}

/** nextReviewAt が今日以前かどうか（復習対象の判定用） */
export function isReviewDue(
  nextReviewAt: string | null,
  now: Date = new Date(),
): boolean {
  if (!nextReviewAt) return false;
  const due = new Date(nextReviewAt);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due.getTime() <= today.getTime();
}
