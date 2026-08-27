import type { VocabQuestion } from "@/lib/special-lessons/types";

/** 英語回答の正規化（前後空白・大文字小文字） */
export function normalizeEnglishAnswer(value: string): string {
  return value.trim().toLowerCase();
}

/** 日本語回答の正規化（前後空白のみ） */
export function normalizeJapaneseAnswer(value: string): string {
  return value.trim();
}

/** 選択肢が正解かどうか（ローカル判定・API 不使用） */
export function isVocabAnswerCorrect(
  selected: string,
  question: VocabQuestion,
): boolean {
  if (question.type === "ja-to-en") {
    return (
      normalizeEnglishAnswer(selected) ===
      normalizeEnglishAnswer(question.answer)
    );
  }
  return normalizeJapaneseAnswer(selected) === normalizeJapaneseAnswer(question.answer);
}
