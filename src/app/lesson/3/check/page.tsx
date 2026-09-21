import { LessonLayout } from "@/components/LessonLayout";
import { CheckQuiz } from "@/components/CheckQuiz";
import { lesson03Meta } from "@/data/lesson03";
import { ui } from "@/lib/ui-text";

export default function Lesson3CheckPage() {
  return (
    <LessonLayout
      lessonNumber={3}
      currentStep="check"
      title={ui.check.title}
      subtitle={ui.check.subtitle}
      lessonId={lesson03Meta.id}
      showMemo
    >
      <CheckQuiz lessonNumber={3} />
    </LessonLayout>
  );
}
