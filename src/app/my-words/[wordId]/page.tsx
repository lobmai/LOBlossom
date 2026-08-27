import Link from "next/link";
import { BlossomPageShell } from "@/components/BlossomPageShell";
import { MyWordsDetail } from "@/components/my-words/MyWordsDetail";
import { ui } from "@/lib/ui-text";

interface MyWordsDetailPageProps {
  params: Promise<{ wordId: string }>;
}

export default async function MyWordsDetailPage({
  params,
}: MyWordsDetailPageProps) {
  const { wordId } = await params;

  return (
    <BlossomPageShell className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/my-words"
          prefetch
          className="text-sm font-medium text-gray-500 transition hover:text-blossom-600"
        >
          {ui.myWords.backToList}
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          {ui.myWords.title}
        </h1>
      </div>

      <MyWordsDetail wordId={decodeURIComponent(wordId)} />
    </BlossomPageShell>
  );
}
