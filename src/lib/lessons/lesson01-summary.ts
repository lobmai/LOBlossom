import type { LessonSummaryConfig } from "@/lib/lessons/types";
import {
  FINAL_MY_SUMMARY_ID,
  POINTS_ID,
  USER_EXAMPLE_ID,
} from "@/lib/lessons/types";
import { LESSON01_FINAL_SUMMARY_SECTIONS } from "@/lib/lessons/lesson01-final-summary";
import {
  BE_VERB_MEANING_ID,
  NEGATION_RULE_ID,
  QUESTION_HOW_ID,
} from "@/lib/lessons/lesson01-ids";

export { BE_VERB_MEANING_ID, NEGATION_RULE_ID, QUESTION_HOW_ID };

export const lesson01SummaryConfig: LessonSummaryConfig = {
  includePointsInTrajectory: false,
  meaningSentences: [],
  meaningFields: [
    {
      id: BE_VERB_MEANING_ID,
      label: "be動詞はどんな意味？",
      placeholder: "自分の言葉で書こう",
      hint: "例：～です、～にいる・ある",
    },
  ],
  usageFields: [
    { id: "usage-am", label: "am", placeholder: "どんな主語のとき？" },
    { id: "usage-is", label: "is", placeholder: "どんな主語のとき？" },
    { id: "usage-are", label: "are", placeholder: "どんな主語のとき？" },
  ],
  extraFields: [
    {
      id: NEGATION_RULE_ID,
      label: "否定文はどう作る？",
      placeholder: "be動詞の否定文の作り方を、自分の言葉で書こう",
      hint: "例：be動詞の後ろに not を置く",
    },
    {
      id: QUESTION_HOW_ID,
      label: "疑問文はどう作る？",
      placeholder: "疑問文の作り方を書こう",
      hint: "例：be動詞を主語の前に出す",
    },
  ],
  sectionLabels: {
    meaning: "be動詞はどんな意味？",
    usage: "be動詞3種類の使い方は？",
    unclear: "分からなかったところ",
    points: "自分が大事だと思うポイント",
    userExample: "自分で例文を作ってみよう",
  },
  questionHowId: QUESTION_HOW_ID,
  teachQuestion: {
    question: "このレッスンで、いちばん大事なことって何？教えて！",
    hintsLabel: "こんなことを入れてみよう",
    hints: ["be動詞", "am / is / are", "否定文", "疑問文"],
  },
  userExampleFields: [
    {
      id: USER_EXAMPLE_ID,
      label: "例文",
      placeholder: "I am tired.",
      hint: "be動詞を使った英文を1文",
    },
  ],
  finalSummarySections: [...LESSON01_FINAL_SUMMARY_SECTIONS],
};

export { POINTS_ID, FINAL_MY_SUMMARY_ID };
