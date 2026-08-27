import { lesson01SpecialConfig } from "@/data/special/lesson01-vocab";
import type { SpecialLessonConfig } from "@/lib/special-lessons/types";

/** 親レッスン番号 → Special 設定（Lesson2以降もここに追加） */
export const SPECIAL_LESSON_BY_PARENT: Record<number, SpecialLessonConfig> = {
  1: lesson01SpecialConfig,
};

export function getSpecialLesson(parentLessonNumber: number): SpecialLessonConfig | undefined {
  return SPECIAL_LESSON_BY_PARENT[parentLessonNumber];
}

export function getSpecialLessonPath(parentLessonNumber: number): string {
  return `/lesson/${parentLessonNumber}/special`;
}

const SPECIAL_COMPLETED_PREFIX = "loblossom:special-completed:";

export function isSpecialCompleted(specialId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`${SPECIAL_COMPLETED_PREFIX}${specialId}`) === "1";
}

export function markSpecialCompleted(specialId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${SPECIAL_COMPLETED_PREFIX}${specialId}`, "1");
}
