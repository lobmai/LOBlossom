import type { SpecialLessonConfig } from "@/lib/special-lessons/types";

/**
 * Lesson5 Special の問題テンプレート
 * 単語の基本情報は lesson05WordMaster から取得。
 * 5語を各1回。英→日と日→英を混ぜる。
 */
export const lesson05SpecialConfig: SpecialLessonConfig = {
  id: "lesson-05-special",
  parentLessonNumber: 5,
  title: "Lesson 5-Special",
  subtitle: "Lesson5で登場した単語を復習しよう",
  questionTemplates: [
    {
      id: "v1",
      type: "en-to-ja",
      wordId: "rich",
      prompt: "rich の意味は？",
      options: ["お金持ち", "お金", "車", "明日"],
      answer: "お金持ち",
    },
    {
      id: "v2",
      type: "en-to-ja",
      wordId: "travel",
      prompt: "travel の意味は？",
      options: ["旅行する", "お金持ち", "車", "お金"],
      answer: "旅行する",
    },
    {
      id: "v3",
      type: "en-to-ja",
      wordId: "car",
      prompt: "car の意味は？",
      options: ["車", "旅行する", "お金", "明日"],
      answer: "車",
    },
    {
      id: "v4",
      type: "ja-to-en",
      wordId: "money",
      prompt: "「お金」を英語で言うと？",
      options: ["money", "rich", "car", "travel"],
      answer: "money",
    },
    {
      id: "v5",
      type: "ja-to-en",
      wordId: "tomorrow",
      prompt: "「明日」を英語で言うと？",
      options: ["tomorrow", "money", "car", "rich"],
      answer: "tomorrow",
    },
  ],
};
