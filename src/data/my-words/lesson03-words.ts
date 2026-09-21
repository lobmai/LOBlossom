import type { WordMasterEntry } from "@/types/my-words";
import { normalizeWordId } from "@/lib/my-words/normalize-word-id";

const LESSON_NUMBER = 3;

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

/** Lesson 3 で学ぶ重要単語 */
export const lesson03WordMaster: WordMasterEntry[] = [
  word(
    "key",
    "鍵",
    "I have lost my key.",
    "私は鍵をなくしてしまっている。",
    "mywords.key",
  ),
  word(
    "homework",
    "宿題",
    "She has finished her homework.",
    "彼女は宿題を終えている。",
    "mywords.homework",
  ),
  word(
    "lost",
    "なくした",
    "I have lost my key.",
    "私は鍵をなくしてしまっている。",
    "mywords.lost",
  ),
  word(
    "finished",
    "終えた",
    "I have finished my homework.",
    "私は宿題を終えている。",
    "mywords.finished",
  ),
  word(
    "lived",
    "住んだ",
    "I have lived here for three years.",
    "私はここに3年住んでいる。",
    "mywords.lived",
  ),
];
