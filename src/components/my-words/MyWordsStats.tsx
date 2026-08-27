"use client";

import type { WordStatus, WordStatusCounts } from "@/types/my-words";
import { ui } from "@/lib/ui-text";

export type StatusVisibility = Record<WordStatus, boolean>;

type MyWordsStatsProps = {
  total: number;
  counts: WordStatusCounts;
  visibility: StatusVisibility;
  onToggle: (status: WordStatus) => void;
};

const FILTER_BUTTONS: {
  status: WordStatus;
  label: string;
  onClass: string;
}[] = [
  {
    status: "practicing",
    label: ui.myWords.statsPracticing,
    onClass: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    status: "new",
    label: ui.myWords.statsNew,
    onClass: "border-sky-200 bg-sky-50 text-sky-800",
  },
  {
    status: "weak",
    label: ui.myWords.statsWeak,
    onClass: "border-rose-200 bg-rose-50 text-rose-800",
  },
  {
    status: "learned",
    label: ui.myWords.statsLearned,
    onClass: "border-leaf-200 bg-leaf-50 text-leaf-800",
  },
];

export function MyWordsStats({
  total,
  counts,
  visibility,
  onToggle,
}: MyWordsStatsProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-blossom-200 bg-blossom-50 px-4 py-4 text-center text-blossom-800 shadow-sm">
        <p className="text-2xl font-bold tabular-nums">{total}</p>
        <p className="mt-1 text-xs font-medium">{ui.myWords.statsTotal}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FILTER_BUTTONS.map((button) => {
          const on = visibility[button.status];
          return (
            <button
              key={button.status}
              type="button"
              onClick={() => onToggle(button.status)}
              aria-pressed={on}
              className={`rounded-xl border px-3 py-3 text-center transition ${
                on
                  ? button.onClass
                  : "border-gray-200 bg-gray-100 text-gray-400 opacity-60"
              }`}
            >
              <p className="text-xl font-bold tabular-nums">
                {counts[button.status]}
              </p>
              <p className="mt-1 text-[11px] leading-tight">{button.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
