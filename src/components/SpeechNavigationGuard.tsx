"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { stopAudio } from "@/lib/audio-player";

/** ページ遷移時に音声再生を停止する */
export function SpeechNavigationGuard() {
  const pathname = usePathname();

  useEffect(() => {
    stopAudio();
  }, [pathname]);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  return null;
}
