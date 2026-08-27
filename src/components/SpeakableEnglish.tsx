"use client";

import type { ReactNode } from "react";
import { SpeakButton } from "@/components/SpeakButton";

type SpeakableEnglishProps = {
  audioRef: string;
  children?: ReactNode;
  className?: string;
  /** inline=文中、block=表など横幅いっぱいで右寄せ */
  layout?: "inline" | "block";
};

/** 英文の横にスピーカーボタン（固定教材用） */
export function SpeakableEnglish({
  audioRef,
  children,
  className = "",
  layout = "inline",
}: SpeakableEnglishProps) {
  if (layout === "block") {
    return (
      <span
        className={`flex w-full items-start justify-between gap-3 ${className}`}
      >
        <span className="min-w-0 flex-1">{children}</span>
        <SpeakButton audioRef={audioRef} />
      </span>
    );
  }

  return (
    <span className={`inline-flex max-w-full items-start gap-2 ${className}`}>
      <span className="min-w-0">{children}</span>
      <SpeakButton audioRef={audioRef} />
    </span>
  );
}
