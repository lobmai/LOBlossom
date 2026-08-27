"use client";



import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { SaveErrorBanner } from "@/components/SaveErrorBanner";

import { StepNavigation } from "@/components/StepNavigation";

import { buildLesson01FinalSummary, replaceLesson01MyPoints } from "@/lib/build-lesson01-final-summary";

import { buildFinalSummary } from "@/lib/build-final-summary";

import { fetchWithTimeout, logDevTiming } from "@/lib/fetch-with-timeout";
import { getMyPointsSourceAnswers } from "@/lib/polish-my-points";
import { FINAL_L1_MY_POINTS_ID } from "@/lib/lessons/lesson01-final-summary";

import { getLesson, getLessonStepPath } from "@/lib/lessons/registry";

import {

  isFinalSummaryComplete,

  validateLessonReadyForFinalize,

} from "@/lib/lesson-finalize-validation";

import {

  fromLabeledAnswers,

  loadDraft,

  saveDraftFinalizeResult,

} from "@/lib/record-store";

import {
  getFinalSummarySections,
  isLegacyFinalSummary,
} from "@/lib/summary-fields";

import { ui } from "@/lib/ui-text";

import type { LabeledAnswer } from "@/types/record";



const inputClassName =

  "w-full resize-y rounded-xl border border-gray-200 p-3 text-base leading-relaxed text-gray-800 focus:border-blossom-300 focus:outline-none focus:ring-2 focus:ring-blossom-100 sm:text-sm";

async function polishLesson01MyPoints(
  entries: LabeledAnswer[],
  userAnswers: string[],
): Promise<LabeledAnswer[]> {
  if (userAnswers.length === 0) return entries;
  const startedAt = performance.now();
  try {
    const response = await fetchWithTimeout("/api/coach/polish-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAnswers }),
    });
    logDevTiming("polish-points API", startedAt);
    if (!response.ok) return entries;
    const data = (await response.json()) as { polishedText?: string };
    if (!data.polishedText?.trim()) return entries;
    return replaceLesson01MyPoints(entries, data.polishedText);
  } catch {
    logDevTiming("polish-points API (failed)", startedAt);
    return entries;
  }
}



export function FinalizeForm({ lessonNumber }: { lessonNumber: number }) {

  const lesson = getLesson(lessonNumber)!;

  const lessonId = lesson.meta.id;

  const router = useRouter();

  const sections = getFinalSummarySections(lessonId);

  const isMultiSection = sections.length > 1;



  const [entries, setEntries] = useState<Record<string, string>>({});

  const [finalList, setFinalList] = useState<LabeledAnswer[]>([]);

  const [saveError, setSaveError] = useState(false);

  const [hydrated, setHydrated] = useState(false);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState(false);

  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const [navigating, setNavigating] = useState(false);



  useEffect(() => {

    let cancelled = false;



    async function load() {

      const draft = loadDraft(lessonId);

      const readiness = validateLessonReadyForFinalize(draft);



      if (!readiness.ready) {

        if (!cancelled) {

          setBlockedReason(readiness.reason ?? "unknown");

          setLoadError(true);

          setLoading(false);

        }

        return;

      }



      const hasValidFinal =

        draft!.finalSummary &&

        draft!.finalSummary.length > 0 &&

        !isLegacyFinalSummary(draft!.finalSummary);



      if (hasValidFinal) {

        let list = draft!.finalSummary!;

        if (lessonId === "lesson-01-be-verb") {

          const currentPoints = list.find((e) => e.id === FINAL_L1_MY_POINTS_ID)?.answer.trim() ?? "";

          const rawCoach = draft!.coachAnswer?.trim() ?? "";

          if (currentPoints && rawCoach && currentPoints === rawCoach) {

            list = await polishLesson01MyPoints(

              list,

              getMyPointsSourceAnswers(draft!.coachSession),

            );

            if (!cancelled) {

              saveDraftFinalizeResult(lessonId, list);

            }

          }

        }

        if (!cancelled) {

          setFinalList(list);

          setEntries(fromLabeledAnswers(list));

          setHydrated(true);

          setLoading(false);

        }

        return;

      }



      if (lessonId === "lesson-01-be-verb") {

        try {

          let built = buildLesson01FinalSummary(

            draft!.trajectoryEntries,

            draft!.coachAnswer,

          );

          const userAnswers = getMyPointsSourceAnswers(draft!.coachSession);

          built = await polishLesson01MyPoints(built, userAnswers);

          if (!cancelled) {

            saveDraftFinalizeResult(lessonId, built);

            setFinalList(built);

            setEntries(fromLabeledAnswers(built));

            setHydrated(true);

            setLoading(false);

          }

          return;

        } catch {

          if (!cancelled) {

            setBlockedReason("coach-answer");

            setLoadError(true);

            setLoading(false);

          }

          return;

        }

      }



      if (draft!.aiEvaluation) {

        const startedAt = performance.now();

        try {

          const response = await fetchWithTimeout("/api/coach/finalize", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({

              lessonId,

              summaryEntries: draft!.trajectoryEntries,

              aiEvaluation: draft!.aiEvaluation,

              coachAnswer: draft!.coachAnswer,

            }),

          });



          logDevTiming("finalize API", startedAt);



          if (response.ok) {

            const data = (await response.json()) as {

              finalSummary: LabeledAnswer[];

              userExampleJapanese: string | null;

            };

            if (!cancelled && data.finalSummary?.length) {

              saveDraftFinalizeResult(lessonId, data.finalSummary, data.userExampleJapanese);

              setFinalList(data.finalSummary);

              setEntries(fromLabeledAnswers(data.finalSummary));

              setHydrated(true);

              setLoading(false);

              return;

            }

          }

        } catch {

          logDevTiming("finalize API (failed)", startedAt);

        }

      }



      const fallback = buildFinalSummary(

        lessonId,

        draft!.trajectoryEntries,

        draft!.aiEvaluation,

      );



      if (!cancelled) {

        saveDraftFinalizeResult(lessonId, fallback);

        setFinalList(fallback);

        setEntries(fromLabeledAnswers(fallback));

        setHydrated(true);

        setLoading(false);

      }

    }



    void load();

    return () => {

      cancelled = true;

    };

  }, [lessonId]);



  const isComplete = useMemo(

    () => isFinalSummaryComplete(lessonId, finalList.map((item) => ({

      ...item,

      answer: (entries[item.id] ?? "").trim(),

    }))),

    [lessonId, finalList, entries],

  );



  function persistFinalSummary(nextEntries: Record<string, string>) {

    const finalSummary = finalList.map((item) => ({

      ...item,

      answer: (nextEntries[item.id] ?? "").trim(),

    }));

    const result = saveDraftFinalizeResult(lessonId, finalSummary);

    setSaveError(!result.ok);

    setFinalList(finalSummary);

  }



  function handleChange(id: string, value: string) {

    const next = { ...entries, [id]: value };

    setEntries(next);

    persistFinalSummary(next);

  }



  function handleNext() {

    if (!isComplete || navigating) return;

    setNavigating(true);

    persistFinalSummary(entries);

    router.push(getLessonStepPath(lessonNumber, "save"));

  }



  if (loading) {

    return (

      <div className="rounded-2xl border border-blossom-100 bg-blossom-50/80 p-8 text-center shadow-sm">

        <p className="text-2xl">📝</p>

        <p className="mt-3 text-sm font-medium text-blossom-700">{ui.finalize.loading}</p>

      </div>

    );

  }



  if (loadError || !hydrated) {

    const message =

      blockedReason === "coach-answer"

        ? ui.finalize.blockedCoachAnswer

        : blockedReason === "trajectory"

          ? ui.finalize.blockedTrajectory

          : blockedReason === "evaluation"

            ? ui.finalize.blockedEvaluation

            : ui.finalize.error;



    return (

      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-6 text-center shadow-sm">

        <p className="text-sm text-gray-700">{message}</p>

        <Link

          href={

            blockedReason === "coach-answer"

              ? getLessonStepPath(lessonNumber, "answer")

              : blockedReason === "evaluation"

                ? getLessonStepPath(lessonNumber, "evaluate")

                : getLessonStepPath(lessonNumber, "summarize")

          }

          className="mt-4 inline-flex rounded-xl bg-blossom-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blossom-600"

        >

          {ui.finalize.backToFix}

        </Link>

      </div>

    );

  }



  return (

    <>

      <p className="mb-4 text-sm text-gray-600">{ui.finalize.subtitleShort}</p>



      <div className="space-y-4">

        {sections.map((section) => (

          <div

            key={section.id}

            className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm"

          >

            <label

              htmlFor={`final-${section.id}`}

              className="mb-2 block text-sm font-bold text-gray-900"

            >

              {section.label}

            </label>

            <textarea

              id={`final-${section.id}`}

              value={entries[section.id] ?? ""}

              onChange={(e) => handleChange(section.id, e.target.value)}

              className={`${inputClassName} ${isMultiSection ? "min-h-28" : "min-h-36"}`}

            />

          </div>

        ))}

      </div>



      {saveError && <SaveErrorBanner />}



      <StepNavigation

        backHref={getLessonStepPath(lessonNumber, "answer")}

        nextHref={getLessonStepPath(lessonNumber, "save")}

        nextLabel={navigating ? ui.finalize.navigating : ui.finalize.next}

        onNextClick={handleNext}

        nextDisabled={!isComplete || navigating}

        nextLoading={navigating}

      />

    </>

  );

}

