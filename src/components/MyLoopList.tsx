"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatStudyDate, getLessonNumber, getRecordDisplayExample } from "@/lib/my-loop-display";
import { rememberMyLoopRecords } from "@/lib/my-loop-cache";
import { LESSON_SELECT_PATH } from "@/lib/lessons/registry";
import { loadAllRecords } from "@/lib/record-store";
import { ui } from "@/lib/ui-text";
import type { LessonRecord } from "@/types/record";

function readRecords(): LessonRecord[] | null {
  if (typeof window === "undefined") return null;
  const records = loadAllRecords();
  rememberMyLoopRecords(records);
  return records;
}

export function MyLoopList() {
  const router = useRouter();
  const [records, setRecords] = useState<LessonRecord[] | null>(null);

  useLayoutEffect(() => {
    setRecords(readRecords() ?? []);
  }, []);

  useLayoutEffect(() => {
    if (!records || records.length === 0) return;
    for (const record of records) {
      router.prefetch(`/my-loop/${encodeURIComponent(record.recordId)}`);
    }
  }, [records, router]);

  if (records === null) {
    return null;
  }

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-blossom-100 bg-white/80 p-8 text-center shadow-sm">
        <p className="text-4xl">🌱</p>
        <p className="mt-4 text-sm text-gray-600">{ui.myLoop.empty}</p>
        <Link
          href={LESSON_SELECT_PATH}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-blossom-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-blossom-600"
        >
          {ui.myLoop.startLesson}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => {
        const lessonNumber = getLessonNumber(record);
        const userExample = getRecordDisplayExample(record);
        const href = `/my-loop/${encodeURIComponent(record.recordId)}`;
        return (
          <Link
            key={record.recordId}
            href={href}
            prefetch
            className="block rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm transition hover:border-blossom-200 hover:bg-blossom-50/30"
          >
            {lessonNumber && (
              <p className="text-xs font-medium text-leaf-600">🌱 レッスン{lessonNumber}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {ui.myLoop.studiedAt(formatStudyDate(record.completedAt ?? record.startedAt))}
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">{record.lessonTitle}</h2>
            {userExample && (
              <p className="mt-1 text-sm italic text-blossom-700">&ldquo;{userExample}&rdquo;</p>
            )}
            {record.feelingLabel && (
              <p className="mt-2 inline-block rounded-full border border-blossom-200 bg-blossom-50 px-3 py-1 text-xs text-blossom-700">
                {record.feelingLabel}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
