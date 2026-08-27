"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { SpeakButton } from "@/components/SpeakButton";
import { StepNavigation } from "@/components/StepNavigation";
import {
  checkChoiceAnswer,
  checkFillAnswer,
  checkReorderAnswer,
  formatCorrectAnswer,
  type QuestionResult,
} from "@/lib/check-answers";
import { getLesson, getLessonStepPath } from "@/lib/lessons/registry";
import {
  createDraft,
  loadDraft,
  saveDraft,
  saveDraftCheckQuizState,
} from "@/lib/record-store";
import { ui } from "@/lib/ui-text";
import type { CheckQuestion } from "@/types/lesson";
import type { CheckQuizState } from "@/types/record";

export function CheckQuiz({ lessonNumber }: { lessonNumber: number }) {
  const lesson = getLesson(lessonNumber)!;
  const lessonId = lesson.meta.id;
  const questions = lesson.checkQuestions;
  const TOTAL = questions.length;

  const reorderQuestion = questions.find((q) => q.type === "reorder");

  const [results, setResults] = useState<Record<string, QuestionResult>>({});
  const [fillInputs, setFillInputs] = useState<Record<string, string>>({});
  const [reorderSelected, setReorderSelected] = useState<string[]>([]);
  const [reorderPool, setReorderPool] = useState<string[]>(
    () => reorderQuestion?.options ?? [],
  );
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    let draft = loadDraft(lessonId);
    if (!draft) {
      draft = createDraft(lessonId, lesson.meta.title);
      saveDraft(draft);
    }

    const saved = draft.checkQuizState;
    if (saved) {
      setResults(saved.results);
      setFillInputs(saved.fillInputs);
      if (saved.reorderSelected) setReorderSelected(saved.reorderSelected);
      if (saved.reorderPool) setReorderPool(saved.reorderPool);
    }

    setHydrated(true);
  }, [lessonId, lesson.meta.title]);

  function persistCheckState(state: CheckQuizState) {
    let draft = loadDraft(lessonId);
    if (!draft) {
      draft = createDraft(lessonId, lesson.meta.title);
      saveDraft({ ...draft, checkQuizState: state });
      return;
    }
    saveDraftCheckQuizState(lessonId, state);
  }

  function snapshotState(
    nextResults: Record<string, QuestionResult>,
    nextFillInputs: Record<string, string>,
    nextReorderSelected: string[] = reorderSelected,
    nextReorderPool: string[] = reorderPool,
  ): CheckQuizState {
    return {
      results: nextResults,
      fillInputs: nextFillInputs,
      reorderSelected: nextReorderSelected,
      reorderPool: nextReorderPool,
    };
  }

  const answeredCount = Object.values(results).filter((r) => r.answered).length;
  const correctCount = Object.values(results).filter(
    (r) => r.answered && r.correct,
  ).length;
  const allAnswered = answeredCount === TOTAL;

  const unansweredNumbers = useMemo(
    () =>
      questions
        .map((q, i) => ({ q, n: i + 1 }))
        .filter(({ q }) => !results[q.id]?.answered)
        .map(({ n }) => n),
    [results, questions],
  );

  function markAnswered(id: string, correct: boolean, userAnswer?: string) {
    setResults((prev) => {
      const next = {
        ...prev,
        [id]: { answered: true, correct, userAnswer },
      };
      persistCheckState(snapshotState(next, fillInputs));
      return next;
    });
  }

  function handleChoiceSelect(question: CheckQuestion, option: string) {
    if (results[question.id]?.answered) return;
    markAnswered(question.id, checkChoiceAnswer(option, question), option);
  }

  function handleFillSubmit(question: CheckQuestion) {
    if (results[question.id]?.answered) return;
    const input = fillInputs[question.id] ?? "";
    if (!input.trim()) return;
    markAnswered(question.id, checkFillAnswer(input, question), input.trim());
  }

  function handleReorderPick(word: string) {
    if (!reorderQuestion || results[reorderQuestion.id]?.answered) return;
    const nextSelected = [...reorderSelected, word];
    const nextPool = reorderPool.filter((w) => w !== word);
    setReorderSelected(nextSelected);
    setReorderPool(nextPool);

    if (nextSelected.length === (reorderQuestion.options?.length ?? 0)) {
      const nextResults = {
        ...results,
        [reorderQuestion.id]: {
          answered: true,
          correct: checkReorderAnswer(nextSelected, reorderQuestion),
          userAnswer: nextSelected.join(" "),
        },
      };
      setResults(nextResults);
      persistCheckState(
        snapshotState(nextResults, fillInputs, nextSelected, nextPool),
      );
    } else {
      persistCheckState(
        snapshotState(results, fillInputs, nextSelected, nextPool),
      );
    }
  }

  function handleReorderRemove(word: string, index: number) {
    if (!reorderQuestion || results[reorderQuestion.id]?.answered) return;
    const nextSelected = reorderSelected.filter((_, i) => i !== index);
    const nextPool = [...reorderPool, word];
    const nextResults = { ...results };
    delete nextResults[reorderQuestion.id];
    setReorderSelected(nextSelected);
    setReorderPool(nextPool);
    setResults(nextResults);
    persistCheckState(
      snapshotState(nextResults, fillInputs, nextSelected, nextPool),
    );
  }

  if (!hydrated) return null;

  return (
    <>
      <div className="space-y-6">
        {questions.map((question, index) => {
          const result = results[question.id];
          const isAnswered = result?.answered ?? false;

          return (
            <div
              key={question.id}
              id={`question-${question.id}`}
              className={`rounded-2xl border bg-white/80 p-5 shadow-sm transition-colors ${
                isAnswered
                  ? "border-blossom-100"
                  : "border-blossom-200 ring-1 ring-blossom-100"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-blossom-500">
                  {ui.check.questionLabel(index + 1)}
                </p>
                {!isAnswered && (
                  <span className="rounded-full bg-blossom-100 px-2 py-0.5 text-xs font-medium text-blossom-600">
                    {ui.check.unanswered}
                  </span>
                )}
              </div>

              <p className="mb-3 font-medium text-gray-900">{question.question}</p>

              {question.type === "choice" && question.options && (
                <ChoiceQuestion
                  question={question}
                  result={result}
                  onSelect={(option) => handleChoiceSelect(question, option)}
                />
              )}

              {question.type === "fill" && (
                <FillQuestion
                  question={question}
                  result={result}
                  value={fillInputs[question.id] ?? ""}
                  onChange={(value) =>
                    setFillInputs((prev) => {
                      const next = { ...prev, [question.id]: value };
                      persistCheckState(snapshotState(results, next));
                      return next;
                    })
                  }
                  onSubmit={() => handleFillSubmit(question)}
                />
              )}

              {question.type === "reorder" && question.options && (
                <ReorderQuestion
                  result={result}
                  selected={reorderSelected}
                  pool={reorderPool}
                  onPick={handleReorderPick}
                  onRemove={handleReorderRemove}
                />
              )}

              {isAnswered && (
                <ResultFeedback
                  lessonNumber={lessonNumber}
                  question={question}
                  correct={result!.correct}
                />
              )}
            </div>
          );
        })}
      </div>

      {unansweredNumbers.length > 0 && (
        <p className="mt-6 rounded-xl bg-blossom-50 px-4 py-3 text-center text-sm text-blossom-700">
          {ui.check.unansweredHint(unansweredNumbers)}
        </p>
      )}

      {allAnswered && (
        <p className="mt-6 rounded-xl bg-leaf-50 px-4 py-4 text-center text-base font-bold text-leaf-700">
          {ui.check.score(TOTAL, correctCount)}
        </p>
      )}

      <StepNavigation
        backHref={getLessonStepPath(lessonNumber, "lesson")}
        nextHref={getLessonStepPath(lessonNumber, "summarize")}
        nextLabel={ui.check.toSummarize}
        nextDisabled={!allAnswered}
      />
    </>
  );
}

function ChoiceQuestion({
  question,
  result,
  onSelect,
}: {
  question: CheckQuestion;
  result?: QuestionResult;
  onSelect: (option: string) => void;
}) {
  const isLocked = result?.answered ?? false;

  return (
    <ul className="space-y-2">
      {question.options!.map((option) => {
        const isCorrectOption = option === question.answer;
        const isWrongPick =
          isLocked && !result!.correct && result!.userAnswer === option;

        let className =
          "w-full rounded-lg border px-4 py-3 text-left text-sm transition active:scale-[0.98] ";
        if (!isLocked) {
          className +=
            "cursor-pointer border-gray-100 text-gray-700 hover:border-blossom-300 hover:bg-blossom-50";
        } else if (isCorrectOption) {
          className += "border-leaf-400 bg-leaf-50 text-leaf-800";
        } else if (isWrongPick) {
          className += "border-sakura-300 bg-sakura-50 text-gray-800";
        } else {
          className += "border-gray-100 bg-gray-50 text-gray-400";
        }

        return (
          <li key={option}>
            <button type="button" className={className} onClick={() => onSelect(option)} disabled={isLocked}>
              {option}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function FillQuestion({
  question,
  result,
  value,
  onChange,
  onSubmit,
}: {
  question: CheckQuestion;
  result?: QuestionResult;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const isLocked = result?.answered ?? false;

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
        placeholder={ui.check.fillInputPlaceholder}
        disabled={isLocked}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blossom-300 focus:outline-none focus:ring-2 focus:ring-blossom-100 disabled:bg-gray-50"
        aria-label={question.question}
      />
      {!isLocked && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className="rounded-xl bg-blossom-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blossom-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          {ui.check.submitAnswer}
        </button>
      )}
    </div>
  );
}

function ReorderQuestion({
  result,
  selected,
  pool,
  onPick,
  onRemove,
}: {
  result?: QuestionResult;
  selected: string[];
  pool: string[];
  onPick: (word: string) => void;
  onRemove: (word: string, index: number) => void;
}) {
  const isLocked = result?.answered ?? false;

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500">{ui.check.reorderYourAnswer}</p>
        <div className="min-h-[44px] rounded-lg border border-dashed border-blossom-200 bg-blossom-50/50 px-3 py-2">
          {selected.length === 0 ? (
            <p className="py-1 text-sm text-gray-400">{ui.check.reorderEmpty}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((word, index) => (
                <button
                  key={`${word}-${index}`}
                  type="button"
                  onClick={() => onRemove(word, index)}
                  disabled={isLocked}
                  className="rounded-lg border border-blossom-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 active:scale-95 disabled:cursor-default"
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500">{ui.check.reorderWords}</p>
        <div className="flex flex-wrap gap-2">
          {pool.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => onPick(word)}
              disabled={isLocked}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm active:scale-95 hover:border-blossom-300 hover:bg-blossom-50 disabled:cursor-default disabled:opacity-50"
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultFeedback({
  lessonNumber,
  question,
  correct,
}: {
  lessonNumber: number;
  question: CheckQuestion;
  correct: boolean;
}) {
  return (
    <div
      className={`mt-4 rounded-xl px-4 py-3 text-sm ${
        correct ? "bg-leaf-50 text-leaf-800" : "bg-sakura-50 text-gray-800"
      }`}
    >
      <p className="font-bold">{correct ? ui.check.correct : ui.check.incorrect}</p>
      {!correct && (
        <p className="mt-1">
          {ui.check.correctAnswer(formatCorrectAnswer(question))}
        </p>
      )}
      <div className="mt-2 flex items-start justify-between gap-2">
        <p className="font-medium text-gray-900">{question.exampleSentence}</p>
        <SpeakButton audioRef={`lesson${lessonNumber}.check.${question.id}`} />
      </div>
      <p className="mt-1">
        {ui.check.translation}
        <span className="text-gray-700">「{question.translation}」</span>
      </p>
      <p className="mt-2 text-gray-600">{question.explanation}</p>
    </div>
  );
}
