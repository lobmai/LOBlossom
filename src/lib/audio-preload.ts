import { FIXED_AUDIO_REFS, resolveAudioRef } from "@/data/fixed-audio-catalog";
import {
  loadGeneratedAudioManifest,
  preloadAudioUrls,
} from "@/lib/audio-player";

/** レッスンに含まれる音声 URL 一覧 */
export function getLessonAudioUrls(lessonNumber: number): string[] {
  const prefix = `lesson${lessonNumber}.`;
  const urls = new Set<string>();
  for (const ref of Object.keys(FIXED_AUDIO_REFS)) {
    if (!ref.startsWith(prefix)) continue;
    const resolved = resolveAudioRef(ref);
    if (resolved) urls.add(resolved.url);
  }
  return [...urls];
}

/** manifest 読み込み + レッスン音声の事前読み込み */
export async function warmLessonAudio(lessonNumber: number): Promise<void> {
  await loadGeneratedAudioManifest();
  preloadAudioUrls(getLessonAudioUrls(lessonNumber));
}
