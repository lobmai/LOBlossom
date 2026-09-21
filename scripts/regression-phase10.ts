/**
 * Phase10 回帰確認：Lesson4 関係代名詞本編
 * 実行: npx tsx scripts/regression-phase10.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { lesson04CheckQuestions, lesson04Meta } from "../src/data/lesson04";
import { lesson01CheckQuestions } from "../src/data/lesson01";
import { lesson02CheckQuestions } from "../src/data/lesson02";
import { lesson03CheckQuestions } from "../src/data/lesson03";
import { lesson04CoachRubric } from "../src/lib/coach-rubric/lesson04";
import { getCoachRubricForLesson } from "../src/lib/coach-rubric";
import { getSpecialLesson } from "../src/lib/special-lessons/registry";
import {
  getLesson,
  getLessonById,
  getLessonStepPath,
  LESSON_REGISTRY,
} from "../src/lib/lessons/registry";
import { getLessonSteps } from "../src/lib/constants";
import { lesson04SummaryConfig } from "../src/lib/lessons/lesson04-summary";
import { pickCoachQuestionForLesson } from "../src/lib/coach-question-picker";
import { getFixedCoachQuestion } from "../src/lib/coach-teach-question";
import { buildFinalSummary } from "../src/lib/build-final-summary";
import { isSummaryComplete } from "../src/lib/summary-validation";
import { FINAL_MY_SUMMARY_ID, POINTS_ID } from "../src/lib/lessons/types";
import { getSummaryFieldDefinitions } from "../src/lib/summary-fields";
import { checkChoiceAnswer } from "../src/lib/check-answers";
import { resolveAudioRef, FIXED_AUDIO_FILES } from "../src/data/fixed-audio-catalog";
import { getExampleGrammarFocus } from "../src/lib/user-example-check";
import { getMyExampleSentence, getMyPoints } from "../src/lib/my-loop-display";
import { resolveMyPointsSourceKind } from "../src/lib/polish-my-points";
import { detectMissingRubricFollowUp } from "../src/lib/coach-teach-coverage";
import { enforceFollowUpLimitForTest } from "../src/lib/coach-teach-evaluate";
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

const root = process.cwd();

const lesson4 = getLesson(4);
ok("Lesson4 が registry にある", lesson4?.meta.id === "lesson-04-relative-pronoun");
ok("Lesson4 タイトル", lesson4?.meta.title === "関係代名詞ってなに？");
ok("Lesson4 サブタイトル", lesson4?.meta.subtitle === "2つの情報を、1つの文につなげよう");
ok("Lesson4 は中級", lesson4?.meta.levelLabel === "中級");
ok("Lesson4 目安は7分", lesson4?.meta.readingMinutes === 7);
ok("getLessonById で Lesson4 を取得できる", getLessonById("lesson-04-relative-pronoun")?.number === 4);
ok(
  "REGISTRY に 1/2/3/4 がある",
  Boolean(LESSON_REGISTRY[1] && LESSON_REGISTRY[2] && LESSON_REGISTRY[3] && LESSON_REGISTRY[4]),
);

const steps = getLessonSteps(4);
ok("Lesson4 は7Step", steps.length === 7);
ok(
  "Lesson4 Step 順",
  steps.map((s) => s.id).join(",") ===
    "lesson,check,summarize,evaluate,answer,finalize,save",
);
ok("Lesson4 Step1 パス", getLessonStepPath(4, "lesson") === "/lesson/4");
ok("Lesson4 Step2 パス", getLessonStepPath(4, "check") === "/lesson/4/check");
ok("Lesson4 Step7 パス", getLessonStepPath(4, "save") === "/lesson/4/save");

const pages = [
  "src/app/lesson/4/page.tsx",
  "src/app/lesson/4/check/page.tsx",
  "src/app/lesson/4/summarize/page.tsx",
  "src/app/lesson/4/evaluate/page.tsx",
  "src/app/lesson/4/answer/page.tsx",
  "src/app/lesson/4/finalize/page.tsx",
  "src/app/lesson/4/save/page.tsx",
];
for (const p of pages) {
  ok(`page exists: ${p}`, existsSync(join(root, p)));
}
ok(
  "Lesson4 読解コンポーネントがある",
  existsSync(join(root, "src/components/lessons/Lesson04Content.tsx")),
);

ok("Lesson4 理解度テストは7問", lesson04CheckQuestions.length === 7);
ok(
  "Lesson4 check はすべて choice",
  lesson04CheckQuestions.every((q) => q.type === "choice"),
);
ok("Q1 正解は役割", lesson04CheckQuestions[0]?.answer === "前の名詞について、あとから説明を足す");
ok("Q2 は choice", lesson04CheckQuestions[1]?.type === "choice");
ok("Q2 正解は who", lesson04CheckQuestions[1]?.answer === "who");
ok(
  "Q2 の選択肢に that はない",
  !(lesson04CheckQuestions[1]?.options ?? []).includes("that"),
);
ok(
  "Q2 は fill の who-only 穴埋めではない",
  lesson04CheckQuestions[1]?.type !== "fill" &&
    !lesson04CheckQuestions[1]?.question.includes("_____"),
);
ok(
  "Q3 正解は which の文",
  lesson04CheckQuestions[2]?.answer === "This is the book which is interesting.",
);
ok(
  "Q4 正解は that の使い方",
  lesson04CheckQuestions[3]?.answer === "人にもものにも使えることがある",
);
ok(
  "Q5 正解は 2文を1文に",
  lesson04CheckQuestions[4]?.answer === "I know the girl who speaks English.",
);
ok(
  "Q6 正解は元の文に戻して考えるちがい",
  Boolean(
    lesson04CheckQuestions[5]?.answer.includes("英語を話します") &&
      lesson04CheckQuestions[5]?.answer.includes("昨日買いました") &&
      !lesson04CheckQuestions[5]?.answer.includes("who自身"),
  ),
);
ok("Q7 id", lesson04CheckQuestions[6]?.id === "q7");
ok(
  "Q7 正解は She's my teacher",
  lesson04CheckQuestions[6]?.answer === "Yes. She's my teacher.",
);
ok(
  "Q7 は Yes, I have を不正解にする",
  checkChoiceAnswer("Yes. She's my teacher.", lesson04CheckQuestions[6]!) &&
    !checkChoiceAnswer("Yes, I have.", lesson04CheckQuestions[6]!),
);
ok(
  "Q7 は Ken is my teacher を不正解にする",
  !checkChoiceAnswer("Yes. Ken is my teacher.", lesson04CheckQuestions[6]!),
);

ok("Step3 meaningFields が2つ", (lesson04SummaryConfig.meaningFields ?? []).length === 2);
ok("Step3 usageFields が1つ", lesson04SummaryConfig.usageFields.length === 1);
ok("Step3 extraFields は空", lesson04SummaryConfig.extraFields.length === 0);
ok(
  "Step3 はポイント欄を含まない",
  lesson04SummaryConfig.includePointsInTrajectory === false,
);
ok(
  "L4 My Loop points 原文は Step5",
  lesson04SummaryConfig.myPointsSource === "step5-answers" &&
    resolveMyPointsSourceKind(lesson04SummaryConfig) === "step5-answers",
);
ok(
  "Step3 フィールド定義に points がない",
  getSummaryFieldDefinitions(lesson04Meta.id).every((f) => f.id !== POINTS_ID),
);
ok(
  "Step3 finalize は final-my-summary のみ",
  lesson04SummaryConfig.finalSummarySections.length === 1 &&
    lesson04SummaryConfig.finalSummarySections[0]?.id === FINAL_MY_SUMMARY_ID,
);

const goodEntries = {
  "rp-meaning": "前の名詞をあとから説明する",
  "rp-who-which-that": "人は who、ものは which、that は両方に使えることがある",
  "rp-subject-object": "who のあとは動詞、that I bought は別の人が動作している",
  "unclear-choice": "none",
  "user-example": "I have a friend who lives in Tokyo.",
};
ok("Step3 完成判定が通る", isSummaryComplete(lesson04Meta.id, goodEntries));
ok(
  "Step3 は points なしでも完成できる",
  isSummaryComplete(lesson04Meta.id, goodEntries) && !("points" in goodEntries),
);

const picked = pickCoachQuestionForLesson(lesson04Meta.id);
ok(
  "Step5 固定質問が正しい",
  picked.question ===
    "今回のレッスンで、いちばん大事だと思ったことは何？教えて！",
);
ok(
  "Step5 ヒント",
  ["who", "which", "that", "説明する", "2つの文"].every((h) =>
    lesson04SummaryConfig.teachQuestion.hints.includes(h),
  ),
);
ok(
  "getFixedCoachQuestion が Lesson4 に対応",
  getFixedCoachQuestion(lesson04Meta.id).question === picked.question,
);

ok("Lesson4 rubric lessonId", lesson04CoachRubric.lessonId === lesson04Meta.id);
ok(
  "Lesson4 rubric 4点",
  lesson04CoachRubric.points.map((p) => p.id).join(",") ===
    "relative-explains,who-which-that,two-sentences,subject-vs-object",
);
ok(
  "Step5 からも Lesson4 rubric を参照できる",
  getCoachRubricForLesson("lesson-04-relative-pronoun")?.lessonId ===
    "lesson-04-relative-pronoun",
);
ok(
  "Lesson4 evaluate prompt は専用",
  Boolean(
    lesson4?.coach.evaluateSystemPrompt.includes("関係代名詞") &&
      lesson4.coach.evaluateSystemPrompt.includes("who") &&
      !lesson4.coach.evaluateSystemPrompt.includes("現在完了レッスンを自分の言葉"),
  ),
);
ok(
  "evaluate prompt に迷ったら that はない",
  Boolean(lesson4?.coach.evaluateSystemPrompt.includes("「迷ったら that」とは教えない")),
);
ok(
  "Lesson4 finalize は final-my-summary 指示",
  Boolean(lesson4?.coach.finalizeInstructions.includes("final-my-summary")),
);

const vague = detectMissingRubricFollowUp(
  lesson04CoachRubric,
  ["関係代名詞を使う"],
  { isInitialAnswer: true },
);
ok(
  "曖昧回答なら Lesson4 follow-up 候補がある",
  vague != null &&
    ["relative-explains", "who-which-that", "two-sentences", "subject-vs-object"].includes(
      vague.pointId,
    ),
);

const limited = enforceFollowUpLimitForTest(
  {
    outcome: "followup",
    paraphrase: null,
    closingMessage: null,
    followUpQuestion: "もう一度教えて？",
    targetRubricPointId: "who-which-that",
    teachContent: null,
  },
  1,
  new Set(lesson04CoachRubric.points.map((p) => p.id)),
);
ok("follow-up 最大1回が維持される", limited.outcome !== "followup");

const fallback = buildFinalSummary(lesson04Meta.id, [], null);
ok(
  "Lesson4 finalize fallback は1項目",
  fallback.length === 1 && fallback[0]?.id === FINAL_MY_SUMMARY_ID,
);
ok(
  "Lesson4 fallback に関係代名詞がある",
  Boolean(fallback[0]?.answer.includes("関係代名詞")),
);
ok(
  "Lesson4 fallback に迷ったら that はない",
  !fallback[0]?.answer.includes("迷ったら"),
);
ok(
  "Lesson4 fallback に主格・目的格・先行詞はない",
  !fallback[0]?.answer.includes("主格") &&
    !fallback[0]?.answer.includes("目的格") &&
    !fallback[0]?.answer.includes("先行詞") &&
    !fallback[0]?.answer.includes("文の構造"),
);

ok(
  "自作例文 grammar focus がある",
  getExampleGrammarFocus(lesson04Meta.id)?.includes("関係代名詞") === true,
);

function baseRecord(extra: Partial<LessonRecord> = {}): LessonRecord {
  return {
    recordId: "t",
    lessonId: lesson04Meta.id,
    lessonTitle: lesson04Meta.title,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    isCompleted: true,
    teachAnswers: [],
    trajectoryEntries: [
      {
        id: "user-example",
        label: "例文",
        answer: "I have a friend who lives in Tokyo.",
      },
    ],
    coachAnswer: "前の名詞を説明することが大事",
    coachQuestion: null,
    finalSummary: [
      { id: FINAL_MY_SUMMARY_ID, label: "レッスンの要約", answer: "・関係代名詞の要約" },
    ],
    feeling: "got-it",
    feelingLabel: "わかった！",
    aiEvaluation: null,
    ...extra,
  };
}

ok(
  "My Loop は myPointsFinal を優先",
  getMyPoints(baseRecord({ myPointsFinal: "who で人を説明できることが大事。" })) ===
    "who で人を説明できることが大事。",
);
ok(
  "myPointsFinal が空なら coachAnswer にフォールバック",
  getMyPoints(baseRecord({ myPointsFinal: null })) === "前の名詞を説明することが大事",
);
ok(
  "My Loop 例文は Step3 原文",
  getMyExampleSentence(baseRecord()) === "I have a friend who lives in Tokyo.",
);
ok(
  "My Loop 例文は userExampleFinal を優先",
  getMyExampleSentence(
    baseRecord({ userExampleFinal: "This is the book which I like." }),
  ) === "This is the book which I like.",
);

const bodyRefs = [
  "lesson4.body.01",
  "lesson4.body.02",
  "lesson4.body.03",
  "lesson4.body.04",
  "lesson4.body.05",
  "lesson4.body.06",
  "lesson4.body.07",
  "lesson4.body.08",
  "lesson4.body.09",
] as const;
for (const ref of bodyRefs) {
  const resolved = resolveAudioRef(ref);
  ok(`${ref} が解決する`, Boolean(resolved?.url.startsWith("/audio/lesson4/")));
}
for (const q of lesson04CheckQuestions) {
  const resolved = resolveAudioRef(`lesson4.check.${q.id}`);
  ok(
    `lesson4.check.${q.id} が解決する`,
    resolved?.text === q.exampleSentence,
  );
}

const l4Files = FIXED_AUDIO_FILES.filter((f) => f.lessonKey === "lesson4");
ok("Lesson4 固有ファイルは9件", l4Files.length === 9);
ok(
  "Q7 音声は本文の質問文を再利用",
  resolveAudioRef("lesson4.check.q7")?.fileId ===
    resolveAudioRef("lesson4.body.09")?.fileId,
);

ok("Lesson4 Special がある", getSpecialLesson(4)?.id === "lesson-04-special");
ok("L1 タイトルは維持", getLesson(1)?.meta.title === "be動詞ってなに？");
ok("L2 タイトルは維持", getLesson(2)?.meta.title === "一般動詞ってなに？");
ok("L3 タイトルは維持", getLesson(3)?.meta.title === "現在完了ってなに？");
ok("L1 は7問のまま", lesson01CheckQuestions.length === 7);
ok("L2 は7問のまま", lesson02CheckQuestions.length === 7);
ok("L3 は7問のまま", lesson03CheckQuestions.length === 7);
ok("L1 Q7 正解は維持", lesson01CheckQuestions[6]?.answer === "Yes, I am.");
ok("L2 Q7 正解は維持", lesson02CheckQuestions[6]?.answer === "Yes, I do.");
ok("L3 Q7 正解は維持", lesson03CheckQuestions[6]?.answer === "Yes, I have.");
ok("L1/L2 の levelLabel は未設定のまま", !getLesson(1)?.meta.levelLabel && !getLesson(2)?.meta.levelLabel);
ok(
  "L1 evaluate prompt は変更されていない",
  Boolean(getLesson(1)?.coach.evaluateSystemPrompt.includes("be動詞")),
);
ok(
  "L2 evaluate prompt は変更されていない",
  Boolean(getLesson(2)?.coach.evaluateSystemPrompt.includes("一般動詞")),
);
ok(
  "L3 evaluate prompt は変更されていない",
  Boolean(getLesson(3)?.coach.evaluateSystemPrompt.includes("現在完了")),
);
ok("Lesson3 Special がある", getSpecialLesson(3)?.id === "lesson-03-special");

const contentSrc = readFileSync(
  join(root, "src/components/lessons/Lesson04Content.tsx"),
  "utf8",
);
ok(
  "読解に 2文→1文 がある",
  contentSrc.includes("I know the girl") &&
    contentSrc.includes("who speaks English") &&
    contentSrc.includes("She speaks English."),
);
ok("読解に who / which / that がある", contentSrc.includes("which") && contentSrc.includes("that"));
ok("読解に迷ったら that はない", !contentSrc.includes("迷ったら"));
ok(
  "冒頭図は3段階",
  contentSrc.includes("who / which / that でつなぐ") &&
    contentSrc.includes("1つの文になる") &&
    !contentSrc.includes("同じ人・ものを見つける"),
);
ok("読解に主格・目的格はない", !contentSrc.includes("主格") && !contentSrc.includes("目的格"));
ok("読解に先行詞はない", !contentSrc.includes("先行詞"));
ok(
  "読解に省略の詳しい説明はない",
  !contentSrc.includes("This is the book I bought yesterday."),
);
ok("読解に同じ人だねはない", !contentSrc.includes("同じ人だね") && !contentSrc.includes("同じものだね"));
ok(
  "読解に置き換え手順の説明はない",
  !contentSrc.includes("She を who に変える") &&
    !contentSrc.includes("it を that に変える"),
);
ok(
  "Q7 は会話の意味理解",
  Boolean(lesson04CheckQuestions[6]?.question.includes("who is talking to Ken")),
);

const l3Content = readFileSync(
  join(root, "src/components/lessons/Lesson03Content.tsx"),
  "utf8",
);
ok("Lesson3 本文は維持", l3Content.includes("I have lost my key."));

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
