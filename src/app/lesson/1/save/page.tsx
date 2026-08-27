import { LessonLayout } from "@/components/LessonLayout";
import { SaveForm } from "@/components/SaveForm";
import { ui } from "@/lib/ui-text";

export default function Lesson1SavePage() {
  return (
    <LessonLayout
      lessonNumber={1}
      currentStep="save"
      title={ui.save.title}
      subtitle={ui.save.subtitle}
    >
      <SaveForm lessonNumber={1} />
    </LessonLayout>
  );
}
