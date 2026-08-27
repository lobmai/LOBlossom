import type { LabeledAnswer } from "@/types/record";
import {
  FINAL_L1_BASICS_ID,
  FINAL_L1_MY_EXAMPLE_ID,
  FINAL_L1_MY_POINTS_ID,
  FINAL_L1_NEGATION_ID,
  FINAL_L1_QUESTION_ID,
  LESSON01_FINAL_SUMMARY_SECTIONS,
  isLesson01StructuredFinalSummary,
} from "@/lib/lessons/lesson01-final-summary";
import {
  BE_VERB_MEANING_ID,
  NEGATION_RULE_ID,
  QUESTION_HOW_ID,
} from "@/lib/lessons/lesson01-ids";
import {
  getValidUserExample,
  isMeaningfulText,
} from "@/lib/answer-quality";
import { fromTrajectoryEntries } from "@/lib/summary-fields";

export {
  FINAL_L1_BASICS_ID,
  FINAL_L1_NEGATION_ID,
  FINAL_L1_QUESTION_ID,
  FINAL_L1_MY_POINTS_ID,
  FINAL_L1_MY_EXAMPLE_ID,
  LESSON01_FINAL_SUMMARY_SECTIONS,
  isLesson01StructuredFinalSummary,
};

/** Lesson1：Step3 + Step5 から固定5項目の完成まとめを組み立てる */
export function buildLesson01FinalSummary(
  trajectoryEntries: LabeledAnswer[],
  coachAnswer: string | null,
): LabeledAnswer[] {
  const map = fromTrajectoryEntries(trajectoryEntries);
  const example = getValidUserExample(map);
  const points = coachAnswer?.trim() ?? "";

  if (!isMeaningfulText(points)) {
    throw new Error("Coach answer is required for Lesson 1 final summary");
  }
  if (!example) {
    throw new Error("Valid user example is required for Lesson 1 final summary");
  }

  const meaningText =
    map[BE_VERB_MEANING_ID]?.trim() ||
    "be動詞は「～です」「～にいます」「～にあります」などを表す言葉";

  const basicsAnswer = [
    "・be動詞の意味",
    `  ${meaningText}`,
    "・am / is / are の使い分け",
    `  - am：${map["usage-am"]?.trim() ?? ""}`,
    `  - is：${map["usage-is"]?.trim() ?? ""}`,
    `  - are：${map["usage-are"]?.trim() ?? ""}`,
  ].join("\n");

  return [
    { id: FINAL_L1_BASICS_ID, label: "be動詞の基礎", answer: basicsAnswer },
    {
      id: FINAL_L1_NEGATION_ID,
      label: "否定文の作り方",
      answer: map[NEGATION_RULE_ID]?.trim() ?? "",
    },
    {
      id: FINAL_L1_QUESTION_ID,
      label: "疑問文の作り方",
      answer: map[QUESTION_HOW_ID]?.trim() ?? "",
    },
    {
      id: FINAL_L1_MY_POINTS_ID,
      label: "私が大事だと思ったこと",
      answer: points,
    },
    {
      id: FINAL_L1_MY_EXAMPLE_ID,
      label: "私が作った例文",
      answer: example,
    },
  ];
}

/** 「私が大事だと思ったこと」だけ差し替え。他項目は変えない */
export function replaceLesson01MyPoints(
  entries: LabeledAnswer[],
  polished: string,
): LabeledAnswer[] {
  const text = polished.trim();
  if (!isMeaningfulText(text)) return entries;
  return entries.map((entry) =>
    entry.id === FINAL_L1_MY_POINTS_ID ? { ...entry, answer: text } : entry,
  );
}

/** My Loop「レッスンの要約」用：基礎・否定・疑問を結合 */
export function formatLesson01SummaryForMyLoop(
  entries: LabeledAnswer[],
): string {
  const byId = Object.fromEntries(entries.map((e) => [e.id, e.answer.trim()]));
  const parts = [
    byId[FINAL_L1_BASICS_ID],
    byId[FINAL_L1_NEGATION_ID],
    byId[FINAL_L1_QUESTION_ID],
  ].filter(Boolean);

  return parts
    .map((text, index) => {
      const label = LESSON01_FINAL_SUMMARY_SECTIONS[index]?.label ?? "";
      return label ? `【${label}】\n${text}` : text;
    })
    .join("\n\n");
}
