"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { markNavStart, measureFromNavStart, perfLog } from "@/lib/perf-log";
import { getLesson, getLessonStepPath } from "@/lib/lessons/registry";
import {
  buildInsufficientEvaluation,
  canRequestAiEvaluation,
} from "@/lib/answer-quality";
import {
  getCoachConfirmationItems,
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
  saveDraftUserExampleJapanese,
} from "@/lib/record-store";
import { getUnclearQuestionText } from "@/lib/summary-fields";
import { getOriginalUserExample, hasUsableUserExampleCheck } from "@/lib/user-example-check";
import { resolveStep4Example } from "@/lib/step4-example";
import {
  normalizeExampleTranslation,
  shouldTranslateFinalExample,
} from "@/lib/translate-user-example";
import { clipUnknownQuestionAnswer } from "@/lib/clip-unknown-question-answer";
import { sanitizeCoachMessage } from "@/lib/sanitize-coach-message";
import { ui } from "@/lib/ui-text";
import { StepNavigation } from "@/components/StepNavigation";
import type { AiEvaluation, UserExampleCheck } from "@/types/record";

function UserExampleCheckCard({
  original,
  check,
  finalEnglish,
  japanese,
}: {
  original: string;
  check: UserExampleCheck | null | undefined;
  finalEnglish: string;
  japanese: string;
}) {
  if (!original.trim() || !hasUsableUserExampleCheck(check)) return null;

  const shownFinal = finalEnglish.trim() || original;

  if (check.isCorrect) {
    return (
      <div className="rounded-2xl border border-leaf-200 bg-leaf-50/80 p-5 shadow-sm">
        <p className="mb-2 text-sm font-bold text-gray-900">
          🌸 {ui.evaluate.exampleCheckTitle}
        </p>
        <p className="text-sm leading-relaxed text-gray-700">
          {ui.evaluate.exampleCheckCorrect}
        </p>
        <p className="mt-3 font-mono text-sm text-gray-800">{shownFinal}</p>
        {japanese ? (
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{japanese}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
      <p className="mb-4 text-sm font-bold text-gray-900">
        🌸 {ui.evaluate.exampleCheckTitle}
      </p>

      <section className="mb-4">
        <p className="mb-2 text-xs font-medium text-gray-500">
          {ui.evaluate.exampleCheckYourExample}
        </p>
        <p className="rounded-xl bg-gray-50 px-3 py-2 font-mono text-sm text-gray-800">
          {original}
        </p>
      </section>

      {check.errorReason && (
        <section className="mb-4">
          <p className="mb-2 text-xs font-medium text-amber-700">
            {ui.evaluate.exampleCheckFixHeading}
          </p>
          <p className="text-sm leading-relaxed text-gray-700">{check.errorReason}</p>
        </section>
      )}

      {check.correctedExample && (
        <section className="rounded-xl border border-leaf-300 bg-leaf-50 px-4 py-3">
          <p className="mb-2 text-xs font-bold text-leaf-800">
            {ui.evaluate.exampleCheckCorrected}
          </p>
          <p className="font-mono text-base font-semibold text-gray-900">
            {shownFinal}
          </p>
          {japanese ? (
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{japanese}</p>
          ) : null}
        </section>
      )}
    </div>
  );
}

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

function UnclearQuestionAnswerSection({
  question,
  answer,
}: {
  question: string;
  answer: string | null | undefined;
}) {
  const text =
    clipUnknownQuestionAnswer(answer) || ui.evaluate.unknownAnswerFallback;
  return (
    <div className="rounded-2xl border border-leaf-200 bg-leaf-50/70 p-5 shadow-sm">
      <p className="mb-3 text-sm font-bold text-gray-900">
        🌱 {ui.evaluate.unknownQuestionTitle}
      </p>
      <p className="text-sm leading-relaxed text-gray-800">{question}</p>
      <p className="my-2 text-sm text-leaf-700" aria-hidden>
        →
      </p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
        {text}
      </p>
    </div>
  );
}

async function ensureExampleTranslation(
  lessonId: string,
  english: string | null | undefined,
): Promise<string> {
  const draft = loadDraft(lessonId);
  const finalEnglish = english?.trim() || draft?.userExampleFinal?.trim() || "";
  const existingJapanese = draft?.userExampleJapanese?.trim() ?? "";
  const shouldRequest = shouldTranslateFinalExample(
    finalEnglish,
    draft?.userExampleJapanese,
    draft?.userExampleJapaneseFor,
  );
  if (!finalEnglish) return existingJapanese;
  if (!shouldRequest) {
    return existingJapanese;
  }

  try {
    const { status, data } = await postCoachApi(
      "/api/coach/translate-example",
      { english: finalEnglish },
      `translate-example:${lessonId}:${finalEnglish}`,
      "translate-example API",
    );
    const translation = normalizeExampleTranslation(
      data && typeof data === "object"
        ? (data as { translation?: string | null }).translation
        : null,
    );
    if (status < 200 || status >= 300) {
      return existingJapanese;
    }
    if (!translation) return existingJapanese;
    saveDraftUserExampleJapanese(lessonId, translation, finalEnglish);
    return translation;
  } catch {
    return existingJapanese;
  }
}

async function persistFinalAndTranslate(
  lessonId: string,
  evaluation: AiEvaluation,
  original: string,
): Promise<{
  evaluation: AiEvaluation;
  finalEnglish: string;
  japanese: string;
}> {
  const draft = loadDraft(lessonId);
  const resolved = resolveStep4Example({
    originalExample: original,
    userExampleCheck: evaluation.userExampleCheck,
    userExampleJapanese: draft?.userExampleJapanese,
    userExampleJapaneseFor: draft?.userExampleJapaneseFor,
  });
  const nextEvaluation: AiEvaluation = {
    ...evaluation,
    userExampleCheck: resolved.display ?? evaluation.userExampleCheck,
  };
  if (resolved.fields.userExampleFinal) {
    saveDraftAiEvaluation(lessonId, nextEvaluation, resolved.fields);
  } else {
    saveDraftAiEvaluation(lessonId, nextEvaluation);
  }
  const japanese = await ensureExampleTranslation(
    lessonId,
    resolved.finalEnglish,
  );
  return {
    evaluation: nextEvaluation,
    finalEnglish: resolved.finalEnglish,
    japanese,
  };
}

function StructuredEvaluationView({ evaluation }: { evaluation: AiEvaluation }) {
  const strengths = getCoachStrengths(evaluation);
  const confirmItems = getCoachConfirmationItems(evaluation);

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
      </div>
    </div>
  );
}

export function EvaluateCoach({ lessonNumber }: { lessonNumber: number }) {
  const lesson = getLesson(lessonNumber)!;
  const lessonId = lesson.meta.id;

  const [evaluation, setEvaluation] = useState<AiEvaluation | null>(null);
  const [originalExample, setOriginalExample] = useState("");
  const [exampleFinal, setExampleFinal] = useState("");
  const [exampleJapanese, setExampleJapanese] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [unclearQuestion, setUnclearQuestion] = useState<string | null>(null);
  const startedRef = useRef(false);
  const mountLoggedRef = useRef(false);

  if (!mountLoggedRef.current) {
    mountLoggedRef.current = true;
    perfLog("evaluate", "EvaluateCoach mount");
    perfLog("evaluate", "loading UI shown (initial loading=true)");
    measureFromNavStart("summarize-to-evaluate", "router.push → mount");
    measureFromNavStart("summarize-to-evaluate", "click → mount");
    measureFromNavStart("summarize-to-evaluate", "click → loading UI");
  }

  const fetchEvaluation = useCallback(
    async (force = false) => {
      const draft = loadDraft(lessonId);
      if (!draft) {
        setError(true);
        setLoading(false);
        return;
      }

      const entryMap = fromLabeledAnswers(draft.trajectoryEntries);
      const original = getOriginalUserExample(draft.trajectoryEntries) ?? "";
      setOriginalExample(original);
      setUnclearQuestion(getUnclearQuestionText(draft.trajectoryEntries));

      if (
        !force &&
        draft.aiEvaluation?.overallMessage &&
        draft.aiEvaluation.overallLevel !== "insufficient"
      ) {
        const persisted = await persistFinalAndTranslate(
          lessonId,
          draft.aiEvaluation,
          original,
        );
        setEvaluation(persisted.evaluation);
        setExampleFinal(persisted.finalEnglish);
        setExampleJapanese(persisted.japanese);
        setError(false);
        setLoading(false);
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
      perfLog("evaluate", "AI fetch start (not included in NAV timings)");

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
          unknownQuestionAnswer: clipUnknownQuestionAnswer(
            parsed.unknownQuestionAnswer,
          ),
          evaluatedAt: parsed.evaluatedAt ?? new Date().toISOString(),
          strengths: parsed.strengths,
          gaps: parsed.gaps,
          misconceptions: parsed.misconceptions,
          nextQuestion: null,
          overallLevel: parsed.overallLevel,
          userExampleCheck: parsed.userExampleCheck,
        };

        if (aiEvaluation.overallLevel === "insufficient") {
          setEvaluation(aiEvaluation);
          setError(false);
          return;
        }

        const persisted = await persistFinalAndTranslate(
          lessonId,
          aiEvaluation,
          original,
        );
        setExampleFinal(persisted.finalEnglish);
        setExampleJapanese(persisted.japanese);
        setEvaluation(persisted.evaluation);
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
        <div className="space-y-4">
          <InsufficientEvaluationView
            lessonNumber={lessonNumber}
            onRetry={() => {
              startedRef.current = false;
              void fetchEvaluation(true);
            }}
          />
          {unclearQuestion && (
            <UnclearQuestionAnswerSection
              question={unclearQuestion}
              answer={evaluation.unknownQuestionAnswer}
            />
          )}
        </div>
      )}

      {evaluation && !loading && !error && !showInsufficient && (
        <div className="space-y-4">
          {showStructured ? (
            <StructuredEvaluationView evaluation={evaluation} />
          ) : (
            <LegacyEvaluationView message={evaluation.overallMessage} />
          )}
          {unclearQuestion && (
            <UnclearQuestionAnswerSection
              question={unclearQuestion}
              answer={evaluation.unknownQuestionAnswer}
            />
          )}
          <UserExampleCheckCard
            original={originalExample}
            check={evaluation.userExampleCheck}
            finalEnglish={exampleFinal}
            japanese={exampleJapanese}
          />
        </div>
      )}

      <StepNavigation
        backHref={getLessonStepPath(lessonNumber, "summarize")}
        nextHref={getLessonStepPath(lessonNumber, "answer")}
        nextLabel={ui.evaluate.next}
        nextDisabled={!canProceed}
        onNextLinkClick={() => {
          markNavStart("evaluate-to-answer");
          perfLog("evaluate", "click 質問に答える (Link, no AI await)");
          measureFromNavStart("evaluate-to-answer", "click → router.push");
        }}
      />
    </>
  );
}
