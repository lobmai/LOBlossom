import { LessonLayout } from "@/components/LessonLayout";
import { CheckQuiz } from "@/components/CheckQuiz";
import { lesson04Meta } from "@/data/lesson04";
import { ui } from "@/lib/ui-text";

export default function Lesson4CheckPage() {
  return (
    <LessonLayout
      lessonNumber={4}
      currentStep="check"
      title={ui.check.title}
      subtitle={ui.check.subtitle}
      lessonId={lesson04Meta.id}
      showMemo
    >
      <CheckQuiz lessonNumber={4} />
    </LessonLayout>
  );
}
