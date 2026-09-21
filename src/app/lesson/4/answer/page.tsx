import { LessonLayout } from "@/components/LessonLayout";
import { AnswerCoach } from "@/components/AnswerCoach";
import { lesson04Meta } from "@/data/lesson04";
import { ui } from "@/lib/ui-text";

export default function Lesson4AnswerPage() {
  return (
    <LessonLayout
      lessonNumber={4}
      currentStep="answer"
      title={ui.answer.title}
      subtitle={ui.answer.subtitle}
      lessonId={lesson04Meta.id}
      showMemo
    >
      <AnswerCoach lessonNumber={4} />
    </LessonLayout>
  );
}
