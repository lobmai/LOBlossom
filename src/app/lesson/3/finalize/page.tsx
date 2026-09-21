import { LessonLayout } from "@/components/LessonLayout";
import { FinalizeForm } from "@/components/FinalizeForm";
import { lesson03Meta } from "@/data/lesson03";
import { ui } from "@/lib/ui-text";

export default function Lesson3FinalizePage() {
  return (
    <LessonLayout
      lessonNumber={3}
      currentStep="finalize"
      title={ui.finalize.title}
      subtitle={ui.finalize.subtitle}
      lessonId={lesson03Meta.id}
      showMemo
    >
      <FinalizeForm lessonNumber={3} />
    </LessonLayout>
  );
}
