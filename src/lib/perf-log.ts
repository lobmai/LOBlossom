/**
 * 開発環境専用の速度計測ログ。
 * production では何もしない。計測以外の保存・挙動変更は行わない。
 */

export type PerfNavKind =
  | "check-to-summarize"
  | "summarize-to-evaluate"
  | "evaluate-to-answer"
  | "answer-to-finalize"
  | "my-loop-to-detail";

interface NavStamp {
  kind: PerfNavKind;
  visit: number;
  wallMs: number;
  perfMs: number;
  id: string;
  detail?: string;
}

const STORAGE_NAV = "loblossom:perf:nav:";
const STORAGE_VISIT = "loblossom:perf:visit:";

export function isPerfEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

function wallIso(): string {
  return new Date().toISOString();
}

function nowPerf(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/** ターミナルの Compiled ログと照合できる ISO 時刻付きログ */
export function perfLog(scope: string, message: string): void {
  if (!isPerfEnabled()) return;
  console.info(`[PERF][${scope}] ${message} @${wallIso()}`);
}

export function startPerfTimer(): number {
  return nowPerf();
}

export function logPerfElapsed(
  scope: string,
  label: string,
  startedAt: number,
): number {
  const ms = Math.round(nowPerf() - startedAt);
  perfLog(scope, `${label}: ${ms}ms`);
  return ms;
}

/** 同期処理の所要時間。処理順は変えない。 */
export function measureSync<T>(scope: string, label: string, fn: () => T): T {
  if (!isPerfEnabled()) return fn();
  const startedAt = nowPerf();
  try {
    return fn();
  } finally {
    logPerfElapsed(scope, label, startedAt);
  }
}

function readVisit(kind: PerfNavKind): number {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_VISIT}${kind}`);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeVisit(kind: PerfNavKind, visit: number): void {
  try {
    sessionStorage.setItem(`${STORAGE_VISIT}${kind}`, String(visit));
  } catch {
    /* ignore quota / private mode */
  }
}

/** ページ跨ぎ用。クリック瞬間に呼ぶ。visit は同一タブ内で 1, 2, … */
export function markNavStart(kind: PerfNavKind, detail?: string): void {
  if (!isPerfEnabled() || typeof window === "undefined") return;

  const visit = readVisit(kind) + 1;
  writeVisit(kind, visit);

  const stamp: NavStamp = {
    kind,
    visit,
    wallMs: Date.now(),
    perfMs: nowPerf(),
    id: `${kind}-v${visit}-${Date.now()}`,
    detail,
  };

  try {
    sessionStorage.setItem(`${STORAGE_NAV}${kind}`, JSON.stringify(stamp));
  } catch {
    /* ignore */
  }

  try {
    performance.mark(`[PERF][NAV][${kind}][START]#${visit}`);
  } catch {
    /* ignore */
  }

  const extra = detail ? ` detail=${detail}` : "";
  perfLog("NAV", `[${kind}][START] visit=${visit} id=${stamp.id}${extra}`);
}

function readStamp(kind: PerfNavKind): NavStamp | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_NAV}${kind}`);
    if (!raw) return null;
    return JSON.parse(raw) as NavStamp;
  } catch {
    return null;
  }
}

/**
 * クリック時点からの経過。client navigation では performance.now()、
 * フルリロード時は Date.now() にフォールバック。
 */
export function measureFromNavStart(kind: PerfNavKind, label: string): void {
  if (!isPerfEnabled()) return;
  const stamp = readStamp(kind);
  if (!stamp) {
    perfLog("NAV", `[${kind}] ${label}: (no START stamp)`);
    return;
  }

  const wallMs = Date.now() - stamp.wallMs;
  const perfMs = nowPerf() - stamp.perfMs;
  const usePerf = perfMs >= 0 && Math.abs(perfMs - wallMs) < 8000;
  const ms = Math.round(usePerf ? perfMs : wallMs);

  try {
    performance.measure(
      `[PERF][NAV][${kind}] ${label}#${stamp.visit}`,
      `[PERF][NAV][${kind}][START]#${stamp.visit}`,
    );
  } catch {
    /* mark が無い・別ドキュメントなら無視 */
  }

  const extra = stamp.detail ? ` detail=${stamp.detail}` : "";
  perfLog(
    "NAV",
    `[${kind}] ${label}: ${ms}ms visit=${stamp.visit} id=${stamp.id}${extra}`,
  );
}
