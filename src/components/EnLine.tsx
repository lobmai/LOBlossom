"use client";

import type { ReactNode } from "react";
import { SpeakButton } from "@/components/SpeakButton";

/** レッスン本文の英文＋和訳行（音声ボタンは右側に統一） */
export function EnLine({
  en,
  ja,
  audioRef,
  audioRefs,
}: {
  en: ReactNode;
  ja: string;
  audioRef?: string;
  audioRefs?: string[];
}) {
  const refs = audioRefs ?? (audioRef ? [audioRef] : []);

  return (
    <li className="space-y-1.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 leading-relaxed">{en}</div>
        {refs.length > 0 && (
          <div
            className={`flex shrink-0 flex-col items-center gap-2 ${
              refs.length > 1 ? "pt-0.5" : "self-start"
            }`}
          >
            {refs.map((ref) => (
              <SpeakButton key={ref} audioRef={ref} />
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500">＝ {ja}</p>
    </li>
  );
}
