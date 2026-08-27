import type { CheckQuestion, LessonMeta } from "@/types/lesson";
import type { CoachRubric } from "@/lib/coach-rubric/types";

export type MeaningSentence = {
  id: string;
  kind: string;
  sentence: string;
  keyword: string;
  keywordMeaning: string;
};

export type SummaryInputField = {
  id: string;
  label: string;
  placeholder: string;
  hint?: string;
  mono?: boolean;
};

export type UserExampleField = {
  id: string;
  label: string;
  placeholder: string;
  hint?: string;
};

export type TeachQuestionConfig = {
  question: string;
  hintsLabel: string;
  hints: string[];
};

export type LessonSummaryConfig = {
  meaningSentences: MeaningSentence[];
  /** 英文例ではなく、題材そのものの意味を書く欄（L1: be動詞の意味） */
  meaningFields?: SummaryInputField[];
  usageFields: SummaryInputField[];
  extraFields: SummaryInputField[];
  /** Step3 自分まとめに「大事だと思うポイント」を含める（L1はCoach質問と重複するため false） */
  includePointsInTrajectory?: boolean;
  sectionLabels: {
    meaning: string;
    usage: string;
    unclear: string;
    points: string;
    userExample: string;
  };
  questionHowId: string;
  userExampleFields: UserExampleField[];
  /** Step5：固定の教える質問とレッスン別ヒント */
  teachQuestion: TeachQuestionConfig;
  finalSummarySections: { id: string; label: string }[];
};

export type LessonCoachConfig = {
  evaluateSystemPrompt: string;
  finalizeInstructions: string;
  questionSystemPrompt: string;
  /** Phase5：Lesson別評価基準（5b 以降で evaluate に使用） */
  rubric?: CoachRubric;
};

export type LessonRegistryEntry = {
  number: number;
  meta: LessonMeta;
  taughtTopics: string[];
  checkQuestions: CheckQuestion[];
  summary: LessonSummaryConfig;
  coach: LessonCoachConfig;
};

export const UNCLEAR_CHOICE_ID = "unclear-choice";
export const UNCLEAR_DETAIL_ID = "unclear-detail";
export const POINTS_ID = "points";
export const FINAL_EXAMPLES_ID = "final-examples";
export const FINAL_MY_SUMMARY_ID = "final-my-summary";

export const USER_EXAMPLE_AFFIRM_ID = "user-example-affirm";
export const USER_EXAMPLE_NEG_ID = "user-example-neg";
export const USER_EXAMPLE_APPLIED_ID = "user-example-applied";

/** @deprecated 旧1欄形式 */
export const USER_EXAMPLE_ID = "user-example";
