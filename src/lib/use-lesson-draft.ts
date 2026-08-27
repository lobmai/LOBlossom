"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import {
  createDraft,
  fromLabeledAnswers,
  loadDraft,
  saveDraft,
  toLabeledAnswers,
} from "@/lib/record-store";
import type { LabeledAnswer, LessonRecord } from "@/types/record";

interface UseLessonDraftOptions {
  lessonId: string;
  lessonTitle: string;
}

/**
 * レッスン中の下書きを読み込み・自動保存するフック。
 * ブラウザの localStorage を使う（将来 DB に差し替えやすいよう record-store 経由）。
 */
export function useLessonDraft({ lessonId, lessonTitle }: UseLessonDraftOptions) {
  const [draft, setDraft] = useState<LessonRecord | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    let existing = loadDraft(lessonId);
    if (!existing || existing.isCompleted) {
      existing = createDraft(lessonId, lessonTitle);
      saveDraft(existing);
    }
    setDraft(existing);
    setIsReady(true);
  }, [lessonId, lessonTitle]);

  const persist = useCallback((record: LessonRecord) => {
    const result = saveDraft(record);
    if (!result.ok) {
      setSaveError(true);
    } else {
      setSaveError(false);
    }
    return result;
  }, []);

  const updateTeachAnswers = useCallback(
    (values: Record<string, string>, definitions: { id: string; label: string }[]) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const next: LessonRecord = {
          ...prev,
          teachAnswers: toLabeledAnswers(values, definitions),
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateTrajectoryEntries = useCallback(
    (values: Record<string, string>, definitions: { id: string; label: string }[]) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const next: LessonRecord = {
          ...prev,
          trajectoryEntries: toLabeledAnswers(values, definitions),
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setTrajectoryEntries = useCallback(
    (entries: LabeledAnswer[]) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const next: LessonRecord = {
          ...prev,
          trajectoryEntries: entries,
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const getInitialTeachValues = useCallback((): Record<string, string> => {
    if (!draft?.teachAnswers.length) return {};
    return fromLabeledAnswers(draft.teachAnswers);
  }, [draft]);

  const getInitialTrajectoryValues = useCallback((): Record<string, string> => {
    if (!draft?.trajectoryEntries.length) return {};
    return fromLabeledAnswers(draft.trajectoryEntries);
  }, [draft]);

  return {
    draft,
    saveError,
    isReady,
    updateTeachAnswers,
    updateTrajectoryEntries,
    setTrajectoryEntries,
    getInitialTeachValues,
    getInitialTrajectoryValues,
    persist,
    clearSaveError: () => setSaveError(false),
  };
}
