import type { LessonSummaryConfig } from "@/lib/lessons/types";
import {
  FINAL_MY_SUMMARY_ID,
  USER_EXAMPLE_ID,
} from "@/lib/lessons/types";

export const NEGATION_RULE_ID = "negation-rule";

export const lesson02SummaryConfig: LessonSummaryConfig = {
  meaningSentences: [],
  usageFields: [
    {
      id: "usage-general",
      label: "一般動詞の使い方",
      placeholder: "例：主語の後ろに動詞を置く",
    },
  ],
  extraFields: [
    {
      id: NEGATION_RULE_ID,
      label: "否定文はどう作る？",
      placeholder: "一般動詞の否定文の作り方を、自分の言葉で書こう",
      hint: "例：don't / doesn't + 動詞原形",
    },
    {
      id: "he-she-rule",
      label: "he / sheのときはどうなる？",
      placeholder: "例：動詞にsを付ける",
      hint: "例：He plays tennis.",
    },
  ],
  sectionLabels: {
    meaning: "これはどんな意味になる？",
    usage: "一般動詞の使い方は？",
    unclear: "分からなかったところ",
    points: "自分が大事だと思うポイント",
    userExample: "自分で例文を作ってみよう",
  },
  questionHowId: "",
  teachQuestion: {
    question: "一般動詞ってなに？",
    hintsLabel: "こんなことを入れてみよう",
    hints: ["一般動詞", "動き", "like"],
  },
  userExampleFields: [
    {
      id: USER_EXAMPLE_ID,
      label: "例文",
      placeholder: "I like music.",
      hint: "一般動詞を使った英文を1文",
    },
  ],
  finalSummarySections: [
    { id: FINAL_MY_SUMMARY_ID, label: "レッスンの要約" },
  ],
};
