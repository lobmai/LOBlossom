"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SpeakButton } from "@/components/SpeakButton";
import {
  formatFirstLearnedAt,
  formatLessonNumbers,
  formatNextReviewAt,
  getWordStatusBadgeClass,
  getWordStatusLabel,
  isWordReviewDue,
} from "@/lib/my-words/display";
import {
  getDisplayedWordStatus,
  hasUserStatusOverride,
  type UserStatusOverride,
} from "@/lib/my-words/display-status";
import {
  getWordNavState,
  resolveWordNavOrder,
} from "@/lib/my-words/nav-order";
import { setUserStatusOverride } from "@/lib/my-words/status-override";
import { getMyWordById, loadMyWords } from "@/lib/my-words/store";
import { ui } from "@/lib/ui-text";
import type { MyWordUserEntry } from "@/types/my-words";

const navButtonClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-lg font-medium transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100";

function readWord(wordId: string): MyWordUserEntry | null | undefined {
  if (typeof window === "undefined") return undefined;
  return getMyWordById(wordId);
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function MyWordsDetail({ wordId }: { wordId: string }) {
  const router = useRouter();
  const [word, setWord] = useState<MyWordUserEntry | null | undefined>(() =>
    readWord(wordId),
  );
  const [tick, setTick] = useState(0);

  useLayoutEffect(() => {
    setWord(getMyWordById(wordId));
  }, [wordId, tick]);

  const allIds =
    typeof window === "undefined"
      ? []
      : loadMyWords().map((entry) => entry.wordId);

  const nav = useMemo(() => {
    const ordered = resolveWordNavOrder(wordId, allIds);
    return getWordNavState(wordId, ordered);
  }, [wordId, allIds]);

  useEffect(() => {
    router.prefetch("/my-words");
    if (nav.prevId) router.prefetch(`/my-words/${encodeURIComponent(nav.prevId)}`);
    if (nav.nextId) router.prefetch(`/my-words/${encodeURIComponent(nav.nextId)}`);
  }, [router, nav.prevId, nav.nextId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      if (event.key === "ArrowLeft" && nav.prevId) {
        event.preventDefault();
        router.push(`/my-words/${encodeURIComponent(nav.prevId)}`);
      }
      if (event.key === "ArrowRight" && nav.nextId) {
        event.preventDefault();
        router.push(`/my-words/${encodeURIComponent(nav.nextId)}`);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nav.prevId, nav.nextId, router]);

  function goTo(id: string | null) {
    if (!id) return;
    router.push(`/my-words/${encodeURIComponent(id)}`);
  }

  function applyOverride(override: UserStatusOverride | null) {
    const result = setUserStatusOverride(wordId, override);
    if (result.ok) setTick((value) => value + 1);
  }

  if (word === undefined) {
    return null;
  }

  if (word === null) {
    return (
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-8 text-center shadow-sm">
        <p className="text-sm text-gray-600">{ui.myWords.notFound}</p>
        <Link
          href="/my-words"
          prefetch
          className="mt-6 inline-flex items-center justify-center rounded-xl border border-blossom-200 bg-white px-6 py-3 text-sm font-medium text-blossom-600 transition hover:bg-blossom-50"
        >
          {ui.myWords.backToList}
        </Link>
      </div>
    );
  }

  const displayed = getDisplayedWordStatus(word);
  const manual = hasUserStatusOverride(word);
  const reviewDue = isWordReviewDue(word.nextReviewAt);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-6 shadow-sm">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => goTo(nav.prevId)}
            disabled={nav.isFirst || !nav.prevId}
            aria-label={ui.myWords.prevWord}
            className={`${navButtonClass} border-gray-200 bg-white text-gray-700 hover:border-blossom-200 hover:bg-blossom-50`}
          >
            ←
          </button>
          <div className="flex min-w-0 items-center justify-center gap-2">
            <p className="truncate font-mono text-3xl font-bold text-gray-900">
              {word.english}
            </p>
            <SpeakButton audioRef={word.audioRef ?? `mywords.${word.wordId}`} />
          </div>
          <button
            type="button"
            onClick={() => goTo(nav.nextId)}
            disabled={nav.isLast || !nav.nextId}
            aria-label={ui.myWords.nextWord}
            className={`${navButtonClass} border-gray-200 bg-white text-gray-700 hover:border-blossom-200 hover:bg-blossom-50`}
          >
            →
          </button>
        </div>
        <p className="mt-3 text-center text-lg text-gray-700">{word.japanese}</p>

        <div className="mt-4 text-center">
          <span
            className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getWordStatusBadgeClass(displayed)}`}
          >
            {getWordStatusLabel(displayed)}
          </span>
          <p className="mt-2 text-xs text-gray-500">
            {ui.myWords.currentStatus}：{getWordStatusLabel(displayed)}
            {manual ? `（${ui.myWords.statusManualHint}）` : ""}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm">
        <p className="text-sm text-gray-600">{ui.myWords.stillUnsure}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => applyOverride("practicing")}
            className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-sm text-amber-800 transition hover:bg-amber-50"
          >
            {ui.myWords.setPracticing}
          </button>
          <button
            type="button"
            onClick={() => applyOverride("weak")}
            className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-2.5 text-sm text-rose-800 transition hover:bg-rose-50"
          >
            {ui.myWords.setWeak}
          </button>
          {manual && (
            <button
              type="button"
              onClick={() => applyOverride(null)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              {ui.myWords.clearOverride}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900">{ui.myWords.example}</h2>
        <p className="mt-2 font-mono text-base text-gray-800">
          {word.exampleEnglish}
        </p>
        <p className="mt-2 text-sm text-gray-600">{word.exampleJapanese}</p>
      </div>

      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-6 shadow-sm">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">{ui.myWords.lessons}</dt>
            <dd className="mt-1 text-gray-900">
              {formatLessonNumbers(word.lessonNumbers)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">{ui.myWords.status}</dt>
            <dd className="mt-1 text-gray-900">
              {getWordStatusLabel(displayed)}
              {manual ? `（${ui.myWords.statusManualHint}）` : ""}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">{ui.myWords.nextReview}</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={
                  reviewDue
                    ? "font-medium text-blossom-600"
                    : "text-gray-900"
                }
              >
                {formatNextReviewAt(word.nextReviewAt)}
              </span>
              {reviewDue && (
                <span className="rounded-full bg-blossom-100 px-2 py-0.5 text-[10px] font-medium text-blossom-700">
                  {ui.myWords.reviewDueHint}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">{ui.myWords.firstLearned}</dt>
            <dd className="mt-1 text-gray-900">
              {formatFirstLearnedAt(word.firstLearnedAt)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
