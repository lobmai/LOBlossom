"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SpeakButton } from "@/components/SpeakButton";
import { getLesson, getLessonBasePath, LESSON_SELECT_PATH } from "@/lib/lessons/registry";
import { loadRecordByLessonId } from "@/lib/record-store";
import { isVocabAnswerCorrect } from "@/lib/special-lessons/answer-check";
import { buildSpecialQuestions } from "@/lib/special-lessons/build-questions";
import { markSpecialCompleted } from "@/lib/special-lessons/registry";
import type { SpecialLessonConfig, VocabQuestion } from "@/lib/special-lessons/types";
import { applyReviewResultToStore, resolveWordMaster } from "@/lib/my-words/review-sync";

function questionLabel(q: VocabQuestion): string {
  return q.type === "en-to-ja" ? q.english : q.japanese;
}

function SpecialFinishLinks({ config }: { config: SpecialLessonConfig }) {
  const lesson = getLesson(config.parentLessonNumber);
  const recordId =
    typeof window !== "undefined" && lesson
      ? loadRecordByLessonId(lesson.meta.id)?.recordId ?? null
      : null;

  return (
    <div className="mt-6 space-y-3">
      {recordId ? (
        <Link
          href={`/my-loop/${recordId}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-blossom-500 px-6 py-3 text-sm font-medium text-white hover:bg-blossom-600"
        >
          レッスン{config.parentLessonNumber}のMy Loopを見る →
        </Link>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            まだMy Loopがありません。先に通常レッスンを完了してね。
          </p>
          <Link
            href={getLessonBasePath(config.parentLessonNumber)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-blossom-500 px-6 py-3 text-sm font-medium text-white hover:bg-blossom-600"
          >
            レッスン{config.parentLessonNumber}を学ぶ →
          </Link>
        </>
      )}
      <Link
        href="/my-words"
        className="inline-flex w-full items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-6 py-3 text-sm font-medium text-sky-700 hover:bg-sky-100"
      >
        My Wordsを見る →
      </Link>
      <Link
        href={LESSON_SELECT_PATH}
        className="inline-flex w-full items-center justify-center rounded-xl border border-blossom-200 bg-white px-6 py-3 text-sm font-medium text-blossom-600 hover:bg-blossom-50"
      >
        レッスン選択に戻る
      </Link>
    </div>
  );
}

export function VocabSpecialQuiz({ config }: { config: SpecialLessonConfig }) {
  const router = useRouter();
  const questions = useMemo(() => buildSpecialQuestions(config), [config]);
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    router.prefetch("/my-words");
    router.prefetch(LESSON_SELECT_PATH);
  }, [router]);

  const question = questions[index];
  const answered = selected !== null;

  function handleSelect(option: string) {
    if (answered || !question) return;

    setSelected(option);
    const isCorrect = isVocabAnswerCorrect(option, question);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }

    applyReviewResultToStore(
      question.wordId,
      isCorrect ? "correct" : "incorrect",
      config.parentLessonNumber,
    );
  }

  function handleNext() {
    if (index + 1 >= total) {
      markSpecialCompleted(config.id);
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-8 text-center shadow-sm">
        <p className="text-sm text-gray-600">
          復習できる単語がありません。先にレッスンを完了して My Words に単語を追加してね。
        </p>
        <Link
          href={getLessonBasePath(config.parentLessonNumber)}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blossom-500 px-6 py-3 text-sm font-medium text-white hover:bg-blossom-600"
        >
          レッスン{config.parentLessonNumber}を学ぶ →
        </Link>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="rounded-2xl border border-leaf-200 bg-leaf-50/80 p-8 text-center shadow-sm">
        <p className="text-2xl">🌸</p>
        <p className="mt-3 text-lg font-bold text-gray-900">復習おつかれさま！</p>
        <p className="mt-2 text-sm text-gray-700">
          {total}問中{correctCount}問正解
        </p>
        <SpecialFinishLinks config={config} />
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const isCorrectSelection =
    selected !== null && isVocabAnswerCorrect(selected, question);

  return (
    <div className="space-y-6">
      <p className="text-xs font-medium text-blossom-500">
        もんだい {index + 1} / {total}
      </p>
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-900">{question.prompt}</p>
        <div className="mt-3 flex items-center gap-2">
          <p className="text-xl font-bold text-blossom-700">{questionLabel(question)}</p>
          <SpeakButton
            audioRef={resolveWordMaster(question.wordId)?.audioRef ?? `mywords.${question.wordId}`}
          />
        </div>
        <div className="mt-5 space-y-2">
          {question.options.map((option) => {
            const isCorrect = isVocabAnswerCorrect(option, question);
            const isSelected = selected === option;
            let style = "border-gray-200 bg-white text-gray-700 hover:border-blossom-200";
            if (answered && isSelected && isCorrect) {
              style = "border-leaf-400 bg-leaf-50 text-leaf-800";
            } else if (answered && isSelected && !isCorrect) {
              style = "border-red-200 bg-red-50 text-red-700";
            } else if (answered && isCorrect) {
              style = "border-leaf-300 bg-leaf-50/50 text-leaf-700";
            }
            return (
              <button
                key={option}
                type="button"
                disabled={answered}
                onClick={() => handleSelect(option)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition active:scale-[0.98] disabled:cursor-default ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {answered && (
          <p className="mt-4 text-sm text-gray-600">
            {isCorrectSelection ? "正解！" : `正解は「${question.answer}」`}
          </p>
        )}
      </div>
      {answered && (
        <button
          type="button"
          onClick={handleNext}
          className="w-full rounded-xl bg-blossom-500 px-6 py-3 text-sm font-medium text-white hover:bg-blossom-600"
        >
          {index + 1 >= total ? "結果を見る" : "次の問題 →"}
        </button>
      )}
    </div>
  );
}
