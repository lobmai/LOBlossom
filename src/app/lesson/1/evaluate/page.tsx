import { LessonLayout } from "@/components/LessonLayout";
import { EvaluateCoach } from "@/components/EvaluateCoach";
import { lesson01Meta } from "@/data/lesson01";
import { ui } from "@/lib/ui-text";

export default function Lesson1EvaluatePage() {
  return (
    <LessonLayout
      lessonNumber={1}
      currentStep="evaluate"
      title={ui.evaluate.title}
      subtitle={ui.evaluate.subtitle}
      lessonId={lesson01Meta.id}
      showMemo
    >
      <EvaluateCoach lessonNumber={1} />
    </LessonLayout>
  );
}
