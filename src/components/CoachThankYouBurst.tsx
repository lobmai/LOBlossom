"use client";

export function CoachThankYouBurst({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <span className="coach-thank-you-burst" aria-hidden>
      <span className="coach-thank-you-glow" />
      <span className="relative z-10 text-2xl leading-none">💡</span>
    </span>
  );
}
