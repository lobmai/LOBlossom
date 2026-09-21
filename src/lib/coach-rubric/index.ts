import type { CoachRubric } from "@/lib/coach-rubric/types";
import { lesson01CoachRubric } from "@/lib/coach-rubric/lesson01";
import { lesson02CoachRubric } from "@/lib/coach-rubric/lesson02";
import { lesson03CoachRubric } from "@/lib/coach-rubric/lesson03";
import { lesson04CoachRubric } from "@/lib/coach-rubric/lesson04";
import { lesson05CoachRubric } from "@/lib/coach-rubric/lesson05";

const RUBRIC_BY_LESSON_ID: Record<string, CoachRubric> = {
  [lesson01CoachRubric.lessonId]: lesson01CoachRubric,
  [lesson02CoachRubric.lessonId]: lesson02CoachRubric,
  [lesson03CoachRubric.lessonId]: lesson03CoachRubric,
  [lesson04CoachRubric.lessonId]: lesson04CoachRubric,
  [lesson05CoachRubric.lessonId]: lesson05CoachRubric,
};

/** lessonId から rubric を取得（未定義なら null） */
export function getCoachRubricForLesson(lessonId: string): CoachRubric | null {
  return RUBRIC_BY_LESSON_ID[lessonId] ?? null;
}

/** Lesson 番号から rubric を取得 */
export function getCoachRubricByLessonNumber(
  lessonNumber: number,
): CoachRubric | null {
  const rubrics = [
    lesson01CoachRubric,
    lesson02CoachRubric,
    lesson03CoachRubric,
    lesson04CoachRubric,
    lesson05CoachRubric,
  ];
  return (
    rubrics.find((r) => {
      const num = r.lessonId.match(/lesson-(\d+)/)?.[1];
      return num !== undefined && Number(num) === lessonNumber;
    }) ?? null
  );
}

export {
  lesson01CoachRubric,
  lesson02CoachRubric,
  lesson03CoachRubric,
  lesson04CoachRubric,
  lesson05CoachRubric,
};

export {
  buildRubricPromptSection,
  buildStructuredEvalRulesSection,
} from "@/lib/coach-rubric/build-prompt";

export { normalizeStructuredEvaluation } from "@/lib/coach-rubric/normalize-eval";
