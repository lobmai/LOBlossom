import Link from "next/link";
import { BlossomPageShell } from "@/components/BlossomPageShell";
import { MyLoopList } from "@/components/MyLoopList";
import { PrefetchOnMount } from "@/components/PrefetchOnMount";
import { LESSON_SELECT_PATH } from "@/lib/lessons/registry";
import { ui } from "@/lib/ui-text";

export default function MyLoopPage() {
  return (
    <BlossomPageShell className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <PrefetchOnMount hrefs={[LESSON_SELECT_PATH, "/"]} />
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-x-4">
          <Link
            href="/"
            prefetch
            className="inline-flex min-h-11 items-center text-sm font-medium text-gray-500 transition hover:text-blossom-600"
          >
            {ui.nav.backToTop}
          </Link>
          <Link
            href={LESSON_SELECT_PATH}
            prefetch
            className="inline-flex min-h-11 items-center text-sm font-medium text-gray-500 transition hover:text-blossom-600"
          >
            {ui.myLoop.backHome}
          </Link>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{ui.myLoop.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{ui.myLoop.subtitle}</p>
      </div>

      <MyLoopList />
    </BlossomPageShell>
  );
}
