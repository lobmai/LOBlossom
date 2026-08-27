import { getWordMasterForLesson } from "@/data/my-words/index";
import { getLesson } from "@/lib/lessons/registry";
import { getValidUserExample } from "@/lib/answer-quality";
import { fromLabeledAnswers } from "@/lib/record-store";
import type { LessonRecord } from "@/types/record";

/** レッスン中に実際に遭遇した wordId を draft から収集 */
export function collectEncounteredWordIds(
  lessonNumber: number,
  draft: LessonRecord,
): string[] {
  const masters = getWordMasterForLesson(lessonNumber);
  if (masters.length === 0) return [];

  const texts: string[] = [];
  const lesson = getLesson(lessonNumber);
  if (!lesson) return [];

  if (draft.checkQuizState?.results) {
    for (const q of lesson.checkQuestions) {
      if (draft.checkQuizState.results[q.id]?.answered) {
        texts.push(
          q.question,
          q.exampleSentence,
          q.explanation,
          ...(q.options ?? []),
          String(q.answer),
        );
      }
    }
  }

  for (const entry of draft.trajectoryEntries) {
    texts.push(entry.answer);
  }

  if (draft.coachAnswer?.trim()) {
    texts.push(draft.coachAnswer);
  }

  const example = getValidUserExample(fromLabeledAnswers(draft.trajectoryEntries));
  if (example) {
    texts.push(example);
  }

  const corpus = texts.join(" ").toLowerCase();
  const encountered = new Set<string>();

  for (const master of masters) {
    if (corpus.includes(master.english.toLowerCase())) {
      encountered.add(master.wordId);
    }
  }

  return Array.from(encountered);
}
