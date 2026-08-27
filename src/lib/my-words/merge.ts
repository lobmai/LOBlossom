import type {
  MyWordUserEntry,
  ReviewResult,
  ReviewUpdateResult,
  WordMasterEntry,
} from "@/types/my-words";
import { getWordMasterForLesson } from "@/data/my-words/index";
import { computeWordStatus } from "@/lib/my-words/status";
import { calculateNextReview, getInitialNextReviewAt } from "@/lib/my-words/review-schedule";

/** マスターから新規ユーザー単語エントリを作成 */
export function createInitialUserEntry(
  master: WordMasterEntry,
  lessonNumber: number,
  now: Date = new Date(),
): MyWordUserEntry {
  const isoNow = now.toISOString();

  return {
    wordId: master.wordId,
    english: master.english,
    japanese: master.japanese,
    exampleEnglish: master.exampleEnglish,
    exampleJapanese: master.exampleJapanese,
    audioRef: master.audioRef,
    lessonNumbers: [lessonNumber],
    status: "new",
    firstLearnedAt: isoNow,
    lastReviewedAt: null,
    nextReviewAt: getInitialNextReviewAt(now),
    correctCount: 0,
    incorrectCount: 0,
    masteryLevel: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    lastReviewResult: null,
    userStatusOverride: null,
    userExamples: [],
    aiWeaknessTags: [],
  };
}

/** 既存エントリに Lesson 番号を追加（重複しない） */
function appendLessonNumber(
  entry: MyWordUserEntry,
  lessonNumber: number,
): MyWordUserEntry {
  if (entry.lessonNumbers.includes(lessonNumber)) {
    return entry;
  }
  return {
    ...entry,
    lessonNumbers: [...entry.lessonNumbers, lessonNumber].sort((a, b) => a - b),
  };
}

/**
 * Lesson 完了時に呼ぶマージ処理（Phase2 で使用）
 * 既存の単語は進捗を維持し、lessonNumbers のみ追加する。
 * encounteredWordIds 指定時は、そのセッションで遭遇した語のみ新規追加する。
 */
export function mergeLessonWordsIntoEntries(
  lessonNumber: number,
  existing: MyWordUserEntry[],
  now: Date = new Date(),
  encounteredWordIds?: string[],
): MyWordUserEntry[] {
  const masters = getWordMasterForLesson(lessonNumber);
  if (masters.length === 0) return existing;

  const targetMasters =
    encounteredWordIds !== undefined
      ? masters.filter((m) => encounteredWordIds.includes(m.wordId))
      : masters;

  const byId = new Map(existing.map((entry) => [entry.wordId, entry]));

  for (const master of targetMasters) {
    const current = byId.get(master.wordId);
    if (current) {
      byId.set(master.wordId, appendLessonNumber(current, lessonNumber));
    } else {
      byId.set(master.wordId, createInitialUserEntry(master, lessonNumber, now));
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.english.localeCompare(b.english),
  );
}

/** 復習結果を適用し、status も更新したエントリを返す */
export function applyReviewResult(
  entry: MyWordUserEntry,
  result: ReviewResult,
  now: Date = new Date(),
): MyWordUserEntry {
  const reviewUpdate: ReviewUpdateResult = calculateNextReview(entry, result, now);
  const updated: MyWordUserEntry = {
    ...entry,
    ...reviewUpdate,
    status: entry.status,
  };

  const previousStatus = entry.status;
  const nextStatus = computeWordStatus(updated, previousStatus);

  if (nextStatus === "weak") {
    updated.masteryLevel = 0;
    updated.nextReviewAt = getInitialNextReviewAt(now);
  }

  updated.status = nextStatus;
  updated.userStatusOverride = null;
  return updated;
}
