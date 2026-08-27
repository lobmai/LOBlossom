"use client";

import { useEffect } from "react";
import { warmLessonAudio } from "@/lib/audio-preload";

/** レッスンページ表示時に manifest と MP3 を事前読み込み */
export function LessonAudioPreloader({ lessonNumber }: { lessonNumber: number }) {
  useEffect(() => {
    void warmLessonAudio(lessonNumber);
  }, [lessonNumber]);
  return null;
}
