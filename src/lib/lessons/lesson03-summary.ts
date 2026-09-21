import type { LessonSummaryConfig } from "@/lib/lessons/types";
import {
  FINAL_MY_SUMMARY_ID,
  USER_EXAMPLE_ID,
} from "@/lib/lessons/types";

export const PP_MEANING_ID = "pp-meaning";
export const PAST_VS_PP_ID = "past-vs-pp";
export const THREE_USES_ID = "three-uses";
export const HAVE_HAS_ID = "have-has-rule";

export const lesson03SummaryConfig: LessonSummaryConfig = {
  includePointsInTrajectory: false,
  myPointsSource: "step5-answers",
  meaningSentences: [],
  meaningFields: [
    {
      id: PP_MEANING_ID,
      label: "現在完了はどんなことを表す？",
      placeholder: "自分の言葉で書こう",
      hint: "例：過去のことと、今とのつながり",
    },
    {
      id: PAST_VS_PP_ID,
      label: "過去形と現在完了は何が違う？",
      placeholder: "自分の言葉でちがいを書こう",
      hint: "例：I lost my key. / I have lost my key.",
    },
  ],
  usageFields: [
    {
      id: THREE_USES_ID,
      label: "経験・完了・継続",
      placeholder: "3つの使い方を、自分の言葉で書こう",
    },
  ],
  extraFields: [
    {
      id: HAVE_HAS_ID,
      label: "have と has はどう使い分ける？",
      placeholder: "どの主語のとき have / has か書こう",
      hint: "例：I/you/we/they → have、he/she/it → has",
    },
  ],
  sectionLabels: {
    meaning: "現在完了はどんなことを表す？",
    usage: "現在完了の3つの使い方は？",
    unclear: "分からなかったところ",
    points: "自分が大事だと思うポイント",
    userExample: "自分で例文を作ってみよう",
  },
  questionHowId: "",
  teachQuestion: {
    question: "今回のレッスンで、いちばん大事だと思ったことは何？教えて！",
    hintsLabel: "こんなことを入れてみよう",
    hints: [
      "have / has",
      "過去分詞",
      "過去と今のつながり",
      "経験",
      "完了",
      "継続",
    ],
    inputPlaceholder: "例：過去形とのちがい / 過去と今のつながり",
  },
  userExampleFields: [
    {
      id: USER_EXAMPLE_ID,
      label: "例文",
      placeholder: "I have eaten sushi.",
      hint: "現在完了を使った英文を1文",
    },
  ],
  finalSummarySections: [
    { id: FINAL_MY_SUMMARY_ID, label: "レッスンの要約" },
  ],
};
