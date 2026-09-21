import { LessonLayout } from "@/components/LessonLayout";
import { AnswerCoach } from "@/components/AnswerCoach";
import { lesson03Meta } from "@/data/lesson03";
import { ui } from "@/lib/ui-text";

export default function Lesson3AnswerPage() {
  return (
    <LessonLayout
      lessonNumber={3}
      currentStep="answer"
      title={ui.answer.title}
      subtitle={ui.answer.subtitle}
      lessonId={lesson03Meta.id}
      showMemo
    >
      <AnswerCoach lessonNumber={3} />
    </LessonLayout>
  );
}
