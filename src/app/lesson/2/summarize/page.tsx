import { LessonLayout } from "@/components/LessonLayout";
import { SummarizeForm } from "@/components/SummarizeForm";
import { lesson02Meta } from "@/data/lesson02";
import { ui } from "@/lib/ui-text";

export default function Lesson2SummarizePage() {
  return (
    <LessonLayout
      lessonNumber={2}
      currentStep="summarize"
      title={ui.summarize.title}
      subtitle={ui.summarize.subtitle}
      lessonId={lesson02Meta.id}
      showMemo
    >
      <SummarizeForm lessonNumber={2} />
    </LessonLayout>
  );
}
