/**
 * 単語単体の英語 MP3 を public/audio/words/ に生成する。
 * Lesson 例文（public/audio/lesson1 など）には書き込まない。
 *
 * 使い方:
 *   npx tsx --env-file=.env.local scripts/generate-word-audio.ts --words=student,teacher,happy,tired,house
 *
 * --words を省略すると何も生成しない（大量生成防止）。
 */
import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import {
  OPENAI_TTS_MODEL,
  OPENAI_TTS_SPEED,
  OPENAI_TTS_VOICE,
} from "../src/lib/audio-constants";
import { getOpenAiApiKey } from "../src/lib/openai-config";

const ROOT = path.resolve(import.meta.dirname, "..");
const WORDS_DIR = path.join(ROOT, "public", "audio", "words");

function parseWordsArg(): string[] {
  const arg = process.argv.find((a) => a.startsWith("--words="));
  if (!arg) return [];
  return arg
    .slice("--words=".length)
    .split(",")
    .map((w) => w.trim().toLowerCase())
    .filter((w) => /^[a-z]+$/.test(w));
}

function parseForceFlag(): boolean {
  return process.argv.includes("--force");
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const words = parseWordsArg();
  if (words.length === 0) {
    console.error(
      "--words=student,teacher,... を指定してください。省略時は生成しません。",
    );
    process.exit(1);
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    console.error("OPENAI_API_KEY が .env.local に設定されていません。");
    process.exit(1);
  }

  const force = parseForceFlag();
  const openai = new OpenAI({ apiKey });
  await fs.mkdir(WORDS_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;
  let totalChars = 0;

  for (const word of words) {
    const fileName = `${word}.mp3`;
    const filePath = path.join(WORDS_DIR, fileName);
    const exists = await fileExists(filePath);

    if (!force && exists) {
      skipped += 1;
      console.log(`⏭  スキップ（既存）: words/${fileName}`);
      continue;
    }

    if (force && exists) {
      console.log(`🔄 再生成: words/${fileName}`);
    }

    console.log(`🔊 生成中: words/${fileName} — "${word}"`);

    const response = await openai.audio.speech.create({
      model: OPENAI_TTS_MODEL,
      voice: OPENAI_TTS_VOICE,
      input: word,
      speed: OPENAI_TTS_SPEED,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    generated += 1;
    totalChars += word.length;
    console.log(`✅ 保存: public/audio/words/${fileName}`);
  }

  console.log("");
  console.log(`完了: ${generated} 件生成 / ${skipped} 件スキップ`);
  if (generated > 0) {
    console.log(`今回の API 入力文字数（概算）: ${totalChars} 文字`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
