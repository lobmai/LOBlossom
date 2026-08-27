import {
  getSummaryConfig,
  hasUserExample,
  isLegacyUserExample,
  POINTS_ID,
  UNCLEAR_CHOICE_ID,
  UNCLEAR_DETAIL_ID,
  USER_EXAMPLE_ID,
} from "@/lib/summary-fields";

/** 明らかに無意味な入力（1文字・記号のみ・同一文字の繰り返し等） */
export function isObviouslyInvalid(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.length === 1) return true;
  if (/^(.)\1+$/u.test(t)) return true;
  if (!/[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/u.test(t)) return true;
  return false;
}

/** 日本語の自由記述（意味のある短い回答も許容） */
export function isMeaningfulText(text: string): boolean {
  const t = text.trim();
  if (isObviouslyInvalid(t)) return false;
  return t.length >= 2;
}

/** Step3 例文欄：英文として成立しうる入力 */
export function isValidUserExample(text: string): boolean {
  const t = text.trim();
  if (isObviouslyInvalid(t)) return false;
  if (!/[a-zA-Z]/.test(t)) return false;

  const words = t.match(/[a-zA-Z]+/g) ?? [];
  if (words.length === 0) return false;

  if (words.length >= 2) return true;
  return words[0]!.length >= 3;
}

export function getUserExampleFromEntries(
  entries: Record<string, string>,
): string {
  const single = (entries[USER_EXAMPLE_ID] ?? "").trim();
  if (single) return single;

  if (isLegacyUserExample(entries)) {
    return (entries[USER_EXAMPLE_ID] ?? "").trim();
  }

  return "";
}

/** 表示・保存に使える例文（無効なら null） */
export function getValidUserExample(
  entries: Record<string, string>,
): string | null {
  const raw = getUserExampleFromEntries(entries);
  if (!raw || !isValidUserExample(raw)) return null;
  return raw;
}

export type TrajectoryQualityResult = {
  valid: boolean;
  /** AI evaluate を呼べるか（全必須欄が意味あり） */
  canEvaluate: boolean;
  invalidFieldIds: string[];
};

/** Step3 入力の品質チェック（正解文との一致は要求しない） */
export function validateTrajectoryQuality(
  lessonId: string,
  entries: Record<string, string>,
): TrajectoryQualityResult {
  const config = getSummaryConfig(lessonId);
  const invalidFieldIds: string[] = [];

  for (const field of config.meaningFields ?? []) {
    if (!isMeaningfulText(entries[field.id] ?? "")) {
      invalidFieldIds.push(field.id);
    }
  }

  for (const field of config.usageFields) {
    if (!isMeaningfulText(entries[field.id] ?? "")) {
      invalidFieldIds.push(field.id);
    }
  }

  for (const field of config.extraFields) {
    if (!isMeaningfulText(entries[field.id] ?? "")) {
      invalidFieldIds.push(field.id);
    }
  }

  if (config.includePointsInTrajectory !== false) {
    if (!isMeaningfulText(entries[POINTS_ID] ?? "")) {
      invalidFieldIds.push(POINTS_ID);
    }
  }

  const exampleRaw = getUserExampleFromEntries(entries);
  if (!hasUserExample(entries) || !isValidUserExample(exampleRaw)) {
    invalidFieldIds.push(USER_EXAMPLE_ID);
  }

  if (entries[UNCLEAR_CHOICE_ID] === "yes") {
    const detail = entries[UNCLEAR_DETAIL_ID] ?? "";
    if (detail.trim() && !isMeaningfulText(detail)) {
      invalidFieldIds.push(UNCLEAR_DETAIL_ID);
    }
  }

  return {
    valid: invalidFieldIds.length === 0,
    canEvaluate: invalidFieldIds.length === 0,
    invalidFieldIds,
  };
}

/** 保存前：無効な例文・ポイントを空にした entries を返す */
export function sanitizeTrajectoryEntries(
  lessonId: string,
  entries: Record<string, string>,
): Record<string, string> {
  const config = getSummaryConfig(lessonId);
  const next = { ...entries };

  if (config.includePointsInTrajectory !== false) {
    if (!isMeaningfulText(next[POINTS_ID] ?? "")) {
      next[POINTS_ID] = "";
    }
  }

  const example = getUserExampleFromEntries(next);
  if (!isValidUserExample(example)) {
    next[USER_EXAMPLE_ID] = "";
  }

  return next;
}

/** AI evaluate 用：まとめ全体が評価可能か */
export function canRequestAiEvaluation(
  lessonId: string,
  entries: Record<string, string>,
): boolean {
  return validateTrajectoryQuality(lessonId, entries).canEvaluate;
}

/** Step5 コーチ回答の品質 */
export function isMeaningfulCoachAnswer(text: string): boolean {
  return isMeaningfulText(text);
}

export function buildInsufficientEvaluation(): {
  overallMessage: string;
  overallLevel: "insufficient";
  strengths: string[];
  gaps: string[];
  misconceptions: string[];
  nextQuestion: null;
  corrections: string[];
  polishedEntries: [];
  hasPolish: false;
  evaluatedAt: string;
} {
  return {
    overallMessage:
      "まだ理解度を確認できませんでした。もう一度、自分の言葉でまとめてみませんか？",
    overallLevel: "insufficient",
    strengths: [],
    gaps: [],
    misconceptions: [],
    nextQuestion: null,
    corrections: [],
    polishedEntries: [],
    hasPolish: false,
    evaluatedAt: new Date().toISOString(),
  };
}
