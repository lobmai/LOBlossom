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
  isValidUserExample,
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

/**
 * Step3 / 完成まとめから「大事だと思ったこと」
 * 1. myPointsFinal（Step6 polish 済み）
 * 2. 旧レコード: L1 final-l1-my-points / L2 points / L3 coachAnswer
 */
export function getMyPoints(record: LessonRecord): string {
  const storedFinal = record.myPointsFinal?.trim() ?? "";
  if (storedFinal && isMeaningfulText(storedFinal)) return storedFinal;

  const finalItems = record.finalSummary ?? [];

  if (isLesson01StructuredFinalSummary(finalItems)) {
    const fromFinal = finalItems.find((e) => e.id === FINAL_L1_MY_POINTS_ID)?.answer.trim();
    if (fromFinal && isMeaningfulText(fromFinal)) return fromFinal;
  }

  const isLesson03 = record.lessonId === "lesson-03-present-perfect";
  if (!isLesson03) {
    const fromStep3 = trajectoryMap(record)["points"]?.trim() ?? "";
    if (isMeaningfulText(fromStep3)) return fromStep3;
  }

  if (record.coachAnswer?.trim() && isMeaningfulText(record.coachAnswer)) {
    return record.coachAnswer.trim();
  }

  return "";
}

/** 最終例文の保存済み日本語訳。未保存の旧レコードは空文字 */
export function getMyExampleJapanese(record: LessonRecord): string {
  if (record.userExampleJapanese?.trim()) {
    return record.userExampleJapanese.trim();
  }
  return "";
}

/** 自作例文（有効なもののみ。確定例文 → Lesson1完成まとめ → Step3原文） */
export function getMyExampleSentence(record: LessonRecord): string {
  const storedFinal = record.userExampleFinal?.trim() ?? "";
  if (storedFinal && isValidUserExample(storedFinal)) {
    return storedFinal;
  }

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

/** Step6 と My Loop で同じ最終表示を作る */
export function getMyLoopSavedFields(record: LessonRecord): {
  summary: string;
  points: string;
  example: string;
  exampleJa: string;
} {
  return {
    summary: getMySummary(record),
    points: getMyPoints(record),
    example: getMyExampleSentence(record),
    exampleJa: getMyExampleJapanese(record),
  };
}

export function formatStudyDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
