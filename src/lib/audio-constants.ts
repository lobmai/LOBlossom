/** OpenAI Speech API 設定（サーバー側・生成スクリプト用） */
export const OPENAI_TTS_MODEL = "tts-1-hd" as const;

/** 英語学習向け：聞き取りやすく自然な女性 voice（tts-1-hd 対応） */
export const OPENAI_TTS_VOICE = "nova" as const;

/** 初心者向け：ややゆっくりすぎない速度 */
export const OPENAI_TTS_SPEED = 1.0;

export type LessonAudioKey = "lesson1" | "lesson2";

export function getAudioFilePath(lessonKey: LessonAudioKey, fileId: string): string {
  return `/audio/${lessonKey}/${fileId}.mp3`;
}
