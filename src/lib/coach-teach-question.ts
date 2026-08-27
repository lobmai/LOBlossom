import { pickCoachQuestionForLesson } from "@/lib/coach-question-picker";
import type { CoachQuestion } from "@/types/record";

/** Step5：レッスンごとの固定質問（API を使わない） */
export function getFixedCoachQuestion(lessonId: string): CoachQuestion {
  return pickCoachQuestionForLesson(lessonId);
}
