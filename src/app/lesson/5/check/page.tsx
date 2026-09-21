import { LessonLayout } from "@/components/LessonLayout";
import { CheckQuiz } from "@/components/CheckQuiz";
import { lesson05Meta } from "@/data/lesson05";
import { ui } from "@/lib/ui-text";

export default function Lesson5CheckPage() {
  return (
    <LessonLayout
      lessonNumber={5}
      currentStep="check"
      title={ui.check.title}
      subtitle={ui.check.subtitle}
      lessonId={lesson05Meta.id}
      showMemo
    >
      <CheckQuiz lessonNumber={5} />
    </LessonLayout>
  );
}
