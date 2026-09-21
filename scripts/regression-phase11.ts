/**
 * Phase11 回帰確認：Lesson5 仮定法 本編
 * 実行: npx tsx scripts/regression-phase11.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { lesson05CheckQuestions, lesson05Meta } from "../src/data/lesson05";
import { lesson01CheckQuestions } from "../src/data/lesson01";
import { lesson02CheckQuestions } from "../src/data/lesson02";
import { lesson03CheckQuestions } from "../src/data/lesson03";
import { lesson04CheckQuestions } from "../src/data/lesson04";
import { lesson05CoachRubric } from "../src/lib/coach-rubric/lesson05";
import {
  getCoachRubricByLessonNumber,
  getCoachRubricForLesson,
} from "../src/lib/coach-rubric";
import { getRubricForLesson } from "../src/lib/coach-teach-hints";
import { getSpecialLesson } from "../src/lib/special-lessons/registry";
import {
  getLesson,
  getLessonById,
  getLessonStepPath,
  LESSON_REGISTRY,
} from "../src/lib/lessons/registry";
import { getLessonSteps } from "../src/lib/constants";
import { lesson05SummaryConfig } from "../src/lib/lessons/lesson05-summary";
import { pickCoachQuestionForLesson } from "../src/lib/coach-question-picker";
import { getFixedCoachQuestion } from "../src/lib/coach-teach-question";
import { buildFinalSummary } from "../src/lib/build-final-summary";
import { isSummaryComplete } from "../src/lib/summary-validation";
import { FINAL_MY_SUMMARY_ID, POINTS_ID } from "../src/lib/lessons/types";
import { getSummaryFieldDefinitions } from "../src/lib/summary-fields";
import { checkChoiceAnswer } from "../src/lib/check-answers";
import {
  FIXED_AUDIO_FILES,
  resolveAudioRef,
} from "../src/data/fixed-audio-catalog";
import {
  buildUserExampleCheckInstructions,
  getExampleGrammarFocus,
} from "../src/lib/user-example-check";
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

const lesson5 = getLesson(5);
ok("Lesson5 が registry にある", lesson5?.meta.id === "lesson-05-subjunctive");
ok("Lesson5 タイトル", lesson5?.meta.title === "仮定法ってなに？");
ok(
  "Lesson5 サブタイトル",
  lesson5?.meta.subtitle === "現実とは違うことを、想像して話そう",
);
ok("Lesson5 は中級", lesson5?.meta.levelLabel === "中級");
ok("Lesson5 目安は7分", lesson5?.meta.readingMinutes === 7);
ok(
  "getLessonById で Lesson5 を取得できる",
  getLessonById("lesson-05-subjunctive")?.number === 5,
);
ok(
  "REGISTRY に 1/2/3/4/5 がある",
  Boolean(
    LESSON_REGISTRY[1] &&
      LESSON_REGISTRY[2] &&
      LESSON_REGISTRY[3] &&
      LESSON_REGISTRY[4] &&
      LESSON_REGISTRY[5],
  ),
);

const steps = getLessonSteps(5);
ok("Lesson5 は7Step", steps.length === 7);
ok(
  "Lesson5 Step 順",
  steps.map((s) => s.id).join(",") ===
    "lesson,check,summarize,evaluate,answer,finalize,save",
);
ok("Lesson5 Step1 パス", getLessonStepPath(5, "lesson") === "/lesson/5");
ok("Lesson5 Step2 パス", getLessonStepPath(5, "check") === "/lesson/5/check");
ok("Lesson5 Step7 パス", getLessonStepPath(5, "save") === "/lesson/5/save");

const pages = [
  "src/app/lesson/5/page.tsx",
  "src/app/lesson/5/check/page.tsx",
  "src/app/lesson/5/summarize/page.tsx",
  "src/app/lesson/5/evaluate/page.tsx",
  "src/app/lesson/5/answer/page.tsx",
  "src/app/lesson/5/finalize/page.tsx",
  "src/app/lesson/5/save/page.tsx",
];
for (const p of pages) {
  ok(`page exists: ${p}`, existsSync(join(root, p)));
}
ok(
  "Lesson5 読解コンポーネントがある",
  existsSync(join(root, "src/components/lessons/Lesson05Content.tsx")),
);
ok(
  "Lesson5 Special ページがある",
  existsSync(join(root, "src/app/lesson/5/special/page.tsx")),
);

ok("Lesson5 理解度テストは7問", lesson05CheckQuestions.length === 7);
ok(
  "Lesson5 check はすべて choice",
  lesson05CheckQuestions.every((q) => q.type === "choice"),
);
ok(
  "Q1 正解は想像する",
  lesson05CheckQuestions[0]?.answer ===
    "現実とは違うことや、実際にはそうではないことを想像する",
);
ok(
  "Q2 正解は今はお金持ちではない想像",
  lesson05CheckQuestions[1]?.answer ===
    "今はお金持ちではないけれど、もしそうだったら、という想像",
);
ok(
  "Q3 正解は If + 過去形, would + 原形",
  lesson05CheckQuestions[2]?.answer === "If + 過去形, would + 動詞の原形",
);
ok(
  "Q4 正解は If I were you",
  lesson05CheckQuestions[3]?.answer === "If I were you, I would talk to her.",
);
ok(
  "Q4 の選択肢に If I was you はない",
  !(lesson05CheckQuestions[3]?.options ?? []).some((o) =>
    o.toLowerCase().includes("if i was you"),
  ),
);
ok(
  "Q5 正解は If I had more time",
  lesson05CheckQuestions[4]?.answer ===
    "If I had more time, I would study English.",
);
ok("Q6 正解は今は答えを知らない", lesson05CheckQuestions[5]?.answer === "今は答えを知らない");
ok(
  "Q7 正解は助言",
  lesson05CheckQuestions[6]?.answer ===
    "もし自分があなただったら話しかけると思う、という助言",
);
ok(
  "Q7 解説に If I were you の助言がある",
  Boolean(lesson05CheckQuestions[6]?.explanation.includes("If I were you")),
);

for (const q of lesson05CheckQuestions) {
  ok(
    `${q.id} は choice 正解が通る`,
    q.type === "choice" && checkChoiceAnswer(q.answer, q),
  );
}

ok("Step3 meaningFields が2つ", (lesson05SummaryConfig.meaningFields ?? []).length === 2);
ok("Step3 usageFields が1つ", lesson05SummaryConfig.usageFields.length === 1);
ok("Step3 extraFields は空", lesson05SummaryConfig.extraFields.length === 0);
ok(
  "Step3 はポイント欄を含まない",
  lesson05SummaryConfig.includePointsInTrajectory === false,
);
ok(
  "L5 My Loop points 原文は Step5",
  lesson05SummaryConfig.myPointsSource === "step5-answers" &&
    resolveMyPointsSourceKind(lesson05SummaryConfig) === "step5-answers",
);
ok(
  "Step3 フィールド定義に points がない",
  getSummaryFieldDefinitions(lesson05Meta.id).every((f) => f.id !== POINTS_ID),
);
ok(
  "Step3 に大事だと思ったことの入力欄がない",
  !getSummaryFieldDefinitions(lesson05Meta.id).some(
    (f) =>
      f.id === POINTS_ID ||
      f.label.includes("大事だと思ったこと") ||
      f.label.includes("いちばん大事"),
  ),
);
ok(
  "Step3 finalize は final-my-summary のみ",
  lesson05SummaryConfig.finalSummarySections.length === 1 &&
    lesson05SummaryConfig.finalSummarySections[0]?.id === FINAL_MY_SUMMARY_ID,
);

const goodEntries = {
  "hypo-meaning": "現実とは違うことを想像する",
  "hypo-past-not-time": "今とは違う想像だから",
  "hypo-if-would": "if側は想像の条件、would側は想像の結果",
  "unclear-choice": "none",
  "user-example": "If I had more time, I would travel more.",
};
ok("Step3 完成判定が通る", isSummaryComplete(lesson05Meta.id, goodEntries));
ok(
  "Step3 は points なしでも完成できる",
  isSummaryComplete(lesson05Meta.id, goodEntries) && !("points" in goodEntries),
);

const picked = pickCoachQuestionForLesson(lesson05Meta.id);
ok(
  "Step5 固定質問が正しい",
  picked.question ===
    "今回のレッスンで、いちばん大事だと思ったことは何？教えて！",
);
ok(
  "Step5 ヒント",
  ["if", "過去形", "would", "想像", "現実"].every((h) =>
    lesson05SummaryConfig.teachQuestion.hints.includes(h),
  ),
);
ok(
  "getFixedCoachQuestion が Lesson5 に対応",
  getFixedCoachQuestion(lesson05Meta.id).question === picked.question,
);

ok("Lesson5 rubric lessonId", lesson05CoachRubric.lessonId === lesson05Meta.id);
ok(
  "Lesson5 rubric 4点",
  lesson05CoachRubric.points.map((p) => p.id).join(",") ===
    "hypothetical-meaning,past-not-past-time,if-past,would-base",
);
ok(
  "could は mustUnderstand に入っていない",
  !lesson05CoachRubric.points.some((p) =>
    p.mustUnderstand.some((m) => m.toLowerCase().includes("could")),
  ),
);

const fromRegistry = lesson5?.coach.rubric ?? null;
const fromStep5 = getCoachRubricForLesson("lesson-05-subjunctive");
const fromNumber = getCoachRubricByLessonNumber(5);
const fromTeach = getRubricForLesson("lesson-05-subjunctive");
ok("Step4 registry rubric が null ではない", fromRegistry != null);
ok("Step5 getCoachRubricForLesson が null ではない", fromStep5 != null);
ok(
  "Step4 と Step5 は同じ Lesson5 rubric オブジェクト",
  fromRegistry === lesson05CoachRubric &&
    fromStep5 === lesson05CoachRubric &&
    fromNumber === lesson05CoachRubric &&
    fromTeach === lesson05CoachRubric,
);

ok(
  "Lesson5 evaluate prompt は専用",
  Boolean(
    lesson5?.coach.evaluateSystemPrompt.includes("仮定法") &&
      lesson5.coach.evaluateSystemPrompt.includes("現実とは違う") &&
      !lesson5.coach.evaluateSystemPrompt.includes("関係代名詞レッスンを自分の言葉"),
  ),
);
ok(
  "evaluate prompt は if=いつでも過去形 を教えない",
  Boolean(
    lesson5?.coach.evaluateSystemPrompt.includes("「if の後ろはいつでも過去形」とは教えない"),
  ),
);
ok(
  "Lesson5 finalize は final-my-summary 指示",
  Boolean(lesson5?.coach.finalizeInstructions.includes("final-my-summary")),
);

const vague = detectMissingRubricFollowUp(
  lesson05CoachRubric,
  ["仮定法を使う"],
  { isInitialAnswer: true },
);
ok(
  "曖昧回答なら Lesson5 follow-up 候補がある",
  vague != null &&
    ["hypothetical-meaning", "past-not-past-time", "if-past", "would-base"].includes(
      vague.pointId,
    ),
);

const followUpQuestions = lesson05CoachRubric.points.map((p) => p.coachQuestion);
ok(
  "深掘り候補：過去形でも昔とは限らない",
  followUpQuestions.includes("どうして過去形なのに、昔の話とは限らないの？"),
);
ok(
  "深掘り候補：if と would の役割",
  followUpQuestions.includes("if の部分と would の部分は、それぞれ何を表している？"),
);
ok(
  "深掘り候補：今本当にお金持ちか",
  followUpQuestions.includes("If I were rich... って言った人は、今本当にお金持ちなのかな？"),
);

const limited = enforceFollowUpLimitForTest(
  {
    outcome: "followup",
    paraphrase: null,
    closingMessage: null,
    followUpQuestion: "もう一度教えて？",
    targetRubricPointId: "past-not-past-time",
    teachContent: null,
  },
  1,
  new Set(lesson05CoachRubric.points.map((p) => p.id)),
);
ok("follow-up 最大1回が維持される", limited.outcome !== "followup");

const fallback = buildFinalSummary(lesson05Meta.id, [], null);
ok(
  "Lesson5 finalize fallback は1項目",
  fallback.length === 1 && fallback[0]?.id === FINAL_MY_SUMMARY_ID,
);
ok(
  "Lesson5 fallback に仮定法がある",
  Boolean(fallback[0]?.answer.includes("仮定法")),
);
ok(
  "Lesson5 fallback に if=いつでも過去形 はない",
  !fallback[0]?.answer.includes("いつでも過去形"),
);

ok(
  "自作例文 grammar focus がある",
  getExampleGrammarFocus(lesson05Meta.id)?.includes("仮定法") === true,
);
ok(
  "自作例文チェック指示に Lesson5 文法がつながる",
  buildUserExampleCheckInstructions(
    lesson05Meta.id,
    "If I had more time, I would travel more.",
  ).includes("仮定法"),
);

function baseRecord(extra: Partial<LessonRecord> = {}): LessonRecord {
  return {
    recordId: "t",
    lessonId: lesson05Meta.id,
    lessonTitle: lesson05Meta.title,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    isCompleted: true,
    teachAnswers: [],
    trajectoryEntries: [
      {
        id: "user-example",
        label: "例文",
        answer: "If I had more time, I would travel more.",
      },
    ],
    coachAnswer: "現実とは違う想像をすることが大事",
    coachQuestion: null,
    finalSummary: [
      { id: FINAL_MY_SUMMARY_ID, label: "レッスンの要約", answer: "・仮定法の要約" },
    ],
    feeling: "got-it",
    feelingLabel: "わかった！",
    aiEvaluation: null,
    ...extra,
  };
}

ok(
  "My Loop は myPointsFinal を優先",
  getMyPoints(baseRecord({ myPointsFinal: "過去形でも昔の話とは限らない。" })) ===
    "過去形でも昔の話とは限らない。",
);
ok(
  "myPointsFinal が空なら coachAnswer にフォールバック",
  getMyPoints(baseRecord({ myPointsFinal: null })) ===
    "現実とは違う想像をすることが大事",
);
ok(
  "My Loop 例文は Step3 原文",
  getMyExampleSentence(baseRecord()) === "If I had more time, I would travel more.",
);
ok(
  "My Loop 例文は userExampleFinal を優先",
  getMyExampleSentence(
    baseRecord({ userExampleFinal: "If I were rich, I would travel more." }),
  ) === "If I were rich, I would travel more.",
);

const saveSrc = readFileSync(join(root, "src/app/lesson/5/save/page.tsx"), "utf8");
ok("Step7 は既存 SaveForm を使う", saveSrc.includes("SaveForm"));
const finalizeSrc = readFileSync(
  join(root, "src/app/lesson/5/finalize/page.tsx"),
  "utf8",
);
ok("Step6 は既存 FinalizeForm を使う", finalizeSrc.includes("FinalizeForm"));
const answerSrc = readFileSync(join(root, "src/app/lesson/5/answer/page.tsx"), "utf8");
ok("Step5 は既存 AnswerCoach を使う", answerSrc.includes("AnswerCoach"));
const evaluateSrc = readFileSync(
  join(root, "src/app/lesson/5/evaluate/page.tsx"),
  "utf8",
);
ok("Step4 は既存 EvaluateCoach を使う", evaluateSrc.includes("EvaluateCoach"));

const bodyRefs = [
  "lesson5.body.01",
  "lesson5.body.02",
  "lesson5.body.03",
  "lesson5.body.04",
  "lesson5.body.05",
  "lesson5.body.06",
  "lesson5.body.07",
  "lesson5.body.08",
  "lesson5.body.09",
  "lesson5.body.10",
  "lesson5.body.11",
] as const;
for (const ref of bodyRefs) {
  const resolved = resolveAudioRef(ref);
  ok(
    `${ref} が解決する`,
    Boolean(resolved?.url.startsWith("/audio/lesson5/") && resolved.lessonKey === "lesson5"),
  );
}
for (const q of lesson05CheckQuestions) {
  const resolved = resolveAudioRef(`lesson5.check.${q.id}`);
  ok(
    `lesson5.check.${q.id} が解決する`,
    resolved?.text === q.exampleSentence,
  );
}

const l5Files = FIXED_AUDIO_FILES.filter((f) => f.lessonKey === "lesson5");
ok("Lesson5 固有ファイルは11件", l5Files.length === 11);
ok(
  "Q1/Q2 音声は本文 If I were rich を再利用",
  resolveAudioRef("lesson5.check.q1")?.fileId ===
    resolveAudioRef("lesson5.body.03")?.fileId &&
    resolveAudioRef("lesson5.check.q2")?.fileId ===
      resolveAudioRef("lesson5.body.03")?.fileId,
);
ok(
  "Q3/Q5 音声は本文 If I had more time, I would を再利用",
  resolveAudioRef("lesson5.check.q3")?.fileId ===
    resolveAudioRef("lesson5.body.05")?.fileId &&
    resolveAudioRef("lesson5.check.q5")?.fileId ===
      resolveAudioRef("lesson5.body.05")?.fileId,
);
ok(
  "Q4/Q7 音声は本文 If I were you を再利用",
  resolveAudioRef("lesson5.check.q4")?.fileId ===
    resolveAudioRef("lesson5.body.06")?.fileId &&
    resolveAudioRef("lesson5.check.q7")?.fileId ===
      resolveAudioRef("lesson5.body.06")?.fileId,
);
ok(
  "Q6 音声は本文 If I knew を再利用",
  resolveAudioRef("lesson5.check.q6")?.fileId ===
    resolveAudioRef("lesson5.body.08")?.fileId,
);

const olderTexts = new Set(
  FIXED_AUDIO_FILES.filter((f) => f.lessonKey !== "lesson5").map((f) => f.text),
);
ok(
  "L1〜4 と完全一致する Lesson5 英文はない",
  l5Files.every((f) => !olderTexts.has(f.text)),
);

const sampleResolved = resolveAudioRef("lesson5.body.01");
const sampleMp3 = sampleResolved
  ? join(root, "public/audio/lesson5", `${sampleResolved.fileId}.mp3`)
  : "";
ok(
  "mp3 未生成でも audioRef 未解決と混同しない",
  sampleResolved != null && sampleResolved.fileId.length > 0,
);
ok(
  "Lesson5 mp3 が生成済み",
  Boolean(sampleMp3) && existsSync(sampleMp3),
);
ok(
  "I am rich. の mp3 がある",
  sampleResolved?.text === "I am rich." && existsSync(sampleMp3),
);

ok("Lesson5 Special がある", getSpecialLesson(5)?.id === "lesson-05-special");
ok("L1 タイトルは維持", getLesson(1)?.meta.title === "be動詞ってなに？");
ok("L2 タイトルは維持", getLesson(2)?.meta.title === "一般動詞ってなに？");
ok("L3 タイトルは維持", getLesson(3)?.meta.title === "現在完了ってなに？");
ok("L4 タイトルは維持", getLesson(4)?.meta.title === "関係代名詞ってなに？");
ok("L1 は7問のまま", lesson01CheckQuestions.length === 7);
ok("L2 は7問のまま", lesson02CheckQuestions.length === 7);
ok("L3 は7問のまま", lesson03CheckQuestions.length === 7);
ok("L4 は7問のまま", lesson04CheckQuestions.length === 7);
ok("L1 Q7 正解は維持", lesson01CheckQuestions[6]?.answer === "Yes, I am.");
ok("L2 Q7 正解は維持", lesson02CheckQuestions[6]?.answer === "Yes, I do.");
ok("L3 Q7 正解は維持", lesson03CheckQuestions[6]?.answer === "Yes, I have.");
ok(
  "L4 Q7 正解は維持",
  lesson04CheckQuestions[6]?.answer === "Yes. She's my teacher.",
);
ok(
  "L1/L2 の levelLabel は未設定のまま",
  !getLesson(1)?.meta.levelLabel && !getLesson(2)?.meta.levelLabel,
);
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
ok(
  "L4 evaluate prompt は変更されていない",
  Boolean(getLesson(4)?.coach.evaluateSystemPrompt.includes("関係代名詞")),
);
ok(
  "L3 Step5 rubric 登録は維持",
  getCoachRubricForLesson("lesson-03-present-perfect") ===
    getLesson(3)?.coach.rubric,
);
ok("Lesson3 Special がある", getSpecialLesson(3)?.id === "lesson-03-special");
ok("Lesson4 Special がある", getSpecialLesson(4)?.id === "lesson-04-special");

const contentSrc = readFileSync(
  join(root, "src/components/lessons/Lesson05Content.tsx"),
  "utf8",
);
ok(
  "読解に現実と想像の対比がある",
  contentSrc.includes("I am not rich.") &&
    contentSrc.includes("If I were rich") &&
    contentSrc.includes("【現実】") &&
    contentSrc.includes("【想像】"),
);
ok(
  "読解に If I were you がある",
  contentSrc.includes("were you") && contentSrc.includes("I would talk to her."),
)
ok("読解に had / knew がある", contentSrc.includes("knew") && contentSrc.includes("had"));
ok("読解に would の役割がある", contentSrc.includes("想像の条件") && contentSrc.includes("想像の結果"));
ok(
  "読解に起こりそうな if + will がある",
  contentSrc.includes("If it rains tomorrow, I will stay home."),
);
ok("読解に could の短い補足がある", contentSrc.includes("could"));
ok("読解に first/second conditional はない", !contentSrc.includes("conditional"));
ok("読解に いつでも過去形 という誤説明はない", !contentSrc.includes("いつでも過去形"));
ok(
  "読解は今回の仮定法では if側を過去形、と説明している",
  contentSrc.includes("今回の仮定法") && contentSrc.includes("if側を過去形"),
);

const dataSrc = readFileSync(join(root, "src/data/lesson05.ts"), "utf8");
ok("Step2 解説に いつでも過去形 という誤説明はない", !dataSrc.includes("いつでも過去形"));
ok(
  "Q2 解説は過去形＝昔ではない",
  Boolean(lesson05CheckQuestions[1]?.explanation.includes("昔の話") === true),
);

const ifPast = lesson05CoachRubric.points.find((p) => p.id === "if-past");
ok(
  "rubric if-past は今回の仮定法に限定",
  Boolean(ifPast?.mustUnderstand[0]?.includes("今回の仮定法")),
);
ok(
  "rubric は if=いつでも過去形 を誤解として扱う",
  Boolean(ifPast?.commonMisconceptions.includes("if の後ろはいつでも過去形")),
);
ok(
  "rubric mustUnderstand は if=いつでも過去形 と教えない",
  !lesson05CoachRubric.points.some((p) =>
    p.mustUnderstand.some((m) => m.includes("いつでも過去形")),
  ),
);

const l3Content = readFileSync(
  join(root, "src/components/lessons/Lesson03Content.tsx"),
  "utf8",
);
ok("Lesson3 本文は維持", l3Content.includes("I have lost my key."));
const l4Content = readFileSync(
  join(root, "src/components/lessons/Lesson04Content.tsx"),
  "utf8",
);
ok(
  "Lesson4 本文は維持",
  l4Content.includes("I know the girl") && l4Content.includes("who speaks English"),
)

const generateSrc = readFileSync(join(root, "scripts/generate-audio.ts"), "utf8");
ok("generate-audio は lesson5 に対応", generateSrc.includes('"lesson5"'));

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
if (l5Files.length > 0) {
  console.log("\nLesson5 mp3 候補:");
  for (const f of l5Files) {
    console.log(`- ${f.text} -> ${f.fileId} -> public/audio/lesson5/${f.fileId}.mp3`);
  }
}
process.exit(failed > 0 ? 1 : 0);
