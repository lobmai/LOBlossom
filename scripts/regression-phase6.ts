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
import { enforceFollowUpLimitForTest } from "../src/lib/coach-teach-evaluate";
import {
  COACH_COMPLETE_CLOSING_MESSAGE,
  playThankYouSoundOnce,
} from "../src/lib/coach-complete-celebration";
import {
  applyRubricCoverageGate,
  detectMissingRubricFollowUp,
  isAmIsAreExplained,
  mentionsAmIsAreWithoutDetail,
} from "../src/lib/coach-teach-coverage";
import { lesson01CoachRubric } from "../src/lib/coach-rubric/lesson01";
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
  "complete closing is fixed",
  limited.closingMessage === COACH_COMPLETE_CLOSING_MESSAGE,
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
  completeWithParaphrase.closingMessage === COACH_COMPLETE_CLOSING_MESSAGE,
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

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
