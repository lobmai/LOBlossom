import { LessonLayout } from "@/components/LessonLayout";
import { AnswerCoach } from "@/components/AnswerCoach";
import { lesson01Meta } from "@/data/lesson01";
import { ui } from "@/lib/ui-text";

export default function Lesson1AnswerPage() {
  return (
    <LessonLayout
      lessonNumber={1}
      currentStep="answer"
      title={ui.answer.title}
      subtitle={ui.answer.subtitle}
      lessonId={lesson01Meta.id}
      showMemo
    >
      <AnswerCoach lessonNumber={1} />
    </LessonLayout>
  );
}
