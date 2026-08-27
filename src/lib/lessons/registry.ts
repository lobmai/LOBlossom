import {
  lesson01CheckQuestions,
  lesson01Meta,
  lesson01TaughtTopics,
} from "@/data/lesson01";
import {
  lesson02CheckQuestions,
  lesson02Meta,
  lesson02TaughtTopics,
} from "@/data/lesson02";
import { lesson01SummaryConfig } from "@/lib/lessons/lesson01-summary";
import { lesson02SummaryConfig } from "@/lib/lessons/lesson02-summary";
import { lesson01CoachRubric } from "@/lib/coach-rubric/lesson01";
import { lesson02CoachRubric } from "@/lib/coach-rubric/lesson02";
import type { LessonRegistryEntry } from "@/lib/lessons/types";

const LESSON01_COACH = {
  evaluateSystemPrompt: `あなたはLOBlossomのAIコーチです。英語初学者がbe動詞レッスンを自分の言葉でまとめた内容を読み、理解を確認します。

【あなたの役割】
1. ユーザーが正しく理解できているか確認する（完璧な文章は求めない）
2. 「be動詞の意味」と「am / is / are の使い分け」は別々に確認する。重要なポイントが大きく抜けていないか見る
3. 内容は正しいが分かりにくい場合のみ、意味を変えず読みやすく整える

【重要ルール】
- ユーザーに代わって学習内容を考えない
- 専門用語を増やさない。初心者の言葉を尊重する
- overallMessage は短く、やさしい日本語で2〜4文程度
- polishedEntries は整え不要なら polishedAnswer は null`,

  finalizeInstructions: `あなたはLOBlossomのAIコーチです。ユーザーがStep3で書いた内容とStep5「教える」回答をもとに、「レッスンの要約」を作成します。

【最重要ルール】
- 返す id は final-my-summary の1項目だけ
- 4〜5行程度の短い日本語。各行は「・」で始める
- 復習ノートとして後から見返せる要点だけを書く
- 「とてもいい内容ですね」「よくまとめられています」などの評価コメントは書かない
- 必ず次の4点を含める（ユーザーの言葉を活かしてよい）：
  1. be動詞は「～です」「～にいる・ある」などを表す
  2. am / is / are があり、主語によって使い分ける
  3. 否定文はbe動詞の後ろにnotを置く
  4. 疑問文はbe動詞を主語の前に出す
- ユーザーがStep3で作った例文は要約本文に入れない
- 専門用語を増やさない`,

  questionSystemPrompt: "", // built dynamically with taughtTopics
  rubric: lesson01CoachRubric,
};

const LESSON02_COACH = {
  evaluateSystemPrompt: `あなたはLOBlossomのAIコーチです。英語初学者が一般動詞レッスンを自分の言葉でまとめた内容を読み、理解を確認します。

【あなたの役割】
1. 一般動詞の理解を確認する（完璧な文章は求めない）
2. he/she の s、don't/doesn't、Do/Does など重要点が大きく抜けていないか見る
3. 分かりにくい場合のみ、意味を変えず読みやすく整える

【重要ルール】
- be動詞のルールで評価しない
- 専門用語を増やさない。overallMessage は2〜4文程度`,

  finalizeInstructions: `あなたはLOBlossomのAIコーチです。一般動詞レッスンの理解を「レッスンの要約」に整理します。

【最重要ルール】
- 返す id は final-my-summary の1項目だけ
- 3〜5行程度。各行は「・」で始める
- 復習ノートとして後から見返せる要点だけ
- 「とてもいい内容ですね」などの評価コメントは書かない
- 一般動詞、he/she の s（3単現）、don't/doesn't、Do/Does、does 使用時は動詞原形 など重要点を含める
- ユーザーの例文は要約本文に入れない`,

  questionSystemPrompt: "",
  rubric: lesson02CoachRubric,
};

export const LESSON_REGISTRY: Record<number, LessonRegistryEntry> = {
  1: {
    number: 1,
    meta: lesson01Meta,
    taughtTopics: lesson01TaughtTopics,
    checkQuestions: lesson01CheckQuestions,
    summary: lesson01SummaryConfig,
    coach: LESSON01_COACH,
  },
  2: {
    number: 2,
    meta: lesson02Meta,
    taughtTopics: lesson02TaughtTopics,
    checkQuestions: lesson02CheckQuestions,
    summary: lesson02SummaryConfig,
    coach: LESSON02_COACH,
  },
};

export function getLesson(number: number): LessonRegistryEntry | undefined {
  return LESSON_REGISTRY[number];
}

export function getLessonById(lessonId: string): LessonRegistryEntry | undefined {
  return Object.values(LESSON_REGISTRY).find((l) => l.meta.id === lessonId);
}

export const LESSON_SELECT_PATH = "/lessons";

export function getLessonBasePath(number: number): string {
  return `/lesson/${number}`;
}

export function getLessonStepPath(number: number, step: string): string {
  if (step === "lesson") return getLessonBasePath(number);
  return `${getLessonBasePath(number)}/${step}`;
}
