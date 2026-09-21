/** 遷移中・初回読み込み中の枠。白い空白を避ける */
export function PageContentSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-2xl border border-blossom-100 bg-white/70"
        />
      ))}
    </div>
  );
}
