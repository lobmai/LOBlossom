import { LessonLayout } from "@/components/LessonLayout";
import { EvaluateCoach } from "@/components/EvaluateCoach";
import { lesson02Meta } from "@/data/lesson02";
import { ui } from "@/lib/ui-text";

export default function Lesson2EvaluatePage() {
  return (
    <LessonLayout
      lessonNumber={2}
      currentStep="evaluate"
      title={ui.evaluate.title}
      subtitle={ui.evaluate.subtitle}
      lessonId={lesson02Meta.id}
      showMemo
    >
      <EvaluateCoach lessonNumber={2} />
    </LessonLayout>
  );
}
