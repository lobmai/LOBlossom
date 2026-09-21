import { LessonLayout } from "@/components/LessonLayout";
import { EvaluateCoach } from "@/components/EvaluateCoach";
import { lesson03Meta } from "@/data/lesson03";
import { ui } from "@/lib/ui-text";

export default function Lesson3EvaluatePage() {
  return (
    <LessonLayout
      lessonNumber={3}
      currentStep="evaluate"
      title={ui.evaluate.title}
      subtitle={ui.evaluate.subtitle}
      lessonId={lesson03Meta.id}
      showMemo
    >
      <EvaluateCoach lessonNumber={3} />
    </LessonLayout>
  );
}
