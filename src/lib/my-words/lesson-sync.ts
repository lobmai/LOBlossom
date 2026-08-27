import { mergeLessonWordsIntoEntries } from "@/lib/my-words/merge";
import { loadMyWords, saveMyWords } from "@/lib/my-words/store";
import { collectEncounteredWordIds } from "@/lib/my-words/encountered-words";
import type { LessonRecord } from "@/types/record";

export function mergeAndSaveLessonWords(
  lessonNumber: number,
  draft: LessonRecord,
  now = new Date(),
) {
  const existing = loadMyWords();
  const encounteredWordIds = collectEncounteredWordIds(lessonNumber, draft);
  const merged = mergeLessonWordsIntoEntries(
    lessonNumber,
    existing,
    now,
    encounteredWordIds,
  );
  return saveMyWords(merged);
}
