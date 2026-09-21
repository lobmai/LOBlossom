import { LessonLayout } from "@/components/LessonLayout";
import { SummarizeForm } from "@/components/SummarizeForm";
import { lesson04Meta } from "@/data/lesson04";
import { ui } from "@/lib/ui-text";

export default function Lesson4SummarizePage() {
  return (
    <LessonLayout
      lessonNumber={4}
      currentStep="summarize"
      title={ui.summarize.title}
      subtitle={ui.summarize.subtitle}
      lessonId={lesson04Meta.id}
      showMemo
    >
      <SummarizeForm lessonNumber={4} />
    </LessonLayout>
  );
}
