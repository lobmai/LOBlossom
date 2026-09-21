"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  emptyLessonMemo,
  loadLessonMemoFields,
  saveLessonMemoFields,
  type LessonMemoFields,
} from "@/lib/memo-store";
import { ui } from "@/lib/ui-text";

const fieldClassName =
  "min-h-20 w-full resize-y rounded-xl border border-blossom-100 bg-white p-3 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:border-blossom-300 focus:outline-none focus:ring-2 focus:ring-blossom-100";

const MEMO_FIELDS: {
  key: keyof LessonMemoFields;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "meaning",
    label: ui.memo.meaning,
    placeholder: ui.memo.meaningPlaceholder,
  },
  {
    key: "grammar",
    label: ui.memo.grammar,
    placeholder: ui.memo.grammarPlaceholder,
  },
  {
    key: "important",
    label: ui.memo.important,
    placeholder: ui.memo.importantPlaceholder,
  },
  {
    key: "other",
    label: ui.memo.other,
    placeholder: ui.memo.otherPlaceholder,
  },
];

export function LessonMemoPanel({ lessonId }: { lessonId: string }) {
  const [open, setOpen] = useState(false);
  const [memo, setMemo] = useState<LessonMemoFields>(emptyLessonMemo);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    setMemo(loadLessonMemoFields(lessonId));
    setHydrated(true);
  }, [lessonId]);

  const persist = useCallback(
    (value: LessonMemoFields) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveLessonMemoFields(lessonId, value);
      }, 300);
    },
    [lessonId],
  );

  function handleChange(key: keyof LessonMemoFields, value: string) {
    const next = { ...memo, [key]: value };
    setMemo(next);
    persist(next);
  }

  if (!hydrated) return null;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={ui.memo.close}
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-24 right-0 z-50 flex items-start max-h-[min(32rem,calc(100dvh-9rem))] transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-[calc(100%-1.75rem)]"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-16 w-7 shrink-0 items-center justify-center rounded-l-md border border-r-0 border-blossom-200 bg-blossom-100 text-[10px] font-medium tracking-widest text-blossom-800 shadow-sm [writing-mode:vertical-rl]"
          aria-expanded={open}
          aria-controls="lesson-memo-panel"
        >
          {ui.memo.button}
        </button>

        <div
          id="lesson-memo-panel"
          aria-hidden={!open}
          className={`flex w-[min(18rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-l-lg border border-blossom-200 bg-blossom-50 shadow-lg sm:w-80 ${
            open ? "" : "pointer-events-none"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-blossom-100 px-3 py-2.5">
            <p className="text-sm font-bold text-blossom-900">{ui.memo.title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-white/80 hover:text-gray-700"
            >
              {ui.memo.close}
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            <p className="text-xs text-gray-500">{ui.memo.hint}</p>
            {MEMO_FIELDS.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`lesson-memo-${field.key}`}
                  className="mb-1 block text-xs font-bold text-gray-800"
                >
                  {field.label}
                </label>
                <textarea
                  id={`lesson-memo-${field.key}`}
                  value={memo[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={fieldClassName}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
