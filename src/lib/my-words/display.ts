import type { WordStatus } from "@/types/my-words";
import { isReviewDue } from "@/lib/my-words/review-schedule";

/** 学習状態の日本語ラベル */
export function getWordStatusLabel(status: WordStatus): string {
  const labels: Record<WordStatus, string> = {
    new: "新しい単語",
    practicing: "練習中",
    learned: "習得済み",
    weak: "苦手",
  };
  return labels[status];
}

/** 学習状態バッジ用の Tailwind クラス */
export function getWordStatusBadgeClass(status: WordStatus): string {
  const classes: Record<WordStatus, string> = {
    new: "border-sky-200 bg-sky-50 text-sky-800",
    practicing: "border-amber-200 bg-amber-50 text-amber-800",
    learned: "border-leaf-200 bg-leaf-50 text-leaf-800",
    weak: "border-rose-200 bg-rose-50 text-rose-800",
  };
  return classes[status];
}

/** Lesson 番号リストを表示用テキストに */
export function formatLessonNumbers(lessonNumbers: number[]): string {
  if (lessonNumbers.length === 0) return "—";
  return lessonNumbers.map((n) => `レッスン${n}`).join("・");
}

/** 次回復習日をやさしい日本語で表示 */
export function formatNextReviewAt(
  nextReviewAt: string | null,
  now: Date = new Date(),
): string {
  if (!nextReviewAt) return "—";

  const due = new Date(nextReviewAt);
  if (Number.isNaN(due.getTime())) return "—";

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) return "今日";
  if (diffDays === 1) return "明日";
  if (diffDays <= 7) return `${diffDays}日後`;

  return due.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
  });
}

/** 次回復習が今日以前か（復習待ち） */
export function isWordReviewDue(
  nextReviewAt: string | null,
  now: Date = new Date(),
): boolean {
  return isReviewDue(nextReviewAt, now);
}

/** 初めて学習した日 */
export function formatFirstLearnedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
