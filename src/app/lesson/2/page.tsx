import { LessonLayout } from "@/components/LessonLayout";
import { Lesson02Content } from "@/components/lessons/Lesson02Content";
import { StepNavigation } from "@/components/StepNavigation";
import { lesson02Meta } from "@/data/lesson02";
import { getLessonStepPath } from "@/lib/lessons/registry";
import { ui } from "@/lib/ui-text";

export default function Lesson2Page() {
  return (
    <LessonLayout
      lessonNumber={2}
      currentStep="lesson"
      title={lesson02Meta.title}
      subtitle={`約${lesson02Meta.readingMinutes}分 · まずは読んでみよう`}
      lessonId={lesson02Meta.id}
      showMemo
    >
      <Lesson02Content />

      <StepNavigation
        backHref="/lessons"
        backLabel={ui.nav.top}
        nextHref={getLessonStepPath(2, "check")}
        nextLabel="理解度テストへ →"
      />
    </LessonLayout>
  );
}
