/**
 * Special / My Words 共通の単語単体音声。
 * ファイルは public/audio/words/{wordId}.mp3
 * Lesson の例文 MP3 にはフォールバックしない。
 */

function wordAudioEntry(wordId: string): { url: string; text: string } {
  return { url: `/audio/words/${wordId}.mp3`, text: wordId };
}

/** 単語 ID → 単語単体 MP3。同じマップを Special / My Words が参照する */
export const WORD_AUDIO_FILES: Record<string, { url: string; text: string }> = {
  student: wordAudioEntry("student"),
  teacher: wordAudioEntry("teacher"),
  happy: wordAudioEntry("happy"),
  tired: wordAudioEntry("tired"),
  house: wordAudioEntry("house"),
  friend: wordAudioEntry("friend"),
  new: wordAudioEntry("new"),
  book: wordAudioEntry("book"),
  play: wordAudioEntry("play"),
  eat: wordAudioEntry("eat"),
  like: wordAudioEntry("like"),
  go: wordAudioEntry("go"),
  study: wordAudioEntry("study"),
};

function parseWordId(ref: string): string | null {
  const wordId = ref.startsWith("mywords.") ? ref.slice("mywords.".length) : ref;
  if (!wordId || !/^[a-z0-9-]+$/i.test(wordId)) return null;
  return wordId;
}

/** 登録済み、または同じファイル名規則の単語 URL。存在確認はしない */
export function resolveWordAudioRef(
  ref: string,
): { url: string; text: string } | null {
  const wordId = parseWordId(ref);
  if (!wordId) return null;
  return WORD_AUDIO_FILES[wordId] ?? wordAudioEntry(wordId);
}

const confirmedWordAudioUrls = new Set<string>();

/** ブラウザで単語 MP3 の実在を確認する。無いときは false（例文へは行かない） */
export async function wordAudioFileExists(url: string): Promise<boolean> {
  if (confirmedWordAudioUrls.has(url)) return true;
  try {
    const head = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (head.ok) {
      confirmedWordAudioUrls.add(url);
      return true;
    }
    if (head.status === 405 || head.status === 501) {
      const getRes = await fetch(url, { method: "GET", cache: "no-store" });
      if (getRes.ok) {
        confirmedWordAudioUrls.add(url);
        return true;
      }
      return false;
    }
    return false;
  } catch {
    return false;
  }
}
