import { LessonLayout } from "@/components/LessonLayout";
import { FinalizeForm } from "@/components/FinalizeForm";
import { lesson02Meta } from "@/data/lesson02";
import { ui } from "@/lib/ui-text";

export default function Lesson2FinalizePage() {
  return (
    <LessonLayout
      lessonNumber={2}
      currentStep="finalize"
      title={ui.finalize.title}
      subtitle={ui.finalize.subtitle}
      lessonId={lesson02Meta.id}
      showMemo
    >
      <FinalizeForm lessonNumber={2} />
    </LessonLayout>
  );
}
