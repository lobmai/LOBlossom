import type { CheckQuestion } from "@/types/lesson";

export interface QuestionResult {
  answered: boolean;
  correct: boolean;
  userAnswer?: string;
}

export function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, "");
}

export function checkChoiceAnswer(selected: string, question: CheckQuestion): boolean {
  return selected === question.answer;
}

export function checkFillAnswer(input: string, question: CheckQuestion): boolean {
  const expected = String(question.answer);
  return normalizeText(input) === normalizeText(expected);
}

export function checkReorderAnswer(selectedWords: string[], question: CheckQuestion): boolean {
  const expected = String(question.answer);
  const built = selectedWords.join(" ");
  return normalizeText(built) === normalizeText(expected);
}

export function formatCorrectAnswer(question: CheckQuestion): string {
  if (Array.isArray(question.answer)) {
    return question.answer.join(" ");
  }
  return question.answer;
}
