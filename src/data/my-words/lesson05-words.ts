import type { WordMasterEntry } from "@/types/my-words";
import { normalizeWordId } from "@/lib/my-words/normalize-word-id";

const LESSON_NUMBER = 5;

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

/** Lesson 5 で学ぶ重要単語 */
export const lesson05WordMaster: WordMasterEntry[] = [
  word(
    "rich",
    "お金持ち",
    "If I were rich, I would travel around the world.",
    "もしお金持ちなら、世界中を旅するのに。",
    "mywords.rich",
  ),
  word(
    "travel",
    "旅行する",
    "If I were rich, I would travel around the world.",
    "もしお金持ちなら、世界中を旅するのに。",
    "mywords.travel",
  ),
  word(
    "car",
    "車",
    "If I had a car, I would drive to the beach.",
    "もし車があったら、海へ車で行くのに。",
    "mywords.car",
  ),
  word(
    "money",
    "お金",
    "If I had more money, I would buy a new computer.",
    "もしお金がもっとあったら、新しいコンピューターを買うのに。",
    "mywords.money",
  ),
  word(
    "tomorrow",
    "明日",
    "If it rains tomorrow, I will stay home.",
    "もし明日雨が降ったら、家にいます。",
    "mywords.tomorrow",
  ),
];
