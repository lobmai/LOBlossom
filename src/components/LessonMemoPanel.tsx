"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { loadLessonMemo, saveLessonMemo } from "@/lib/memo-store";
import { ui } from "@/lib/ui-text";

export function LessonMemoPanel({ lessonId }: { lessonId: string }) {
  const [open, setOpen] = useState(false);
  const [memo, setMemo] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    setMemo(loadLessonMemo(lessonId));
    setHydrated(true);
  }, [lessonId]);

  const persist = useCallback(
    (value: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveLessonMemo(lessonId, value);
      }, 300);
    },
    [lessonId],
  );

  function handleChange(value: string) {
    setMemo(value);
    persist(value);
  }

  if (!hydrated) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-blossom-200 bg-white/95 px-3.5 py-2 text-xs font-medium text-blossom-700 shadow-sm backdrop-blur transition hover:border-blossom-300 hover:bg-blossom-50 sm:bottom-6 sm:right-6 sm:text-sm"
        aria-expanded={open}
        aria-controls="lesson-memo-panel"
      >
        📝 {ui.memo.button}
      </button>

      {open && (
        <button
          type="button"
          aria-label={ui.memo.close}
          className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        id="lesson-memo-panel"
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[55vh] transform rounded-t-2xl border border-blossom-100 bg-white shadow-lg transition-transform duration-200 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-80 sm:max-h-[70vh] sm:rounded-2xl ${
          open ? "translate-y-0" : "translate-y-full sm:translate-y-4 sm:opacity-0 sm:pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between border-b border-blossom-50 px-4 py-3">
          <p className="text-sm font-bold text-gray-900">{ui.memo.title}</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            {ui.memo.close}
          </button>
        </div>
        <div className="p-4">
          <p className="mb-2 text-xs text-gray-500">{ui.memo.hint}</p>
          <textarea
            value={memo}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={ui.memo.placeholder}
            className="min-h-32 w-full resize-y rounded-xl border border-gray-200 p-3 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:border-blossom-300 focus:outline-none focus:ring-2 focus:ring-blossom-100"
          />
        </div>
      </div>
    </>
  );
}
