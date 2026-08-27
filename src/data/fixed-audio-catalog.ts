import { lesson01CheckQuestions } from "@/data/lesson01";

import { lesson02CheckQuestions } from "@/data/lesson02";

import { lesson01SummaryConfig } from "@/lib/lessons/lesson01-summary";

import { lesson02SummaryConfig } from "@/lib/lessons/lesson02-summary";

import type { LessonAudioKey } from "@/lib/audio-constants";



export type AudioFileEntry = {

  fileId: string;

  lessonKey: LessonAudioKey;

  text: string;

};



/** コード上の参照キー → 音声 fileId */

export type AudioRefMap = Record<string, string>;



function normalizeText(text: string): string {

  return text.trim().replace(/\s+/g, " ");

}



function slugify(text: string): string {

  return normalizeText(text)

    .toLowerCase()

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/^-|-$/g, "")

    .slice(0, 48);

}



function buildCatalog(

  lessonKey: LessonAudioKey,

  refs: { ref: string; text: string }[],

  globalTextToFile: Map<string, AudioFileEntry>,

  allFiles: AudioFileEntry[],

): AudioRefMap {

  const refMap: AudioRefMap = {};

  let counter = 1;



  for (const { ref, text } of refs) {

    const normalized = normalizeText(text);

    let file = globalTextToFile.get(normalized);



    if (!file) {

      const slug = slugify(normalized);

      let fileId = slug ? `${lessonKey}-${slug}` : `${lessonKey}-example-${String(counter).padStart(2, "0")}`;

      while (allFiles.some((f) => f.fileId === fileId)) {

        counter += 1;

        fileId = `${lessonKey}-example-${String(counter).padStart(2, "0")}`;

      }

      file = { fileId, lessonKey, text: normalized };

      globalTextToFile.set(normalized, file);

      allFiles.push(file);

      counter += 1;

    }



    refMap[ref] = file.fileId;

  }



  return refMap;

}



const lesson1BodyRefs: { ref: string; text: string }[] = [

  { ref: "lesson1.body.01", text: "I am a student." },

  { ref: "lesson1.body.02", text: "He is a teacher." },

  { ref: "lesson1.body.03", text: "They are friends." },

  { ref: "lesson1.body.04", text: "I am happy." },

  { ref: "lesson1.body.05", text: "She is a doctor." },

  { ref: "lesson1.body.06", text: "We are students." },

  { ref: "lesson1.body.07", text: "It is a book." },

  { ref: "lesson1.body.08", text: "The book is new." },

  { ref: "lesson1.body.09", text: "They are books." },

  { ref: "lesson1.body.10", text: "The books are new." },

  { ref: "lesson1.body.11", text: "I am tired." },

  { ref: "lesson1.body.12", text: "He is Japanese." },

  { ref: "lesson1.body.13", text: "I am at home." },

  { ref: "lesson1.body.14", text: "I am not tired." },

  { ref: "lesson1.body.15", text: "He is happy." },

  { ref: "lesson1.body.16", text: "He is not happy." },

  { ref: "lesson1.body.17", text: "They are here." },

  { ref: "lesson1.body.18", text: "They are not here." },

  { ref: "lesson1.body.19", text: "He is not happy." },

  { ref: "lesson1.body.20", text: "He isn't happy." },

  { ref: "lesson1.body.21", text: "They are not here." },

  { ref: "lesson1.body.22", text: "They aren't here." },

  { ref: "lesson1.body.23", text: "You are a student." },

  { ref: "lesson1.body.24", text: "Are you a student?" },

  { ref: "lesson1.body.25", text: "She is tired." },

  { ref: "lesson1.body.26", text: "Is she tired?" },

  { ref: "lesson1.body.27", text: "Are they friends?" },

  { ref: "lesson1.body.28", text: "She is at home." },

  { ref: "lesson1.body.29", text: "Tom is a student." },

  { ref: "lesson1.body.30", text: "My friends are happy." },

  { ref: "lesson1.body.31", text: "Yes, I am." },

  { ref: "lesson1.body.32", text: "No, I'm not." },

  { ref: "lesson1.applied.01", text: "Are you in the house?" },

];



const lesson1CheckRefs = lesson01CheckQuestions.map((q) => ({

  ref: `lesson1.check.${q.id}`,

  text: q.exampleSentence,

}));



const lesson1Step3Refs = lesson01SummaryConfig.meaningSentences.map((s) => ({

  ref: `lesson1.step3.${s.id}`,

  text: s.sentence,

}));



const lesson2BodyRefs: { ref: string; text: string }[] = [

  { ref: "lesson2.body.01", text: "I play tennis." },

  { ref: "lesson2.body.02", text: "I like music." },

  { ref: "lesson2.body.03", text: "We study English." },

  { ref: "lesson2.body.04", text: "He plays tennis." },

  { ref: "lesson2.body.05", text: "She likes music." },

  { ref: "lesson2.body.06", text: "I don't play tennis." },

  { ref: "lesson2.body.07", text: "She doesn't play tennis." },

  { ref: "lesson2.body.08", text: "She doesn't like music." },

  { ref: "lesson2.body.09", text: "You like music." },

  { ref: "lesson2.body.10", text: "Do you like music?" },

  { ref: "lesson2.body.11", text: "Does she like music?" },

  { ref: "lesson2.body.12", text: "Do you play tennis?" },

  { ref: "lesson2.body.13", text: "Yes, I do." },

  { ref: "lesson2.body.14", text: "No, I don't." },

  { ref: "lesson2.body.15", text: "Yes, she does." },

  { ref: "lesson2.body.16", text: "No, she doesn't." },

];



const lesson2CheckRefs = lesson02CheckQuestions.map((q) => ({

  ref: `lesson2.check.${q.id}`,

  text: q.exampleSentence,

}));



const lesson2Step3Refs = lesson02SummaryConfig.meaningSentences.map((s) => ({

  ref: `lesson2.step3.${s.id}`,

  text: s.sentence,

}));



const globalTextToFile = new Map<string, AudioFileEntry>();

const allFiles: AudioFileEntry[] = [];



const lesson1RefMap = buildCatalog(

  "lesson1",

  [...lesson1BodyRefs, ...lesson1CheckRefs, ...lesson1Step3Refs],

  globalTextToFile,

  allFiles,

);



const lesson2RefMap = buildCatalog(

  "lesson2",

  [...lesson2BodyRefs, ...lesson2CheckRefs, ...lesson2Step3Refs],

  globalTextToFile,

  allFiles,

);



export const FIXED_AUDIO_FILES: AudioFileEntry[] = allFiles;



export const FIXED_AUDIO_REFS: AudioRefMap = {

  ...lesson1RefMap,

  ...lesson2RefMap,

};



const fileById = new Map(FIXED_AUDIO_FILES.map((f) => [f.fileId, f]));



export function resolveAudioRef(ref: string): {

  fileId: string;

  lessonKey: LessonAudioKey;

  text: string;

  url: string;

} | null {

  const fileId = FIXED_AUDIO_REFS[ref];

  if (!fileId) return null;



  const file = fileById.get(fileId);

  if (!file) return null;



  return {

    fileId: file.fileId,

    lessonKey: file.lessonKey,

    text: file.text,

    url: `/audio/${file.lessonKey}/${file.fileId}.mp3`,

  };

}



export function getFileById(fileId: string): AudioFileEntry | undefined {

  return fileById.get(fileId);

}

