import { LessonLayout } from "@/components/LessonLayout";
import { SaveForm } from "@/components/SaveForm";
import { ui } from "@/lib/ui-text";

export default function Lesson4SavePage() {
  return (
    <LessonLayout
      lessonNumber={4}
      currentStep="save"
      title={ui.save.master.replace("1", "4")}
      subtitle={ui.save.subtitle}
    >
      <SaveForm lessonNumber={4} />
    </LessonLayout>
  );
}
