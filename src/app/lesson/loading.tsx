import { PageContentSkeleton } from "@/components/PageContentSkeleton";

export default function LessonLoading() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <div className="mb-8 space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-white/80" />
        <div className="h-8 w-52 animate-pulse rounded-lg bg-white/80" />
        <div className="h-4 w-full max-w-sm animate-pulse rounded bg-white/70" />
      </div>
      <PageContentSkeleton rows={4} />
    </div>
  );
}
