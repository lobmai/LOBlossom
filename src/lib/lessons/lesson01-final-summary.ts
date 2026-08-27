/** Lesson1 完成まとめ：固定5項目 ID と定義 */
export const FINAL_L1_BASICS_ID = "final-l1-basics";
export const FINAL_L1_NEGATION_ID = "final-l1-negation";
export const FINAL_L1_QUESTION_ID = "final-l1-question";
export const FINAL_L1_MY_POINTS_ID = "final-l1-my-points";
export const FINAL_L1_MY_EXAMPLE_ID = "final-l1-my-example";

export const LESSON01_FINAL_SUMMARY_SECTIONS = [
  { id: FINAL_L1_BASICS_ID, label: "be動詞の基礎" },
  { id: FINAL_L1_NEGATION_ID, label: "否定文の作り方" },
  { id: FINAL_L1_QUESTION_ID, label: "疑問文の作り方" },
  { id: FINAL_L1_MY_POINTS_ID, label: "私が大事だと思ったこと" },
  { id: FINAL_L1_MY_EXAMPLE_ID, label: "私が作った例文" },
] as const;

export function isLesson01StructuredFinalSummary(
  entries: { id: string }[],
): boolean {
  return entries.some((e) => e.id === FINAL_L1_BASICS_ID);
}
