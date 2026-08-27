import Link from "next/link";
import { BlossomPageShell } from "@/components/BlossomPageShell";
import { MyLoopDetail } from "@/components/MyLoopDetail";
import { ui } from "@/lib/ui-text";

interface MyLoopDetailPageProps {
  params: Promise<{ recordId: string }>;
}

export default async function MyLoopDetailPage({ params }: MyLoopDetailPageProps) {
  const { recordId } = await params;

  return (
    <BlossomPageShell className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/my-loop"
          prefetch
          className="text-sm font-medium text-gray-500 transition hover:text-blossom-600"
        >
          {ui.myLoop.backToList}
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">{ui.myLoop.title}</h1>
      </div>

      <MyLoopDetail recordId={decodeURIComponent(recordId)} />
    </BlossomPageShell>
  );
}
