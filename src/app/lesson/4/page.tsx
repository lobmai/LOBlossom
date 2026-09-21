import { LessonLayout } from "@/components/LessonLayout";
import { Lesson04Content } from "@/components/lessons/Lesson04Content";
import { StepNavigation } from "@/components/StepNavigation";
import { lesson04Meta } from "@/data/lesson04";
import { getLessonStepPath } from "@/lib/lessons/registry";
import { ui } from "@/lib/ui-text";

export default function Lesson4Page() {
  return (
    <LessonLayout
      lessonNumber={4}
      currentStep="lesson"
      title={lesson04Meta.title}
      subtitle={`約${lesson04Meta.readingMinutes}分 · まずは読んでみよう\n大事なところや気になったところはメモしておこう！`}
      lessonId={lesson04Meta.id}
      showMemo
    >
      <Lesson04Content />

      <StepNavigation
        backHref="/lessons"
        backLabel={ui.nav.top}
        nextHref={getLessonStepPath(4, "check")}
        nextLabel="理解度テストへ →"
      />
    </LessonLayout>
  );
}
