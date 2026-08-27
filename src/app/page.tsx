import Link from "next/link";
import { BlossomPageShell } from "@/components/BlossomPageShell";
import { LESSON_SELECT_PATH } from "@/lib/lessons/registry";
import { ui } from "@/lib/ui-text";

/** LOBlossom タイトル画面（レッスン一覧は表示しない） */
export default function TitlePage() {
  return (
    <BlossomPageShell className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-20">
      <div className="relative z-10 w-full text-center">
        <p className="mb-3 text-sm font-medium tracking-wide text-blossom-500">
          {ui.titleScreen.tagline}
        </p>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          LOBlossom
        </h1>
        <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-gray-600">
          {ui.titleScreen.lead}
          <br />
          {ui.titleScreen.lead2}
        </p>
        <Link
          href={LESSON_SELECT_PATH}
          className="inline-flex min-w-[12rem] items-center justify-center rounded-xl bg-blossom-500 px-8 py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-blossom-600 active:scale-[0.98]"
        >
          {ui.titleScreen.startButton}
        </Link>
      </div>
    </BlossomPageShell>
  );
}
