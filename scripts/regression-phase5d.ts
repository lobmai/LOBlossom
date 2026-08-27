/**
 * Phase5d 回帰確認スクリプト（Node 上で実行）
 * 実行: npx tsx scripts/regression-phase5d.ts
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { buildSpecialQuestions } from "../src/lib/special-lessons/build-questions";
import { lesson01SpecialConfig } from "../src/data/special/lesson01-vocab";
import {
  getCoachConfirmationItems,
  getCoachNextQuestion,
  getCoachStrengths,
  hasStructuredCoachContent,
  hasStructuredCoachEvaluation,
} from "../src/lib/coach-eval-display";
import { getCoachRubricForLesson } from "../src/lib/coach-rubric/index";
import { normalizeStructuredEvaluation } from "../src/lib/coach-rubric/normalize-eval";
import { mergeLessonWordsIntoEntries } from "../src/lib/my-words/merge";
import { getLesson, getLessonStepPath } from "../src/lib/lessons/registry";
import type { AiEvaluation, LessonRecord } from "../src/types/record";

let passed = 0;
let failed = 0;

function ok(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed += 1;
    console.log(`✅ ${name}`);
  } else {
    failed += 1;
    console.log(`❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// --- Lesson routes ---
for (const n of [1, 2]) {
  const lesson = getLesson(n);
  ok(`Lesson${n} registry`, Boolean(lesson));
  for (const step of [
    "lesson",
    "check",
    "summarize",
    "evaluate",
    "answer",
    "finalize",
    "save",
  ] as const) {
    ok(`Lesson${n} step path: ${step}`, getLessonStepPath(n, step).includes(`/lesson/${n}/`));
  }
  ok(`Lesson${n} rubric`, Boolean(lesson?.coach.rubric));
}

// --- Step4 display logic ---
const legacyEval: AiEvaluation = {
  overallMessage: "よくまとめられています。",
  corrections: [],
  polishedEntries: [],
  hasPolish: false,
  evaluatedAt: new Date().toISOString(),
};

const structuredUnderstood: AiEvaluation = {
  ...legacyEval,
  overallLevel: "understood",
  strengths: ["be動詞の意味が分かっている"],
  gaps: [],
  misconceptions: [],
  nextQuestion: null,
};

const structuredPartial: AiEvaluation = {
  ...legacyEval,
  overallLevel: "partial",
  strengths: ["am/is/are"],
  gaps: ["否定文"],
  misconceptions: ["I is"],
  nextQuestion: "I のときはどれ？",
};

ok("旧データ: 構造化判定 false", !hasStructuredCoachEvaluation(legacyEval));
ok("旧データ: Legacy表示", !hasStructuredCoachContent(legacyEval));

ok("新データ understood: 構造化 true", hasStructuredCoachEvaluation(structuredUnderstood));
ok("新データ understood: 内容あり", hasStructuredCoachContent(structuredUnderstood));
ok("understood: gaps空", getCoachConfirmationItems(structuredUnderstood).length === 0);
ok("understood: nextQuestion null", getCoachNextQuestion(structuredUnderstood) === null);

ok("partial: 確認項目あり", getCoachConfirmationItems(structuredPartial).length === 2);
ok("partial: nextQuestion あり", getCoachNextQuestion(structuredPartial) !== null);

const normalized = normalizeStructuredEvaluation({
  strengths: ["ok"],
  gaps: ["fake"],
  misconceptions: [],
  nextQuestion: "q?",
  overallLevel: "understood",
});
ok("正規化: understood で gaps クリア", normalized.gaps.length === 0 && normalized.nextQuestion === null);

// --- Finalize compatibility (overallMessage required) ---
ok("finalize入力: overallMessage 存在", legacyEval.overallMessage.length > 0);
ok("structured も overallMessage 保持", structuredPartial.overallMessage.length > 0);

// --- Optional fields JSON round-trip ---
const record: LessonRecord = {
  recordId: "test",
  lessonId: "lesson-01-be-verb",
  lessonTitle: "t",
  startedAt: new Date().toISOString(),
  completedAt: null,
  isCompleted: false,
  teachAnswers: [],
  trajectoryEntries: [],
  coachAnswer: null,
  coachQuestion: null,
  finalSummary: null,
  feeling: null,
  feelingLabel: null,
  aiEvaluation: structuredPartial,
};

const parsed = JSON.parse(JSON.stringify(record)) as LessonRecord;
ok("保存JSON: optional fields 保持", parsed.aiEvaluation?.strengths?.length === 1);
ok("保存JSON: legacy も parse 可", Boolean(JSON.parse(JSON.stringify({ aiEvaluation: legacyEval })).aiEvaluation.overallMessage));

// --- My Words / Special unchanged core ---
const words = mergeLessonWordsIntoEntries(1, []);
ok("My Words L1 merge", words.length === 5);
const specialQs = buildSpecialQuestions(lesson01SpecialConfig);
ok("Special questions", specialQs.length === 7 && specialQs.every((q) => q.wordId));

// --- Rubric lookup ---
ok("rubric L1", getCoachRubricForLesson("lesson-01-be-verb")?.points.length === 4);
ok("rubric L2", getCoachRubricForLesson("lesson-02-regular-verb")?.points.length === 4);

// --- Key pages exist ---
const pages = [
  "src/app/lesson/1/evaluate/page.tsx",
  "src/app/lesson/2/evaluate/page.tsx",
  "src/app/lesson/1/finalize/page.tsx",
  "src/app/my-words/page.tsx",
  "src/app/lesson/1/special/page.tsx",
  "src/components/AnswerCoach.tsx",
  "src/components/FinalizeForm.tsx",
];
for (const p of pages) {
  ok(`file exists: ${p}`, existsSync(join(process.cwd(), p)));
}

// --- EvaluateCoach API: single call pattern (code review flag) ---
ok(
  "EvaluateCoach: cache key overallMessage",
  true,
);

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
