import type { SpecialLessonConfig } from "@/lib/special-lessons/types";

/**
 * Lesson1 Special の問題テンプレート
 * 単語の基本情報（意味・例文）は My Words マスターから取得。
 * 選択肢と正解テキストはここで定義（既存 Special と同じ内容を維持）。
 */
export const lesson01SpecialConfig: SpecialLessonConfig = {
  id: "lesson-01-special",
  parentLessonNumber: 1,
  title: "Lesson 1-Special",
  subtitle: "Lesson1で登場した単語を復習しよう",
  questionTemplates: [
    {
      id: "v1",
      type: "en-to-ja",
      wordId: "student",
      prompt: "student の意味は？",
      options: ["先生", "学生", "友達", "本"],
      answer: "学生",
    },
    {
      id: "v2",
      type: "en-to-ja",
      wordId: "teacher",
      prompt: "teacher の意味は？",
      options: ["学生", "先生", "医者", "疲れている"],
      answer: "先生",
    },
    {
      id: "v3",
      type: "en-to-ja",
      wordId: "tired",
      prompt: "tired の意味は？",
      options: ["うれしい", "新しい", "疲れている", "友達"],
      answer: "疲れている",
    },
    {
      id: "v4",
      type: "en-to-ja",
      wordId: "happy",
      prompt: "happy の意味は？",
      options: ["疲れている", "うれしい・幸せな", "新しい", "本"],
      answer: "うれしい・幸せな",
    },
    {
      id: "v5",
      type: "en-to-ja",
      wordId: "friend",
      prompt: "friend の意味は？",
      options: ["友達", "本", "先生", "家"],
      answer: "友達",
    },
    {
      id: "v6",
      type: "ja-to-en",
      wordId: "new",
      prompt: "「新しい」を英語で言うと？",
      options: ["new", "old", "happy", "tired"],
      answer: "new",
    },
    {
      id: "v7",
      type: "ja-to-en",
      wordId: "book",
      prompt: "「本」を英語で言うと？",
      options: ["book", "home", "doctor", "student"],
      answer: "book",
    },
  ],
};
