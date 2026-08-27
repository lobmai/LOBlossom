import type { LabeledAnswer } from "@/types/record";
import { getLessonById } from "@/lib/lessons/registry";
import type { LessonSummaryConfig, SummaryInputField } from "@/lib/lessons/types";
import {
  FINAL_EXAMPLES_ID,
  FINAL_MY_SUMMARY_ID,
  POINTS_ID,
  UNCLEAR_CHOICE_ID,
  UNCLEAR_DETAIL_ID,
  USER_EXAMPLE_AFFIRM_ID,
  USER_EXAMPLE_APPLIED_ID,
  USER_EXAMPLE_ID,
  USER_EXAMPLE_NEG_ID,
} from "@/lib/lessons/types";
import { QUESTION_HOW_ID } from "@/lib/lessons/lesson01-ids";
import { lesson01SummaryConfig } from "@/lib/lessons/lesson01-summary";

export {
  FINAL_EXAMPLES_ID,
  FINAL_MY_SUMMARY_ID,
  POINTS_ID,
  QUESTION_HOW_ID,
  UNCLEAR_CHOICE_ID,
  UNCLEAR_DETAIL_ID,
  USER_EXAMPLE_AFFIRM_ID,
  USER_EXAMPLE_NEG_ID,
  USER_EXAMPLE_APPLIED_ID,
  USER_EXAMPLE_ID,
};

/** @deprecated lesson01 互換 */
export const lesson01MeaningSentences = lesson01SummaryConfig.meaningSentences;
/** @deprecated lesson01 互換 */
export const lesson01UsageVerbs = lesson01SummaryConfig.usageFields.map((f) => ({
  id: f.id,
  verb: f.label,
  placeholder: f.placeholder,
}));
/** @deprecated lesson01 互換 */
export const SECTION_LABELS = lesson01SummaryConfig.sectionLabels;
/** @deprecated lesson01 互換 */
export const FINAL_SUMMARY_SECTIONS = lesson01SummaryConfig.finalSummarySections;

export function getSummaryConfig(lessonId: string): LessonSummaryConfig {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    throw new Error(`Unknown lessonId: ${lessonId}`);
  }
  return lesson.summary;
}

export function includesPointsInTrajectory(config: LessonSummaryConfig): boolean {
  return config.includePointsInTrajectory !== false;
}

export function hasUserExample(entries: Record<string, string>): boolean {
  if ((entries[USER_EXAMPLE_ID] ?? "").trim()) return true;
  return [USER_EXAMPLE_AFFIRM_ID, USER_EXAMPLE_NEG_ID, USER_EXAMPLE_APPLIED_ID].some(
    (id) => (entries[id] ?? "").trim().length > 0,
  );
}

/** @deprecated use hasUserExample */
export function hasUserExamples(entries: Record<string, string>): boolean {
  return hasUserExample(entries);
}

export function hasUnclearDetail(entries: Record<string, string>): boolean {
  return entries[UNCLEAR_CHOICE_ID] === "yes";
}

export function getMeaningFields(config: LessonSummaryConfig): SummaryInputField[] {
  return config.meaningFields ?? [];
}

export function getSummaryFieldDefinitions(
  lessonId: string,
): { id: string; label: string }[] {
  const config = getSummaryConfig(lessonId);
  return [
    ...config.meaningSentences.map((s) => ({ id: s.id, label: s.sentence })),
    ...getMeaningFields(config).map((f) => ({ id: f.id, label: f.label })),
    ...config.usageFields.map((f) => ({ id: f.id, label: f.label })),
    ...config.extraFields.map((f) => ({ id: f.id, label: f.label })),
    { id: UNCLEAR_CHOICE_ID, label: config.sectionLabels.unclear },
    { id: UNCLEAR_DETAIL_ID, label: "分からなかった内容" },
    ...(includesPointsInTrajectory(config)
      ? [{ id: POINTS_ID, label: config.sectionLabels.points }]
      : []),
    ...config.userExampleFields.map((f) => ({
      id: f.id,
      label: `${config.sectionLabels.userExample}（${f.label}）`,
    })),
  ];
}

export function getFinalSummarySections(
  lessonId: string,
): { id: string; label: string }[] {
  const config = getSummaryConfig(lessonId);
  return [...config.finalSummarySections];
}

export function toTrajectoryEntries(
  lessonId: string,
  values: Record<string, string>,
): LabeledAnswer[] {
  return getSummaryFieldDefinitions(lessonId)
    .map((def) => ({
      id: def.id,
      label: def.label,
      answer: (values[def.id] ?? "").trim(),
    }))
    .filter((entry) => {
      if (entry.id === UNCLEAR_DETAIL_ID && !hasUnclearDetail(values)) {
        return false;
      }
      return true;
    });
}

export function fromTrajectoryEntries(entries: LabeledAnswer[]): Record<string, string> {
  const map = Object.fromEntries(entries.map((e) => [e.id, e.answer]));
  if (!map[UNCLEAR_CHOICE_ID]) {
    map[UNCLEAR_CHOICE_ID] = "none";
  }
  return map;
}

import { isLesson01StructuredFinalSummary } from "@/lib/lessons/lesson01-final-summary";

export function isLegacyFinalSummary(entries: LabeledAnswer[]): boolean {
  if (entries.some((e) => e.id === FINAL_MY_SUMMARY_ID)) return false;
  if (isLesson01StructuredFinalSummary(entries)) return false;
  return entries.some((e) => e.id.startsWith("final-"));
}

export function isLegacyUserExample(entries: Record<string, string>): boolean {
  const hasLegacyTriple = [USER_EXAMPLE_AFFIRM_ID, USER_EXAMPLE_NEG_ID, USER_EXAMPLE_APPLIED_ID].some(
    (id) => (entries[id] ?? "").trim().length > 0,
  );
  return hasLegacyTriple && !(entries[USER_EXAMPLE_ID] ?? "").trim();
}
