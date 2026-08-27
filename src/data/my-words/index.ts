import type { WordMasterEntry } from "@/types/my-words";
import { lesson01WordMaster } from "@/data/my-words/lesson01-words";
import { lesson02WordMaster } from "@/data/my-words/lesson02-words";
import { lesson01SupplementalWords } from "@/data/my-words/lesson01-supplemental";

/** Lesson 番号 → 単語マスター */
const WORD_MASTER_BY_LESSON: Record<number, WordMasterEntry[]> = {
  1: lesson01WordMaster,
  2: lesson02WordMaster,
};

/** 指定 Lesson の重要単語マスターを返す */
export function getWordMasterForLesson(lessonNumber: number): WordMasterEntry[] {
  return WORD_MASTER_BY_LESSON[lessonNumber] ?? [];
}

/** 登録済み Lesson の単語マスターをすべて返す */
export function getAllWordMasters(): WordMasterEntry[] {
  const seen = new Set<string>();
  const all: WordMasterEntry[] = [];

  for (const lessonNumber of Object.keys(WORD_MASTER_BY_LESSON).map(Number)) {
    for (const entry of getWordMasterForLesson(lessonNumber)) {
      if (seen.has(entry.wordId)) continue;
      seen.add(entry.wordId);
      all.push(entry);
    }
  }

  return all;
}

/** wordId からマスターを検索（通常 + 補助） */
export function findWordMasterById(wordId: string): WordMasterEntry | null {
  const all = [
    ...getAllWordMasters(),
    ...lesson01SupplementalWords,
  ];
  return all.find((entry) => entry.wordId === wordId) ?? null;
}
