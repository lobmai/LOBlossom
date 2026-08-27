import type { WordMasterEntry } from "@/types/my-words";
import { normalizeWordId } from "@/lib/my-words/normalize-word-id";

const LESSON_NUMBER = 2;

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

/** Lesson 2 で学ぶ重要単語 */
export const lesson02WordMaster: WordMasterEntry[] = [
  word(
    "play",
    "する・遊ぶ",
    "I play tennis.",
    "私はテニスをします。",
    "mywords.play",
  ),
  word(
    "eat",
    "食べる",
    "I eat lunch.",
    "私は昼ごはんを食べます。",
    "mywords.eat",
  ),
  word(
    "like",
    "好き",
    "I like music.",
    "私は音楽が好きです。",
    "mywords.like",
  ),
  word(
    "go",
    "行く",
    "I go to school.",
    "私は学校へ行きます。",
    "mywords.go",
  ),
  word(
    "study",
    "勉強する",
    "We study English.",
    "私たちは英語を勉強します。",
    "mywords.study",
  ),
];
