import type { WordMasterEntry } from "@/types/my-words";
import { normalizeWordId } from "@/lib/my-words/normalize-word-id";

const LESSON_NUMBER = 1;

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
    introducedInLessons: [LESSON_NUMBER],
  };
}

/** Lesson 1 で学ぶ重要単語 */
export const lesson01WordMaster: WordMasterEntry[] = [
  word(
    "student",
    "生徒・学生",
    "I am a student.",
    "私は学生です。",
    "mywords.student",
  ),
  word(
    "teacher",
    "先生",
    "He is a teacher.",
    "彼は先生です。",
    "mywords.teacher",
  ),
  word(
    "happy",
    "うれしい・幸せな",
    "I am happy.",
    "私はうれしいです。",
    "mywords.happy",
  ),
  word(
    "tired",
    "疲れている",
    "I am tired.",
    "私は疲れています。",
    "mywords.tired",
  ),
  word(
    "house",
    "家",
    "This is my house.",
    "これは私の家です。",
    "mywords.house",
  ),
];
