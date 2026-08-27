import type { CoachRubric, CoachRubricPoint } from "@/lib/coach-rubric/types";

/** rubric 各ポイント：回答テキストが「説明できている」か */
export type RubricCoverageContext = {
  /** 初回質問への回答か（true なら全重要項目を確認） */
  isInitialAnswer: boolean;
  /** 追加質問への回答か（true なら追加質問を出さない） */
  isFollowUpAnswer?: boolean;
  /** 追加質問への回答なら、確認対象の point id */
  activeRubricPointId?: string;
};

function normalize(text: string): string {
  return text.normalize("NFKC").toLowerCase();
}

function includesAny(text: string, terms: string[]): boolean {
  const n = normalize(text);
  return terms.some((t) => n.includes(normalize(t)));
}

/** am/is/are：主語との具体的な対応が説明されているか */
export function isAmIsAreExplained(text: string): boolean {
  const n = normalize(text);

  const iAm =
    /\bi\b.{0,12}\bam\b/.test(n) ||
    /\bam\b.{0,12}\bi\b/.test(n) ||
    /i.{0,6}(は|→|なら|のとき).{0,8}am/.test(n) ||
    /am.{0,6}(は|→|なら|のとき).{0,8}(i|私)/.test(n);

  const isThird =
    /\b(he|she|it)\b.{0,12}\bis\b/.test(n) ||
    /\bis\b.{0,12}\b(he|she|it)\b/.test(n) ||
    /(he|she|it|三人称|1人|ひとり).{0,10}(は|→|なら|のとき).{0,8}\bis\b/.test(n) ||
    /\bis\b.{0,10}(he|she|it|三人称)/.test(n);

  const arePlural =
    /\b(you|we|they)\b.{0,12}\bare\b/.test(n) ||
    /\bare\b.{0,12}\b(you|we|they)\b/.test(n) ||
    /(you|we|they|二人|複数).{0,10}(は|→|なら|のとき).{0,8}\bare\b/.test(n) ||
    /\bare\b.{0,10}(you|we|they|二人|複数)/.test(n);

  const mappingCount = [iAm, isThird, arePlural].filter(Boolean).length;
  return mappingCount >= 2;
}

/** 使い分けに言及しているが具体説明がない（部分理解） */
export function mentionsAmIsAreWithoutDetail(text: string): boolean {
  const n = normalize(text);
  const mentions =
    includesAny(n, ["am", "is", "are"]) ||
    includesAny(n, ["be動詞", "ビー動詞"]);
  const vagueSplit =
    /使い分け|くふう|区別|ちがい|違い|3種類|三種類|種類/.test(n);
  return mentions && vagueSplit && !isAmIsAreExplained(text);
}

export function isNegationExplained(text: string): boolean {
  return (
    includesAny(text, [
      "not",
      "否定",
      "ない",
      "ません",
      "is not",
      "are not",
      "am not",
      "後ろ",
      "あと",
    ]) && /not|否定|ない|後ろ|あと/.test(normalize(text))
  );
}

export function isQuestionExplained(text: string): boolean {
  return includesAny(text, [
    "疑問",
    "質問文",
    "be動詞を主語の前",
    "be動詞の前",
    "前に出",
    "前に出す",
    "are you",
    "is he",
    "is she",
  ]);
}

export function isBeVerbMeaningExplained(text: string): boolean {
  return (
    includesAny(text, ["be動詞", "ビー動詞"]) &&
    includesAny(text, ["です", "いる", "ある", "意味", "状態", "にいます", "にあります"])
  );
}

const COVERAGE_CHECKERS: Record<
  string,
  (text: string) => boolean
> = {
  "be-verb-meaning": isBeVerbMeaningExplained,
  "am-is-are": isAmIsAreExplained,
  "be-negation": isNegationExplained,
  "be-question": isQuestionExplained,
};

/** Lesson1 初回回答：確認優先順（未確認の重要項目） */
const L1_INITIAL_PRIORITY = [
  "am-is-are",
  "be-negation",
  "be-question",
  "be-verb-meaning",
] as const;

function isPointCovered(point: CoachRubricPoint, combinedText: string): boolean {
  const checker = COVERAGE_CHECKERS[point.id];
  if (checker) return checker(combinedText);

  if (point.okIfIncludes?.length) {
    const hits = point.okIfIncludes.filter((k) =>
      normalize(combinedText).includes(normalize(k)),
    );
    return hits.length >= Math.min(2, point.okIfIncludes.length);
  }

  return false;
}

function pickFollowUpQuestion(point: CoachRubricPoint): string {
  return (
    point.coachQuestion?.trim() ||
    `${point.label}について、もう少し教えて！`
  );
}

export type MissingRubricFollowUp = {
  pointId: string;
  followUpQuestion: string;
  reason: string;
};

/** 会話全体のユーザーテキストから、次に聞くべき rubric ポイントを1つ返す */
export function detectMissingRubricFollowUp(
  rubric: CoachRubric,
  userTexts: string[],
  ctx: RubricCoverageContext,
): MissingRubricFollowUp | null {
  const combined = userTexts.map((t) => t.trim()).filter(Boolean).join("\n");
  if (!combined) return null;

  const pointsToCheck: CoachRubricPoint[] = [];

  if (ctx.isInitialAnswer) {
    const priorityIds =
      rubric.lessonId === "lesson-01-be-verb"
        ? [...L1_INITIAL_PRIORITY]
        : rubric.points.map((p) => p.id);

    for (const id of priorityIds) {
      const p = rubric.points.find((pt) => pt.id === id);
      if (p) pointsToCheck.push(p);
    }
    for (const p of rubric.points) {
      if (!pointsToCheck.some((x) => x.id === p.id)) {
        pointsToCheck.push(p);
      }
    }
  } else if (ctx.activeRubricPointId) {
    const p = rubric.points.find((pt) => pt.id === ctx.activeRubricPointId);
    if (p) pointsToCheck.push(p);
  } else {
    pointsToCheck.push(...rubric.points);
  }

  for (const point of pointsToCheck) {
    if (isPointCovered(point, combined)) continue;

    if (
      point.id === "am-is-are" &&
      mentionsAmIsAreWithoutDetail(combined)
    ) {
      return {
        pointId: point.id,
        followUpQuestion: "am・is・areは、主語によってどう使い分ける？",
        reason: "am-is-are-partial",
      };
    }

    return {
      pointId: point.id,
      followUpQuestion: pickFollowUpQuestion(point),
      reason: `missing-${point.id}`,
    };
  }

  return null;
}

/** AI が complete を返しても、rubric 未達なら followup に上書き */
export function applyRubricCoverageGate(
  result: {
    outcome: "complete" | "followup" | "teach";
    followUpQuestion?: string | null;
    targetRubricPointId?: string | null;
    paraphrase?: string | null;
    closingMessage?: string | null;
    teachContent?: string | null;
  },
  rubric: CoachRubric | null,
  userTexts: string[],
  ctx: RubricCoverageContext,
  followUpCount: number,
): typeof result {
  if (!rubric || followUpCount >= 1 || ctx.isFollowUpAnswer) return result;
  if (result.outcome !== "complete") return result;

  const missing = detectMissingRubricFollowUp(rubric, userTexts, ctx);
  if (!missing) return result;

  return {
    ...result,
    outcome: "followup",
    followUpQuestion: missing.followUpQuestion,
    targetRubricPointId: missing.pointId,
    closingMessage: null,
    teachContent: null,
  };
}
