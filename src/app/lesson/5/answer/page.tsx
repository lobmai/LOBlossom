import { LessonLayout } from "@/components/LessonLayout";
import { AnswerCoach } from "@/components/AnswerCoach";
import { lesson05Meta } from "@/data/lesson05";
import { ui } from "@/lib/ui-text";

export default function Lesson5AnswerPage() {
  return (
    <LessonLayout
      lessonNumber={5}
      currentStep="answer"
      title={ui.answer.title}
      subtitle={ui.answer.subtitle}
      lessonId={lesson05Meta.id}
      showMemo
    >
      <AnswerCoach lessonNumber={5} />
    </LessonLayout>
  );
}
