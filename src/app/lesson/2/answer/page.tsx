import { LessonLayout } from "@/components/LessonLayout";
import { AnswerCoach } from "@/components/AnswerCoach";
import { lesson02Meta } from "@/data/lesson02";
import { ui } from "@/lib/ui-text";

export default function Lesson2AnswerPage() {
  return (
    <LessonLayout
      lessonNumber={2}
      currentStep="answer"
      title={ui.answer.title}
      subtitle={ui.answer.subtitle}
      lessonId={lesson02Meta.id}
      showMemo
    >
      <AnswerCoach lessonNumber={2} />
    </LessonLayout>
  );
}
