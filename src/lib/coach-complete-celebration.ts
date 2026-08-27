/** Step5 十分理解時の固定終了メッセージ（言い換えしない） */
export const COACH_COMPLETE_CLOSING_MESSAGE =
  "分かりやすい！教えてくれてありがとう！😊";

/**
 * MVP後に public/sounds/thank-you.mp3 を置けば再生される。
 * 今回はファイルを置かない。未配置でも例外を出さない。
 */
export const THANK_YOU_SOUND_PATH = "/sounds/thank-you.mp3";

let preparedAudio: HTMLAudioElement | null = null;
let playRequested = false;
let playedOnce = false;
let soundAvailable: boolean | null = null;
let availabilityPromise: Promise<boolean> | null = null;

function probeThankYouSound(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (soundAvailable !== null) return Promise.resolve(soundAvailable);
  if (!availabilityPromise) {
    availabilityPromise = fetch(THANK_YOU_SOUND_PATH, {
      method: "HEAD",
      cache: "no-store",
    })
      .then((res) => {
        soundAvailable = res.ok;
        return res.ok;
      })
      .catch(() => {
        soundAvailable = false;
        return false;
      });
  }
  return availabilityPromise;
}

function unlockPreparedAudio(): void {
  if (!preparedAudio) {
    preparedAudio = new Audio(THANK_YOU_SOUND_PATH);
    preparedAudio.preload = "auto";
  }
  const audio = preparedAudio;
  audio.muted = true;
  void audio
    .play()
    .then(() => {
      if (playRequested) {
        audio.muted = false;
        return;
      }
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    })
    .catch(() => {
      /* 再生不可でもエラーにしない */
    });
}

/** ユーザー操作中に呼ぶ。ファイルがなければ何もしない */
export function unlockThankYouSound(): void {
  if (typeof window === "undefined") return;
  void probeThankYouSound().then((ok) => {
    if (!ok) return;
    unlockPreparedAudio();
  });
}

/** 同じ終了判定・再レンダーで連続再生しない。mp3 がなければ何もしない */
export function playThankYouSoundOnce(): void {
  if (typeof window === "undefined") return;
  if (playedOnce) return;
  playedOnce = true;
  playRequested = true;
  void probeThankYouSound().then((ok) => {
    if (!ok) return;
    try {
      const audio = preparedAudio ?? new Audio(THANK_YOU_SOUND_PATH);
      preparedAudio = audio;
      audio.muted = false;
      audio.currentTime = 0;
      audio.addEventListener("error", () => undefined, { once: true });
      void audio.play().catch(() => {
        /* 未配置・autoplay 拒否は無視 */
      });
    } catch {
      /* 無視 */
    }
  });
}

export function resetThankYouSoundForTests(): void {
  playedOnce = false;
  playRequested = false;
  preparedAudio = null;
  soundAvailable = null;
  availabilityPromise = null;
}
