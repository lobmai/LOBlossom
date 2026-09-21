import type { LessonSummaryConfig } from "@/lib/lessons/types";
import {
  FINAL_MY_SUMMARY_ID,
  USER_EXAMPLE_ID,
} from "@/lib/lessons/types";

export const HYPO_MEANING_ID = "hypo-meaning";
export const HYPO_PAST_NOT_TIME_ID = "hypo-past-not-time";
export const HYPO_IF_WOULD_ID = "hypo-if-would";

export const lesson05SummaryConfig: LessonSummaryConfig = {
  includePointsInTrajectory: false,
  myPointsSource: "step5-answers",
  meaningSentences: [],
  meaningFields: [
    {
      id: HYPO_MEANING_ID,
      label: "仮定法はどんなときに使う？",
      placeholder: "自分の言葉で書こう",
      hint: "例：現実とは違うことを想像する",
    },
    {
      id: HYPO_PAST_NOT_TIME_ID,
      label: "なぜ過去形を使っているのに、昔の話とは限らない？",
      placeholder: "自分の言葉で書こう",
      hint: "例：今とは違う想像だから",
    },
  ],
  usageFields: [
    {
      id: HYPO_IF_WOULD_ID,
      label: "役割のちがい",
      placeholder: "例：想像の条件 / 想像の結果",
      hint: "想像の条件 / 想像の結果",
    },
  ],
  extraFields: [],
  sectionLabels: {
    meaning: "仮定法はどんなときに使う？",
    usage: "if側とwould側は、それぞれ何を表している？",
    unclear: "分からなかったところ",
    points: "自分が大事だと思うポイント",
    userExample: "自分で仮定法の例文を作ってみよう",
  },
  questionHowId: "",
  teachQuestion: {
    question: "今回のレッスンで、いちばん大事だと思ったことは何？教えて！",
    hintsLabel: "こんなことを入れてみよう",
    hints: ["if", "過去形", "would", "想像", "現実"],
    inputPlaceholder: "例：現実とは違う想像 / 過去形でも昔の話とは限らない",
  },
  userExampleFields: [
    {
      id: USER_EXAMPLE_ID,
      label: "例文",
      placeholder: "If I had more time, I would travel more.",
      hint: "仮定法を使った英文を1文",
    },
  ],
  finalSummarySections: [
    { id: FINAL_MY_SUMMARY_ID, label: "レッスンの要約" },
  ],
};
