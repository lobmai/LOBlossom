"use client";

import { ExampleWithGloss } from "@/components/WordGloss";
import { SpeakButton } from "@/components/SpeakButton";

/** Step3 用：例文＋読み上げボタン（固定英文） */
export function SpeakableExample({
  sentence,
  keyword,
  meaning,
  kind,
  audioRef,
}: {
  sentence: string;
  keyword?: string;
  meaning?: string;
  kind?: string;
  audioRef: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        {kind && (
          <p className="mb-1 text-[11px] font-medium text-blossom-600">{kind}</p>
        )}
        <ExampleWithGloss sentence={sentence} keyword={keyword} meaning={meaning} />
      </div>
      <SpeakButton audioRef={audioRef} />
    </div>
  );
}
