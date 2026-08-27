import { getLessonById } from "@/lib/lessons/registry";
import {
  FINAL_MY_SUMMARY_ID,
  USER_EXAMPLE_AFFIRM_ID,
  USER_EXAMPLE_APPLIED_ID,
  USER_EXAMPLE_ID,
  USER_EXAMPLE_NEG_ID,
} from "@/lib/lessons/types";
import type { AiEvaluation, LabeledAnswer } from "@/types/record";

const LESSON1_FALLBACK_SUMMARY = [
  "・be動詞は「～です」「～にいる・ある」などを表す。",
  "・am / is / are があり、主語によって使い分ける。",
  "・否定文はbe動詞の後ろにnotを置く。",
  "・疑問文はbe動詞を主語の前に出す。",
].join("\n");

const LESSON2_FALLBACK_SUMMARY = [
  "・一般動詞は「する・好き」などを表す。",
  "・he / she / it など三人称単数のとき、動詞にsを付ける（3単現）。",
  "・否定は don't / doesn't、疑問は Do / Does を文頭に置く。",
  "・does / doesn't / Does の後ろの動詞は原形（sを付けない）。",
].join("\n");

function fallbackForLesson(lessonNumber: number): string {
  if (lessonNumber === 1) return LESSON1_FALLBACK_SUMMARY;
  if (lessonNumber === 2) return LESSON2_FALLBACK_SUMMARY;
  return "・今日学んだ内容の要点を整理できた。";
}

/** Step 6：API 未使用時のフォールバック（評価コメントは含めない） */
export function buildFinalSummary(
  lessonId: string,
  trajectoryEntries: LabeledAnswer[],
  _aiEvaluation: AiEvaluation | null,
  finalizedEntries?: LabeledAnswer[] | null,
): LabeledAnswer[] {
  if (finalizedEntries && finalizedEntries.length > 0) {
    return finalizedEntries;
  }

  const lesson = getLessonById(lessonId);
  if (!lesson) {
    throw new Error(`Unknown lessonId: ${lessonId}`);
  }

  return [
    {
      id: FINAL_MY_SUMMARY_ID,
      label: "レッスンの要約",
      answer: fallbackForLesson(lesson.number),
    },
  ];
}

export function isFinalSummaryEntry(entry: LabeledAnswer): boolean {
  return entry.id === FINAL_MY_SUMMARY_ID && entry.answer.trim().length > 0;
}

export { FINAL_MY_SUMMARY_ID as FINAL_MY_SUMMARY_ID_EXPORT };

export function getUserExampleText(map: Record<string, string>): string {
  const single = map[USER_EXAMPLE_ID]?.trim();
  if (single) return single;
  return (
    [map[USER_EXAMPLE_AFFIRM_ID], map[USER_EXAMPLE_NEG_ID], map[USER_EXAMPLE_APPLIED_ID]]
      .map((s) => s?.trim())
      .filter(Boolean)[0] ?? ""
  );
}
