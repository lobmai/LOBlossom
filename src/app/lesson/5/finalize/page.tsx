import { LessonLayout } from "@/components/LessonLayout";
import { FinalizeForm } from "@/components/FinalizeForm";
import { lesson05Meta } from "@/data/lesson05";
import { ui } from "@/lib/ui-text";

export default function Lesson5FinalizePage() {
  return (
    <LessonLayout
      lessonNumber={5}
      currentStep="finalize"
      title={ui.finalize.title}
      subtitle={ui.finalize.subtitle}
      lessonId={lesson05Meta.id}
      showMemo
    >
      <FinalizeForm lessonNumber={5} />
    </LessonLayout>
  );
}
