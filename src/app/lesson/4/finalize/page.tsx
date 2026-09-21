import { LessonLayout } from "@/components/LessonLayout";
import { FinalizeForm } from "@/components/FinalizeForm";
import { lesson04Meta } from "@/data/lesson04";
import { ui } from "@/lib/ui-text";

export default function Lesson4FinalizePage() {
  return (
    <LessonLayout
      lessonNumber={4}
      currentStep="finalize"
      title={ui.finalize.title}
      subtitle={ui.finalize.subtitle}
      lessonId={lesson04Meta.id}
      showMemo
    >
      <FinalizeForm lessonNumber={4} />
    </LessonLayout>
  );
}
