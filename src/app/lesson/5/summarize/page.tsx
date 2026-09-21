import { LessonLayout } from "@/components/LessonLayout";
import { SummarizeForm } from "@/components/SummarizeForm";
import { lesson05Meta } from "@/data/lesson05";
import { ui } from "@/lib/ui-text";

export default function Lesson5SummarizePage() {
  return (
    <LessonLayout
      lessonNumber={5}
      currentStep="summarize"
      title={ui.summarize.title}
      subtitle={ui.summarize.subtitle}
      lessonId={lesson05Meta.id}
      showMemo
    >
      <SummarizeForm lessonNumber={5} />
    </LessonLayout>
  );
}
