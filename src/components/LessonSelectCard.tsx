"use client";

import Link from "next/link";
import { getLessonBasePath } from "@/lib/lessons/registry";
import { getSpecialLesson, getSpecialLessonPath } from "@/lib/special-lessons/registry";
import type { LessonRegistryEntry } from "@/lib/lessons/types";
import { ui } from "@/lib/ui-text";

/** レッスン選択画面用カード（registry から自動生成） */
export function LessonSelectCard({ lesson }: { lesson: LessonRegistryEntry }) {
  const special = getSpecialLesson(lesson.number);

  return (
    <div className="rounded-2xl border border-blossom-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <p className="mb-1 text-xs font-medium text-leaf-600">🌱 レッスン{lesson.number}</p>
      <h2 className="mb-2 text-xl font-bold text-gray-900">{lesson.meta.title}</h2>
      <p className="mb-5 text-sm text-gray-600">{lesson.meta.subtitle}</p>
      <Link
        href={getLessonBasePath(lesson.number)}
        className="inline-flex w-full items-center justify-center rounded-xl bg-blossom-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-blossom-600"
      >
        レッスンをはじめる →
      </Link>
      {special && (
        <div className="mt-4 border-t border-blossom-100 pt-4">
          <p className="mb-2 text-xs font-medium text-leaf-600">{ui.lessonSelect.specialLabel}</p>
          <Link
            href={getSpecialLessonPath(lesson.number)}
            className="inline-flex w-full items-center justify-center rounded-xl border border-blossom-200 bg-white px-6 py-2.5 text-sm font-medium text-blossom-600 transition hover:bg-blossom-50"
          >
            {ui.lessonSelect.specialButton}
          </Link>
        </div>
      )}
    </div>
  );
}
