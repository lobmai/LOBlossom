"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { SpeakButton } from "@/components/SpeakButton";
import {
  MyWordsStats,
  type StatusVisibility,
} from "@/components/my-words/MyWordsStats";
import {
  formatNextReviewAt,
  getWordStatusBadgeClass,
  getWordStatusLabel,
  isWordReviewDue,
} from "@/lib/my-words/display";
import { getDisplayedWordStatus } from "@/lib/my-words/display-status";
import { saveMyWordsNavOrder } from "@/lib/my-words/nav-order";
import { PageContentSkeleton } from "@/components/PageContentSkeleton";
import { loadMyWords } from "@/lib/my-words/store";
import { countTotalWords, countWordsByStatus } from "@/lib/my-words/stats";
import { getSpecialLessonPath } from "@/lib/special-lessons/registry";
import { LESSON_SELECT_PATH } from "@/lib/lessons/registry";
import { ui } from "@/lib/ui-text";
import type { MyWordUserEntry, WordStatus } from "@/types/my-words";

const ALL_VISIBLE: StatusVisibility = {
  new: true,
  practicing: true,
  learned: true,
  weak: true,
};

const LESSON1_SPECIAL_PATH = getSpecialLessonPath(1);

function readWords(): MyWordUserEntry[] | null {
  if (typeof window === "undefined") return null;
  return loadMyWords();
}

function stopCardNavigation(event: MouseEvent) {
  event.stopPropagation();
}

export function MyWordsList() {
  const router = useRouter();
  const [words, setWords] = useState<MyWordUserEntry[] | null>(readWords);
  const [visibility, setVisibility] = useState<StatusVisibility>(ALL_VISIBLE);

  useLayoutEffect(() => {
    setWords(loadMyWords());
  }, []);

  const visibleWords = useMemo(
    () =>
      (words ?? []).filter((word) => visibility[getDisplayedWordStatus(word)]),
    [words, visibility],
  );

  useLayoutEffect(() => {
    if (visibleWords.length === 0) return;
    const ids = visibleWords.map((word) => word.wordId);
    saveMyWordsNavOrder(ids);
    for (const id of ids) {
      router.prefetch(`/my-words/${encodeURIComponent(id)}`);
    }
    router.prefetch(LESSON1_SPECIAL_PATH);
  }, [visibleWords, router]);

  function toggleStatus(status: WordStatus) {
    setVisibility((current) => ({
      ...current,
      [status]: !current[status],
    }));
  }

  if (words === null) {
    return <PageContentSkeleton rows={4} />;
  }

  const total = countTotalWords(words);
  const counts = countWordsByStatus(words);

  if (words.length === 0) {
    return (
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-8 text-center shadow-sm">
        <p className="text-4xl">📖</p>
        <p className="mt-4 text-sm text-gray-600">{ui.myWords.empty}</p>
        <Link
          href={LESSON_SELECT_PATH}
          prefetch
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-blossom-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-blossom-600"
        >
          {ui.myWords.startLesson}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MyWordsStats
        total={total}
        counts={counts}
        visibility={visibility}
        onToggle={toggleStatus}
      />

      <div>
        <h2 className="mb-3 text-sm font-bold text-gray-900">
          {ui.myWords.listHeading}
        </h2>
        {visibleWords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 px-4 py-8 text-center text-sm text-gray-500">
            {ui.myWords.filterEmpty}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleWords.map((word) => {
              const displayed = getDisplayedWordStatus(word);
              const reviewDue = isWordReviewDue(word.nextReviewAt);
              const nextReviewLabel = formatNextReviewAt(word.nextReviewAt);
              const href = `/my-words/${encodeURIComponent(word.wordId)}`;

              return (
                <div
                  key={word.wordId}
                  className="relative rounded-2xl border border-blossom-100 bg-white/80 p-4 shadow-sm transition hover:border-blossom-200 hover:bg-blossom-50/30"
                >
                  <Link
                    href={href}
                    prefetch
                    className="absolute inset-0 z-0 rounded-2xl"
                    aria-label={`${word.english} の詳細`}
                  />

                  <div className="relative z-10 flex items-start gap-3">
                    <div className="min-w-0 flex-1 pointer-events-none">
                      <p className="truncate font-mono text-lg font-bold text-gray-900">
                        {word.english}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{word.japanese}</p>
                    </div>
                    <div className="pointer-events-none flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getWordStatusBadgeClass(displayed)}`}
                      >
                        {getWordStatusLabel(displayed)}
                      </span>
                      <div className="relative z-20 pointer-events-auto">
                        <SpeakButton
                          audioRef={word.audioRef ?? `mywords.${word.wordId}`}
                          buttonClassName="h-11 w-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-3 pointer-events-none">
                    <p className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>
                        {ui.myWords.nextReview}：
                        <span
                          className={
                            reviewDue
                              ? "font-medium text-blossom-600"
                              : "text-gray-700"
                          }
                        >
                          {nextReviewLabel}
                        </span>
                      </span>
                      {reviewDue && (
                        <span className="rounded-full bg-blossom-100 px-2 py-0.5 text-[10px] font-medium text-blossom-700">
                          {ui.myWords.reviewDueHint}
                        </span>
                      )}
                    </p>
                  </div>

                  {reviewDue && (
                    <Link
                      href={LESSON1_SPECIAL_PATH}
                      prefetch
                      onClick={stopCardNavigation}
                      onPointerDown={stopCardNavigation}
                      className="relative z-20 mt-3 inline-flex min-h-11 items-center rounded-xl border border-blossom-200 bg-white px-3 py-2 text-xs font-medium text-blossom-700 transition hover:bg-blossom-50"
                    >
                      {ui.myWords.reviewSpecialCta}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
