"use client";

import { useEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from "react";
import { resolveAudioRef } from "@/data/fixed-audio-catalog";
import { resolveWordAudioRef, wordAudioFileExists } from "@/lib/word-audio";
import {
  getNextPlaybackRate,
  playAudioFile,
  preloadAudioUrl,
  subscribeAudioPlayState,
} from "@/lib/audio-player";

const iconClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blossom-200 bg-white text-sm text-blossom-600 shadow-sm transition hover:border-blossom-300 hover:bg-blossom-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";

type SpeakButtonProps = {
  audioRef: string;
};

type AudioStatus = "ready" | "unavailable" | "error";

export function SpeakButton({ audioRef }: SpeakButtonProps) {
  const isWordRef = audioRef.startsWith("mywords.");
  const resolved = isWordRef
    ? resolveWordAudioRef(audioRef)
    : resolveAudioRef(audioRef);
  const [status, setStatus] = useState<AudioStatus>("ready");
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!resolved || isWordRef) return;
    preloadAudioUrl(resolved.url);
  }, [resolved, isWordRef]);

  useEffect(() => {
    return subscribeAudioPlayState((_playing, url) => {
      setActiveUrl(url);
    });
  }, []);

  const url = resolved?.url ?? null;
  const text = resolved?.text ?? audioRef;
  const isThisPlaying = Boolean(url && activeUrl === url);

  function stopLinkNavigation(event: SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    stopLinkNavigation(event);
    if (!resolved) return;
    if (busyRef.current) return;
    busyRef.current = true;

    try {
      if (isWordRef) {
        const exists = await wordAudioFileExists(resolved.url);
        if (!exists) return;
      }

      const playbackRate = getNextPlaybackRate(resolved.url);
      let result = await playAudioFile(resolved.url, playbackRate);
      if (!result.ok && !isWordRef) {
        result = await playAudioFile(resolved.url, playbackRate);
      }
      if (isWordRef) return;
      setStatus(result.ok ? "ready" : "unavailable");
    } catch {
      if (!isWordRef) setStatus("error");
    } finally {
      busyRef.current = false;
    }
  }

  const title = isThisPlaying
    ? "再生中"
    : status === "ready"
      ? "音声を再生"
      : status === "error"
        ? "再生に失敗しました。もう一度お試しください"
        : "音声ファイルを準備中です";

  return (
    <span className="inline-flex flex-col items-center">
      <button
        type="button"
        onClick={(event) => void handleClick(event)}
        onPointerDown={stopLinkNavigation}
        className={`${iconClass}${isThisPlaying ? " border-blossom-400 bg-blossom-50" : ""}`}
        aria-label={`「${text}」を読み上げる`}
        title={title}
        disabled={busyRef.current}
      >
        {isThisPlaying ? "🔈" : "🔊"}
      </button>
      {status === "unavailable" && (
        <span className="mt-1 max-w-[8rem] text-center text-[10px] leading-tight text-gray-400">
          音声ファイルを準備中です
        </span>
      )}
      {status === "error" && (
        <span className="mt-1 max-w-[8rem] text-center text-[10px] leading-tight text-gray-400">
          再生できませんでした。もう一度お試しください
        </span>
      )}
    </span>
  );
}

export function UserExampleSpeakPlaceholder() {
  return null;
}
