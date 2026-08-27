"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLesson, getLessonStepPath } from "@/lib/lessons/registry";
import {
  buildInsufficientEvaluation,
  canRequestAiEvaluation,
} from "@/lib/answer-quality";
import {
  getCoachConfirmationItems,
  getCoachNextQuestion,
  getCoachStrengths,
  hasStructuredCoachContent,
  hasStructuredCoachEvaluation,
  isInsufficientEvaluation,
} from "@/lib/coach-eval-display";
import { postCoachApi } from "@/lib/coach-fetch";
import {
  fromLabeledAnswers,
  loadDraft,
  saveDraftAiEvaluation,
} from "@/lib/record-store";
import { sanitizeCoachMessage } from "@/lib/sanitize-coach-message";
import { ui } from "@/lib/ui-text";
import { StepNavigation } from "@/components/StepNavigation";
import type { AiEvaluation } from "@/types/record";

function EvaluationList({ items }: { items: string[] }) {
  return (
    <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-gray-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function LegacyEvaluationView({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
      <p className="mb-2 text-sm font-bold text-gray-900">🌸 {ui.evaluate.overall}</p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
        {message}
      </p>
    </div>
  );
}

function InsufficientEvaluationView({
  lessonNumber,
  onRetry,
}: {
  lessonNumber: number;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-blossom-100 bg-blossom-50/80 p-6 shadow-sm">
      <p className="text-sm font-bold text-gray-900">🌸 {ui.evaluate.overall}</p>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        {ui.evaluate.insufficientMessage}
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href={getLessonStepPath(lessonNumber, "summarize")}
          className="inline-flex items-center justify-center rounded-xl bg-blossom-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blossom-600"
        >
          {ui.evaluate.backToSummarize}
        </Link>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-xl border border-blossom-200 bg-white px-5 py-2.5 text-sm font-medium text-blossom-700 transition hover:bg-blossom-50"
        >
          {ui.evaluate.retryAfterEdit}
        </button>
      </div>
    </div>
  );
}

function StructuredEvaluationView({ evaluation }: { evaluation: AiEvaluation }) {
  const strengths = getCoachStrengths(evaluation);
  const confirmItems = getCoachConfirmationItems(evaluation);
  const nextQuestion = getCoachNextQuestion(evaluation);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
        <p className="mb-4 text-sm font-bold text-gray-900">🌸 {ui.evaluate.overall}</p>

        {strengths.length > 0 && (
          <section className="mb-4 last:mb-0">
            <p className="mb-2 text-xs font-medium text-leaf-700">
              {ui.evaluate.structuredStrengths}
            </p>
            <EvaluationList items={strengths} />
          </section>
        )}

        {confirmItems.length > 0 && (
          <section className="mb-4 last:mb-0">
            <p className="mb-2 text-xs font-medium text-amber-700">
              {ui.evaluate.structuredConfirm}
            </p>
            <EvaluationList items={confirmItems} />
          </section>
        )}

        {nextQuestion && (
          <section>
            <p className="mb-2 text-xs font-medium text-blossom-700">
              {ui.evaluate.structuredNextQuestion}
            </p>
            <p className="text-sm leading-relaxed text-gray-700">{nextQuestion}</p>
          </section>
        )}
      </div>
    </div>
  );
}

export function EvaluateCoach({ lessonNumber }: { lessonNumber: number }) {
  const lesson = getLesson(lessonNumber)!;
  const lessonId = lesson.meta.id;

  const [evaluation, setEvaluation] = useState<AiEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const startedRef = useRef(false);

  const fetchEvaluation = useCallback(
    async (force = false) => {
      const draft = loadDraft(lessonId);
      if (!draft) {
        setError(true);
        setLoading(false);
        return;
      }

      const entryMap = fromLabeledAnswers(draft.trajectoryEntries);

      if (
        !force &&
        draft.aiEvaluation?.overallMessage &&
        draft.aiEvaluation.overallLevel !== "insufficient"
      ) {
        setEvaluation(draft.aiEvaluation);
        setLoading(false);
        setError(false);
        return;
      }

      if (!canRequestAiEvaluation(lessonId, entryMap)) {
        const insufficient = buildInsufficientEvaluation();
        setEvaluation(insufficient);
        setLoading(false);
        setError(false);
        return;
      }

      const filled = draft.trajectoryEntries.filter((a) => a.answer.trim().length > 0);
      if (filled.length === 0) {
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);
      setApiKeyError(false);
      setEvaluation(null);

      try {
        const fingerprint = draft.trajectoryEntries
          .map((entry) => `${entry.id}=${entry.answer}`)
          .join("&");
        const { status, data } = await postCoachApi(
          "/api/coach/evaluate",
          {
            lessonId,
            lessonTitle: draft.lessonTitle,
            summaryEntries: draft.trajectoryEntries,
          },
          `evaluate:${lessonId}:${fingerprint}`,
          "evaluate API",
        );

        if (status === 503 || status === 401) {
          setApiKeyError(true);
          throw new Error("API key not configured");
        }

        if (status < 200 || status >= 300) throw new Error("API request failed");
        if (!data || typeof data !== "object") throw new Error("API request failed");

        const parsed = data as AiEvaluation;
        const aiEvaluation: AiEvaluation = {
          overallMessage: sanitizeCoachMessage(parsed.overallMessage ?? ""),
          corrections: [],
          polishedEntries: parsed.polishedEntries ?? [],
          hasPolish: parsed.hasPolish ?? false,
          unclearAdvice: parsed.unclearAdvice ?? null,
          evaluatedAt: parsed.evaluatedAt ?? new Date().toISOString(),
          strengths: parsed.strengths,
          gaps: parsed.gaps,
          misconceptions: parsed.misconceptions,
          nextQuestion: parsed.nextQuestion ?? null,
          overallLevel: parsed.overallLevel,
        };

        if (aiEvaluation.overallLevel === "insufficient") {
          setEvaluation(aiEvaluation);
          setError(false);
          return;
        }

        saveDraftAiEvaluation(lessonId, aiEvaluation);
        setEvaluation(aiEvaluation);
        setError(false);
      } catch {
        setError(true);
        setEvaluation(null);
      } finally {
        setLoading(false);
      }
    },
    [lessonId],
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void fetchEvaluation();
  }, [fetchEvaluation]);

  const showInsufficient = evaluation !== null && isInsufficientEvaluation(evaluation);

  const showStructured =
    evaluation !== null &&
    !showInsufficient &&
    hasStructuredCoachEvaluation(evaluation) &&
    hasStructuredCoachContent(evaluation);

  const canProceed =
    evaluation !== null &&
    !showInsufficient &&
    !loading &&
    !error;

  return (
    <>
      {loading && (
        <div className="rounded-2xl border border-blossom-100 bg-blossom-50/80 p-8 text-center shadow-sm">
          <p className="text-2xl">💬</p>
          <p className="mt-3 text-sm font-medium text-blossom-700">{ui.evaluate.loading}</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-blossom-100 bg-white/80 p-6 text-center shadow-sm">
          <p className="text-sm text-gray-700">
            {apiKeyError ? ui.evaluate.apiKeyError : ui.evaluate.error}
          </p>
          <button
            type="button"
            onClick={() => {
              startedRef.current = false;
              void fetchEvaluation(true);
            }}
            className="mt-4 rounded-xl bg-blossom-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blossom-600"
          >
            {ui.evaluate.retry}
          </button>
        </div>
      )}

      {evaluation && !loading && !error && showInsufficient && (
        <InsufficientEvaluationView
          lessonNumber={lessonNumber}
          onRetry={() => {
            startedRef.current = false;
            void fetchEvaluation(true);
          }}
        />
      )}

      {evaluation && !loading && !error && !showInsufficient && (
        showStructured ? (
          <StructuredEvaluationView evaluation={evaluation} />
        ) : (
          <LegacyEvaluationView message={evaluation.overallMessage} />
        )
      )}

      <StepNavigation
        backHref={getLessonStepPath(lessonNumber, "summarize")}
        nextHref={getLessonStepPath(lessonNumber, "answer")}
        nextLabel={ui.evaluate.next}
        nextDisabled={!canProceed}
      />
    </>
  );
}
