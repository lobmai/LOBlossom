import { getLessonById } from "@/lib/lessons/registry";
import type { CoachQuestion } from "@/types/record";

/** Step5：レッスン設定の固定質問（API 不使用） */
export function pickCoachQuestionForLesson(lessonId: string): CoachQuestion {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    throw new Error(`Unknown lessonId: ${lessonId}`);
  }

  const { teachQuestion } = lesson.summary;

  return {
    question: teachQuestion.question,
    keywords: teachQuestion.hints,
    generatedAt: new Date().toISOString(),
    source: "rubric",
  };
}
