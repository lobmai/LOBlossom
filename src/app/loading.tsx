import { BlossomPageShell } from "@/components/BlossomPageShell";
import { PageContentSkeleton } from "@/components/PageContentSkeleton";

export default function AppLoading() {
  return (
    <BlossomPageShell className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-white/80" />
        <div className="h-4 w-64 animate-pulse rounded bg-white/70" />
      </div>
      <PageContentSkeleton rows={4} />
    </BlossomPageShell>
  );
}
