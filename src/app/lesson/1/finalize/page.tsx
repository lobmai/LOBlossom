import { LessonLayout } from "@/components/LessonLayout";
import { FinalizeForm } from "@/components/FinalizeForm";
import { lesson01Meta } from "@/data/lesson01";
import { ui } from "@/lib/ui-text";

export default function Lesson1FinalizePage() {
  return (
    <LessonLayout
      lessonNumber={1}
      currentStep="finalize"
      title={ui.finalize.title}
      subtitle={ui.finalize.subtitle}
      lessonId={lesson01Meta.id}
      showMemo
    >
      <FinalizeForm lessonNumber={1} />
    </LessonLayout>
  );
}
