import type { CoachOverallLevel } from "@/lib/coach-rubric/types";

export type StructuredEvalInput = {
  strengths?: string[];
  gaps?: string[];
  misconceptions?: string[];
  nextQuestion?: string | null;
  overallLevel?: CoachOverallLevel;
};

export type NormalizedStructuredEval = {
  strengths: string[];
  gaps: string[];
  misconceptions: string[];
  nextQuestion: string | null;
  overallLevel: CoachOverallLevel;
};

function trimNonEmpty(items: string[] | undefined): string[] {
  return (items ?? []).map((s) => s.trim()).filter(Boolean);
}

/**
 * AI 返却の構造化フィールドを正規化する。
 * understood のとき gaps / misconceptions を空、nextQuestion を null に強制。
 */
export function normalizeStructuredEvaluation(
  parsed: StructuredEvalInput,
): NormalizedStructuredEval {
  const strengths = trimNonEmpty(parsed.strengths);
  let gaps = trimNonEmpty(parsed.gaps);
  let misconceptions = trimNonEmpty(parsed.misconceptions);
  let nextQuestion = parsed.nextQuestion?.trim() || null;
  let overallLevel: CoachOverallLevel = parsed.overallLevel ?? "partial";

  if (overallLevel === "insufficient") {
    return {
      strengths: [],
      gaps: [],
      misconceptions: [],
      nextQuestion: null,
      overallLevel: "insufficient",
    };
  }

  if (misconceptions.length > 0) {
    overallLevel = "misconception";
  } else if (gaps.length > 0 && overallLevel === "understood") {
    overallLevel = "partial";
  }

  if (overallLevel === "understood") {
    gaps = [];
    misconceptions = [];
    nextQuestion = null;
  }

  return {
    strengths,
    gaps,
    misconceptions,
    nextQuestion,
    overallLevel,
  };
}
