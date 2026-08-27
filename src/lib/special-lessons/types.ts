/** 現在対応：英語→日本語 / 日本語→英語。将来 audio-to-word / fill-blank を追加 */
export type VocabQuestionType =
  | "en-to-ja"
  | "ja-to-en"
  | "audio-to-word"
  | "fill-blank";

/** Special 問題テンプレート（選択肢・正解はここ。単語の意味は My Words から取得） */
export type SpecialQuestionTemplate =
  | {
      id: string;
      type: "en-to-ja";
      wordId: string;
      prompt?: string;
      options: string[];
      answer: string;
    }
  | {
      id: string;
      type: "ja-to-en";
      wordId: string;
      prompt?: string;
      options: string[];
      answer: string;
    };

export type VocabQuestion =
  | {
      id: string;
      type: "en-to-ja";
      wordId: string;
      prompt: string;
      english: string;
      options: string[];
      answer: string;
    }
  | {
      id: string;
      type: "ja-to-en";
      wordId: string;
      prompt: string;
      japanese: string;
      options: string[];
      answer: string;
    };

export type SpecialLessonConfig = {
  id: string;
  parentLessonNumber: number;
  title: string;
  subtitle: string;
  /** 実行時に My Words データと合成して VocabQuestion[] を生成 */
  questionTemplates: SpecialQuestionTemplate[];
};
