"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { SpeechNavigationGuard } from "@/components/SpeechNavigationGuard";
import {
  formatStudyDate,
  getLessonReviewPath,
  getMyExampleJapanese,
  getMyExampleSentence,
  getMyPoints,
  getMySummary,
  getLessonNumber,
  getRecordDisplayExample,
} from "@/lib/my-loop-display";
import { PageContentSkeleton } from "@/components/PageContentSkeleton";
import {
  peekCachedMyLoopRecord,
} from "@/lib/my-loop-cache";
import { loadRecordById } from "@/lib/record-store";
import {
  logPerfElapsed,
  measureFromNavStart,
  perfLog,
  startPerfTimer,
} from "@/lib/perf-log";
import { ui } from "@/lib/ui-text";
import type { LessonRecord } from "@/types/record";

function readRecord(recordId: string): LessonRecord | null | undefined {
  if (typeof window === "undefined") return undefined;
  const cacheStartedAt = startPerfTimer();
  perfLog("my-loop-detail", "cache check start");
  const cached = peekCachedMyLoopRecord(recordId);
  logPerfElapsed(
    "my-loop-detail",
    `cache check ${cached ? "HIT" : "MISS"}`,
    cacheStartedAt,
  );
  if (cached) return cached;
  return loadRecordById(recordId);
}

export function MyLoopDetail({ recordId }: { recordId: string }) {
  const [record, setRecord] = useState<LessonRecord | null | undefined>(undefined);
  const mountLoggedRef = useRef(false);
  const mountAtRef = useRef(0);
  const displayLoggedRef = useRef(false);

  if (!mountLoggedRef.current) {
    mountLoggedRef.current = true;
    mountAtRef.current = startPerfTimer();
    perfLog("my-loop-detail", "MyLoopDetail mount");
    measureFromNavStart("my-loop-to-detail", "click → mount");
  }

  useLayoutEffect(() => {
    perfLog("my-loop-detail", "record load start");
    const loadStartedAt = startPerfTimer();
    const next = readRecord(recordId) ?? null;
    logPerfElapsed("my-loop-detail", "record load", loadStartedAt);
    setRecord(next);
    perfLog("my-loop-detail", "record state set");
  }, [recordId]);

  if (record !== undefined && !displayLoggedRef.current) {
    displayLoggedRef.current = true;
    perfLog("my-loop-detail", record ? "detail UI shown" : "not-found UI shown");
    perfLog("my-loop-detail", "skeleton end");
    logPerfElapsed("my-loop-detail", "mount → record display", mountAtRef.current);
    measureFromNavStart("my-loop-to-detail", "click → final display");
  }

  if (record === undefined) {
    return <PageContentSkeleton rows={4} />;
  }

  if (record === null) {
    return (
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-8 text-center shadow-sm">
        <p className="text-sm text-gray-600">{ui.myLoop.notFound}</p>
        <Link
          href="/my-loop"
          prefetch
          className="mt-6 inline-block text-sm font-medium text-blossom-600 hover:text-blossom-700"
        >
          {ui.myLoop.backToList}
        </Link>
      </div>
    );
  }

  const lessonSummary = getMySummary(record);
  const myPoints = getMyPoints(record);
  const myExample = getMyExampleSentence(record);
  const myExampleJa = getMyExampleJapanese(record);
  const displayExample = getRecordDisplayExample(record);
  const lessonNumber = getLessonNumber(record);
  const studyDate = formatStudyDate(record.completedAt ?? record.startedAt);

  return (
    <div className="space-y-4">
      <SpeechNavigationGuard />

      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">{record.lessonTitle}</h2>
        {displayExample && (
          <p className="mt-2 text-sm italic text-blossom-700">&ldquo;{displayExample}&rdquo;</p>
        )}
        <p className="mt-2 text-sm text-gray-600">
          {studyDate}に学習
          {record.feelingLabel && <span> ｜ 🌸 {record.feelingLabel}</span>}
        </p>
        {lessonNumber && (
          <p className="mt-1 text-xs text-leaf-600">🌱 レッスン{lessonNumber}</p>
        )}
      </div>

      <section className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">■ {ui.myLoop.lessonSummary}</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {lessonSummary || ui.myLoop.noSummary}
        </p>
      </section>

      <section className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">■ {ui.myLoop.myPoints}</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {myPoints || ui.myLoop.noPoints}
        </p>
      </section>

      <section className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">■ {ui.myLoop.myExample}</h3>
        {myExample ? (
          <>
            <p className="mt-3 font-mono text-sm text-gray-800">{myExample}</p>
            {myExampleJa && (
              <p className="mt-1 text-sm text-gray-600">{myExampleJa}</p>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-gray-500">{ui.myLoop.noExample}</p>
        )}
      </section>

      <Link
        href={getLessonReviewPath(record)}
        prefetch
        className="inline-flex w-full items-center justify-center rounded-xl border border-blossom-200 bg-white px-6 py-3 text-sm font-medium text-blossom-600 transition hover:bg-blossom-50"
      >
        {ui.myLoop.reviewLesson}
      </Link>

      <Link
        href="/my-loop"
        prefetch
        className="inline-block text-sm font-medium text-blossom-600 hover:text-blossom-700"
      >
        {ui.myLoop.backToList}
      </Link>
    </div>
  );
}
