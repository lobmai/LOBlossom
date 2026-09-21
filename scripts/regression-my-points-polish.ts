/**
 * My Loop「大事だと思ったこと」共通 polish
 * 実行: npx tsx scripts/regression-my-points-polish.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildLesson01FinalSummary } from "../src/lib/build-lesson01-final-summary";
import { FINAL_L1_MY_POINTS_ID } from "../src/lib/lessons/lesson01-final-summary";
import { lesson01SummaryConfig } from "../src/lib/lessons/lesson01-summary";
import { lesson02SummaryConfig } from "../src/lib/lessons/lesson02-summary";
import { lesson03SummaryConfig } from "../src/lib/lessons/lesson03-summary";
import { lesson04SummaryConfig } from "../src/lib/lessons/lesson04-summary";
import { lesson05SummaryConfig } from "../src/lib/lessons/lesson05-summary";
import {
  getMyExampleSentence,
  getMyLoopSavedFields,
  getMyPoints,
} from "../src/lib/my-loop-display";
import {
  collectMyPointsPolishSource,
  fallbackMyPointsFromAnswers,
  isPolishedMyPointsAcceptable,
  resolveMyPointsSourceKind,
  toStoredMyPointsFinal,
} from "../src/lib/polish-my-points";
import { toReviewNoteStyle } from "../src/lib/my-points-note-style";
import {
  canEditFinalizePreview,
  resolveEditedPreviewValue,
} from "../src/lib/finalize-preview-edit";
import type { CoachSession, LabeledAnswer, LessonRecord } from "../src/types/record";

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

function baseRecord(
  lessonId: string,
  extra: Partial<LessonRecord> = {},
): LessonRecord {
  return {
    recordId: "t",
    lessonId,
    lessonTitle: "t",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    isCompleted: true,
    teachAnswers: [],
    trajectoryEntries: [],
    coachAnswer: null,
    coachQuestion: null,
    finalSummary: null,
    feeling: null,
    feelingLabel: null,
    aiEvaluation: null,
    ...extra,
  };
}

ok(
  "L1 原文ソースは Step5",
  resolveMyPointsSourceKind(lesson01SummaryConfig) === "step5-answers",
);
ok(
  "L2 原文ソースは Step5",
  resolveMyPointsSourceKind(lesson02SummaryConfig) === "step5-answers",
);
ok(
  "L2 Step3 は points 欄を出さない",
  lesson02SummaryConfig.includePointsInTrajectory === false,
);
ok(
  "L3 原文ソースは Step5",
  resolveMyPointsSourceKind(lesson03SummaryConfig) === "step5-answers",
);
ok(
  "L4 原文ソースは Step5",
  resolveMyPointsSourceKind(lesson04SummaryConfig) === "step5-answers",
);
ok(
  "L5 原文ソースは Step5",
  resolveMyPointsSourceKind(lesson05SummaryConfig) === "step5-answers",
);
ok(
  "未指定+points欄ありは step3-points",
  resolveMyPointsSourceKind({
    ...lesson02SummaryConfig,
    myPointsSource: undefined,
    includePointsInTrajectory: true,
  }) === "step3-points",
);
ok(
  "未指定+points欄なしは step5-answers",
  resolveMyPointsSourceKind({
    ...lesson01SummaryConfig,
    myPointsSource: undefined,
    includePointsInTrajectory: false,
  }) === "step5-answers",
);

const l2Points = "3単現のsが大事だよ！";
const l2Coach = "Step5の合成なので使わない";
const l2Q1 = "don't と doesn't の使い分けが大事";
const l2Q2 = "I like music.";
const l2Session: CoachSession = {
  status: "complete",
  followUpCount: 1,
  hintLevel: 0,
  exchanges: [
    { role: "coach", kind: "question", text: "いちばん大事だと思ったことは何？", at: "t" },
    { role: "user", kind: "answer", text: l2Q1, at: "t" },
    { role: "coach", kind: "followup-question", text: "この文はどんな意味？", at: "t" },
    { role: "user", kind: "answer", text: l2Q2, at: "t" },
  ],
};
const l2Source = collectMyPointsPolishSource(
  resolveMyPointsSourceKind(lesson02SummaryConfig),
  [
    { id: "points", label: "ポイント", answer: l2Points },
    { id: "user-example", label: "例文", answer: "I like music." },
  ],
  l2Session,
);
ok("L2 polish 原文は Step5 の1問目だけ", l2Source.length === 1 && l2Source[0] === l2Q1);
ok("L2 polish 原文に Step3 points を使わない", !l2Source.includes(l2Points));
ok("L2 polish 原文に 2問目を混ぜない", !l2Source.includes(l2Q2));
ok("L2 polish 原文に coachAnswer を使わない", !l2Source.includes(l2Coach));

const l3A = "過去形との違い！";
const l3B =
  "過去形は過去のことを話して、現在完了形は、過去のことが今どうなってるのかも話す文法だよ";
const l3Session: CoachSession = {
  status: "complete",
  followUpCount: 1,
  hintLevel: 0,
  exchanges: [
    { role: "coach", kind: "question", text: "いちばん大事だと思ったことは何？", at: "t" },
    { role: "user", kind: "answer", text: l3A, at: "t" },
    { role: "coach", kind: "followup-question", text: "もう少し教えて", at: "t" },
    { role: "user", kind: "answer", text: l3B, at: "t" },
  ],
};
const l3Joined = "過去形との違い！。過去形は過去のことを話して、現在完了形は、過去のことが今どうなってるのかも話す文法だよ。";
const l3Source = collectMyPointsPolishSource("step5-answers", [], l3Session);
ok(
  "L3 polish 原文は1問目だけ",
  l3Source.length === 1 && l3Source[0] === l3A && !l3Source.includes(l3B),
);
ok("L3 polish 原文は合成 coachAnswer ではない", !l3Source.some((s) => s.includes("！。")));

const l5Q1 = "If I wasじゃなくてIf I wereを使うこと";
const l5Q2 = "もし私がお金持ちなら、世界中を旅行する";
const l5Session: CoachSession = {
  status: "complete",
  followUpCount: 1,
  hintLevel: 0,
  exchanges: [
    {
      role: "coach",
      kind: "question",
      text: "今回のレッスンで、いちばん大事だと思ったことは何？教えて！",
      at: "t",
    },
    { role: "user", kind: "answer", text: l5Q1, at: "t" },
    {
      role: "coach",
      kind: "followup-question",
      text: "If I were rich, I would travel around the world.\nこの文はどんな意味？",
      at: "t",
    },
    { role: "user", kind: "answer", text: l5Q2, at: "t" },
  ],
};
const l5Source = collectMyPointsPolishSource("step5-answers", [], l5Session);
ok(
  "L5 polish 原文は1問目だけ",
  l5Source.length === 1 && l5Source[0] === l5Q1,
);
ok("L5 polish 原文に2問目の旅行を入れない", !l5Source.some((s) => s.includes("旅行")));
ok(
  "L5 fallback も1問目だけ",
  fallbackMyPointsFromAnswers(l5Source) ===
    "If I wasじゃなくてIf I wereを使うこと。",
);

ok("空文字は myPointsFinal にしない", toStoredMyPointsFinal("") === null);
ok("空白だけは myPointsFinal にしない", toStoredMyPointsFinal("   ") === null);
ok("1文字は myPointsFinal にしない", toStoredMyPointsFinal("あ") === null);
ok(
  "意味のある文は保存できる",
  toStoredMyPointsFinal("過去形との違い。") === "過去形との違い。",
);

const polishedL3 = "過去形との違い。過去形は過去の出来事を表し、現在完了は今とのつながりも表す。";
ok(
  "L3 は myPointsFinal を表示",
  getMyPoints(
    baseRecord("lesson-03-present-perfect", {
      coachAnswer: l3Joined,
      coachSession: l3Session,
      myPointsFinal: polishedL3,
    }),
  ) === polishedL3,
);
ok(
  "L3 旧レコードは coachAnswer",
  getMyPoints(
    baseRecord("lesson-03-present-perfect", {
      coachAnswer: l3Joined,
      coachSession: l3Session,
    }),
  ) === l3Joined,
);
ok(
  "空の myPointsFinal はフォールバック",
  getMyPoints(
    baseRecord("lesson-03-present-perfect", {
      coachAnswer: l3Joined,
      myPointsFinal: "  ",
    }),
  ) === l3Joined,
);

ok(
  "L2 は myPointsFinal を表示（points原文は残す）",
  getMyPoints(
    baseRecord("lesson-02-regular-verb", {
      coachAnswer: l2Coach,
      trajectoryEntries: [{ id: "points", label: "p", answer: l2Points }],
      myPointsFinal: "三人称単数では動詞に s を付けることが大事。",
    }),
  ) === "三人称単数では動詞に s を付けることが大事。",
);
ok(
  "L2 旧レコードは points",
  getMyPoints(
    baseRecord("lesson-02-regular-verb", {
      coachAnswer: l2Coach,
      trajectoryEntries: [{ id: "points", label: "p", answer: l2Points }],
    }),
  ) === l2Points,
);

const l1Trajectory: LabeledAnswer[] = [
  { id: "be-verb-meaning", label: "be動詞はどんな意味？", answer: "～です、～にいる・ある" },
  { id: "usage-am", label: "am", answer: "I のとき" },
  { id: "usage-is", label: "is", answer: "he/she/it のとき" },
  { id: "usage-are", label: "are", answer: "you/we/they のとき" },
  { id: "negation-rule", label: "neg", answer: "notを後ろに" },
  { id: "question-how", label: "q", answer: "be動詞を前に" },
  { id: "user-example", label: "ex", answer: "I am happy." },
];
const l1Built = buildLesson01FinalSummary(l1Trajectory, "am/is/areの使い分けが大事");
const l1Polished = "be動詞は主語によって am・is・are を使い分ける。";
ok(
  "L1 は myPointsFinal を優先",
  getMyPoints(
    baseRecord("lesson-01-be-verb", {
      coachAnswer: "am/is/areの使い分けが大事",
      finalSummary: l1Built,
      myPointsFinal: l1Polished,
    }),
  ) === l1Polished,
);
ok(
  "L1 旧レコードは final-l1-my-points",
  getMyPoints(
    baseRecord("lesson-01-be-verb", {
      coachAnswer: "別の合成",
      finalSummary: l1Built,
    }),
  ) === "am/is/areの使い分けが大事",
);
ok(
  "L1 finalize の他項目は残る",
  Boolean(
    l1Built.find((e) => e.id === "final-l1-basics")?.answer.includes("am") &&
      l1Built.find((e) => e.id === FINAL_L1_MY_POINTS_ID),
  ),
);

ok(
  "自作例文 userExampleFinal は独立",
  getMyExampleSentence(
    baseRecord("lesson-03-present-perfect", {
      trajectoryEntries: [
        { id: "user-example", label: "例文", answer: "I haven't never been to Hokkaido." },
      ],
      userExampleFinal: "I have never been to Hokkaido.",
      myPointsFinal: polishedL3,
    }),
  ) === "I have never been to Hokkaido.",
);

const finalizeSrc = readFileSync(join(root, "src/components/FinalizeForm.tsx"), "utf8");
ok("Step6 が polish-points API を使う", finalizeSrc.includes("/api/coach/polish-points"));
ok("Step6 が共通ソース収集を使う", finalizeSrc.includes("collectMyPointsPolishSource"));
ok("Step6 が空の polished を保存しない", finalizeSrc.includes("polished ?? undefined"));
ok("My Loop表示ファイルは polish API を呼ばない", !readFileSync(
  join(root, "src/lib/my-loop-display.ts"),
  "utf8",
).includes("polish-points"));

const polishSrc = readFileSync(join(root, "src/lib/polish-my-points.ts"), "utf8");
ok("既存 polish 関数を維持", polishSrc.includes("polishMyPointsFromAnswers"));
ok("内容追加を禁止", polishSrc.includes("言っていない知識"));
ok("間違いを正解にしない", polishSrc.includes("間違いを正解に書き換えない"));
ok("要約係ではない", polishSrc.includes("要約係ではありません"));
ok("短文化を強制しない", polishSrc.includes("短い発言を無理に長くしない"));
ok("2〜4文の長文化指示はない", !polishSrc.includes("2〜4文程度"));
ok("復習ノート調ポリシーを使う", polishSrc.includes("buildMyPointsNoteStylePolicy"));
ok("話し言葉を許可する旧指示はない", !polishSrc.includes("話し言葉は、まとめ向け"));
ok("だね・だよを禁止する", polishSrc.includes("だね") && polishSrc.includes("だよ"));

ok(
  "会話調だねを復習ノート調にする",
  toReviewNoteStyle(
    "「If I was」じゃなくて「If I were」と言うべきだね。これは、もし私が〜だったらという意味になるよ。",
  ) ===
    "「If I was」じゃなくて「If I were」と言うべきだ。これは、もし私が〜だったらという意味になる。",
);
ok(
  "fallback のだよを最小整形する",
  fallbackMyPointsFromAnswers(["If I wasじゃなくてIf I wereになるよ"]) ===
    "If I wasじゃなくてIf I wereになる。",
);
ok(
  "Step6とMy Loopは同じ getMyPoints",
  readFileSync(join(root, "src/components/FinalizeForm.tsx"), "utf8").includes(
    "getMyLoopSavedFields",
  ) &&
    readFileSync(join(root, "src/lib/my-loop-display.ts"), "utf8").includes(
      "getMyPoints",
    ),
);

const caseA =
  "whoは人でwhichは物でthatはどっちにも使えるのが大事だと思った";
const caseB = "whoとthatの違いが大事だと思った";
const caseC = "2つの文を1つにできるところ";
ok(
  "A 良い整形は受け入れ",
  isPolishedMyPointsAcceptable(
    [caseA],
    "人にはwho、ものにはwhichを使い、thatは人・ものの両方に使えることがある点が大事だと思いました。",
  ),
);
ok(
  "B に which を足した整形は拒否",
  !isPolishedMyPointsAcceptable(
    [caseB],
    "人にはwho、ものにはwhichを使い、thatは人・ものの両方に使えます。",
  ),
);
ok(
  "B 良い整形は受け入れ",
  isPolishedMyPointsAcceptable([caseB], "whoとthatの違いが大事だと思いました。"),
);
ok(
  "C に who/which を足した整形は拒否",
  !isPolishedMyPointsAcceptable(
    [caseC],
    "関係代名詞では、人にはwho、ものにはwhichを使い、2つの文を1つにつなげることができます。",
  ),
);
ok(
  "C 良い整形は受け入れ",
  isPolishedMyPointsAcceptable(
    [caseC],
    "2つの文を1つにつなげられるところが大事だと思いました。",
  ),
);
ok(
  "A fallback は本人の語を残す",
  fallbackMyPointsFromAnswers([caseA])?.includes("who") === true &&
    fallbackMyPointsFromAnswers([caseA])?.includes("which") === true,
);
ok(
  "B fallback に which はない",
  fallbackMyPointsFromAnswers([caseB])?.includes("which") === false,
);

const preview = getMyLoopSavedFields(
  baseRecord("lesson-04-relative-pronoun", {
    finalSummary: [
      { id: "final-my-summary", label: "レッスンの要約", answer: "・関係代名詞の要約" },
    ],
    myPointsFinal: "whoとthatの違いが大事だと思いました。",
    userExampleFinal: "I know the girl who speaks English.",
    userExampleJapanese: "英語を話す女の子を知っています。",
    trajectoryEntries: [
      { id: "user-example", label: "例文", answer: "I know the girl who speaks English." },
    ],
  }),
);
ok("Step6/My Loop 要約は同じ getter", preview.summary === "・関係代名詞の要約");
ok(
  "Step6/My Loop 大事なことは同じ getter",
  preview.points === "whoとthatの違いが大事だと思いました。",
);
ok(
  "Step6/My Loop 例文は同じ getter",
  preview.example === "I know the girl who speaks English.",
);
ok(
  "Step6/My Loop 訳は同じ getter",
  preview.exampleJa === "英語を話す女の子を知っています。",
);

ok(
  "Step6 に My Loop 保存プレビューがある",
  finalizeSrc.includes("savedPreviewTitle") &&
    finalizeSrc.includes("getMyLoopSavedFields"),
);
ok("Step6 は API失敗時に fallback する", finalizeSrc.includes("fallbackMyPointsFromAnswers"));
ok(
  "L2〜5 は Step6 プレビューを編集できる",
  ["lesson-02-regular-verb", "lesson-03-present-perfect", "lesson-04-relative-pronoun", "lesson-05-subjunctive"].every(
    (id) => canEditFinalizePreview(id),
  ),
);
ok("L1 は今回のプレビュー編集対象外", canEditFinalizePreview("lesson-01-be-verb") === false);
ok(
  "大事なことの編集は myPointsFinal 用の値になる",
  resolveEditedPreviewValue("points", "  whoとthatの違いが大事  ") ===
    "whoとthatの違いが大事",
);
ok("大事なことの空白は保存しない", resolveEditedPreviewValue("points", "   ") === null);
ok(
  "例文の編集は userExampleFinal 用の値になる",
  resolveEditedPreviewValue("example", "  I know the girl who speaks English.  ") ===
    "I know the girl who speaks English.",
);
ok("例文の空白は保存しない", resolveEditedPreviewValue("example", "   ") === null);
ok(
  "日本語訳の編集は保存できる",
  resolveEditedPreviewValue("japanese", " 英語を話す女の子を知っています。 ") ===
    "英語を話す女の子を知っています。",
);
ok("日本語訳の空白は保存しない", resolveEditedPreviewValue("japanese", " ") === null);

const editedPreview = getMyLoopSavedFields(
  baseRecord("lesson-04-relative-pronoun", {
    finalSummary: [
      { id: "final-my-summary", label: "レッスンの要約", answer: "・関係代名詞の要約" },
    ],
    myPointsFinal: resolveEditedPreviewValue("points", "whoとthatの違いが大事") ?? "",
    userExampleFinal:
      resolveEditedPreviewValue("example", "This is the book that I bought yesterday.") ??
      "",
    userExampleJapanese:
      resolveEditedPreviewValue("japanese", "これは昨日買った本です。") ?? "",
    trajectoryEntries: [
      { id: "user-example", label: "例文", answer: "I know the girl who speaks English." },
    ],
  }),
);
ok(
  "編集後の大事なことを My Loop getter が見る",
  editedPreview.points === "whoとthatの違いが大事",
);
ok(
  "編集後の例文を My Loop getter が見る",
  editedPreview.example === "This is the book that I bought yesterday.",
);
ok(
  "編集後の訳を My Loop getter が見る",
  editedPreview.exampleJa === "これは昨日買った本です。",
);

ok(
  "Step6 編集保存は polish API を呼ばない",
  finalizeSrc.includes("persistPreviewEdit") &&
    !finalizeSrc.includes("requestPolishedMyPoints(draft") &&
    finalizeSrc.includes("saveDraft(next)"),
);
ok(
  "Step6 に編集UIがある",
  finalizeSrc.includes("FinalizePreviewEditCard") &&
    existsSync(join(root, "src/components/FinalizePreviewEditCard.tsx")),
);

const l2ContentSrc = readFileSync(
  join(root, "src/components/lessons/Lesson02Content.tsx"),
  "utf8",
);
ok(
  "L2 Step1 I am tired. は既存 lesson1 音声",
  l2ContentSrc.includes('audioRef="lesson1.body.11"') &&
    l2ContentSrc.includes("I am tired."),
);
ok(
  "L2 Step1 I play tennis. は既存 lesson2 音声",
  l2ContentSrc.includes('audioRef="lesson2.body.01"') &&
    l2ContentSrc.includes("I play tennis."),
);
ok(
  "L2 Step1 単語 play は既存 mywords 音声",
  l2ContentSrc.includes('audioRef="mywords.play"'),
);
ok("L2 Step1 単語 eat は既存 mywords 音声", l2ContentSrc.includes('audioRef="mywords.eat"'));
ok("L2 Step1 単語 like は既存 mywords 音声", l2ContentSrc.includes('audioRef="mywords.like"'));
ok("L2 Step1 単語 go は既存 mywords 音声", l2ContentSrc.includes('audioRef="mywords.go"'));
ok(
  "L2 Step1 単語 study は既存 mywords 音声",
  l2ContentSrc.includes('audioRef="mywords.study"'),
);

const summarizeSrc = readFileSync(join(root, "src/components/SummarizeForm.tsx"), "utf8");
ok(
  "Step3 points 欄は includePointsInTrajectory で出す",
  summarizeSrc.includes("includePointsInTrajectory !== false"),
);
ok(
  "L2 Step3 は例文欄を残す",
  lesson02SummaryConfig.userExampleFields.some((f) => f.id === "user-example"),
);

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
