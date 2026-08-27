import { LessonLayout } from "@/components/LessonLayout";
import { SummarizeForm } from "@/components/SummarizeForm";
import { lesson01Meta } from "@/data/lesson01";
import { ui } from "@/lib/ui-text";

export default function Lesson1SummarizePage() {
  return (
    <LessonLayout
      lessonNumber={1}
      currentStep="summarize"
      title={ui.summarize.title}
      subtitle={ui.summarize.subtitle}
      lessonId={lesson01Meta.id}
      showMemo
    >
      <SummarizeForm lessonNumber={1} />
    </LessonLayout>
  );
}
