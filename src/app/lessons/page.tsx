import Link from "next/link";
import { BlossomPageShell } from "@/components/BlossomPageShell";
import { LessonSelectCard } from "@/components/LessonSelectCard";
import { PrefetchOnMount } from "@/components/PrefetchOnMount";
import { getLessonBasePath, LESSON_REGISTRY } from "@/lib/lessons/registry";
import { getSpecialLesson, getSpecialLessonPath } from "@/lib/special-lessons/registry";
import { ui } from "@/lib/ui-text";

/** レッスン選択画面 */
export default function LessonSelectPage() {
  const lessons = Object.values(LESSON_REGISTRY).sort((a, b) => a.number - b.number);
  const prefetchHrefs = [
    ...lessons.map((lesson) => getLessonBasePath(lesson.number)),
    ...lessons.flatMap((lesson) => {
      const special = getSpecialLesson(lesson.number);
      return special ? [getSpecialLessonPath(lesson.number)] : [];
    }),
    "/my-loop",
    "/my-words",
    "/",
  ];

  return (
    <BlossomPageShell className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <PrefetchOnMount hrefs={prefetchHrefs} />
      <Link
        href="/"
        prefetch
        className="mb-4 inline-flex min-h-11 items-center text-sm text-gray-500 hover:text-blossom-500"
      >
        {ui.nav.backToTop}
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{ui.lessonSelect.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{ui.lessonSelect.subtitle}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3">
        <Link
          href="/my-loop"
          prefetch
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blossom-200 bg-white/70 px-3 py-2.5 text-sm font-medium text-blossom-600 transition hover:bg-blossom-50"
        >
          {ui.lessonSelect.myLoopLink}
        </Link>
        <Link
          href="/my-words"
          prefetch
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-200 bg-white/70 px-3 py-2.5 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
        >
          {ui.lessonSelect.myWordsLink}
        </Link>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <LessonSelectCard key={lesson.meta.id} lesson={lesson} />
        ))}
      </div>
    </BlossomPageShell>
  );
}
