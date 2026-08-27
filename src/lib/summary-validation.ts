import {
  getSummaryConfig,
  hasUserExample,
  POINTS_ID,
  UNCLEAR_CHOICE_ID,
  UNCLEAR_DETAIL_ID,
} from "@/lib/summary-fields";
import {
  getUserExampleFromEntries,
  isMeaningfulText,
  isValidUserExample,
  validateTrajectoryQuality,
} from "@/lib/answer-quality";

export function isUnclearChoiceSelected(entries: Record<string, string>): boolean {
  return (
    entries[UNCLEAR_CHOICE_ID] === "none" || entries[UNCLEAR_CHOICE_ID] === "yes"
  );
}

export function isSummaryComplete(
  lessonId: string,
  entries: Record<string, string>,
): boolean {
  if (!isUnclearChoiceSelected(entries)) return false;
  return validateTrajectoryQuality(lessonId, entries).valid;
}

/** 空欄があるか（品質チェック前のヒント用） */
export function hasEmptyRequiredFields(
  lessonId: string,
  entries: Record<string, string>,
): boolean {
  const config = getSummaryConfig(lessonId);

  const meaningEmpty = (config.meaningFields ?? []).some(
    (f) => !(entries[f.id] ?? "").trim(),
  );
  const usageEmpty = config.usageFields.some(
    (f) => !(entries[f.id] ?? "").trim(),
  );
  const extraEmpty = config.extraFields.some(
    (f) => !(entries[f.id] ?? "").trim(),
  );
  const pointsEmpty =
    config.includePointsInTrajectory !== false &&
    !(entries[POINTS_ID] ?? "").trim();
  const exampleEmpty = !hasUserExample(entries);
  const unclearOk =
    entries[UNCLEAR_CHOICE_ID] === "none" ||
    (entries[UNCLEAR_CHOICE_ID] === "yes" &&
      (entries[UNCLEAR_DETAIL_ID] ?? "").trim().length > 0);

  return meaningEmpty || usageEmpty || extraEmpty || pointsEmpty || exampleEmpty || !unclearOk;
}

/** 入力はあるが品質不足 */
export function hasLowQualityFields(
  lessonId: string,
  entries: Record<string, string>,
): boolean {
  if (hasEmptyRequiredFields(lessonId, entries)) return false;
  return !validateTrajectoryQuality(lessonId, entries).valid;
}

export { isMeaningfulText, isValidUserExample, getUserExampleFromEntries };
