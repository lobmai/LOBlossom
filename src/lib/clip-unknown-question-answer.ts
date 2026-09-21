/** Step4「分からなかったところ」回答の表示前クリップ。途中ぶつ切りはしない。 */

export const UNKNOWN_QUESTION_ANSWER_MAX_SENTENCES = 3;
const MAX_TOTAL_CHARS = 500;
const HUGE_SENTENCE_CHARS = 800;

const CLOSING_OR_ENCOURAGEMENT =
  /お疲れ|また次回|また会いましょ|また会おう|また会える|一緒に頑張|次も期待|次も一緒|頑張って|がんばって|また質問|質問してください|次のステップ|学習を続け|学習を進|他に質問|一緒に考え|理解を深め|自分で考えて|ありがとうございました|ありがとうね|応援して|ファイト|がんばろう|また来て|またね[。！!]?$|次回も|楽しみにして|いつでも聞|聞いてね|引き続き頑張|これからも一緒/;

export function splitUnknownQuestionSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[。！？!?])\s*|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeForCompare(sentence: string): string {
  return sentence.replace(/[\s。！？、,.!?\u3000「」『』（）()]/g, "");
}

function isClosingOrEncouragement(sentence: string): boolean {
  const compact = sentence.replace(/\s+/g, "");
  if (!compact) return true;
  return CLOSING_OR_ENCOURAGEMENT.test(compact);
}

/** 「つまり」「それによって」で同じ意味を足す文。意味類似判定はしない。 */
const RESTATEMENT_PREFIX =
  /^(つまり|すなわち|要するに|言い換えれば|それによって)[、,\s]?/;

function isRestatementPadding(sentence: string): boolean {
  return RESTATEMENT_PREFIX.test(sentence.trim());
}

function isDuplicateOf(existing: string, next: string): boolean {
  const a = normalizeForCompare(existing);
  const b = normalizeForCompare(next);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 8 && b.includes(a)) return true;
  if (b.length >= 8 && a.includes(b)) return true;
  return false;
}

function hasRepeatedChunk(text: string): boolean {
  const compact = text.replace(/\s+/g, "").slice(0, 2000);
  if (compact.length < 48) return false;
  for (let n = 6; n <= 18; n += 1) {
    const counts = new Map<string, number>();
    for (let i = 0; i <= compact.length - n; i += 1) {
      const gram = compact.slice(i, i + n);
      const next = (counts.get(gram) ?? 0) + 1;
      if (next >= 5) return true;
      counts.set(gram, next);
    }
  }
  return false;
}

/**
 * unknownQuestionAnswer を最大3文に整える。
 * 励まし・締め・反復を除き、途中で文字を切らない。
 * 異常なら null（呼び出し側が短い fallback を使う）。
 */
export function clipUnknownQuestionAnswer(
  raw: string | null | undefined,
): string | null {
  const text = raw?.trim() ?? "";
  if (!text) return null;

  const kept: string[] = [];
  for (const sentence of splitUnknownQuestionSentences(text)) {
    if (isClosingOrEncouragement(sentence)) continue;
    if (kept.length > 0 && isRestatementPadding(sentence)) continue;
    if (hasRepeatedChunk(sentence)) {
      if (kept.length === 0) return null;
      break;
    }
    if (sentence.length > HUGE_SENTENCE_CHARS) {
      if (kept.length === 0) return null;
      break;
    }
    if (kept.some((prev) => isDuplicateOf(prev, sentence))) continue;
    kept.push(sentence);
    if (kept.length >= UNKNOWN_QUESTION_ANSWER_MAX_SENTENCES) break;
  }

  if (kept.length === 0) return null;

  let selected = kept;
  while (selected.length > 1) {
    const joined = selected.join("");
    if (joined.length <= MAX_TOTAL_CHARS) break;
    selected = selected.slice(0, -1);
  }

  const out = selected.join("").trim();
  if (!out) return null;
  if (selected.length === 1 && (out.length > HUGE_SENTENCE_CHARS || hasRepeatedChunk(out))) {
    return null;
  }
  return out;
}
