import { LessonLayout } from "@/components/LessonLayout";
import { EvaluateCoach } from "@/components/EvaluateCoach";
import { lesson05Meta } from "@/data/lesson05";
import { ui } from "@/lib/ui-text";

export default function Lesson5EvaluatePage() {
  return (
    <LessonLayout
      lessonNumber={5}
      currentStep="evaluate"
      title={ui.evaluate.title}
      subtitle={ui.evaluate.subtitle}
      lessonId={lesson05Meta.id}
      showMemo
    >
      <EvaluateCoach lessonNumber={5} />
    </LessonLayout>
  );
}
