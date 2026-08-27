import type { WordMasterEntry } from "@/types/my-words";
import { normalizeWordId } from "@/lib/my-words/normalize-word-id";

/**
 * Lesson1 の Special で復習するが、
 * My Words 重要単語マスター（lesson01-words）には含めない単語。
 * Lesson本文には登場するため、Special復習時のみ My Words へ追加される。
 */
export const lesson01SupplementalWords: WordMasterEntry[] = [
  {
    wordId: normalizeWordId("friend"),
    english: "friend",
    japanese: "友達",
    exampleEnglish: "They are friends.",
    exampleJapanese: "彼らは友達です。",
    audioRef: "mywords.friend",
    introducedInLessons: [1],
  },
  {
    wordId: normalizeWordId("new"),
    english: "new",
    japanese: "新しい",
    exampleEnglish: "The book is new.",
    exampleJapanese: "その本は新しいです。",
    audioRef: "mywords.new",
    introducedInLessons: [1],
  },
  {
    wordId: normalizeWordId("book"),
    english: "book",
    japanese: "本",
    exampleEnglish: "It is a book.",
    exampleJapanese: "それは本です。",
    audioRef: "mywords.book",
    introducedInLessons: [1],
  },
];
