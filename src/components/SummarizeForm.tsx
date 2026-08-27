"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SpeakableExample } from "@/components/SpeakableExample";
import { SaveErrorBanner } from "@/components/SaveErrorBanner";
import { StepNavigation } from "@/components/StepNavigation";
import { getLesson, getLessonStepPath } from "@/lib/lessons/registry";
import { resetDraftAfterSummarize } from "@/lib/record-store";
import {
  POINTS_ID,
  toTrajectoryEntries,
  UNCLEAR_CHOICE_ID,
  UNCLEAR_DETAIL_ID,
} from "@/lib/summary-fields";
import { isSummaryComplete, hasLowQualityFields } from "@/lib/summary-validation";
import { ui } from "@/lib/ui-text";
import { useLessonDraft } from "@/lib/use-lesson-draft";

const inputClassName =
  "w-full resize-y rounded-xl border border-gray-200 p-3 text-base leading-relaxed text-gray-800 placeholder:text-gray-400 focus:border-blossom-300 focus:outline-none focus:ring-2 focus:ring-blossom-100 sm:text-sm";

export function SummarizeForm({ lessonNumber }: { lessonNumber: number }) {
  const lesson = getLesson(lessonNumber)!;
  const { meta, summary: config } = lesson;
  const router = useRouter();

  const { saveError, isReady, getInitialTrajectoryValues } = useLessonDraft({
    lessonId: meta.id,
    lessonTitle: meta.title,
  });

  const [entries, setEntries] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [showEmptyHint, setShowEmptyHint] = useState(false);
  const [navigating, setNavigating] = useState(false);

  useLayoutEffect(() => {
    if (isReady && !hydrated) {
      const initial = getInitialTrajectoryValues();
      setEntries(
        Object.keys(initial).length > 0
          ? { ...initial, [UNCLEAR_CHOICE_ID]: initial[UNCLEAR_CHOICE_ID] ?? "none" }
          : { [UNCLEAR_CHOICE_ID]: "none" },
      );
      setHydrated(true);
    }
  }, [isReady, hydrated, getInitialTrajectoryValues]);

  const isComplete = useMemo(
    () => isSummaryComplete(meta.id, entries),
    [meta.id, entries],
  );
  const showQualityHint = useMemo(
    () => hasLowQualityFields(meta.id, entries),
    [meta.id, entries],
  );
  const hasUnclear = entries[UNCLEAR_CHOICE_ID] === "yes";

  function persist(next: Record<string, string>) {
    resetDraftAfterSummarize(meta.id, toTrajectoryEntries(meta.id, next));
  }

  function handleChange(id: string, value: string) {
    const next = { ...entries, [id]: value };
    setEntries(next);
    persist(next);
    if (value.trim()) setShowEmptyHint(false);
  }

  function handleUnclearChoice(value: "none" | "yes") {
    const next: Record<string, string> = { ...entries, [UNCLEAR_CHOICE_ID]: value };
    if (value === "none") next[UNCLEAR_DETAIL_ID] = "";
    setEntries(next);
    persist(next);
    setShowEmptyHint(false);
  }

  function handleNext() {
    if (!isComplete || navigating) {
      if (!isComplete) setShowEmptyHint(true);
      return;
    }
    setNavigating(true);
    persist(entries);
    router.push(getLessonStepPath(lessonNumber, "evaluate"));
  }

  if (!hydrated) return null;

  let sectionIndex = 1;

  return (
    <>
      <div className="space-y-6">
        {config.meaningSentences.length > 0 && (
        <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-gray-900">
            {sectionIndex++}. {config.sectionLabels.meaning}
          </p>
          <div className="space-y-4">
            {config.meaningSentences.map((item) => (
              <div key={item.id}>
                <label htmlFor={`summary-${item.id}`} className="mb-2 block">
                  <SpeakableExample
                    kind={item.kind}
                    sentence={item.sentence}
                    keyword={item.keyword}
                    meaning={item.keywordMeaning}
                    audioRef={`lesson${lessonNumber}.step3.${item.id}`}
                  />
                </label>
                <input
                  id={`summary-${item.id}`}
                  type="text"
                  value={entries[item.id] ?? ""}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                  placeholder="日本語で意味を書こう"
                  className={inputClassName}
                />
              </div>
            ))}
          </div>
        </div>
        )}

        {(config.meaningFields ?? []).map((field) => (
          <div
            key={field.id}
            className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm"
          >
            <label
              htmlFor={`summary-${field.id}`}
              className="mb-2 block text-sm font-bold text-gray-900"
            >
              {sectionIndex++}. {field.label}
            </label>
            {field.hint && (
              <p className="mb-3 text-xs text-gray-500">{field.hint}</p>
            )}
            <input
              id={`summary-${field.id}`}
              type="text"
              value={entries[field.id] ?? ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={inputClassName}
            />
          </div>
        ))}

        <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-gray-900">
            {sectionIndex++}. {config.sectionLabels.usage}
          </p>
          <div className="space-y-4">
            {config.usageFields.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <label
                  htmlFor={`summary-${item.id}`}
                  className="shrink-0 text-sm font-bold text-blossom-700 sm:w-36"
                >
                  {item.label}
                </label>
                <input
                  id={`summary-${item.id}`}
                  type="text"
                  value={entries[item.id] ?? ""}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                  placeholder={item.placeholder}
                  className={inputClassName}
                />
              </div>
            ))}
          </div>
        </div>

        {config.extraFields.map((field) => (
          <div
            key={field.id}
            className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm"
          >
            <label
              htmlFor={`summary-${field.id}`}
              className="mb-2 block text-sm font-bold text-gray-900"
            >
              {sectionIndex++}. {field.label}
            </label>
            {field.hint && (
              <p className="mb-3 text-xs text-gray-500">{field.hint}</p>
            )}
            <input
              id={`summary-${field.id}`}
              type="text"
              value={entries[field.id] ?? ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={inputClassName}
            />
          </div>
        ))}

        <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-gray-900">
            {sectionIndex++}. {config.sectionLabels.unclear}
          </p>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="unclear-choice"
                checked={entries[UNCLEAR_CHOICE_ID] === "none"}
                onChange={() => handleUnclearChoice("none")}
                className="text-blossom-500"
              />
              なし
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="unclear-choice"
                checked={entries[UNCLEAR_CHOICE_ID] === "yes"}
                onChange={() => handleUnclearChoice("yes")}
                className="text-blossom-500"
              />
              ある
            </label>
          </div>
          {hasUnclear && (
            <textarea
              id={`summary-${UNCLEAR_DETAIL_ID}`}
              value={entries[UNCLEAR_DETAIL_ID] ?? ""}
              onChange={(e) => handleChange(UNCLEAR_DETAIL_ID, e.target.value)}
              placeholder="分からなかったことを書こう"
              className={`${inputClassName} mt-4 min-h-24`}
            />
          )}
        </div>

        {config.includePointsInTrajectory !== false && (
        <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
          <label
            htmlFor={`summary-${POINTS_ID}`}
            className="mb-2 block text-sm font-bold text-gray-900"
          >
            {sectionIndex++}. {config.sectionLabels.points}
          </label>
          <textarea
            id={`summary-${POINTS_ID}`}
            value={entries[POINTS_ID] ?? ""}
            onChange={(e) => handleChange(POINTS_ID, e.target.value)}
            placeholder="自分にとって大切だと思ったことを書こう"
            className={`${inputClassName} min-h-28`}
          />
        </div>
        )}

        <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
          <p className="mb-2 text-sm font-bold text-gray-900">
            {sectionIndex++}. {config.sectionLabels.userExample}
          </p>
          <p className="mb-4 text-sm text-gray-600">
            今回学んだ内容を使って、英文を1つ作ってみよう。
          </p>
          {config.userExampleFields.map((field) => (
            <div key={field.id}>
              {field.hint && (
                <p className="mb-2 text-xs text-gray-500">{field.hint}</p>
              )}
              <input
                id={`summary-${field.id}`}
                type="text"
                value={entries[field.id] ?? ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`${inputClassName} font-mono text-sm`}
              />
            </div>
          ))}
        </div>
      </div>

      {showEmptyHint && (
        <p className="mt-4 rounded-xl bg-blossom-50 px-4 py-3 text-center text-sm text-blossom-700">
          {ui.summarize.emptyHint}
        </p>
      )}

      {showQualityHint && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          {ui.summarize.qualityHint}
        </p>
      )}

      {saveError && <SaveErrorBanner />}

      <StepNavigation
        backHref={getLessonStepPath(lessonNumber, "check")}
        nextHref={getLessonStepPath(lessonNumber, "evaluate")}
        nextLabel={navigating ? ui.summarize.navigating : ui.summarize.toEvaluate}
        onNextClick={handleNext}
        nextDisabled={!isComplete || navigating}
        nextLoading={navigating}
      />
    </>
  );
}
