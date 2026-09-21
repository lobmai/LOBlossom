import { LessonLayout } from "@/components/LessonLayout";
import { SaveForm } from "@/components/SaveForm";
import { ui } from "@/lib/ui-text";

export default function Lesson5SavePage() {
  return (
    <LessonLayout
      lessonNumber={5}
      currentStep="save"
      title={ui.save.master.replace("1", "5")}
      subtitle={ui.save.subtitle}
    >
      <SaveForm lessonNumber={5} />
    </LessonLayout>
  );
}
