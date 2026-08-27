let currentAudio: HTMLAudioElement | null = null;
let currentPlayingUrl: string | null = null;
let cachedManifest: Set<string> | null = null;

const playStateListeners = new Set<(playing: boolean, url: string | null) => void>();
const playCountByUrl = new Map<string, number>();
const preloadedUrls = new Set<string>();

export const AUDIO_SLOW_PLAYBACK_RATE = 0.65;
const MANIFEST_FETCH_TIMEOUT_MS = 5000;

function notifyPlaying(playing: boolean, url: string | null = null): void {
  playStateListeners.forEach((fn) => fn(playing, url));
}

export function subscribeAudioPlayState(
  listener: (playing: boolean, url: string | null) => void,
): () => void {
  playStateListeners.add(listener);
  return () => playStateListeners.delete(listener);
}

export function stopAudio(): void {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
  currentPlayingUrl = null;
  notifyPlaying(false, null);
}

export type PlayAudioResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "play-failed" };

let manifestPromise: Promise<Set<string>> | null = null;

export function resetAudioManifestCache(): void {
  manifestPromise = null;
  cachedManifest = null;
}

async function fetchManifest(): Promise<Set<string>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MANIFEST_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`/audio/manifest.json`, {
      signal: controller.signal,
      cache: "force-cache",
    });
    if (!res.ok) return new Set<string>();
    const data = (await res.json()) as { files?: string[] };
    return new Set(data.files ?? []);
  } catch {
    return new Set<string>();
  } finally {
    clearTimeout(timeout);
  }
}

export async function loadGeneratedAudioManifest(): Promise<Set<string>> {
  if (!manifestPromise) {
    manifestPromise = fetchManifest().then((set) => {
      cachedManifest = set;
      return set;
    });
  }
  return manifestPromise;
}

export function getCachedManifest(): Set<string> | null {
  return cachedManifest;
}

export function isAudioGenerated(
  manifest: Set<string>,
  lessonKey: string,
  fileId: string,
): boolean {
  return manifest.has(`${lessonKey}/${fileId}.mp3`);
}

export function isInManifest(lessonKey: string, fileId: string): boolean {
  if (!cachedManifest) return false;
  return isAudioGenerated(cachedManifest, lessonKey, fileId);
}

/** MP3 をブラウザに事前読み込み（API 呼び出しなし） */
export function preloadAudioUrl(url: string): void {
  if (preloadedUrls.has(url)) return;
  preloadedUrls.add(url);
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = url;
  audio.load();
}

export function preloadAudioUrls(urls: string[]): void {
  for (const url of urls) preloadAudioUrl(url);
}

export function getNextPlaybackRate(url: string): number {
  const count = (playCountByUrl.get(url) ?? 0) + 1;
  playCountByUrl.set(url, count);
  return count % 2 === 0 ? AUDIO_SLOW_PLAYBACK_RATE : 1.0;
}

export async function playAudioFile(
  url: string,
  playbackRate = 1.0,
): Promise<PlayAudioResult> {
  stopAudio();

  const audio = new Audio(url);
  audio.preload = "auto";
  audio.playbackRate = playbackRate;
  currentAudio = audio;
  currentPlayingUrl = url;
  notifyPlaying(true, url);

  return new Promise((resolve) => {
    const cleanup = (result: PlayAudioResult) => {
      if (currentAudio === audio) {
        currentAudio = null;
        currentPlayingUrl = null;
        notifyPlaying(false, null);
      }
      resolve(result);
    };

    audio.onended = () => {
      if (currentAudio === audio) {
        currentAudio = null;
        currentPlayingUrl = null;
        notifyPlaying(false, null);
      }
    };

    audio.onerror = () => cleanup({ ok: false, reason: "play-failed" });

    void audio.play().then(
      () => resolve({ ok: true }),
      () => cleanup({ ok: false, reason: "play-failed" }),
    );
  });
}

export function isAudioPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

export function getCurrentPlayingUrl(): string | null {
  return currentPlayingUrl;
}
