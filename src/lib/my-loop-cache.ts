import type { LessonRecord } from "@/types/record";

let listCache: LessonRecord[] | null = null;

/** 一覧で読んだ My Loop を同一セッション内で詳細の初回表示に再利用する */
export function rememberMyLoopRecords(records: LessonRecord[]): void {
  listCache = records;
}

export function peekCachedMyLoopRecord(recordId: string): LessonRecord | null {
  if (!listCache) return null;
  return listCache.find((record) => record.recordId === recordId) ?? null;
}
