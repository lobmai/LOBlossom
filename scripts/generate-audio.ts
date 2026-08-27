/**
 * 固定教材の英文を OpenAI Speech API で事前生成するスクリプト。
 * サーバー側（Node.js）でのみ実行。API キーは .env.local から読み込む。
 *
 * 使い方:
 *   npm run generate-audio
 *   npm run generate-audio -- --lesson=lesson1
 *   npm run generate-audio -- --only=lesson1-he-is-japanese --force
 */

import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import {
  OPENAI_TTS_MODEL,
  OPENAI_TTS_SPEED,
  OPENAI_TTS_VOICE,
  type LessonAudioKey,
} from "../src/lib/audio-constants";
import { FIXED_AUDIO_FILES } from "../src/data/fixed-audio-catalog";
import { getOpenAiApiKey } from "../src/lib/openai-config";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC_AUDIO = path.join(ROOT, "public", "audio");
const MANIFEST_PATH = path.join(PUBLIC_AUDIO, "manifest.json");

type Manifest = { files: string[]; generatedAt?: string };

function parseOnlyArg(): Set<string> | null {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return null;
  const ids = arg.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean);
  return new Set(ids);
}

async function readManifest(): Promise<Manifest> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    return JSON.parse(raw) as Manifest;
  } catch {
    return { files: [] };
  }
}

async function writeManifest(files: string[]): Promise<void> {
  const manifest: Manifest = {
    files: [...new Set(files)].sort(),
    generatedAt: new Date().toISOString(),
  };
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function manifestKey(lessonKey: LessonAudioKey, fileId: string): string {
  return `${lessonKey}/${fileId}.mp3`;
}

async function fileExists(lessonKey: LessonAudioKey, fileId: string): Promise<boolean> {
  const filePath = path.join(PUBLIC_AUDIO, lessonKey, `${fileId}.mp3`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseForceFlag(): boolean {
  return process.argv.includes("--force");
}

function parseLessonArg(): LessonAudioKey | null {
  const arg = process.argv.find((a) => a.startsWith("--lesson="));
  if (!arg) return null;
  const key = arg.slice("--lesson=".length).trim();
  if (key === "lesson1" || key === "lesson2") return key;
  return null;
}

async function syncManifestFromDisk(manifestSet: Set<string>): Promise<number> {
  let added = 0;
  for (const lessonKey of ["lesson1", "lesson2"] as LessonAudioKey[]) {
    const dir = path.join(PUBLIC_AUDIO, lessonKey);
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (!file.endsWith(".mp3")) continue;
        const key = `${lessonKey}/${file}`;
        if (!manifestSet.has(key)) {
          manifestSet.add(key);
          added += 1;
          console.log(`📋 manifest に追加: ${key}`);
        }
      }
    } catch {
      // directory may not exist yet
    }
  }
  return added;
}

async function main(): Promise<void> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    console.error("OPENAI_API_KEY が .env.local に設定されていません。");
    process.exit(1);
  }

  const only = parseOnlyArg();
  const lessonFilter = parseLessonArg();
  const force = parseForceFlag();
  const openai = new OpenAI({ apiKey });
  const manifest = await readManifest();
  const manifestSet = new Set(manifest.files);

  let generated = 0;
  let skipped = 0;
  let totalChars = 0;

  for (const entry of FIXED_AUDIO_FILES) {
    if (lessonFilter && entry.lessonKey !== lessonFilter) continue;
    if (only && !only.has(entry.fileId)) continue;

    const key = manifestKey(entry.lessonKey, entry.fileId);
    const exists = await fileExists(entry.lessonKey, entry.fileId);

    if (!force && (exists || manifestSet.has(key))) {
      skipped += 1;
      console.log(`⏭  スキップ（既存）: ${key}`);
      continue;
    }

    if (force && exists) {
      console.log(`🔄 再生成: ${key}`);
    }

    console.log(`🔊 生成中: ${key} — "${entry.text}"`);

    const response = await openai.audio.speech.create({
      model: OPENAI_TTS_MODEL,
      voice: OPENAI_TTS_VOICE,
      input: entry.text,
      speed: OPENAI_TTS_SPEED,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const dir = path.join(PUBLIC_AUDIO, entry.lessonKey);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${entry.fileId}.mp3`), buffer);

    manifestSet.add(key);
    generated += 1;
    totalChars += entry.text.length;
    console.log(`✅ 保存: public/audio/${key}`);
  }

  const synced = await syncManifestFromDisk(manifestSet);
  await writeManifest([...manifestSet]);

  console.log("");
  console.log(`完了: ${generated} 件生成 / ${skipped} 件スキップ / manifest同期 ${synced} 件`);
  if (generated > 0) {
    console.log(`今回の API 入力文字数（概算）: ${totalChars} 文字`);
  }
  if (only && generated === 0 && skipped === 0) {
    console.warn("--only で指定した fileId がカタログに見つかりませんでした。");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
