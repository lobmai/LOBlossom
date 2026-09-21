import { getLessonById } from "@/lib/lessons/registry";

export const MEANING_CHECK_QUESTION_JA = "この文はどんな意味？";

export const MEANING_CHECK_OK_CLOSING = "わかった！教えてくれてありがとう！😊";

export const MEANING_CHECK_FOLLOW_UP_POLICY = `【2問目 — 英文の意味確認】
初回回答のあと（followUpCount が 0）は、原則 followup にする。
抽象的な追加質問は作らない。

followUpSentence に、このレッスンで習った範囲の短い英文を1つ書く。
followUpQuestion は次の固定文だけ：
この文はどんな意味？

英文のルール：
- そのレッスンですでに学習した内容だけを使う
- 未習の文法を入れない
- 短く、小学5年生でも考えやすい
- 文法的に正しい
- 答えが分かりにくい英文にしない
- そのレッスンの中心となる文法を含める
- ユーザーの1問目の回答だけに無理に合わせない

禁止する2問目：
- 「自分の言葉で教えて！」
- 「〜についてどう考えますか？」
- 「どんなときに使うと思う？」
- 「この文法の役割は何だと思う？」
- 「現実と想像の違いについて説明してください」
- 「どのような状況で使用されると考えますか？」

【2問目への回答の判定】
一字一句の和訳は要求しない。
その英文が伝えている意味・考え方を大きく理解していれば complete。
complete の closingMessage は次の1文だけ：
「わかった！教えてくれてありがとう！😊」
「その意味でOK」「正解」など、採点する言い方は禁止。
意味を大きく間違えていたときだけ teach。
teachContent は、分からない人として短く聞く形にする。
例：「ここがまだよく分からないんだけど、〜っていう意味？」
長い講義、新しい英文、3問目は出さない。followup は禁止。`;

export function buildMeaningCheckFollowUpPolicy(): string {
  return MEANING_CHECK_FOLLOW_UP_POLICY;
}

export function isUsableMeaningCheckSentence(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const words = t.match(/[A-Za-z']+/g) ?? [];
  if (words.length < 2) return false;
  if (t.length > 140) return false;
  if (/^(yes|no)\b/i.test(t) && words.length <= 4) return false;
  return true;
}

export function getLessonExampleSentences(lessonId: string): string[] {
  const lesson = getLessonById(lessonId);
  if (!lesson) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const question of lesson.checkQuestions) {
    const sentence = question.exampleSentence?.trim() ?? "";
    if (!isUsableMeaningCheckSentence(sentence)) continue;
    const key = sentence.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(sentence);
  }
  return out;
}

export function pickMeaningCheckFallbackSentence(lessonId: string): string {
  return getLessonExampleSentences(lessonId)[0] ?? "I am happy.";
}

export function formatMeaningCheckFollowUp(sentence: string): string {
  return `${sentence.trim()}\n${MEANING_CHECK_QUESTION_JA}`;
}

export function extractEnglishSentence(
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null;
  for (const line of raw.split(/\n+/)) {
    if (isUsableMeaningCheckSentence(line)) return line.trim();
  }
  if (isUsableMeaningCheckSentence(raw)) return raw.trim();
  return null;
}

export function applyMeaningCheckFollowUpGate(
  result: {
    outcome: "complete" | "followup" | "teach";
    followUpQuestion?: string | null;
    followUpSentence?: string | null;
    targetRubricPointId?: string | null;
    paraphrase?: string | null;
    closingMessage?: string | null;
    teachContent?: string | null;
  },
  lessonId: string,
  opts: { isFollowUpAnswer: boolean; followUpCount: number },
): typeof result {
  if (opts.isFollowUpAnswer || opts.followUpCount >= 1) {
    if (result.outcome === "followup") {
      return {
        ...result,
        outcome: "complete",
        followUpQuestion: null,
        followUpSentence: null,
        closingMessage: MEANING_CHECK_OK_CLOSING,
      };
    }
    if (result.outcome === "complete") {
      return {
        ...result,
        followUpQuestion: null,
        followUpSentence: null,
        closingMessage: MEANING_CHECK_OK_CLOSING,
      };
    }
    return {
      ...result,
      followUpQuestion: null,
      followUpSentence: null,
    };
  }

  if (result.outcome === "teach") {
    return {
      ...result,
      followUpQuestion: null,
      followUpSentence: null,
    };
  }

  const sentence =
    extractEnglishSentence(result.followUpSentence) ??
    extractEnglishSentence(result.followUpQuestion) ??
    pickMeaningCheckFallbackSentence(lessonId);

  return {
    ...result,
    outcome: "followup",
    followUpSentence: sentence,
    followUpQuestion: formatMeaningCheckFollowUp(sentence),
    closingMessage: null,
    teachContent: null,
  };
}
