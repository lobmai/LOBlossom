import type { LessonSummaryConfig } from "@/lib/lessons/types";
import {
  FINAL_MY_SUMMARY_ID,
  USER_EXAMPLE_ID,
} from "@/lib/lessons/types";

export const RP_MEANING_ID = "rp-meaning";
export const RP_WHO_WHICH_THAT_ID = "rp-who-which-that";
export const RP_SUBJECT_OBJECT_ID = "rp-subject-object";

export const lesson04SummaryConfig: LessonSummaryConfig = {
  includePointsInTrajectory: false,
  myPointsSource: "step5-answers",
  meaningSentences: [],
  meaningFields: [
    {
      id: RP_MEANING_ID,
      label: "関係代名詞は何をしている？",
      placeholder: "自分の言葉で書こう",
      hint: "例：前の名詞をあとから説明する / 2つの文を1つにする",
    },
    {
      id: RP_WHO_WHICH_THAT_ID,
      label: "who / which / that はどう使い分ける？",
      placeholder: "自分の言葉で使い分けを書こう",
      hint: "例：人は who、ものは which、that は人・ものの両方に使えることがある",
    },
  ],
  usageFields: [
    {
      id: RP_SUBJECT_OBJECT_ID,
      label: "文の並びのちがい",
      placeholder: "文の並びで気づいたことを書こう",
      hint: "「who のあとが動詞」の文と「that I bought」の文では、何が違う？",
    },
  ],
  extraFields: [],
  sectionLabels: {
    meaning: "関係代名詞は何をしている？",
    usage: "「whoのあとが動詞」の文と「that I bought」の文では、何が違う？",
    unclear: "分からなかったところ",
    points: "自分が大事だと思うポイント",
    userExample: "自分で例文を作ってみよう",
  },
  questionHowId: "",
  teachQuestion: {
    question: "今回のレッスンで、いちばん大事だと思ったことは何？教えて！",
    hintsLabel: "こんなことを入れてみよう",
    hints: ["who", "which", "that", "説明する", "2つの文"],
    inputPlaceholder: "例：後ろから名詞を説明する / who と which のちがい",
  },
  userExampleFields: [
    {
      id: USER_EXAMPLE_ID,
      label: "例文",
      placeholder: "I have a friend who lives in Tokyo.",
      hint: "who / which / that を使った英文を1文",
    },
  ],
  finalSummarySections: [
    { id: FINAL_MY_SUMMARY_ID, label: "レッスンの要約" },
  ],
};
