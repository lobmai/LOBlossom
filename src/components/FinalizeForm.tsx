"use client";



import Link from "next/link";

import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { SaveErrorBanner } from "@/components/SaveErrorBanner";

import { StepNavigation } from "@/components/StepNavigation";

import { buildLesson01FinalSummary, replaceLesson01MyPoints } from "@/lib/build-lesson01-final-summary";

import { buildFinalSummary } from "@/lib/build-final-summary";

import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import {
  logPerfElapsed,
  measureFromNavStart,
  perfLog,
  startPerfTimer,
} from "@/lib/perf-log";
import { isMeaningfulText } from "@/lib/answer-quality";
import {
  collectMyPointsPolishSource,
  fallbackMyPointsFromAnswers,
  resolveMyPointsSourceKind,
  toStoredMyPointsFinal,
} from "@/lib/polish-my-points";
import { FinalizePreviewEditCard } from "@/components/FinalizePreviewEditCard";
import { getMyLoopSavedFields } from "@/lib/my-loop-display";
import {
  canEditFinalizePreview,
  resolveEditedPreviewValue,
} from "@/lib/finalize-preview-edit";
import { FINAL_L1_MY_POINTS_ID } from "@/lib/lessons/lesson01-final-summary";

import { getLesson, getLessonStepPath } from "@/lib/lessons/registry";

import {

  isFinalSummaryComplete,

  validateLessonReadyForFinalize,

} from "@/lib/lesson-finalize-validation";

import {

  fromLabeledAnswers,

  loadDraft,

  saveDraft,

  saveDraftFinalizeResult,

} from "@/lib/record-store";

import {
  getFinalSummarySections,
  isLegacyFinalSummary,
} from "@/lib/summary-fields";

import { ui } from "@/lib/ui-text";

import type { LabeledAnswer, LessonRecord } from "@/types/record";



const inputClassName =

  "w-full resize-y rounded-xl border border-gray-200 p-3 text-base leading-relaxed text-gray-800 focus:border-blossom-300 focus:outline-none focus:ring-2 focus:ring-blossom-100 sm:text-sm";

let finalizeLoadSeq = 0;

async function requestPolishedMyPoints(userAnswers: string[]): Promise<string | null> {
  const answers = userAnswers.map((a) => a.trim()).filter(Boolean);
  if (answers.length === 0) return null;
  const startedAt = startPerfTimer();
  perfLog("polish", "client fetch start");
  try {
    const response = await fetchWithTimeout("/api/coach/polish-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAnswers: answers }),
    });
    logPerfElapsed("polish", "client fetch", startedAt);
    if (!response.ok) return fallbackMyPointsFromAnswers(answers);
    const data = (await response.json()) as { polishedText?: string };
    return (
      toStoredMyPointsFinal(data.polishedText) ??
      fallbackMyPointsFromAnswers(answers)
    );
  } catch {
    logPerfElapsed("polish", "client fetch (failed)", startedAt);
    return fallbackMyPointsFromAnswers(answers);
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

  const draftRef = useRef<LessonRecord | null>(null);

  const [loopPreview, setLoopPreview] = useState<ReturnType<
    typeof getMyLoopSavedFields
  > | null>(null);

  const mountLoggedRef = useRef(false);
  if (!mountLoggedRef.current) {
    mountLoggedRef.current = true;
    perfLog("FinalizeForm", "FinalizeForm mount");
    perfLog("FinalizeForm", "loading UI shown (initial loading=true)");
    measureFromNavStart("answer-to-finalize", "click → mount");
    measureFromNavStart("answer-to-finalize", "click → loading UI");
  }

  function applyLoopPreview(
    draft: LessonRecord,
    summary: LabeledAnswer[],
    myPointsFinal?: string | null,
  ) {
    const next: LessonRecord = {
      ...draft,
      finalSummary: summary,
      myPointsFinal:
        myPointsFinal !== undefined ? myPointsFinal : draft.myPointsFinal,
    };
    draftRef.current = next;
    setLoopPreview(getMyLoopSavedFields(next));
  }

  useEffect(() => {

    let cancelled = false;



    async function load() {

      const runId = ++finalizeLoadSeq;

      const loadStartedAt = startPerfTimer();

      perfLog("FinalizeForm", `load start run=${runId}`);

      try {

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

        let polished = toStoredMyPointsFinal(draft!.myPointsFinal);

        if (!polished) {

          const sourceKind = resolveMyPointsSourceKind(lesson.summary);

          const answers = collectMyPointsPolishSource(

            sourceKind,

            draft!.trajectoryEntries,

            draft!.coachSession,

          );

          if (lessonId === "lesson-01-be-verb") {

            const currentPoints = list.find((e) => e.id === FINAL_L1_MY_POINTS_ID)?.answer.trim() ?? "";

            const rawCoach = draft!.coachAnswer?.trim() ?? "";

            if (currentPoints && rawCoach && currentPoints === rawCoach) {

              const next = await requestPolishedMyPoints(answers);

              if (next) {

                list = replaceLesson01MyPoints(list, next);

                polished = next;

              }

            } else if (currentPoints && isMeaningfulText(currentPoints)) {

              polished = currentPoints;

            }

          } else {

            polished = await requestPolishedMyPoints(answers);

          }

          if (!cancelled) {

            saveDraftFinalizeResult(lessonId, list, undefined, polished ?? undefined);

          }

        }

        if (!cancelled) {

          applyLoopPreview(draft!, list, polished);

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

            draft!.userExampleFinal,

          );

          const userAnswers = collectMyPointsPolishSource(

            resolveMyPointsSourceKind(lesson.summary),

            draft!.trajectoryEntries,

            draft!.coachSession,

          );

          const polished = await requestPolishedMyPoints(userAnswers);

          if (polished) {

            built = replaceLesson01MyPoints(built, polished);

          }

          if (!cancelled) {

            saveDraftFinalizeResult(lessonId, built, undefined, polished ?? undefined);

            applyLoopPreview(draft!, built, polished ?? draft!.myPointsFinal);

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

        const startedAt = startPerfTimer();

        perfLog("finalize", `client fetch start run=${runId}`);

        try {

          const response = await fetchWithTimeout("/api/coach/finalize", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({

              lessonId,

              summaryEntries: draft!.trajectoryEntries,

              aiEvaluation: draft!.aiEvaluation,

              coachAnswer: draft!.coachAnswer,

              userExampleFinal: draft!.userExampleFinal ?? null,

            }),

          });



          logPerfElapsed("finalize", `client fetch run=${runId}`, startedAt);



          if (response.ok) {

            const data = (await response.json()) as {

              finalSummary: LabeledAnswer[];

            };

            if (!cancelled && data.finalSummary?.length) {

              const finalizeEndedAt = startPerfTimer();

              const existingPoints = toStoredMyPointsFinal(draft!.myPointsFinal);

              logPerfElapsed(

                "FinalizeForm",

                `finalize end → polish start run=${runId}`,

                finalizeEndedAt,

              );

              if (existingPoints) {

                perfLog("FinalizeForm", `polish skipped (myPointsFinal exists) run=${runId}`);

              }

              const polished =

                existingPoints ??

                (await requestPolishedMyPoints(

                  collectMyPointsPolishSource(

                    resolveMyPointsSourceKind(lesson.summary),

                    draft!.trajectoryEntries,

                    draft!.coachSession,

                  ),

                ));

              const saveStartedAt = startPerfTimer();

              saveDraftFinalizeResult(

                lessonId,

                data.finalSummary,

                undefined,

                polished ?? undefined,

              );

              logPerfElapsed(

                "FinalizeForm",

                `AI end → draft save run=${runId}`,

                saveStartedAt,

              );

              applyLoopPreview(

                draft!,

                data.finalSummary,

                polished ?? draft!.myPointsFinal,

              );

              setFinalList(data.finalSummary);

              setEntries(fromLabeledAnswers(data.finalSummary));

              setHydrated(true);

              setLoading(false);

              return;

            }

          }

        } catch {

          logPerfElapsed("finalize", `client fetch (failed) run=${runId}`, startedAt);

        }

      }



      const fallback = buildFinalSummary(

        lessonId,

        draft!.trajectoryEntries,

        draft!.aiEvaluation,

      );



      if (!cancelled) {

        const polishGapStartedAt = startPerfTimer();

        const existingPoints = toStoredMyPointsFinal(draft!.myPointsFinal);

        logPerfElapsed(

          "FinalizeForm",

          `finalize end → polish start run=${runId}`,

          polishGapStartedAt,

        );

        if (existingPoints) {

          perfLog("FinalizeForm", `polish skipped (myPointsFinal exists) run=${runId}`);

        }

        const polished =

          existingPoints ??

          (await requestPolishedMyPoints(

            collectMyPointsPolishSource(

              resolveMyPointsSourceKind(lesson.summary),

              draft!.trajectoryEntries,

              draft!.coachSession,

            ),

          ));

        const saveStartedAt = startPerfTimer();

        saveDraftFinalizeResult(lessonId, fallback, undefined, polished ?? undefined);

        logPerfElapsed("FinalizeForm", `AI end → draft save run=${runId}`, saveStartedAt);

        applyLoopPreview(draft!, fallback, polished ?? draft!.myPointsFinal);

        setFinalList(fallback);

        setEntries(fromLabeledAnswers(fallback));

        setHydrated(true);

        setLoading(false);

      }

      } finally {

        logPerfElapsed("FinalizeForm", `total run=${runId}`, loadStartedAt);

      }

    }



    void load();

    return () => {

      cancelled = true;

    };

  }, [lessonId, lesson.summary]);



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

    const result = saveDraftFinalizeResult(

      lessonId,

      finalSummary,

      undefined,

      lessonId === "lesson-01-be-verb"

        ? toStoredMyPointsFinal(nextEntries[FINAL_L1_MY_POINTS_ID]) ?? undefined

        : undefined,

    );

    setSaveError(!result.ok);

    setFinalList(finalSummary);

    if (draftRef.current) {
      applyLoopPreview(
        draftRef.current,
        finalSummary,
        lessonId === "lesson-01-be-verb"
          ? toStoredMyPointsFinal(nextEntries[FINAL_L1_MY_POINTS_ID])
          : draftRef.current.myPointsFinal,
      );
    }

  }

  function persistPreviewEdit(
    patch: Partial<
      Pick<
        LessonRecord,
        "myPointsFinal" | "userExampleFinal" | "userExampleJapanese"
      >
    >,
  ): boolean {
    const draft = draftRef.current;
    if (!draft) return false;
    const next = { ...draft, ...patch };
    const result = saveDraft(next);
    setSaveError(!result.ok);
    if (!result.ok) return false;
    applyLoopPreview(next, next.finalSummary ?? finalList, next.myPointsFinal);
    return true;
  }

  function savePreviewPoints(raw: string): boolean {
    const next = resolveEditedPreviewValue("points", raw);
    if (!next) return false;
    return persistPreviewEdit({ myPointsFinal: next });
  }

  function savePreviewExample(raw: string): boolean {
    const next = resolveEditedPreviewValue("example", raw);
    if (!next) return false;
    return persistPreviewEdit({ userExampleFinal: next });
  }

  function savePreviewJapanese(raw: string): boolean {
    const next = resolveEditedPreviewValue("japanese", raw);
    if (!next) return false;
    return persistPreviewEdit({ userExampleJapanese: next });
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

      {loopPreview && (
        <div className="mt-8 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-900">
              {ui.finalize.savedPreviewTitle}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {ui.finalize.savedPreviewNote}
            </p>
          </div>
          <section className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900">
              ■ {ui.myLoop.lessonSummary}
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {loopPreview.summary || ui.myLoop.noSummary}
            </p>
          </section>
          <FinalizePreviewEditCard
            title={ui.myLoop.myPoints}
            display={loopPreview.points}
            emptyLabel={ui.myLoop.noPoints}
            canEdit={canEditFinalizePreview(lessonId)}
            onSave={savePreviewPoints}
          />
          <FinalizePreviewEditCard
            title={ui.myLoop.myExample}
            display={loopPreview.example}
            emptyLabel={ui.myLoop.noExample}
            canEdit={canEditFinalizePreview(lessonId)}
            mono
            onSave={savePreviewExample}
          />
          <FinalizePreviewEditCard
            title={ui.finalize.exampleJapanese}
            display={loopPreview.exampleJa}
            emptyLabel={ui.myLoop.noExample}
            canEdit={canEditFinalizePreview(lessonId)}
            onSave={savePreviewJapanese}
          />
        </div>
      )}

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

