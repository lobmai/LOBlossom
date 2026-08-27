import type {
  SpecialLessonConfig,
  SpecialQuestionTemplate,
  VocabQuestion,
} from "@/lib/special-lessons/types";
import { resolveWordMaster } from "@/lib/my-words/review-sync";

function buildEnToJaQuestion(
  template: Extract<SpecialQuestionTemplate, { type: "en-to-ja" }>,
): VocabQuestion | null {
  const master = resolveWordMaster(template.wordId);
  if (!master) return null;

  return {
    id: template.id,
    type: "en-to-ja",
    wordId: template.wordId,
    prompt: template.prompt ?? `${master.english} の意味は？`,
    english: master.english,
    options: template.options,
    answer: template.answer,
  };
}

function buildJaToEnQuestion(
  template: Extract<SpecialQuestionTemplate, { type: "ja-to-en" }>,
): VocabQuestion | null {
  const master = resolveWordMaster(template.wordId);
  if (!master) return null;

  return {
    id: template.id,
    type: "ja-to-en",
    wordId: template.wordId,
    prompt: template.prompt ?? `「${master.japanese}」を英語で言うと？`,
    japanese: master.japanese,
    options: template.options,
    answer: template.answer,
  };
}

/**
 * SpecialLessonConfig のテンプレート + My Words マスターから
 * 実行時の VocabQuestion[] を生成
 */
export function buildSpecialQuestions(
  config: SpecialLessonConfig,
): VocabQuestion[] {
  const questions: VocabQuestion[] = [];

  for (const template of config.questionTemplates) {
    const built =
      template.type === "en-to-ja"
        ? buildEnToJaQuestion(template)
        : buildJaToEnQuestion(template);

    if (built) {
      questions.push(built);
    }
  }

  return questions;
}
