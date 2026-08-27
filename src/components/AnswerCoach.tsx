"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isMeaningfulCoachAnswer } from "@/lib/answer-quality";
import { isInsufficientEvaluation } from "@/lib/coach-eval-display";
import {
  appendExchange,
  createInitialCoachSession,
  isCoachSessionFinished,
  resetHintRound,
  synthesizeCoachPointsFromSession,
  updateSessionStatus,
} from "@/lib/coach-session";
import { getFixedCoachQuestion } from "@/lib/coach-teach-question";
import {
  buildLocalHint,
  buildLocalTeachContent,
  getRubricForLesson,
  isStruggleAnswer,
  pickDefaultRubricPointId,
} from "@/lib/coach-teach-hints";
import { postCoachApi } from "@/lib/coach-fetch";
import { getLesson, getLessonStepPath } from "@/lib/lessons/registry";
import {
  loadDraft,
  saveDraftCoachQuestion,
  saveDraftCoachSession,
} from "@/lib/record-store";
import { ui } from "@/lib/ui-text";
import { StepNavigation } from "@/components/StepNavigation";
import { CoachThankYouBurst } from "@/components/CoachThankYouBurst";
import {
  COACH_COMPLETE_CLOSING_MESSAGE,
  playThankYouSoundOnce,
  unlockThankYouSound,
} from "@/lib/coach-complete-celebration";
import type {
  CoachExchange,
  CoachQuestion,
  CoachSession,
  TeachEvaluateResult,
} from "@/types/record";

const inputClassName =
  "min-h-32 w-full resize-y rounded-xl border border-gray-200 p-4 text-base leading-relaxed text-gray-800 placeholder:text-gray-400 focus:border-blossom-300 focus:outline-none focus:ring-2 focus:ring-blossom-100 sm:text-sm";

function exchangeBubbleClass(exchange: CoachExchange): string {
  if (exchange.role === "user") {
    return "ml-8 rounded-2xl rounded-tr-sm bg-blossom-100/80 px-4 py-3 text-sm text-gray-800";
  }
  if (exchange.kind === "hint") {
    return "mr-8 rounded-2xl rounded-tl-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-gray-800";
  }
  if (exchange.kind === "teach") {
    return "mr-8 rounded-2xl rounded-tl-sm border border-leaf-200 bg-leaf-50 px-4 py-3 text-sm text-gray-800";
  }
  if (exchange.kind === "closing") {
    return "mr-8 rounded-2xl rounded-tl-sm border border-blossom-200 bg-blossom-50 px-4 py-3 text-sm text-gray-800";
  }
  return "mr-8 rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-gray-800 shadow-sm";
}

export function AnswerCoach({ lessonNumber }: { lessonNumber: number }) {
  const lesson = getLesson(lessonNumber)!;
  const lessonId = lesson.meta.id;
  const { teachQuestion } = lesson.summary;
  const router = useRouter();

  const [coachQuestion, setCoachQuestion] = useState<CoachQuestion | null>(null);
  const [session, setSession] = useState<CoachSession | null>(null);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [showEmptyHint, setShowEmptyHint] = useState(false);
  const [showQualityHint, setShowQualityHint] = useState(false);
  const [showSessionHint, setShowSessionHint] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showThankYouBurst, setShowThankYouBurst] = useState(false);
  const thankYouPlayedRef = useRef(false);
  const submitLockRef = useRef(false);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);

  function triggerCompleteCelebration() {
    if (thankYouPlayedRef.current) return;
    thankYouPlayedRef.current = true;
    playThankYouSoundOnce();
    setShowThankYouBurst(true);
    window.setTimeout(() => setShowThankYouBurst(false), 900);
  }

  function syncAnswerFromTextarea() {
    const value = answerInputRef.current?.value ?? "";
    setDraftAnswer(value);
    if (value.trim()) {
      setShowEmptyHint(false);
      setShowQualityHint(false);
    }
  }

  function clearAnswerInput() {
    setDraftAnswer("");
    if (answerInputRef.current) {
      answerInputRef.current.value = "";
    }
  }

  function handleAnswerInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraftAnswer(e.target.value);
    if (e.target.value.trim()) {
      setShowEmptyHint(false);
      setShowQualityHint(false);
    }
  }

  /** 右クリック貼り付け等：React 合成イベントを経由しない入力も state に反映 */
  useEffect(() => {
    if (!hydrated || blocked || !session || isCoachSessionFinished(session)) {
      return;
    }

    const el = answerInputRef.current;
    if (!el) return;

    const onNativeInput = () => syncAnswerFromTextarea();
    el.addEventListener("input", onNativeInput);
    return () => el.removeEventListener("input", onNativeInput);
  }, [hydrated, blocked, session]);

  useEffect(() => {
    const draft = loadDraft(lessonId);
    if (!draft?.aiEvaluation || isInsufficientEvaluation(draft.aiEvaluation)) {
      setBlocked(true);
      setHydrated(true);
      return;
    }

    const question = draft.coachQuestion ?? getFixedCoachQuestion(lessonId);
    if (!draft.coachQuestion) {
      saveDraftCoachQuestion(lessonId, question);
    }

    const initialSession =
      draft.coachSession ??
      createInitialCoachSession(question.question);

    if (!draft.coachSession) {
      saveDraftCoachSession(lessonId, initialSession);
    }

    setCoachQuestion(question);
    setSession(initialSession);
    setBlocked(false);
    setHydrated(true);
  }, [lessonId]);

  const persistSession = useCallback(
    (nextSession: CoachSession) => {
      const consolidated = synthesizeCoachPointsFromSession(
        nextSession,
        lessonId,
      );
      saveDraftCoachSession(
        lessonId,
        nextSession,
        consolidated || undefined,
      );
      setSession(nextSession);
    },
    [lessonId],
  );

  const conversationHistory = useCallback((s: CoachSession) => {
    return s.exchanges.map((e) => ({
      role: e.role,
      text: e.text,
    }));
  }, []);

  const handleLocalHint = useCallback(
    (current: CoachSession, answerText: string, rubricPointId: string) => {
      const rubric = getRubricForLesson(lessonId);
      if (!rubric) return current;

      let next = appendExchange(current, {
        role: "user",
        kind: "answer",
        text: answerText,
        rubricPointId,
      });

      const hintLevel = next.hintLevel;
      if (hintLevel >= 2) {
        const teachText = buildLocalTeachContent(rubric, rubricPointId);
        next = appendExchange(next, {
          role: "coach",
          kind: "teach",
          text: teachText,
          rubricPointId,
        });
        const closing =
          "こう覚えておこう！しっかり伝わったよ。教えてくれてありがとう😊";
        next = appendExchange(next, {
          role: "coach",
          kind: "closing",
          text: closing,
          rubricPointId,
        });
        next = updateSessionStatus(next, "taught", {
          closingMessage: closing,
          hintLevel: 0,
          activeRubricPointId: rubricPointId,
          pendingFollowUpQuestion: undefined,
        });
        return next;
      }

      const hint = buildLocalHint(rubric, rubricPointId, hintLevel, {
        isInitialBroadHint:
          current.followUpCount === 0 &&
          current.status !== "awaiting-followup",
      });
      if (hint) {
        next = appendExchange(next, {
          role: "coach",
          kind: "hint",
          text: hint,
          rubricPointId,
        });
      }

      next = updateSessionStatus(next, "showing-hint", {
        hintLevel: hintLevel + 1,
        activeRubricPointId: rubricPointId,
      });
      return next;
    },
    [lessonId],
  );

  const applyTeachResult = useCallback(
    (current: CoachSession, result: TeachEvaluateResult, answerText: string) => {
      let next = appendExchange(current, {
        role: "user",
        kind: "answer",
        text: answerText,
        rubricPointId: result.targetRubricPointId ?? current.activeRubricPointId,
      });

      if (result.outcome === "complete") {
        const closing = COACH_COMPLETE_CLOSING_MESSAGE;
        next = appendExchange(next, {
          role: "coach",
          kind: "closing",
          text: closing,
        });
        next = updateSessionStatus(next, "complete", {
          closingMessage: closing,
          hintLevel: 0,
          pendingFollowUpQuestion: undefined,
        });
        return next;
      }

      if (result.outcome === "followup" && result.followUpQuestion) {
        const rubricForPoint = getRubricForLesson(lessonId);
        const pointId =
          result.targetRubricPointId ??
          current.activeRubricPointId ??
          (rubricForPoint ? pickDefaultRubricPointId(rubricForPoint) : undefined);

        next = appendExchange(next, {
          role: "coach",
          kind: "followup-question",
          text: result.followUpQuestion,
          rubricPointId: pointId,
        });

        next = updateSessionStatus(next, "awaiting-followup", {
          followUpCount: current.followUpCount + 1,
          hintLevel: 0,
          activeRubricPointId: pointId,
          pendingFollowUpQuestion: result.followUpQuestion,
        });
        return next;
      }

      const teachText =
        result.teachContent?.trim() ||
        (getRubricForLesson(lessonId)
          ? buildLocalTeachContent(
              getRubricForLesson(lessonId)!,
              result.targetRubricPointId ?? current.activeRubricPointId,
            )
          : "レッスンで学んだ内容を、もう一度確認してみよう。");
      next = appendExchange(next, {
        role: "coach",
        kind: "teach",
        text: teachText,
        rubricPointId: result.targetRubricPointId ?? undefined,
      });
      const closing =
        result.closingMessage?.trim() ||
        "しっかり伝わったよ！教えてくれてありがとう😊";
      next = appendExchange(next, {
        role: "coach",
        kind: "closing",
        text: closing,
      });
      next = updateSessionStatus(next, "taught", {
        closingMessage: closing,
        hintLevel: 0,
        pendingFollowUpQuestion: undefined,
      });
      return next;
    },
    [lessonId],
  );

  async function handleSubmitAnswer() {
    if (!session || !coachQuestion || evaluating || submitLockRef.current) return;

    const text = (answerInputRef.current?.value ?? draftAnswer).trim();
    if (!text) {
      setShowEmptyHint(true);
      setShowQualityHint(false);
      return;
    }

    if (!isMeaningfulCoachAnswer(text)) {
      setShowQualityHint(true);
      setShowEmptyHint(false);
      return;
    }

    setShowEmptyHint(false);
    setShowQualityHint(false);
    setApiError(false);

    const rubric = getRubricForLesson(lessonId);
    const rubricPointId =
      session.activeRubricPointId ??
      (rubric ? pickDefaultRubricPointId(rubric) : undefined);

    if (isStruggleAnswer(text) && rubric && rubricPointId) {
      const next = handleLocalHint(session, text, rubricPointId);
      persistSession(next);
      clearAnswerInput();
      return;
    }

    submitLockRef.current = true;
    setEvaluating(true);
    const isFollowUp = session.status === "awaiting-followup";
    unlockThankYouSound();

    try {
      const { status, data } = await postCoachApi(
        "/api/coach/teach-evaluate",
        {
          lessonId,
          initialQuestion: coachQuestion.question,
          userAnswer: text,
          followUpCount: session.followUpCount,
          conversationHistory: conversationHistory(session),
          isFollowUpAnswer: isFollowUp,
          currentRubricPointId: session.activeRubricPointId,
        },
        `teach-evaluate:${lessonId}:${isFollowUp ? "1" : "0"}:${text}`,
        "teach-evaluate API",
      );

      if (status === 503 || status === 401) {
        setApiKeyError(true);
        throw new Error("API key not configured");
      }
      if (status < 200 || status >= 300) throw new Error("API request failed");
      if (!data || typeof data !== "object") throw new Error("API request failed");

      const result = data as TeachEvaluateResult;
      const working = resetHintRound(session);
      const next = applyTeachResult(working, result, text);
      persistSession(next);
      clearAnswerInput();
      if (next.status === "complete") {
        triggerCompleteCelebration();
      }
    } catch {
      setApiError(true);
    } finally {
      setEvaluating(false);
      submitLockRef.current = false;
    }
  }

  function handleNext() {
    if (!session || navigating) return;
    if (!isCoachSessionFinished(session)) {
      setShowSessionHint(true);
      return;
    }
    const consolidated = synthesizeCoachPointsFromSession(session, lessonId);
    if (!isMeaningfulCoachAnswer(consolidated)) {
      setShowQualityHint(true);
      return;
    }
    setNavigating(true);
    saveDraftCoachSession(lessonId, session, consolidated);
    router.push(getLessonStepPath(lessonNumber, "finalize"));
  }

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-6 text-center shadow-sm">
        <p className="text-sm text-gray-700">{ui.answer.loading}</p>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-6 text-center shadow-sm">
        <p className="text-sm text-gray-700">{ui.answer.needEvaluateFirst}</p>
        <Link
          href={getLessonStepPath(lessonNumber, "evaluate")}
          className="mt-4 inline-flex rounded-xl bg-blossom-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blossom-600"
        >
          {ui.answer.backToEvaluate}
        </Link>
      </div>
    );
  }

  if (!coachQuestion || !session) {
    return (
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-6 text-center shadow-sm">
        <p className="text-sm text-gray-700">{ui.answer.loading}</p>
      </div>
    );
  }

  const sessionDone = isCoachSessionFinished(session);
  const canSubmit = !sessionDone && !evaluating && draftAnswer.trim().length > 0;

  return (
    <>
      <div className="space-y-4">
        <div className="relative rounded-2xl border border-blossom-100 bg-blossom-50/40 p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-gray-900">
            {ui.answer.conversationTitle}
          </p>
          <div className="space-y-3">
            {session.exchanges.map((exchange, index) => (
              <div
                key={`${exchange.at}-${index}`}
                className={`relative ${exchangeBubbleClass(exchange)}`}
              >
                {exchange.role === "coach" && exchange.kind === "hint" && (
                  <p className="mb-1 text-xs font-medium text-amber-700">💡 ヒント</p>
                )}
                {exchange.role === "coach" && exchange.kind === "teach" && (
                  <p className="mb-1 text-xs font-medium text-leaf-700">📖 こう覚えよう</p>
                )}
                {exchange.role === "coach" && exchange.kind === "closing" && (
                  <span className="pointer-events-none absolute -right-1 -top-2">
                    <CoachThankYouBurst visible={showThankYouBurst} />
                  </span>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{exchange.text}</p>
              </div>
            ))}
          </div>
        </div>

        {!sessionDone && (
          <>
            <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
              <p className="mb-3 text-sm font-medium text-blossom-700">
                {teachQuestion.hintsLabel}
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                {teachQuestion.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
              <label
                htmlFor="coach-answer"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {ui.answer.inputLabel}
              </label>
              <textarea
                ref={answerInputRef}
                id="coach-answer"
                name="coach-answer"
                defaultValue=""
                onChange={handleAnswerInput}
                placeholder={ui.answer.inputPlaceholder}
                className={inputClassName}
                disabled={evaluating}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => void handleSubmitAnswer()}
                disabled={!canSubmit}
                className="mt-4 w-full rounded-xl bg-blossom-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blossom-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {evaluating ? ui.answer.evaluating : ui.answer.submit}
              </button>
            </div>
          </>
        )}
      </div>

      {showEmptyHint && (
        <p className="mt-4 rounded-xl bg-blossom-50 px-4 py-3 text-center text-sm text-blossom-700">
          {ui.answer.emptyHint}
        </p>
      )}

      {showQualityHint && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          {ui.answer.qualityHint}
        </p>
      )}

      {showSessionHint && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          {ui.answer.sessionIncomplete}
        </p>
      )}

      {apiError && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-800">
          <p>{apiKeyError ? ui.answer.apiKeyError : ui.answer.error}</p>
          <button
            type="button"
            onClick={() => setApiError(false)}
            className="mt-2 text-sm font-medium text-blossom-700 underline"
          >
            {ui.answer.retry}
          </button>
        </div>
      )}

      <StepNavigation
        backHref={getLessonStepPath(lessonNumber, "evaluate")}
        nextHref={getLessonStepPath(lessonNumber, "finalize")}
        nextLabel={navigating ? ui.answer.navigating : ui.answer.next}
        onNextClick={handleNext}
        nextDisabled={navigating || !sessionDone}
        nextLoading={navigating}
      />
    </>
  );
}
