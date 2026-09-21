import type { SpecialLessonConfig } from "@/lib/special-lessons/types";

/**
 * Lesson2 Special の問題テンプレート
 * 単語の基本情報は既存の lesson02WordMaster から取得。
 * 5語を各1回。英→日と日→英を混ぜる（7問には揃えない）。
 */
export const lesson02SpecialConfig: SpecialLessonConfig = {
  id: "lesson-02-special",
  parentLessonNumber: 2,
  title: "Lesson 2-Special",
  subtitle: "Lesson2で登場した単語を復習しよう",
  questionTemplates: [
    {
      id: "v1",
      type: "en-to-ja",
      wordId: "play",
      prompt: "play の意味は？",
      options: ["する・遊ぶ", "食べる", "好き", "行く"],
      answer: "する・遊ぶ",
    },
    {
      id: "v2",
      type: "en-to-ja",
      wordId: "eat",
      prompt: "eat の意味は？",
      options: ["食べる", "する・遊ぶ", "勉強する", "行く"],
      answer: "食べる",
    },
    {
      id: "v3",
      type: "ja-to-en",
      wordId: "like",
      prompt: "「好き」を英語で言うと？",
      options: ["like", "play", "eat", "go"],
      answer: "like",
    },
    {
      id: "v4",
      type: "en-to-ja",
      wordId: "go",
      prompt: "go の意味は？",
      options: ["行く", "勉強する", "好き", "食べる"],
      answer: "行く",
    },
    {
      id: "v5",
      type: "ja-to-en",
      wordId: "study",
      prompt: "「勉強する」を英語で言うと？",
      options: ["study", "play", "eat", "go"],
      answer: "study",
    },
  ],
};
