import { LessonLayout } from "@/components/LessonLayout";
import { Lesson03Content } from "@/components/lessons/Lesson03Content";
import { StepNavigation } from "@/components/StepNavigation";
import { lesson03Meta } from "@/data/lesson03";
import { getLessonStepPath } from "@/lib/lessons/registry";
import { ui } from "@/lib/ui-text";

export default function Lesson3Page() {
  return (
    <LessonLayout
      lessonNumber={3}
      currentStep="lesson"
      title={lesson03Meta.title}
      subtitle={`約${lesson03Meta.readingMinutes}分 · まずは読んでみよう\n大事なところや気になったところはメモしておこう！`}
      lessonId={lesson03Meta.id}
      showMemo
    >
      <Lesson03Content />

      <StepNavigation
        backHref="/lessons"
        backLabel={ui.nav.top}
        nextHref={getLessonStepPath(3, "check")}
        nextLabel="理解度テストへ →"
      />
    </LessonLayout>
  );
}
