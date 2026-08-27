import Link from "next/link";
import { BlossomPageShell } from "@/components/BlossomPageShell";
import { LessonSelectCard } from "@/components/LessonSelectCard";
import { LESSON_REGISTRY } from "@/lib/lessons/registry";
import { ui } from "@/lib/ui-text";

/** レッスン選択画面 */
export default function LessonSelectPage() {
  const lessons = Object.values(LESSON_REGISTRY).sort((a, b) => a.number - b.number);

  return (
    <BlossomPageShell className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{ui.lessonSelect.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{ui.lessonSelect.subtitle}</p>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <LessonSelectCard key={lesson.meta.id} lesson={lesson} />
        ))}

        <Link
          href="/my-loop"
          className="inline-flex w-full items-center justify-center rounded-xl border border-blossom-200 bg-white px-6 py-3 text-sm font-medium text-blossom-600 transition hover:bg-blossom-50"
        >
          {ui.lessonSelect.myLoopLink}
        </Link>

        <Link
          href="/my-words"
          className="inline-flex w-full items-center justify-center rounded-xl border border-sky-200 bg-sky-50/50 px-6 py-3 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
        >
          {ui.lessonSelect.myWordsLink}
        </Link>
      </div>
    </BlossomPageShell>
  );
}
