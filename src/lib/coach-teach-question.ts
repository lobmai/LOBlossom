import { pickCoachQuestionForLesson } from "@/lib/coach-question-picker";
import { getLessonById } from "@/lib/lessons/registry";
import { ui } from "@/lib/ui-text";
import type { CoachQuestion } from "@/types/record";

/** Step5：レッスンごとの固定質問（API を使わない） */
export function getFixedCoachQuestion(lessonId: string): CoachQuestion {
  return pickCoachQuestionForLesson(lessonId);
}

/** Step5 入力欄。Lesson 設定が無ければ Lesson1 用の共通文言 */
export function getAnswerInputPlaceholder(lessonId: string): string {
  const fromLesson = getLessonById(lessonId)?.summary.teachQuestion.inputPlaceholder;
  return fromLesson ?? ui.answer.inputPlaceholder;
}
