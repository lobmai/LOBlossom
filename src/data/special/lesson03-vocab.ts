import type { SpecialLessonConfig } from "@/lib/special-lessons/types";

/**
 * Lesson3 Special の問題テンプレート
 * 単語の基本情報は lesson03WordMaster から取得。
 * 5語を各1回。英→日と日→英を混ぜる。
 */
export const lesson03SpecialConfig: SpecialLessonConfig = {
  id: "lesson-03-special",
  parentLessonNumber: 3,
  title: "Lesson 3-Special",
  subtitle: "Lesson3で登場した単語を復習しよう",
  questionTemplates: [
    {
      id: "v1",
      type: "en-to-ja",
      wordId: "key",
      prompt: "key の意味は？",
      options: ["鍵", "宿題", "なくした", "住んだ"],
      answer: "鍵",
    },
    {
      id: "v2",
      type: "en-to-ja",
      wordId: "homework",
      prompt: "homework の意味は？",
      options: ["宿題", "鍵", "終えた", "なくした"],
      answer: "宿題",
    },
    {
      id: "v3",
      type: "en-to-ja",
      wordId: "lost",
      prompt: "lost の意味は？",
      options: ["なくした", "終えた", "鍵", "住んだ"],
      answer: "なくした",
    },
    {
      id: "v4",
      type: "ja-to-en",
      wordId: "finished",
      prompt: "「終えた」を英語で言うと？",
      options: ["finished", "lived", "lost", "key"],
      answer: "finished",
    },
    {
      id: "v5",
      type: "ja-to-en",
      wordId: "lived",
      prompt: "「住んだ」を英語で言うと？",
      options: ["lived", "finished", "lost", "homework"],
      answer: "lived",
    },
  ],
};
