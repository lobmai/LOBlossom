import { LessonLayout } from "@/components/LessonLayout";
import { EvaluateCoach } from "@/components/EvaluateCoach";
import { lesson04Meta } from "@/data/lesson04";
import { ui } from "@/lib/ui-text";

export default function Lesson4EvaluatePage() {
  return (
    <LessonLayout
      lessonNumber={4}
      currentStep="evaluate"
      title={ui.evaluate.title}
      subtitle={ui.evaluate.subtitle}
      lessonId={lesson04Meta.id}
      showMemo
    >
      <EvaluateCoach lessonNumber={4} />
    </LessonLayout>
  );
}
