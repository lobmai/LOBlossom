/**
 * 理解度テストの choice 表示順。
 * 判定は option 文字列と question.answer の一致のまま。
 * 同じ問題・同じ選択肢なら毎回同じ並び。
 */
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const CORRECT_INDEX_SPREAD = [1, 3, 0, 2];

function targetCorrectIndex(questionId: string, optionCount: number): number {
  const parsed = Number((questionId.match(/\d+/) ?? ["1"])[0]);
  const ordinal = Number.isFinite(parsed) ? Math.max(0, parsed - 1) : 0;
  const slot = CORRECT_INDEX_SPREAD[ordinal % CORRECT_INDEX_SPREAD.length] ?? 1;
  return slot % optionCount;
}

export function shuffleChoicesStable(
  lessonId: string,
  questionId: string,
  options: readonly string[],
  answer?: string,
): string[] {
  const copy = [...options];
  if (copy.length < 2) return copy;
  const rng = mulberry32(hashSeed(`${lessonId}\0${questionId}\0${copy.join("\0")}`));
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const current = copy[i];
    const swap = copy[j];
    if (current === undefined || swap === undefined) continue;
    copy[i] = swap;
    copy[j] = current;
  }

  if (!answer) return copy;
  const from = copy.indexOf(answer);
  if (from < 0) return copy;
  const target = targetCorrectIndex(questionId, copy.length);
  if (from === target) return copy;
  const [picked] = copy.splice(from, 1);
  if (picked === undefined) return copy;
  copy.splice(target, 0, picked);
  return copy;
}

export function correctChoiceIndex(
  options: readonly string[],
  answer: string,
): number {
  return options.findIndex((option) => option === answer);
}
