import { LessonLayout } from "@/components/LessonLayout";
import { CheckQuiz } from "@/components/CheckQuiz";
import { lesson01Meta } from "@/data/lesson01";
import { ui } from "@/lib/ui-text";

export default function Lesson1CheckPage() {
  return (
    <LessonLayout
      lessonNumber={1}
      currentStep="check"
      title={ui.check.title}
      subtitle={ui.check.subtitle}
      lessonId={lesson01Meta.id}
      showMemo
    >
      <CheckQuiz lessonNumber={1} />
    </LessonLayout>
  );
}
