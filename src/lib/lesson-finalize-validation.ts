import { isCoachSessionFinished } from "@/lib/coach-session";
import { getLessonById } from "@/lib/lessons/registry";
import {
  isMeaningfulCoachAnswer,
  isMeaningfulText,
  validateTrajectoryQuality,
} from "@/lib/answer-quality";
import { isInsufficientEvaluation } from "@/lib/coach-eval-display";
import { fromLabeledAnswers } from "@/lib/record-store";
import type { LabeledAnswer, LessonRecord } from "@/types/record";

export type LessonReadyResult = {
  ready: boolean;
  reason?: "no-draft" | "trajectory" | "evaluation" | "coach-answer" | "coach-session";
};

/** Step6 へ進めるか（Step3・Step4・Step5 の品質を総合判定） */
export function validateLessonReadyForFinalize(
  draft: LessonRecord | null,
): LessonReadyResult {
  if (!draft) {
    return { ready: false, reason: "no-draft" };
  }

  const entryMap = fromLabeledAnswers(draft.trajectoryEntries);
  if (!validateTrajectoryQuality(draft.lessonId, entryMap).valid) {
    return { ready: false, reason: "trajectory" };
  }

  if (
    !draft.aiEvaluation ||
    isInsufficientEvaluation(draft.aiEvaluation)
  ) {
    return { ready: false, reason: "evaluation" };
  }

  if (draft.coachSession && !isCoachSessionFinished(draft.coachSession)) {
    return { ready: false, reason: "coach-session" };
  }

  if (!isMeaningfulCoachAnswer(draft.coachAnswer ?? "")) {
    return { ready: false, reason: "coach-answer" };
  }

  return { ready: true };
}

/** 完成まとめの全項目が編集可能な状態か（L1 固定5項目） */
export function isFinalSummaryComplete(
  lessonId: string,
  entries: LabeledAnswer[],
): boolean {
  const lesson = getLessonById(lessonId);
  if (!lesson) return false;

  const sectionIds = lesson.summary.finalSummarySections.map((s) => s.id);
  if (sectionIds.length === 0) return false;

  return sectionIds.every((id) => {
    const answer = entries.find((e) => e.id === id)?.answer.trim() ?? "";
    if (id.endsWith("-my-example")) {
      return answer.length > 0 && /[a-zA-Z]/.test(answer);
    }
    return isMeaningfulText(answer);
  });
}
