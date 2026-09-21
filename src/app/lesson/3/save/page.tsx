import { LessonLayout } from "@/components/LessonLayout";
import { SaveForm } from "@/components/SaveForm";
import { ui } from "@/lib/ui-text";

export default function Lesson3SavePage() {
  return (
    <LessonLayout
      lessonNumber={3}
      currentStep="save"
      title={ui.save.master.replace("1", "3")}
      subtitle={ui.save.subtitle}
    >
      <SaveForm lessonNumber={3} />
    </LessonLayout>
  );
}
