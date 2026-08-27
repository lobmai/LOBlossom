import type { MyWordUserEntry } from "@/types/my-words";
import { loadMyWords } from "@/lib/my-words/store";

/**
 * Special 復習の対象単語を My Words から取得
 * 将来：nextReviewAt / weak / incorrectCount 等で優先順位付け
 */
export function getReviewCandidatesForLesson(
  lessonNumber: number,
): MyWordUserEntry[] {
  return loadMyWords()
    .filter((entry) => entry.lessonNumbers.includes(lessonNumber))
    .sort((a, b) => a.english.localeCompare(b.english));
}

/** 復習期限が来ている単語（将来の優先出題用） */
export function getDueReviewCandidatesForLesson(
  lessonNumber: number,
  now: Date = new Date(),
): MyWordUserEntry[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return getReviewCandidatesForLesson(lessonNumber).filter((entry) => {
    if (!entry.nextReviewAt) return false;
    const due = new Date(entry.nextReviewAt);
    due.setHours(0, 0, 0, 0);
    return due.getTime() <= today.getTime();
  });
}
