import Link from "next/link";
import { VocabSpecialQuiz } from "@/components/special/VocabSpecialQuiz";
import { getSpecialLesson } from "@/lib/special-lessons/registry";
import { LESSON_SELECT_PATH } from "@/lib/lessons/registry";

export default function Lesson1SpecialPage() {
  const config = getSpecialLesson(1);
  if (!config) {
    return null;
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <header className="mb-8">
        <Link
          href={LESSON_SELECT_PATH}
          className="mb-4 inline-block text-sm text-gray-500 hover:text-blossom-500"
        >
          ← レッスン選択
        </Link>
        <p className="text-xs font-medium text-leaf-600">🌸 ボーナス復習</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{config.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{config.subtitle}</p>
        <p className="mt-2 text-xs text-gray-500">
          レッスン1をクリアしたあとの単語復習です。やらなくてもレッスン1はクリア済みのままです。
        </p>
      </header>
      <VocabSpecialQuiz config={config} />
    </div>
  );
}
