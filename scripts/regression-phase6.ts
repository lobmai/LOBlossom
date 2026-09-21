/**
 * Phase6 回帰確認：Step5 会話・ヒント・teach-evaluate ガード
 * 実行: npx tsx scripts/regression-phase6.ts
 */
import { isMeaningfulCoachAnswer } from "../src/lib/answer-quality";
import {
  appendExchange,
  buildCoachAnswerFromSession,
  createInitialCoachSession,
  isCoachSessionFinished,
  synthesizeCoachPointsFromSession,
  updateSessionStatus,
} from "../src/lib/coach-session";
import {
  buildLocalHint,
  buildLocalTeachContent,
  isStruggleAnswer,
  pickDefaultRubricPointId,
} from "../src/lib/coach-teach-hints";
import {
  buildTeachEvaluateInput,
  enforceFollowUpLimitForTest,
  evaluateTeachAnswer,
  getTeachEvaluateSystemPrompt,
} from "../src/lib/coach-teach-evaluate";
import { getAnswerInputPlaceholder } from "../src/lib/coach-teach-question";
import { isOpenAiApiKeyConfigured } from "../src/lib/openai-config";
import { playThankYouSoundOnce } from "../src/lib/coach-complete-celebration";
import {
  applyRubricCoverageGate,
  detectMissingRubricFollowUp,
  isAmIsAreExplained,
  mentionsAmIsAreWithoutDetail,
} from "../src/lib/coach-teach-coverage";
import { lesson01CoachRubric } from "../src/lib/coach-rubric/lesson01";
import { lesson02CoachRubric } from "../src/lib/coach-rubric/lesson02";
import { validateLessonReadyForFinalize } from "../src/lib/lesson-finalize-validation";
import { pickCoachQuestionForLesson } from "../src/lib/coach-question-picker";
import { buildMyPointsPolishInput } from "../src/lib/polish-my-points";
import type { CoachSession, LessonRecord } from "../src/types/record";

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

ok('isStruggleAnswer("分からない")', isStruggleAnswer("分からない"));
ok('!isStruggleAnswer("am/is/are")', !isStruggleAnswer("am/is/are"));

const pointId = pickDefaultRubricPointId(lesson01CoachRubric);
ok("default rubric point", pointId === "am-is-are");

const hint0 = buildLocalHint(lesson01CoachRubric, pointId, 0);
ok("local hint stage 0 (follow-up)", Boolean(hint0?.includes("ヒント")));

const hintInitial = buildLocalHint(lesson01CoachRubric, pointId, 0, {
  isInitialBroadHint: true,
});
ok(
  "initial broad hint",
  Boolean(
    hintInitial?.includes("be動詞") &&
      hintInitial.includes("am・is・are") &&
      !hintInitial.includes("Iを思い出して"),
  ),
);

const teachLocal = buildLocalTeachContent(lesson01CoachRubric, pointId);
ok("local teach content", teachLocal.includes("こう覚えて"));

const q = pickCoachQuestionForLesson("lesson-01-be-verb");
let session = createInitialCoachSession(q.question);
ok("initial session not finished", !isCoachSessionFinished(session));

session = appendExchange(session, {
  role: "user",
  kind: "answer",
  text: "amとisとareの使い分け",
});
session = appendExchange(session, {
  role: "coach",
  kind: "closing",
  text: "しっかり伝わったよ！",
});
session = updateSessionStatus(session, "complete", {
  closingMessage: "しっかり伝わったよ！",
});
ok("complete session finished", isCoachSessionFinished(session));

const consolidated = buildCoachAnswerFromSession(session);
ok("consolidated coach answer", consolidated.includes("amとisとare"));
ok("meaningful consolidated", isMeaningfulCoachAnswer(consolidated));

const limited = enforceFollowUpLimitForTest(
  {
    outcome: "followup",
    paraphrase: null,
    closingMessage: null,
    followUpQuestion: "どう使い分ける？",
    targetRubricPointId: "am-is-are",
    teachContent: null,
  },
  1,
  new Set(["am-is-are"]),
);
ok("followUp blocked at count 1", limited.outcome !== "followup");
ok(
  "complete closing is meaning-check",
  limited.closingMessage === "わかった！教えてくれてありがとう！😊",
);

const completeWithParaphrase = enforceFollowUpLimitForTest(
  {
    outcome: "complete",
    paraphrase: "amとisの使い分け",
    closingMessage: "教えてくれた内容なんだね",
    followUpQuestion: null,
    targetRubricPointId: null,
    teachContent: null,
  },
  0,
  new Set(["am-is-are"]),
);
ok(
  "AI言い返しを使わない",
  completeWithParaphrase.closingMessage === "わかった！教えてくれてありがとう！😊",
);

let thankYouThrew = false;
try {
  playThankYouSoundOnce();
} catch {
  thankYouThrew = true;
}
ok("音声なしでも例外なし", !thankYouThrew);

ok(
  "my-points polish input uses user answers only",
  buildMyPointsPolishInput(["notをbe動詞の後ろに置くんだよ"]).includes("置くんだよ") &&
    buildMyPointsPolishInput(["notをbe動詞の後ろに置くんだよ"]).includes("発言だけを根拠"),
);

const partialL1Answer =
  "be動詞はam、is、areの3種類があります。主語によって使い分けます。";

const followUpAnswer =
  "am-I\nis-she he it その他（単数）\nare-you they we その他（複数）";
const gatedAfterFollowUp = applyRubricCoverageGate(
  {
    outcome: "complete",
    closingMessage: "しっかり伝わったよ！",
    followUpQuestion: null,
    targetRubricPointId: null,
    paraphrase: null,
    teachContent: null,
  },
  lesson01CoachRubric,
  [partialL1Answer, followUpAnswer],
  { isInitialAnswer: false, isFollowUpAnswer: true, activeRubricPointId: "am-is-are" },
  1,
);
ok(
  "no second followup after follow-up answer",
  gatedAfterFollowUp.outcome === "complete",
);

let synthSession = createInitialCoachSession(q.question);
synthSession = appendExchange(synthSession, {
  role: "user",
  kind: "answer",
  text: "わからない",
});
synthSession = appendExchange(synthSession, {
  role: "user",
  kind: "answer",
  text: "be動詞はam、is、are。主語によって使い分けます。",
});
synthSession = appendExchange(synthSession, {
  role: "user",
  kind: "answer",
  text: "am-I\nis-she he it\nare-you they we",
});
const synthesized = synthesizeCoachPointsFromSession(
  synthSession,
  "lesson-01-be-verb",
);
ok(
  "synthesized excludes struggle",
  !synthesized.includes("わからない") &&
    synthesized.includes("主語によって使い分ける") &&
    synthesized.includes("Iにはam"),
);

ok(
  "partial: mentions without detail",
  mentionsAmIsAreWithoutDetail(partialL1Answer),
);
ok("partial: !isAmIsAreExplained", !isAmIsAreExplained(partialL1Answer));

const missingPartial = detectMissingRubricFollowUp(
  lesson01CoachRubric,
  [partialL1Answer],
  { isInitialAnswer: true },
);
ok(
  "partial L1 → followup am-is-are",
  missingPartial?.pointId === "am-is-are" &&
    Boolean(missingPartial.followUpQuestion.includes("使い分け")),
);

const gatedPartial = applyRubricCoverageGate(
  {
    outcome: "complete",
    closingMessage: "しっかり伝わったよ！",
    followUpQuestion: null,
    targetRubricPointId: null,
    paraphrase: null,
    teachContent: null,
  },
  lesson01CoachRubric,
  [partialL1Answer],
  { isInitialAnswer: true },
  0,
);
ok(
  "complete overridden to followup",
  gatedPartial.outcome === "followup" &&
    gatedPartial.targetRubricPointId === "am-is-are",
);

const fullL1Answer =
  "be動詞は「〜です」を表す。Iのときはam、heやsheのときはis、youやweのときはare。否定文はbe動詞の後ろにnot。疑問文はbe動詞を主語の前に出す。";
ok("full L1 isAmIsAreExplained", isAmIsAreExplained(fullL1Answer));
const missingFull = detectMissingRubricFollowUp(
  lesson01CoachRubric,
  [fullL1Answer],
  { isInitialAnswer: true },
);
ok("full L1 all covered", missingFull === null);

const readyDraft: LessonRecord = {
  recordId: "t",
  lessonId: "lesson-01-be-verb",
  lessonTitle: "t",
  startedAt: new Date().toISOString(),
  completedAt: null,
  isCompleted: false,
  teachAnswers: [],
  trajectoryEntries: [
    { id: "be-verb-meaning", label: "be動詞はどんな意味？", answer: "～です、～にいる・ある" },
    { id: "usage-am", label: "am", answer: "I のとき" },
    { id: "usage-is", label: "is", answer: "he/she/it のとき" },
    { id: "usage-are", label: "are", answer: "you/we/they のとき" },
    { id: "negation-rule", label: "neg", answer: "notを後ろに" },
    { id: "question-how", label: "q", answer: "be動詞を前に" },
    { id: "unclear-choice", label: "u", answer: "none" },
    { id: "user-example", label: "ex", answer: "I am happy." },
  ],
  coachAnswer: synthesized || consolidated,
  coachQuestion: q,
  coachSession: session,
  finalSummary: null,
  feeling: null,
  feelingLabel: null,
  aiEvaluation: {
    overallMessage: "ok",
    corrections: [],
    polishedEntries: [],
    hasPolish: false,
    evaluatedAt: new Date().toISOString(),
    overallLevel: "understood",
  },
};

ok("ready with session", validateLessonReadyForFinalize(readyDraft).ready);

const incompleteSession: CoachSession = {
  ...session,
  status: "awaiting-followup",
};
ok(
  "!ready incomplete session",
  !validateLessonReadyForFinalize({
    ...readyDraft,
    coachSession: incompleteSession,
  }).ready,
);

const l1Placeholder = getAnswerInputPlaceholder("lesson-01-be-verb");
ok(
  "L1 placeholder keeps am/is/are",
  l1Placeholder === "例：am / is / are の使い分け",
);

const l2Placeholder = getAnswerInputPlaceholder("lesson-02-regular-verb");
ok(
  "L2 placeholder has no am/is/are",
  !l2Placeholder.includes("am / is / are") &&
    l2Placeholder.includes("like") &&
    l2Placeholder.includes("play"),
);

const l2Question = pickCoachQuestionForLesson("lesson-02-regular-verb");
ok(
  "L2 question is 大事だと思ったこと",
  l2Question.question ===
    "今回のレッスンで、いちばん大事だと思ったことは何？教えて！" &&
    !l2Question.question.includes("一般動詞ってなに？") &&
    l2Question.keywords.includes("一般動詞") &&
    l2Question.keywords.includes("3単現") &&
    l2Question.keywords.includes("don't / doesn't"),
);

const l1Question = pickCoachQuestionForLesson("lesson-01-be-verb");
ok(
  "L1 question unchanged",
  l1Question.question ===
    "このレッスンで、いちばん大事なことって何？教えて！",
);

const l1System = getTeachEvaluateSystemPrompt("lesson-01-be-verb");
ok(
  "L1 teach-evaluate keeps be動詞 rules",
  l1System.includes("be動詞レッスンの重要項目") &&
    l1System.includes("am/is/are") &&
    l1System.includes("I→am"),
);
ok(
  "L1 teach に英文の意味確認ルールがある",
  l1System.includes("この文はどんな意味"),
);

const l2System = getTeachEvaluateSystemPrompt("lesson-02-regular-verb");
ok(
  "L2 teach-evaluate has no be動詞固定指示",
  !l2System.includes("be動詞レッスン") &&
    !l2System.includes("am/is/are") &&
    !l2System.includes("I→am") &&
    l2System.includes("評価基準"),
);
ok(
  "L2 teach にも英文の意味確認ルールがある",
  l2System.includes("この文はどんな意味"),
);

const l1Input = buildTeachEvaluateInput({
  lessonId: "lesson-01-be-verb",
  initialQuestion: "いちばん大事なことって何？",
  userAnswer: "be動詞です",
  followUpCount: 0,
  conversationHistory: [],
  isFollowUpAnswer: false,
});
ok(
  "L1 input rules keep am/is/are",
  l1Input.includes("am/is/are") && l1Input.includes("I→am"),
);

const l2Input = buildTeachEvaluateInput({
  lessonId: "lesson-02-regular-verb",
  initialQuestion: "一般動詞ってなに？",
  userAnswer: "動きや好きを表す",
  followUpCount: 0,
  conversationHistory: [],
  isFollowUpAnswer: false,
});
ok(
  "L2 input rules have no am/is/are",
  !l2Input.includes("am/is/are") &&
    !l2Input.includes("I→am") &&
    l2Input.includes("評価基準"),
);
ok(
  "L2 input にこのレッスンの英文例がある",
  l2Input.includes("I like music."),
);

const missingL2 = detectMissingRubricFollowUp(
  lesson02CoachRubric,
  ["一般動詞は動きや好きを表す。like とか。"],
  { isInitialAnswer: true },
);
ok(
  "L2 followup is 一般動詞 rubric",
  missingL2 != null &&
    missingL2.pointId !== "am-is-are" &&
    ["third-person-s", "general-negation", "general-question"].includes(
      missingL2.pointId,
    ),
);

function sessionWithAnswers(texts: string[]): CoachSession {
  let s = createInitialCoachSession(
    "今回のレッスンで、いちばん大事だと思ったことは何？教えて！",
  );
  for (const text of texts) {
    s = appendExchange(s, { role: "user", kind: "answer", text });
  }
  return s;
}

const l2Feel = synthesizeCoachPointsFromSession(
  sessionWithAnswers(["Feel"]),
  "lesson-02-regular-verb",
);
ok(
  "L2 Feel is not raw word",
  l2Feel !== "Feel" &&
    l2Feel !== "Feel。" &&
    l2Feel.includes("Feel") &&
    l2Feel.includes("大事"),
);

const l2Third = synthesizeCoachPointsFromSession(
  sessionWithAnswers(["3単現が大事"]),
  "lesson-02-regular-verb",
);
ok(
  "L2 3単現 is a short sentence",
  l2Third.includes("3単現が大事だと思いました") &&
    !l2Third.includes("he / she"),
);

const l2Full = synthesizeCoachPointsFromSession(
  sessionWithAnswers([
    "he や she のときは動詞に s を付けることが大事だと思いました",
  ]),
  "lesson-02-regular-verb",
);
ok(
  "L2 full sentence kept",
  l2Full.includes("動詞に s を付ける") && l2Full.includes("だと思いました"),
);

const l1SynthUnchanged = synthesizeCoachPointsFromSession(
  synthSession,
  "lesson-01-be-verb",
);
ok(
  "L1 synthesize still maps am/is/are",
  l1SynthUnchanged.includes("Iにはam") &&
    l1SynthUnchanged.includes("主語によって使い分ける"),
);

async function runLesson2ApiCheck() {
  if (!isOpenAiApiKeyConfigured()) {
    console.log("⏭ Lesson2 teach-evaluate API（キー未設定のためスキップ）");
    return;
  }

  try {
    const result = await evaluateTeachAnswer({
      lessonId: "lesson-02-regular-verb",
      initialQuestion: "一般動詞ってなに？",
      userAnswer:
        "一般動詞は動きや好きを表すよ。like や play。he のときは likes みたいに s を付ける。否定は don't と doesn't。疑問は Do と Does。",
      followUpCount: 0,
      conversationHistory: [
        { role: "coach", text: "一般動詞ってなに？" },
      ],
      isFollowUpAnswer: false,
    });
    const okOutcome = ["complete", "followup", "teach"].includes(result.outcome);
    ok("L2 teach-evaluate API succeeds", okOutcome);
    if (result.followUpQuestion) {
      ok(
        "L2 API followup is not am/is/are",
        !/am\s*[\/・]\s*is/i.test(result.followUpQuestion) &&
          !result.followUpQuestion.includes("be動詞を主語の前"),
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ok("L2 teach-evaluate API succeeds", false, message);
  }
}

void runLesson2ApiCheck().then(() => {
  console.log("\n---");
  console.log(`Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
});
