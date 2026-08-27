import type { AiEvaluation } from "@/types/record";

/** 理解度を判断できなかった評価 */
export function isInsufficientEvaluation(evaluation: AiEvaluation): boolean {
  return evaluation.overallLevel === "insufficient";
}

/** Phase5b 以降の構造化評価データがあるか */
export function hasStructuredCoachEvaluation(
  evaluation: AiEvaluation,
): boolean {
  if (isInsufficientEvaluation(evaluation)) return false;
  if (evaluation.overallLevel !== undefined) return true;
  if (Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0) {
    return true;
  }
  if (Array.isArray(evaluation.gaps) && evaluation.gaps.length > 0) {
    return true;
  }
  if (
    Array.isArray(evaluation.misconceptions) &&
    evaluation.misconceptions.length > 0
  ) {
    return true;
  }
  if (evaluation.nextQuestion?.trim()) return true;
  return false;
}

/** 「もう少し確認したいこと」にまとめる項目（gaps + misconceptions） */
export function getCoachConfirmationItems(
  evaluation: AiEvaluation,
): string[] {
  const gaps = (evaluation.gaps ?? []).map((s) => s.trim()).filter(Boolean);
  const misconceptions = (evaluation.misconceptions ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  return [...gaps, ...misconceptions];
}

export function getCoachStrengths(evaluation: AiEvaluation): string[] {
  return (evaluation.strengths ?? []).map((s) => s.trim()).filter(Boolean);
}

export function getCoachNextQuestion(evaluation: AiEvaluation): string | null {
  const q = evaluation.nextQuestion?.trim();
  return q || null;
}

/** 構造化表示に出す項目が1つ以上あるか */
export function hasStructuredCoachContent(evaluation: AiEvaluation): boolean {
  if (isInsufficientEvaluation(evaluation)) return false;
  return (
    getCoachStrengths(evaluation).length > 0 ||
    getCoachConfirmationItems(evaluation).length > 0 ||
    getCoachNextQuestion(evaluation) !== null
  );
}
