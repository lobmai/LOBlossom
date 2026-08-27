import { LessonLayout } from "@/components/LessonLayout";
import { CheckQuiz } from "@/components/CheckQuiz";
import { lesson02Meta } from "@/data/lesson02";
import { ui } from "@/lib/ui-text";

export default function Lesson2CheckPage() {
  return (
    <LessonLayout
      lessonNumber={2}
      currentStep="check"
      title={ui.check.title}
      subtitle={ui.check.subtitle}
      lessonId={lesson02Meta.id}
      showMemo
    >
      <CheckQuiz lessonNumber={2} />
    </LessonLayout>
  );
}
