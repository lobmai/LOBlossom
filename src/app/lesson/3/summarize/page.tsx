import { LessonLayout } from "@/components/LessonLayout";
import { SummarizeForm } from "@/components/SummarizeForm";
import { lesson03Meta } from "@/data/lesson03";
import { ui } from "@/lib/ui-text";

export default function Lesson3SummarizePage() {
  return (
    <LessonLayout
      lessonNumber={3}
      currentStep="summarize"
      title={ui.summarize.title}
      subtitle={ui.summarize.subtitle}
      lessonId={lesson03Meta.id}
      showMemo
    >
      <SummarizeForm lessonNumber={3} />
    </LessonLayout>
  );
}
