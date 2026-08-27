import type { CoachRubric, CoachRubricPoint } from "@/lib/coach-rubric/types";
import { getCoachRubricForLesson } from "@/lib/coach-rubric";

const STRUGGLE_PATTERNS = [
  /^分(?:から|か)ない/u,
  /^わからない/u,
  /^忘れ/u,
  /^覚えて(?:ない|ません)/u,
  /^知らない/u,
  /^不明/u,
  /^(?:わ|分)か(?:ら|り)ません/u,
  /^よく(?:わ|分)からない/u,
];

/** 「分からない」等 → ヒント表示（API 不要） */
export function isStruggleAnswer(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return STRUGGLE_PATTERNS.some((p) => p.test(t));
}

export function getRubricPoint(
  rubric: CoachRubric,
  pointId: string | undefined,
): CoachRubricPoint | null {
  if (!pointId) return rubric.points[0] ?? null;
  return rubric.points.find((p) => p.id === pointId) ?? rubric.points[0] ?? null;
}

/** 初回質問向け：am/is/are など主要ポイントを優先 */
export function pickDefaultRubricPointId(rubric: CoachRubric): string {
  const preferred = rubric.points.find((p) => p.id === "am-is-are");
  return preferred?.id ?? rubric.points[0]?.id ?? "";
}

/** ヒント段階 0〜1：ローカル表示。2 以上は teach へ */
export function buildLocalHint(
  rubric: CoachRubric,
  rubricPointId: string | undefined,
  hintLevel: number,
  options?: { isInitialBroadHint?: boolean },
): string | null {
  if (options?.isInitialBroadHint && hintLevel <= 0) {
    return buildInitialBroadHint(rubric);
  }

  const point = getRubricPoint(rubric, rubricPointId);
  if (!point) return null;

  if (hintLevel <= 0) {
    const hints = point.coachHints ?? [];
    const hint = hints[0];
    if (!hint) return `ヒント：${point.label}について、もう少し考えてみよう。`;
    const follow =
      hints.length > 1
        ? `じゃあ、${hints[1]}はどうだったかな？`
        : "もう少し具体的に教えてくれる？";
    return `ヒント：${hint}を思い出してみよう。${follow}`;
  }

  if (hintLevel === 1) {
    const line = point.mustUnderstand[0];
    if (!line) return null;
    return `ヒント：${simplifyMustUnderstand(line)}`;
  }

  return null;
}

/** 初回質問「いちばん大事なこと」向け：レッスン全体を思い出すヒント */
function buildInitialBroadHint(rubric: CoachRubric): string {
  if (rubric.lessonId === "lesson-01-be-verb") {
    return "ヒント：このレッスンでは『be動詞』について学んだね。am・is・areを思い出してみよう！";
  }
  return `ヒント：${rubric.title}で学んだことを、自分の言葉で思い出してみよう！`;
}

/** ローカル teach：mustUnderstand をやさしく結合（API 不要） */
export function buildLocalTeachContent(
  rubric: CoachRubric,
  rubricPointId: string | undefined,
): string {
  const point = getRubricPoint(rubric, rubricPointId);
  if (!point) {
    return "大丈夫だよ。レッスンで学んだ内容を、もう一度見返してみよう。";
  }

  const lines = point.mustUnderstand.map(simplifyMustUnderstand).filter(Boolean);
  const body = lines.length > 0 ? lines.join("\n") : point.label;
  return `こう覚えておこう！\n${body}`;
}

function simplifyMustUnderstand(text: string): string {
  return text
    .replace(/状態・属性を表す/g, "「～です」「～にいます」などを表す")
    .replace(/状態や属性/g, "「～です」「～にいます」など");
}

export function getRubricForLesson(lessonId: string): CoachRubric | null {
  return getCoachRubricForLesson(lessonId);
}
