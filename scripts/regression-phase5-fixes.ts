/**
 * Phase5 修正後 + E2E フィードバック回帰確認
 * 実行: npx tsx scripts/regression-phase5-fixes.ts
 */
import {
  buildInsufficientEvaluation,
  canRequestAiEvaluation,
  isMeaningfulCoachAnswer,
  isObviouslyInvalid,
  isValidUserExample,
  isMeaningfulText,
} from "../src/lib/answer-quality";
import {
  buildLesson01FinalSummary,
  replaceLesson01MyPoints,
} from "@/lib/build-lesson01-final-summary";
import {
  isLesson01StructuredFinalSummary,
  LESSON01_FINAL_SUMMARY_SECTIONS,
} from "@/lib/lessons/lesson01-final-summary";
import { pickCoachQuestionForLesson } from "../src/lib/coach-question-picker";
import { isInsufficientEvaluation } from "../src/lib/coach-eval-display";
import { collectEncounteredWordIds } from "../src/lib/my-words/encountered-words";
import { mergeLessonWordsIntoEntries } from "../src/lib/my-words/merge";
import {
  isFinalSummaryComplete,
  validateLessonReadyForFinalize,
} from "../src/lib/lesson-finalize-validation";
import { getLesson } from "../src/lib/lessons/registry";
import {
  fromTrajectoryEntries,
  getSummaryFieldDefinitions,
  toTrajectoryEntries,
} from "../src/lib/summary-fields";
import type { LessonRecord } from "../src/types/record";

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

const validL1: Record<string, string> = {
  "be-verb-meaning": "～です、～にいる・ある",
  "usage-am": "I のとき",
  "usage-is": "he/she/it のとき",
  "usage-are": "you/we/they のとき",
  "negation-rule": "be動詞の後ろに not を置く",
  "question-how": "be動詞を主語の前に出す",
  "unclear-choice": "none",
  "user-example": "I am happy.",
};

const invalidL1 = { ...validL1, "user-example": "a" };

ok("正常回答: canEvaluate", canRequestAiEvaluation("lesson-01-be-verb", validL1));
ok("無効回答: !canEvaluate", !canRequestAiEvaluation("lesson-01-be-verb", invalidL1));
const { "be-verb-meaning": _meaning, ...noMeaningL1 } = validL1;
ok(
  "意味欄なし: !canEvaluate",
  !canRequestAiEvaluation("lesson-01-be-verb", noMeaningL1),
);
ok(
  "意味欄が定義にある",
  getSummaryFieldDefinitions("lesson-01-be-verb").some((d) => d.id === "be-verb-meaning"),
);
const savedMeaning = toTrajectoryEntries("lesson-01-be-verb", validL1);
ok(
  "意味が保存される",
  savedMeaning.some((e) => e.id === "be-verb-meaning" && e.answer === "～です、～にいる・ある"),
);
ok(
  "意味が復元される",
  fromTrajectoryEntries(savedMeaning)["be-verb-meaning"] === validL1["be-verb-meaning"],
);
ok("短いが意味あり: canEvaluate", canRequestAiEvaluation("lesson-01-be-verb", {
  ...validL1,
  "negation-rule": "notを使う",
}));
ok('!isMeaningfulCoachAnswer("a")', !isMeaningfulCoachAnswer("a"));
ok("isMeaningfulCoachAnswer 正常", isMeaningfulCoachAnswer("am/is/areの使い分け"));

const q = pickCoachQuestionForLesson("lesson-01-be-verb");
ok("Coach固定質問", q.question.includes("いちばん大事"));
ok("L1 完成まとめ5項目", LESSON01_FINAL_SUMMARY_SECTIONS.length === 5);

const trajectory = Object.entries(validL1)
  .filter(([id]) => !["unclear-choice"].includes(id))
  .map(([id, answer]) => ({ id, label: id, answer }));

const final5 = buildLesson01FinalSummary(
  [
    ...trajectory,
    { id: "usage-am", label: "am", answer: validL1["usage-am"]! },
  ].filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i),
  "am/is/areの使い分けが大事",
);
ok("L1 final 5 items", final5.length === 5);
ok(
  "完成まとめに意味",
  Boolean(final5.find((e) => e.id === "final-l1-basics")?.answer.includes("～です")),
);
ok(
  "完成まとめに使い分け",
  Boolean(final5.find((e) => e.id === "final-l1-basics")?.answer.includes("am")),
);
const onlyPointsChanged = replaceLesson01MyPoints(
  final5,
  "be動詞には am・is・are があり、主語によって使い分ける。",
);
ok(
  "my-points だけ差し替え",
  Boolean(
    onlyPointsChanged.find((e) => e.id === "final-l1-my-points")?.answer.includes("主語によって") &&
      onlyPointsChanged.find((e) => e.id === "final-l1-basics")?.answer ===
        final5.find((e) => e.id === "final-l1-basics")?.answer &&
      onlyPointsChanged.find((e) => e.id === "final-l1-my-example")?.answer ===
        final5.find((e) => e.id === "final-l1-my-example")?.answer,
  ),
);
ok("L1 大事=coach回答", Boolean(final5.find((e) => e.id === "final-l1-my-points")?.answer.includes("am/is/are")));
ok("isLesson01Structured", isLesson01StructuredFinalSummary(final5));
ok("final complete", isFinalSummaryComplete("lesson-01-be-verb", final5));

const readyDraft: LessonRecord = {
  recordId: "t",
  lessonId: "lesson-01-be-verb",
  lessonTitle: "t",
  startedAt: new Date().toISOString(),
  completedAt: null,
  isCompleted: false,
  teachAnswers: [],
  trajectoryEntries: trajectory,
  coachAnswer: "am/is/areの使い分け",
  coachQuestion: q,
  finalSummary: final5,
  feeling: null,
  feelingLabel: null,
  aiEvaluation: { ...buildInsufficientEvaluation(), overallLevel: "understood", overallMessage: "ok" },
};
ok("ready draft", validateLessonReadyForFinalize(readyDraft).ready);

const badCoachDraft = { ...readyDraft, coachAnswer: "a" };
ok("!ready coach a", !validateLessonReadyForFinalize(badCoachDraft).ready);

const draftWithCheck: LessonRecord = {
  ...readyDraft,
  checkQuizState: {
    results: Object.fromEntries(["q1","q2","q3","q4","q5","q6"].map((id) => [id, { answered: true, correct: true }])),
    fillInputs: {},
  },
};
const encountered = collectEncounteredWordIds(1, draftWithCheck);
ok("遭遇語: house なし", !encountered.includes("house"));

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
