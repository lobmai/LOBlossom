import type { SpecialLessonConfig } from "@/lib/special-lessons/types";

/**
 * Lesson4 Special の問題テンプレート
 * 単語の基本情報は lesson04WordMaster から取得。
 * 5語を各1回。英→日と日→英を混ぜる。
 */
export const lesson04SpecialConfig: SpecialLessonConfig = {
  id: "lesson-04-special",
  parentLessonNumber: 4,
  title: "Lesson 4-Special",
  subtitle: "Lesson4で登場した単語を復習しよう",
  questionTemplates: [
    {
      id: "v1",
      type: "en-to-ja",
      wordId: "girl",
      prompt: "girl の意味は？",
      options: ["女の子", "本", "おもしろい", "昨日"],
      answer: "女の子",
    },
    {
      id: "v2",
      type: "en-to-ja",
      wordId: "book",
      prompt: "book の意味は？",
      options: ["本", "女の子", "おもしろい", "買った"],
      answer: "本",
    },
    {
      id: "v3",
      type: "en-to-ja",
      wordId: "interesting",
      prompt: "interesting の意味は？",
      options: ["おもしろい", "本", "女の子", "昨日"],
      answer: "おもしろい",
    },
    {
      id: "v4",
      type: "ja-to-en",
      wordId: "yesterday",
      prompt: "「昨日」を英語で言うと？",
      options: ["yesterday", "bought", "girl", "book"],
      answer: "yesterday",
    },
    {
      id: "v5",
      type: "ja-to-en",
      wordId: "bought",
      prompt: "「買った」を英語で言うと？",
      options: ["bought", "yesterday", "girl", "interesting"],
      answer: "bought",
    },
  ],
};
