import { getLessonById, getLessonBasePath } from "@/lib/lessons/registry";
import {
  FINAL_MY_SUMMARY_ID,
  USER_EXAMPLE_AFFIRM_ID,
  USER_EXAMPLE_APPLIED_ID,
  USER_EXAMPLE_ID,
  USER_EXAMPLE_NEG_ID,
} from "@/lib/lessons/types";
import {
  getValidUserExample,
  isMeaningfulText,
} from "@/lib/answer-quality";
import { formatLesson01SummaryForMyLoop } from "@/lib/build-lesson01-final-summary";
import {
  FINAL_L1_MY_EXAMPLE_ID,
  FINAL_L1_MY_POINTS_ID,
  isLesson01StructuredFinalSummary,
} from "@/lib/lessons/lesson01-final-summary";
import type { LessonRecord } from "@/types/record";

function trajectoryMap(record: LessonRecord): Record<string, string> {
  return Object.fromEntries(record.trajectoryEntries.map((e) => [e.id, e.answer]));
}

/** Step3 / 完成まとめから「大事だと思ったこと」（Coach回答優先） */
export function getMyPoints(record: LessonRecord): string {
  const finalItems = record.finalSummary ?? [];

  if (isLesson01StructuredFinalSummary(finalItems)) {
    const fromFinal = finalItems.find((e) => e.id === FINAL_L1_MY_POINTS_ID)?.answer.trim();
    if (fromFinal && isMeaningfulText(fromFinal)) return fromFinal;
  }

  if (record.coachAnswer?.trim() && isMeaningfulText(record.coachAnswer)) {
    return record.coachAnswer.trim();
  }

  const raw = trajectoryMap(record)["points"]?.trim() ?? "";
  return isMeaningfulText(raw) ? raw : "";
}

/** Step3 で入力した自作例文の日本語訳 */
export function getMyExampleJapanese(record: LessonRecord): string {
  if (record.userExampleJapanese?.trim()) {
    return record.userExampleJapanese.trim();
  }
  return "";
}

/** 自作例文（有効なもののみ。完成まとめ優先） */
export function getMyExampleSentence(record: LessonRecord): string {
  const finalItems = record.finalSummary ?? [];

  if (isLesson01StructuredFinalSummary(finalItems)) {
    const fromFinal = finalItems.find((e) => e.id === FINAL_L1_MY_EXAMPLE_ID)?.answer.trim();
    if (fromFinal && getValidUserExample({ [USER_EXAMPLE_ID]: fromFinal })) {
      return fromFinal;
    }
  }

  const map = trajectoryMap(record);
  const valid = getValidUserExample(map);
  if (valid) return valid;

  const legacy = [
    map[USER_EXAMPLE_AFFIRM_ID],
    map[USER_EXAMPLE_NEG_ID],
    map[USER_EXAMPLE_APPLIED_ID],
  ]
    .map((s) => s?.trim())
    .filter(Boolean);

  for (const candidate of legacy) {
    if (candidate && getValidUserExample({ [USER_EXAMPLE_ID]: candidate })) {
      return candidate;
    }
  }

  return "";
}

/** My Loop 等で表示するユーザー例文（無効なら null） */
export function getRecordDisplayExample(record: LessonRecord): string | null {
  const example = getMyExampleSentence(record);
  return example || null;
}

/** 完成まとめ：レッスンの要約 */
export function getMySummary(record: LessonRecord): string {
  const items = record.finalSummary ?? [];

  if (isLesson01StructuredFinalSummary(items)) {
    return formatLesson01SummaryForMyLoop(items);
  }

  const current = items.find((e) => e.id === FINAL_MY_SUMMARY_ID)?.answer.trim();
  if (current) return current;

  const legacyParts = items
    .filter((e) => e.id.startsWith("final-") && e.id !== FINAL_MY_SUMMARY_ID)
    .map((e) => e.answer.trim())
    .filter(Boolean);

  if (legacyParts.length === 0) return "";

  return legacyParts
    .join("\n")
    .split("\n")
    .slice(0, 5)
    .join("\n");
}

export function getLessonNumber(record: LessonRecord): number | null {
  const lesson = getLessonById(record.lessonId);
  return lesson?.number ?? null;
}

export function getLessonReviewPath(record: LessonRecord): string {
  const n = getLessonNumber(record);
  return n ? getLessonBasePath(n) : "/lessons";
}

export function formatStudyDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
