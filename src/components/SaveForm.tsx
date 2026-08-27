"use client";



import Link from "next/link";

import { useLayoutEffect, useState } from "react";

import { getLesson, getLessonBasePath, LESSON_SELECT_PATH } from "@/lib/lessons/registry";

import { getSpecialLesson, getSpecialLessonPath } from "@/lib/special-lessons/registry";

import {

  createDraft,

  finalizeRecord,

  fromLabeledAnswers,

  loadDraft,

  saveDraft,

} from "@/lib/record-store";

import {

  sanitizeTrajectoryEntries,

  validateTrajectoryQuality,

} from "@/lib/answer-quality";

import { validateLessonReadyForFinalize } from "@/lib/lesson-finalize-validation";
import { mergeAndSaveLessonWords } from "@/lib/my-words/lesson-sync";

import { toTrajectoryEntries } from "@/lib/summary-fields";

import { ui } from "@/lib/ui-text";

import type { FeelingId, LessonRecord } from "@/types/record";

import { SaveErrorBanner } from "@/components/SaveErrorBanner";

import { SakuraPetals } from "@/components/SakuraPetals";



export function SaveForm({ lessonNumber }: { lessonNumber: number }) {

  const lesson = getLesson(lessonNumber)!;

  const lessonId = lesson.meta.id;



  const [draft, setDraft] = useState<LessonRecord | null>(null);

  const [selectedFeeling, setSelectedFeeling] = useState<FeelingId | null>(null);

  const [saveError, setSaveError] = useState(false);

  const [saved, setSaved] = useState(false);

  const [saving, setSaving] = useState(false);



  useLayoutEffect(() => {

    let existing = loadDraft(lessonId);

    if (!existing) {

      existing = createDraft(lessonId, lesson.meta.title);

      saveDraft(existing);

    }

    setDraft(existing);

    if (existing.feeling) {

      setSelectedFeeling(existing.feeling);

      setSaved(existing.isCompleted);

    }

  }, [lessonId, lesson.meta.title]);



  function handleFeelingSelect(id: FeelingId, label: string) {

    if (!draft || saving || saved) return;



    setSaving(true);

    setSaveError(false);



    const entryMap = fromLabeledAnswers(draft.trajectoryEntries);

    if (!validateTrajectoryQuality(lessonId, entryMap).valid) {

      setSaveError(true);

      setSaving(false);

      return;

    }



    const sanitized = sanitizeTrajectoryEntries(lessonId, entryMap);
    const trajectoryEntries = toTrajectoryEntries(lessonId, sanitized);

    const draftForCheck: LessonRecord = {
      ...draft,
      trajectoryEntries,
    };
    if (!validateLessonReadyForFinalize(draftForCheck).ready) {
      setSaveError(true);
      setSaving(false);
      return;
    }

    const updated: LessonRecord = {

      ...draft,

      trajectoryEntries,

      feeling: id,

      feelingLabel: label,

    };



    if (!saveDraft(updated).ok) {

      setSaveError(true);

      setSaving(false);

      return;

    }



    setDraft(updated);

    setSelectedFeeling(id);

    setSaveError(false);



    if (!finalizeRecord(updated).ok) {

      setSaveError(true);

      setSaving(false);

      return;

    }



    mergeAndSaveLessonWords(lessonNumber, updated);



    setSaved(true);

    setSaving(false);

  }



  const specialConfig = getSpecialLesson(lessonNumber);



  return (

    <>

      <SakuraPetals active={saved} />



      {!saved ? (

        <div className="rounded-2xl border border-blossom-100 bg-white/80 p-6 shadow-sm">

          {saving && (

            <p className="mb-4 rounded-xl bg-blossom-50 px-4 py-3 text-center text-sm text-blossom-700">

              {ui.save.saving}

            </p>

          )}

          <p className="text-lg font-bold text-gray-900">{ui.save.master.replace("1", String(lessonNumber))}</p>

          <p className="mt-2 text-sm text-gray-600">{ui.save.message}</p>

          <p className="mt-1 text-sm text-gray-600">{ui.save.message2}</p>



          <p className="mt-6 text-sm font-bold text-gray-900">{ui.save.selfEval}</p>

          <div className="mt-3 space-y-2">

            {ui.save.feelings.map((feeling) => (

              <button

                key={feeling.id}

                type="button"

                onClick={() => handleFeelingSelect(feeling.id as FeelingId, feeling.label)}

                disabled={saving}

                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition active:scale-[0.98] ${

                  selectedFeeling === feeling.id

                    ? "border-blossom-400 bg-blossom-50 text-blossom-800"

                    : "border-gray-200 bg-white text-gray-700 hover:border-blossom-200"

                }`}

              >

                {feeling.label}

              </button>

            ))}

          </div>

        </div>

      ) : (

        <div className="rounded-2xl border border-leaf-200 bg-leaf-50/80 p-6 text-center shadow-sm">

          <p className="text-2xl">🌸</p>

          <p className="mt-2 text-sm font-bold text-leaf-800">{ui.save.savedHint}</p>

          <Link

            href="/my-loop"

            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blossom-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-blossom-600"

          >

            {ui.save.toMyLoop}

          </Link>

          <Link

            href={LESSON_SELECT_PATH}

            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-blossom-200 bg-white px-6 py-3 text-sm font-medium text-blossom-600 transition hover:bg-blossom-50"

          >

            {ui.save.backToLessons}

          </Link>

          {specialConfig && (

            <Link

              href={getSpecialLessonPath(lessonNumber)}

              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-leaf-200 bg-leaf-50 px-6 py-3 text-sm font-medium text-leaf-700 transition hover:bg-leaf-100"

            >

              {specialConfig.title}：単語復習（ボーナス）→

            </Link>

          )}

          <Link

            href={getLessonBasePath(lessonNumber)}

            className="mt-3 block text-sm text-gray-500 hover:text-gray-700"

          >

            もう一度レッスン{lessonNumber}を見る

          </Link>

        </div>

      )}



      {saveError && <SaveErrorBanner />}

    </>

  );

}

