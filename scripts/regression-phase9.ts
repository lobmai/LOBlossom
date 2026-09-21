/**
 * Phase9 回帰確認：Lesson3 現在完了本編
 * 実行: npx tsx scripts/regression-phase9.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { lesson03CheckQuestions, lesson03Meta } from "../src/data/lesson03";
import { lesson03CoachRubric } from "../src/lib/coach-rubric/lesson03";
import { lesson01SpecialConfig } from "../src/data/special/lesson01-vocab";
import { lesson02SpecialConfig } from "../src/data/special/lesson02-vocab";
import { buildSpecialQuestions } from "../src/lib/special-lessons/build-questions";
import { getSpecialLesson } from "../src/lib/special-lessons/registry";
import {
  getLesson,
  getLessonById,
  getLessonStepPath,
  LESSON_REGISTRY,
} from "../src/lib/lessons/registry";
import { getLessonSteps } from "../src/lib/constants";
import { lesson03SummaryConfig } from "../src/lib/lessons/lesson03-summary";
import { pickCoachQuestionForLesson } from "../src/lib/coach-question-picker";
import { getFixedCoachQuestion } from "../src/lib/coach-teach-question";
import { buildFinalSummary } from "../src/lib/build-final-summary";
import { isSummaryComplete } from "../src/lib/summary-validation";
import { FINAL_MY_SUMMARY_ID } from "../src/lib/lessons/types";
import {
  detectMissingRubricFollowUp,
} from "../src/lib/coach-teach-coverage";
import {
  buildTeachEvaluateInput,
  enforceFollowUpLimitForTest,
} from "../src/lib/coach-teach-evaluate";

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

const root = process.cwd();

// --- Registry / meta ---
const lesson3 = getLesson(3);
ok("Lesson3 が registry にある", lesson3?.meta.id === "lesson-03-present-perfect");
ok("Lesson3 タイトル", lesson3?.meta.title === "現在完了ってなに？");
ok("Lesson3 は中級", lesson3?.meta.levelLabel === "中級");
ok("L1/L2 の levelLabel は未設定のまま", !getLesson(1)?.meta.levelLabel && !getLesson(2)?.meta.levelLabel);
ok("getLessonById で Lesson3 を取得できる", getLessonById("lesson-03-present-perfect")?.number === 3);
ok("REGISTRY に 1/2/3 がある", Boolean(LESSON_REGISTRY[1] && LESSON_REGISTRY[2] && LESSON_REGISTRY[3]));

// --- 7 steps ---
const steps = getLessonSteps(3);
ok("Lesson3 は7Step", steps.length === 7);
ok(
  "Lesson3 Step 順",
  steps.map((s) => s.id).join(",") ===
    "lesson,check,summarize,evaluate,answer,finalize,save",
);
ok("Lesson3 Step1 パス", getLessonStepPath(3, "lesson") === "/lesson/3");
ok("Lesson3 Step2 パス", getLessonStepPath(3, "check") === "/lesson/3/check");
ok("Lesson3 Step7 パス", getLessonStepPath(3, "save") === "/lesson/3/save");

const pages = [
  "src/app/lesson/3/page.tsx",
  "src/app/lesson/3/check/page.tsx",
  "src/app/lesson/3/summarize/page.tsx",
  "src/app/lesson/3/evaluate/page.tsx",
  "src/app/lesson/3/answer/page.tsx",
  "src/app/lesson/3/finalize/page.tsx",
  "src/app/lesson/3/save/page.tsx",
];
for (const p of pages) {
  ok(`page exists: ${p}`, existsSync(join(root, p)));
}
ok(
  "Lesson3 読解コンポーネントがある",
  existsSync(join(root, "src/components/lessons/Lesson03Content.tsx")),
);

// --- Check quiz ---
ok("Lesson3 理解度テストは7問", lesson03CheckQuestions.length === 7);
ok(
  "Q1 は基本形",
  lesson03CheckQuestions[0]?.answer === "have / has + 過去分詞",
);
ok(
  "Q2 は has の穴埋め",
  lesson03CheckQuestions[1]?.type === "fill" &&
    lesson03CheckQuestions[1]?.answer === "has",
);
ok(
  "Q6 は過去形との違い",
  Boolean(lesson03CheckQuestions[5]?.question.includes("I lost my key.")),
);
ok(
  "Q7 は Have you ever been to Kyoto? の返事",
  lesson03CheckQuestions[6]?.id === "q7" &&
    lesson03CheckQuestions[6]?.answer === "Yes, I have.",
);
ok(
  "Lesson3 check に並べ替えはない",
  lesson03CheckQuestions.every((q) => q.type !== "reorder"),
);

// --- Summary / Step3 ---
ok(
  "Step3 meaningFields が2つ",
  (lesson03SummaryConfig.meaningFields ?? []).length === 2,
);
ok("Step3 usageFields が1つ", lesson03SummaryConfig.usageFields.length === 1);
ok("Step3 extraFields が1つ", lesson03SummaryConfig.extraFields.length === 1);
ok(
  "Step3 はポイント欄を含まない",
  lesson03SummaryConfig.includePointsInTrajectory === false,
);
ok(
  "L3 My Loop points 原文は Step5",
  lesson03SummaryConfig.myPointsSource === "step5-answers",
);
ok(
  "Step3 finalize は final-my-summary のみ",
  lesson03SummaryConfig.finalSummarySections.length === 1 &&
    lesson03SummaryConfig.finalSummarySections[0]?.id === FINAL_MY_SUMMARY_ID,
);

const goodEntries = {
  "pp-meaning": "過去のことと今のつながりを表す",
  "past-vs-pp": "過去形は過去だけ、現在完了は今へのつながりもある",
  "three-uses": "経験・完了・継続。どれも過去と今がつながる",
  "have-has-rule": "I/you/we/they は have、he/she/it は has",
  "unclear-choice": "none",
  "user-example": "I have eaten sushi.",
};
ok(
  "Step3 完成判定が通る",
  isSummaryComplete(lesson03Meta.id, goodEntries),
);
ok(
  "Step3 は points なしでも完成できる",
  isSummaryComplete(lesson03Meta.id, goodEntries) && !("points" in goodEntries),
);

// --- Step5 question ---
const picked = pickCoachQuestionForLesson(lesson03Meta.id);
ok(
  "Step5 固定質問が正しい",
  picked.question ===
    "今回のレッスンで、いちばん大事だと思ったことは何？教えて！",
);
ok(
  "Step5 ヒントに過去と今のつながりがある",
  lesson03SummaryConfig.teachQuestion.hints.includes("過去と今のつながり"),
);
ok(
  "getFixedCoachQuestion が Lesson3 に対応",
  getFixedCoachQuestion(lesson03Meta.id).question.length > 0,
);

// --- Rubric / AI prompts ---
ok("Lesson3 rubric lessonId", lesson03CoachRubric.lessonId === lesson03Meta.id);
ok("Lesson3 rubric に過去形との違いがある", Boolean(
  lesson03CoachRubric.points.find((p) => p.id === "past-vs-present-perfect"),
));
ok(
  "Lesson3 evaluate prompt は専用",
  Boolean(
    lesson3?.coach.evaluateSystemPrompt.includes("現在完了") &&
      lesson3.coach.evaluateSystemPrompt.includes("過去形") &&
      !lesson3.coach.evaluateSystemPrompt.includes("一般動詞の理解を確認"),
  ),
);
ok(
  "Lesson3 finalize は final-my-summary 指示",
  Boolean(lesson3?.coach.finalizeInstructions.includes("final-my-summary")),
);
ok(
  "L1 evaluate prompt は変更されていない",
  Boolean(getLesson(1)?.coach.evaluateSystemPrompt.includes("be動詞")),
);
ok(
  "L2 evaluate prompt は変更されていない",
  Boolean(getLesson(2)?.coach.evaluateSystemPrompt.includes("一般動詞")),
);

const vague = detectMissingRubricFollowUp(
  lesson03CoachRubric,
  ["have と過去分詞を使う"],
  { isInitialAnswer: true },
);
ok(
  "曖昧回答なら Lesson3 follow-up 候補がある",
  vague != null &&
    [
      "pp-connection",
      "past-vs-present-perfect",
      "three-uses",
      "have-has",
      "form-have-pp",
    ].includes(vague.pointId),
);

const pastVsPrompt = lesson03CoachRubric.points.find(
  (p) => p.id === "past-vs-present-perfect",
)?.coachQuestion;
ok(
  "過去形との違い follow-up 質問がある",
  pastVsPrompt === "現在完了と過去形って、何が違うの？",
);

const limited = enforceFollowUpLimitForTest(
  {
    outcome: "followup",
    paraphrase: null,
    closingMessage: null,
    followUpQuestion: "もう一度教えて？",
    targetRubricPointId: "past-vs-present-perfect",
    teachContent: null,
  },
  1,
  new Set(lesson03CoachRubric.points.map((p) => p.id)),
);
ok("follow-up 最大1回が維持される", limited.outcome !== "followup");

const l3Input = buildTeachEvaluateInput({
  lessonId: lesson03Meta.id,
  initialQuestion: picked.question,
  userAnswer: "過去と今のつながりがいちばん大事",
  followUpCount: 0,
  conversationHistory: [],
  isFollowUpAnswer: false,
});
ok(
  "Lesson3 teach-evaluate input に現在完了基準がある",
  l3Input.includes("現在完了") || l3Input.includes("評価基準"),
);

// --- Finalize L2-type ---
const fallback = buildFinalSummary(lesson03Meta.id, [], null);
ok(
  "Lesson3 finalize fallback は1項目",
  fallback.length === 1 && fallback[0]?.id === FINAL_MY_SUMMARY_ID,
);
ok(
  "Lesson3 finalize fallback につながりがある",
  Boolean(fallback[0]?.answer.includes("つながり")),
);

const finalizeSrc = readFileSync(join(root, "src/components/FinalizeForm.tsx"), "utf8");
ok(
  "FinalizeForm の L1 専用分岐は lesson-01 のまま",
  finalizeSrc.includes('lessonId === "lesson-01-be-verb"') &&
    !finalizeSrc.includes("lesson-03-present-perfect"),
);

// --- Special / L1 L2 protection ---
ok("Lesson3 Special がある", getSpecialLesson(3)?.id === "lesson-03-special");
ok(
  "L1 Special は7問のまま",
  buildSpecialQuestions(lesson01SpecialConfig).length === 7,
);
ok(
  "L2 Special は5問のまま",
  buildSpecialQuestions(lesson02SpecialConfig).length === 5,
);

const contentSrc = readFileSync(
  join(root, "src/components/lessons/Lesson03Content.tsx"),
  "utf8",
);
ok("読解に I lost my key がある", contentSrc.includes("I lost my key."));
ok("読解に I have lost my key がある", contentSrc.includes("I have lost my key."));
ok("読解に経験・完了・継続がある", contentSrc.includes("経験") && contentSrc.includes("完了") && contentSrc.includes("継続"));

const selectSrc = readFileSync(join(root, "src/components/LessonSelectCard.tsx"), "utf8");
ok("選択カードが levelLabel を表示する", selectSrc.includes("levelLabel"));

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
