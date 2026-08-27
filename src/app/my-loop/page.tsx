import Link from "next/link";
import { BlossomPageShell } from "@/components/BlossomPageShell";
import { MyLoopList } from "@/components/MyLoopList";
import { LESSON_SELECT_PATH } from "@/lib/lessons/registry";
import { ui } from "@/lib/ui-text";

export default function MyLoopPage() {
  return (
    <BlossomPageShell className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <div className="mb-8">
        <Link
          href={LESSON_SELECT_PATH}
          className="text-sm font-medium text-gray-500 transition hover:text-blossom-600"
        >
          {ui.myLoop.backHome}
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">{ui.myLoop.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{ui.myLoop.subtitle}</p>
      </div>

      <MyLoopList />
    </BlossomPageShell>
  );
}
