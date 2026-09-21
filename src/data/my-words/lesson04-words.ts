import type { WordMasterEntry } from "@/types/my-words";
import { normalizeWordId } from "@/lib/my-words/normalize-word-id";

const LESSON_NUMBER = 4;

function word(
  english: string,
  japanese: string,
  exampleEnglish: string,
  exampleJapanese: string,
  audioRef?: string,
): WordMasterEntry {
  return {
    wordId: normalizeWordId(english),
    english,
    japanese,
    exampleEnglish,
    exampleJapanese,
    audioRef,
    introducedInLessons: english === "book" ? [1, LESSON_NUMBER] : [LESSON_NUMBER],
  };
}

/** Lesson 4 で学ぶ重要単語 */
export const lesson04WordMaster: WordMasterEntry[] = [
  word(
    "girl",
    "女の子",
    "I know the girl.",
    "私はその女の子を知っています。",
    "mywords.girl",
  ),
  word(
    "book",
    "本",
    "This is the book.",
    "これはその本です。",
    "mywords.book",
  ),
  word(
    "interesting",
    "おもしろい",
    "This is the book which is interesting.",
    "これはおもしろい本です。",
    "mywords.interesting",
  ),
  word(
    "yesterday",
    "昨日",
    "I bought it yesterday.",
    "私はそれを昨日買いました。",
    "mywords.yesterday",
  ),
  word(
    "bought",
    "買った",
    "I bought it yesterday.",
    "私はそれを昨日買いました。",
    "mywords.bought",
  ),
];
