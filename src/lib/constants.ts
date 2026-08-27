import type { LessonStep, LessonStepConfig } from "@/types/lesson";
import { ui } from "@/lib/ui-text";

export function getLessonSteps(lessonNumber: number): LessonStepConfig[] {
  const base = `/lesson/${lessonNumber}`;
  return [
    { id: "lesson", stepNumber: 1, label: ui.steps.lesson, path: base },
    { id: "check", stepNumber: 2, label: ui.steps.check, path: `${base}/check` },
    {
      id: "summarize",
      stepNumber: 3,
      label: ui.steps.summarize,
      path: `${base}/summarize`,
    },
    {
      id: "evaluate",
      stepNumber: 4,
      label: ui.steps.evaluate,
      path: `${base}/evaluate`,
    },
    { id: "answer", stepNumber: 5, label: ui.steps.answer, path: `${base}/answer` },
    {
      id: "finalize",
      stepNumber: 6,
      label: ui.steps.finalize,
      path: `${base}/finalize`,
    },
    { id: "save", stepNumber: 7, label: ui.steps.save, path: `${base}/save` },
  ];
}

/** @deprecated lesson 1 固定 */
export const LESSON_STEPS = getLessonSteps(1);

export function getStepConfig(
  lessonNumber: number,
  step: LessonStep,
): LessonStepConfig {
  const config = getLessonSteps(lessonNumber).find((s) => s.id === step);
  if (!config) throw new Error(`Unknown step: ${step}`);
  return config;
}

export function getNextStepPath(lessonNumber: number, step: LessonStep): string | null {
  const steps = getLessonSteps(lessonNumber);
  const index = steps.findIndex((s) => s.id === step);
  if (index === -1 || index === steps.length - 1) return null;
  return steps[index + 1].path;
}
