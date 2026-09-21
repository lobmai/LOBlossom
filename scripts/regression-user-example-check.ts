/**
 * 自作例文チェック（文法チェック → 理由 → 修正版 → My Loop は確定例文）
 * 実行: npx tsx scripts/regression-user-example-check.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildLesson01FinalSummary } from "../src/lib/build-lesson01-final-summary";
import { FINAL_L1_MY_EXAMPLE_ID } from "../src/lib/lessons/lesson01-final-summary";
import { getMyExampleJapanese, getMyExampleSentence, getMyLoopSavedFields, getMyPoints } from "../src/lib/my-loop-display";
import {
  applyUserExampleCheck,
  buildUserExampleCheckInstructions,
  getExampleGrammarFocus,
  pickExampleForTranslation,
} from "../src/lib/user-example-check";
import { parseLessonMemo } from "../src/lib/memo-store";
import { getUnclearQuestionText } from "../src/lib/summary-fields";
import { UNCLEAR_CHOICE_ID, UNCLEAR_DETAIL_ID } from "../src/lib/lessons/types";
import {
  clipUnknownQuestionAnswer,
  splitUnknownQuestionSentences,
  UNKNOWN_QUESTION_ANSWER_MAX_SENTENCES,
} from "../src/lib/clip-unknown-question-answer";
import {
  applyMeaningCheckFollowUpGate,
  formatMeaningCheckFollowUp,
  pickMeaningCheckFallbackSentence,
} from "../src/lib/meaning-check-follow-up";
import {
  buildExampleTranslationPatch,
  mergeSavedExampleTranslation,
  normalizeExampleTranslation,
  shouldTranslateFinalExample,
} from "../src/lib/translate-user-example";
import {
  applyStep4TranslationResult,
  resolveStep4Example,
  runStep4ExampleFlow,
  TRANSLATE_EXAMPLE_API_PATH,
} from "../src/lib/step4-example";

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
  example: string,
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
    trajectoryEntries: [
      { id: "user-example", label: "例文", answer: example },
    ],
    coachAnswer: "大事なこと",
    coachQuestion: null,
    finalSummary: null,
    feeling: null,
    feelingLabel: null,
    aiEvaluation: null,
    ...extra,
  };
}

const l3Wrong = "I haven't never been to Hokkaido.";
const l3Corrected = "I have never been to Hokkaido.";
const l3Ok = "I have been to Hokkaido.";

const l3WrongApplied = applyUserExampleCheck(l3Wrong, {
  isCorrect: false,
  correctedExample: l3Corrected,
  errorReason: "haven't と never を一緒に使うと二重否定になるため",
});
ok("L3 間違い: isCorrect=false", l3WrongApplied.fields.userExampleIsCorrect === false);
ok("L3 間違い: 修正版を確定", l3WrongApplied.fields.userExampleFinal === l3Corrected);
ok(
  "L3 間違い: 理由を保持",
  Boolean(l3WrongApplied.fields.userExampleCorrectionReason?.includes("二重否定")),
);
ok("L3 間違い: 原文は trajectory 用に残す", l3WrongApplied.display?.correctedExample === l3Corrected);

const l3OkApplied = applyUserExampleCheck(l3Ok, {
  isCorrect: true,
  correctedExample: "I've been to Hokkaido before.",
  errorReason: "より自然",
});
ok("L3 正しい: isCorrect=true", l3OkApplied.fields.userExampleIsCorrect === true);
ok("L3 正しい: 原文を確定（過剰修正しない）", l3OkApplied.fields.userExampleFinal === l3Ok);
ok("L3 正しい: 理由なし", l3OkApplied.fields.userExampleCorrectionReason === null);
ok("L3 正しい: 表示も書き換えない", l3OkApplied.display?.correctedExample === null);

ok(
  "My Loop L3 間違い→修正版",
  getMyExampleSentence(
    baseRecord("lesson-03-present-perfect", l3Wrong, {
      userExampleFinal: l3WrongApplied.fields.userExampleFinal,
    }),
  ) === l3Corrected,
);
ok(
  "My Loop L3 正しい→原文",
  getMyExampleSentence(
    baseRecord("lesson-03-present-perfect", l3Ok, {
      userExampleFinal: l3OkApplied.fields.userExampleFinal,
    }),
  ) === l3Ok,
);

const l2Wrong = "She play tennis every day.";
const l2Corrected = "She plays tennis every day.";
const l2Applied = applyUserExampleCheck(l2Wrong, {
  isCorrect: false,
  correctedExample: l2Corrected,
  errorReason: "he / she のときは一般動詞に s が付くよ",
});
ok("L2 間違い: 修正版を確定", l2Applied.fields.userExampleFinal === l2Corrected);
ok(
  "My Loop L2 間違い→修正版",
  getMyExampleSentence(
    baseRecord("lesson-02-regular-verb", l2Wrong, {
      userExampleFinal: l2Applied.fields.userExampleFinal,
    }),
  ) === l2Corrected,
);

const l1Wrong = "He am a student.";
const l1Corrected = "He is a student.";
const l1Applied = applyUserExampleCheck(l1Wrong, {
  isCorrect: false,
  correctedExample: l1Corrected,
  errorReason: "he のときは is を使うよ",
});
ok("L1 間違い: 修正版を確定", l1Applied.fields.userExampleFinal === l1Corrected);

const l1Trajectory: LabeledAnswer[] = [
  { id: "be-verb-meaning", label: "be動詞はどんな意味？", answer: "～です、～にいる・ある" },
  { id: "usage-am", label: "am", answer: "I のとき" },
  { id: "usage-is", label: "is", answer: "he/she/it のとき" },
  { id: "usage-are", label: "are", answer: "you/we/they のとき" },
  { id: "negation-rule", label: "neg", answer: "notを後ろに" },
  { id: "question-how", label: "q", answer: "be動詞を前に" },
  { id: "user-example", label: "ex", answer: l1Wrong },
];
const l1BuiltOriginal = buildLesson01FinalSummary(
  l1Trajectory,
  "am/is/areの使い分けが大事",
);
ok(
  "L1 finalize 従来: 原文を例文に使う",
  l1BuiltOriginal.find((e) => e.id === FINAL_L1_MY_EXAMPLE_ID)?.answer === l1Wrong,
);
const l1BuiltCorrected = buildLesson01FinalSummary(
  l1Trajectory,
  "am/is/areの使い分けが大事",
  l1Corrected,
);
ok(
  "L1 finalize: userExampleFinal を例文に使う",
  l1BuiltCorrected.find((e) => e.id === FINAL_L1_MY_EXAMPLE_ID)?.answer === l1Corrected,
);
ok(
  "L1 他項目は変えずに例文だけ差し替え",
  l1BuiltCorrected.find((e) => e.id === "final-l1-basics")?.answer ===
    l1BuiltOriginal.find((e) => e.id === "final-l1-basics")?.answer,
);
ok(
  "My Loop L1 は userExampleFinal 優先（final-l1-my-example が原文でも）",
  getMyExampleSentence(
    baseRecord("lesson-01-be-verb", l1Wrong, {
      userExampleFinal: l1Corrected,
      finalSummary: l1BuiltOriginal,
    }),
  ) === l1Corrected,
);

const oldL3 = baseRecord("lesson-03-present-perfect", l3Ok);
ok(
  "旧レコード: userExampleFinal なしでも原文を表示",
  getMyExampleSentence(oldL3) === l3Ok,
);
const oldL1 = baseRecord("lesson-01-be-verb", "I am happy.", {
  finalSummary: l1BuiltOriginal.map((e) =>
    e.id === FINAL_L1_MY_EXAMPLE_ID ? { ...e, answer: "I am happy." } : e,
  ),
});
ok(
  "旧レコード L1: final-l1-my-example へフォールバック",
  getMyExampleSentence(oldL1) === "I am happy.",
);

const failedCheck = applyUserExampleCheck(l3Wrong, null);
ok("AI失敗: display なし", failedCheck.display === null);
ok("AI失敗: userExampleFinal を保存しない", failedCheck.fields.userExampleFinal === null);
ok("AI失敗: isCorrect も未確定", failedCheck.fields.userExampleIsCorrect === null);

const emptyCorrected = applyUserExampleCheck(l3Wrong, {
  isCorrect: false,
  correctedExample: "",
  errorReason: "二重否定",
});
ok("空の修正版は保存しない", emptyCorrected.fields.userExampleFinal === null);
ok("空の修正版でも理由は残せる", emptyCorrected.display?.errorReason?.includes("二重否定") === true);

const bogusCorrected = applyUserExampleCheck(l3Wrong, {
  isCorrect: false,
  correctedExample: "x",
  errorReason: "だめ",
});
ok("壊れた修正版は保存しない", bogusCorrected.fields.userExampleFinal === null);

const incomplete = applyUserExampleCheck(l3Wrong, {
  isCorrect: false,
  correctedExample: null,
  errorReason: null,
});
ok("不完全な不正解は確定しない", incomplete.fields.userExampleFinal === null);
ok("不完全な不正解は修正版として見せない", incomplete.display === null);

const malformed = applyUserExampleCheck(l3Wrong, { foo: 1 });
ok("不正なAI結果は無視", malformed.fields.userExampleFinal === null && malformed.display === null);

ok(
  "訳対象は確定例文を優先",
  pickExampleForTranslation(l3Wrong, l3Corrected) === l3Corrected,
);
ok(
  "確定例文がなければ原文を訳す",
  pickExampleForTranslation(l3Ok, null) === l3Ok,
);
ok(
  "空の確定例文は訳対象にしない",
  pickExampleForTranslation(l3Ok, "   ") === l3Ok,
);

ok(
  "L1 文法フォーカス",
  getExampleGrammarFocus("lesson-01-be-verb")?.includes("be動詞") === true,
);
ok(
  "L2 文法フォーカス",
  getExampleGrammarFocus("lesson-02-regular-verb")?.includes("一般動詞") === true,
);
ok(
  "L3 文法フォーカス",
  getExampleGrammarFocus("lesson-03-present-perfect")?.includes("現在完了") === true,
);
ok(
  "未登録 Lesson でも共通ルールを使える",
  getExampleGrammarFocus("lesson-04-future") === null,
);

const l3Prompt = buildUserExampleCheckInstructions(
  "lesson-03-present-perfect",
  l3Wrong,
);
ok("プロンプトが過剰修正を禁止", l3Prompt.includes("好みや「より自然だから」"));
ok("プロンプトが未使用だけで不正解にしない", l3Prompt.includes("使っていないことだけで"));
ok("プロンプトに対象例文がある", l3Prompt.includes(l3Wrong));

const evaluateSrc = readFileSync(join(root, "src/components/EvaluateCoach.tsx"), "utf8");
ok("Step4 に例文確認カードがある", evaluateSrc.includes("UserExampleCheckCard"));
ok(
  "Step4 が例文フィールドを保存する",
  evaluateSrc.includes("resolved.fields") &&
    evaluateSrc.includes("saveDraftAiEvaluation"),
);
ok("英語UI Your example is correct を使わない", !evaluateSrc.includes("Your example is correct"));

const uiSrc = readFileSync(join(root, "src/lib/ui-text.ts"), "utf8");
ok("日本語: 例文を確認しよう", uiSrc.includes("例文を確認しよう"));
ok("日本語: ここを直そう", uiSrc.includes("ここを直そう"));
ok("日本語: 修正版", uiSrc.includes("exampleCheckCorrected: \"修正版\""));

const loopSrc = readFileSync(join(root, "src/lib/my-loop-display.ts"), "utf8");
ok("My Loop が userExampleFinal を優先", loopSrc.includes("record.userExampleFinal"));

const finalizeSrc = readFileSync(join(root, "src/components/FinalizeForm.tsx"), "utf8");
ok("L1 finalize が userExampleFinal を渡す", finalizeSrc.includes("draft!.userExampleFinal"));
ok("Step6 API に確定例文を渡す", finalizeSrc.includes("userExampleFinal: draft!.userExampleFinal"));

const resetSrc = readFileSync(join(root, "src/lib/record-store.ts"), "utf8");
ok("Step3 やり直しで確定例文をクリア", resetSrc.includes("userExampleFinal: null"));

const evalLib = readFileSync(join(root, "src/lib/coach-evaluate.ts"), "utf8");
ok("evaluate schema に userExampleCheck", evalLib.includes("userExampleCheck:"));
ok(
  "evaluate API は和訳を埋め込まない",
  !evalLib.includes("translateUserExampleEnglish"),
);
ok("finalize は翻訳を再実行しない", !evalLib.includes("【日本語訳の対象例文】"));
ok(
  "Step4 確定後に translate-example を呼ぶ",
  evaluateSrc.includes("ensureExampleTranslation") &&
    evaluateSrc.includes("/api/coach/translate-example") &&
    evaluateSrc.includes("saveDraftAiEvaluation"),
);
ok(
  "fresh evaluate のあとも和訳を確保する",
  evaluateSrc.includes("persistFinalAndTranslate") &&
    evaluateSrc.includes("ensureExampleTranslation"),
);
ok(
  "Step4 は resolveStep4Example で final を決める",
  evaluateSrc.includes("resolveStep4Example"),
);
ok("Step4 カードが保存済み和訳を表示する", evaluateSrc.includes("japanese={exampleJapanese}"));
ok(
  "Step4 カードが確定英文を表示する",
  evaluateSrc.includes("finalEnglish={exampleFinal}"),
);
ok("Step6 は finalize API 和訳を保存しない", !finalizeSrc.includes("data.userExampleJapanese"));
ok("Step6 は保存済み和訳を表示する", finalizeSrc.includes("loopPreview.exampleJa"));
ok(
  "空訳で既存を消さない保存関数がある",
  resetSrc.includes("saveDraftUserExampleJapanese"),
);

ok(
  "正しい例文の訳は原文",
  pickExampleForTranslation(l3Ok, l3OkApplied.fields.userExampleFinal) === l3Ok,
);
ok(
  "修正例文の訳は修正版",
  pickExampleForTranslation(l3Wrong, l3WrongApplied.fields.userExampleFinal) ===
    l3Corrected,
);

ok(
  "和訳の正規化: 説明文を除く",
  normalizeExampleTranslation("この文は私は学生です。という意味です") ===
    "私は学生です。",
);
ok(
  "和訳の正規化: 空は null",
  normalizeExampleTranslation("  ") === null,
);
ok(
  "空の新規訳で既存を消さない",
  mergeSavedExampleTranslation("私は学生です。", "") === "私は学生です。",
);
ok(
  "null の新規訳で既存を消さない",
  mergeSavedExampleTranslation("私は学生です。", null) === "私は学生です。",
);
ok(
  "新しい訳があれば更新する",
  mergeSavedExampleTranslation("古い訳", "私は学生です。") === "私は学生です。",
);

const l1House = "this is the house.";
const l1HouseJa = "これは家です。";
const l1HousePatch = buildExampleTranslationPatch(l1House, l1HouseJa);
ok("L1 実機例文の訳パッチが保存値になる", l1HousePatch.userExampleJapanese === l1HouseJa);
ok("L1 実機例文の訳対象英文を記録する", l1HousePatch.userExampleJapaneseFor === l1House);
ok(
  "空の翻訳パッチは既存を消さない",
  Object.keys(buildExampleTranslationPatch(l1House, "")).length === 0,
);
ok(
  "翻訳失敗パッチは空",
  Object.keys(buildExampleTranslationPatch(l1House, null)).length === 0,
);

ok(
  "最終例文あり・訳なしは翻訳する",
  shouldTranslateFinalExample(l1House, null, null) === true,
);
ok(
  "同じ最終例文の既存訳は再翻訳しない",
  shouldTranslateFinalExample(l1House, l1HouseJa, l1House) === false,
);
ok(
  "既存訳あり・対象英文なしは再翻訳しない",
  shouldTranslateFinalExample(l1House, l1HouseJa, null) === false,
);
ok(
  "最終例文が変わったら再翻訳する",
  shouldTranslateFinalExample("This is a house.", l1HouseJa, l1House) === true,
);
ok(
  "最終例文がなければ翻訳しない",
  shouldTranslateFinalExample(null, null, null) === false,
);

const l1Saved = baseRecord("lesson-01-be-verb", l1House, {
  userExampleFinal: l1House,
  userExampleJapanese: l1HouseJa,
});
ok("L1 Step4/6/My Loop 同じ和訳", getMyExampleJapanese(l1Saved) === l1HouseJa);
ok(
  "L1 getMyLoopSavedFields も同じ和訳",
  getMyLoopSavedFields(l1Saved).exampleJa === l1HouseJa &&
    getMyLoopSavedFields(l1Saved).example === l1House,
);

const l1CorrectedEn = "This is the house.";
const l1CorrectedJa = "これはその家です。";
const l1CorrectedRecord = baseRecord("lesson-01-be-verb", l1House, {
  userExampleFinal: l1CorrectedEn,
  userExampleJapanese: l1CorrectedJa,
});
ok(
  "修正版の和訳を表示する",
  getMyExampleJapanese(l1CorrectedRecord) === l1CorrectedJa &&
    getMyExampleSentence(l1CorrectedRecord) === l1CorrectedEn,
);

ok(
  "保存済み和訳を My Loop が表示する",
  getMyExampleJapanese(
    baseRecord("lesson-01-be-verb", "I am a student.", {
      userExampleJapanese: "私は学生です。",
    }),
  ) === "私は学生です。",
);
ok(
  "和訳なしの旧レコードは空文字（クラッシュしない）",
  getMyExampleJapanese(baseRecord("lesson-01-be-verb", "I am a student.")) === "",
);

const l1Page = readFileSync(join(root, "src/app/lesson/1/page.tsx"), "utf8");
ok(
  "L1 I am a student. に既存 audioRef",
  l1Page.includes('audioRef="lesson1.body.01"') &&
    l1Page.includes("I am a student."),
);
ok(
  "L1 導入例も SpeakableEnglish",
  l1Page.includes("<SpeakableEnglish audioRef=\"lesson1.body.01\">I am a student.</SpeakableEnglish>"),
);

const catalogSrc = readFileSync(
  join(root, "src/data/fixed-audio-catalog.ts"),
  "utf8",
);
ok(
  "catalog: I am a student. = lesson1.body.01",
  catalogSrc.includes('ref: "lesson1.body.01"') &&
    catalogSrc.includes('text: "I am a student."'),
);

for (const n of [1, 2, 3, 4, 5]) {
  const src = readFileSync(
    join(root, `src/app/lesson/${n}/evaluate/page.tsx`),
    "utf8",
  );
  ok(`L${n} Step4 は共通 EvaluateCoach`, src.includes("EvaluateCoach"));
}

const l2Points = "3単現のsが大事";
const l3Points = "過去と今のつながりが大事";
const l2Coach = "Have＋過去分詞の使い分け。経験、完了、継続それぞれ違うよ。";
const l3Coach = "Have＋過去分詞の使い分け。経験、完了、継続それぞれ違うよ。";

ok(
  "L2 pointsあり+coachAnswerあり → points",
  getMyPoints(
    baseRecord("lesson-02-regular-verb", "I like music.", {
      coachAnswer: l2Coach,
      trajectoryEntries: [
        { id: "points", label: "自分が大事だと思うポイント", answer: l2Points },
        { id: "user-example", label: "例文", answer: "I like music." },
      ],
    }),
  ) === l2Points,
);
ok(
  "L3 は coachAnswer を表示（Step3 points があっても）",
  getMyPoints(
    baseRecord("lesson-03-present-perfect", l3Ok, {
      coachAnswer: l3Coach,
      trajectoryEntries: [
        { id: "points", label: "自分が大事だと思うポイント", answer: l3Points },
        { id: "user-example", label: "例文", answer: l3Ok },
      ],
    }),
  ) === l3Coach,
);
ok(
  "L2 pointsなし+coachAnswerあり → coachAnswer",
  getMyPoints(
    baseRecord("lesson-02-regular-verb", "I like music.", {
      coachAnswer: l2Coach,
    }),
  ) === l2Coach,
);
ok(
  "L3 pointsなし+coachAnswerあり → coachAnswer",
  getMyPoints(
    baseRecord("lesson-03-present-perfect", l3Ok, {
      coachAnswer: l3Coach,
    }),
  ) === l3Coach,
);
ok(
  "L1 は final-l1-my-points を維持",
  getMyPoints(
    baseRecord("lesson-01-be-verb", "I am happy.", {
      coachAnswer: "Step5の合成文",
      trajectoryEntries: [
        { id: "points", label: "自分が大事だと思うポイント", answer: "Step3のポイント" },
        { id: "user-example", label: "例文", answer: "I am happy." },
      ],
      finalSummary: l1BuiltOriginal,
    }),
  ) === "am/is/areの使い分けが大事",
);
ok(
  "myPointsFinal があれば L3 でも優先",
  getMyPoints(
    baseRecord("lesson-03-present-perfect", l3Ok, {
      coachAnswer: l3Coach,
      myPointsFinal: "過去形との違いを大事だと思った。",
    }),
  ) === "過去形との違いを大事だと思った。",
);
ok(
  "自作例文は userExampleFinal 優先のまま",
  getMyExampleSentence(
    baseRecord("lesson-03-present-perfect", l3Wrong, {
      userExampleFinal: l3Corrected,
    }),
  ) === l3Corrected,
);

const legacyMemo = parseLessonMemo("am は I のときだけ");
ok("旧メモはその他メモへ", legacyMemo.other === "am は I のときだけ");
ok("旧メモの意味は空", legacyMemo.meaning === "");
ok(
  "新メモJSONを読める",
  parseLessonMemo(
    JSON.stringify({
      meaning: "意味A",
      grammar: "文法B",
      important: "大事C",
      other: "他D",
    }),
  ).grammar === "文法B",
);

ok(
  "疑問なしは null",
  getUnclearQuestionText({ [UNCLEAR_CHOICE_ID]: "none", [UNCLEAR_DETAIL_ID]: "なぜ？" }) ===
    null,
);
ok(
  "疑問ありでも空欄は null",
  getUnclearQuestionText({ [UNCLEAR_CHOICE_ID]: "yes", [UNCLEAR_DETAIL_ID]: "  " }) ===
    null,
);
ok(
  "疑問あり＋入力ありは本文を返す",
  getUnclearQuestionText({
    [UNCLEAR_CHOICE_ID]: "yes",
    [UNCLEAR_DETAIL_ID]: "なぜifの後に過去形を使うの？",
  }) === "なぜifの後に過去形を使うの？",
);

ok("evaluate schema に unknownQuestionAnswer", evalLib.includes("unknownQuestionAnswer:"));
ok(
  "疑問なしなら回答を作らせない指示がある",
  evalLib.includes("ユーザーは疑問を書いていない。unknownQuestionAnswer は必ず null"),
);
ok(
  "Step4 に疑問回答セクションがある",
  evaluateSrc.includes("UnclearQuestionAnswerSection"),
);
ok(
  "Step4 の evaluate API は1箇所のまま",
  (evaluateSrc.match(/\/api\/coach\/evaluate/g) ?? []).length === 1,
);
ok(
  "日本語: 分からなかったところを確認しよう",
  uiSrc.includes("分からなかったところを確認しよう"),
);

const memoPanelSrc = readFileSync(
  join(root, "src/components/LessonMemoPanel.tsx"),
  "utf8",
);
ok("メモに意味欄がある", memoPanelSrc.includes("ui.memo.meaning"));
ok("メモに文法欄がある", memoPanelSrc.includes("ui.memo.grammar"));
ok("メモに大事なこと欄がある", memoPanelSrc.includes("ui.memo.important"));
ok("メモにその他メモ欄がある", memoPanelSrc.includes("ui.memo.other"));
ok("メモはAIを呼ばない", !memoPanelSrc.includes("/api/"));

const explainPolicy = readFileSync(
  join(root, "src/lib/coach-explain-policy.ts"),
  "utf8",
);
ok("共通説明方針がある", explainPolicy.includes("ルールだから"));
ok("共通方針は核心から答える", explainPolicy.includes("最初に核心"));
ok("共通方針は理由の捏造を禁止", explainPolicy.includes("もっともらしい理由を作らない"));
ok("共通方針に仮定法の固定回答はない", !explainPolicy.includes("If I were rich"));
ok(
  "evaluate が共通方針を使う",
  evalLib.includes("buildExplainToUnderstandPolicy"),
);
const teachEvalSrc = readFileSync(
  join(root, "src/lib/coach-teach-evaluate.ts"),
  "utf8",
);
ok(
  "Step5 teach も共通方針を使う",
  teachEvalSrc.includes("buildExplainToUnderstandPolicy"),
);
ok(
  "Step4 に「次の質問」見出しがない",
  !evaluateSrc.includes("structuredNextQuestion") &&
    !evaluateSrc.includes("次の質問"),
);
ok(
  "分からなかったところセクションは残る",
  evaluateSrc.includes("UnclearQuestionAnswerSection"),
);

ok(
  "unknownQuestionAnswer は最大3文",
  UNKNOWN_QUESTION_ANSWER_MAX_SENTENCES === 3,
);
ok(
  "evaluate が疑問回答をクリップする",
  evalLib.includes("clipUnknownQuestionAnswer"),
);
ok(
  "表示側も疑問回答をクリップする",
  evaluateSrc.includes("clipUnknownQuestionAnswer"),
);
ok(
  "疑問回答に3文制限プロンプトがある",
  evalLib.includes("buildUnknownQuestionAnswerLengthPolicy"),
);
ok(
  "共通方針ファイルに3文制限がある",
  explainPolicy.includes("最大3文"),
);
ok(
  "Step5 teach は3文制限を使わない",
  !teachEvalSrc.includes("buildUnknownQuestionAnswerLengthPolicy") &&
    !teachEvalSrc.includes("clipUnknownQuestionAnswer"),
);

const idealUnknown = [
  "仮定法では、現実とは違う想像だと表すために過去形を使うよ。",
  "ここでの過去形は「昔」ではなく、「現実から距離を置く」役割。",
  "だから今の話でも If I were... になる。",
].join("");
ok(
  "理想の3文はそのまま残る",
  clipUnknownQuestionAnswer(idealUnknown) === idealUnknown,
);

const fourSentences =
  "答えは過去形で現実から距離を置くことだよ。理由は想像だから。補足として were を使う。これは4文目なので切る。";
ok(
  "4文目以降は捨てて3文にする",
  splitUnknownQuestionSentences(clipUnknownQuestionAnswer(fourSentences) ?? "")
    .length === 3,
);
ok(
  "4文クリップ後も句点で終わる",
  (clipUnknownQuestionAnswer(fourSentences) ?? "").endsWith("。"),
);

const runawayClosings = [
  "仮定法では、現実とは違う想像だと表すために過去形を使うよ。",
  "お疲れ様でした。",
  "また次回も一緒に頑張りましょう。",
  "次も期待しています。",
  "また会いましょう。",
  "お疲れ様でした。",
  "また次回も一緒に頑張りましょう。",
  "次も期待しています。",
  "また会いましょう。",
].join("");
const clippedRunaway = clipUnknownQuestionAnswer(runawayClosings);
ok(
  "締めの反復は除いて核心だけ残る",
  clippedRunaway ===
    "仮定法では、現実とは違う想像だと表すために過去形を使うよ。",
);
ok(
  "励まし文は残らない",
  !/お疲れ|頑張|また会い|次も期待|また次回/.test(clippedRunaway ?? ""),
);

const onlyClosings = "お疲れ様でした。また会いましょう。一緒に頑張りましょう。";
ok(
  "締めだけなら null（fallback 用）",
  clipUnknownQuestionAnswer(onlyClosings) === null,
);
ok("空文字は null", clipUnknownQuestionAnswer("  ") === null);
ok("null は null", clipUnknownQuestionAnswer(null) === null);

const repeatedSame =
  "過去形は昔ではなく想像のためだよ。過去形は昔ではなく想像のためだよ。過去形は昔ではなく想像のためだよ。";
ok(
  "同じ文の繰り返しは1回だけ",
  splitUnknownQuestionSentences(clipUnknownQuestionAnswer(repeatedSame) ?? "")
    .length === 1,
);

const loopChunk = "また会いましょう".repeat(40);
ok(
  "同一フレーズの暴走は fallback",
  clipUnknownQuestionAnswer(loopChunk) === null,
);

ok(
  "クリップは途中ぶつ切りしない",
  clipUnknownQuestionAnswer(
    "仮定法の過去形は昔の話ではないよ。これは2文目です。",
  ) === "仮定法の過去形は昔の話ではないよ。これは2文目です。",
);

const restatedUnknown = [
  "ifの後に過去形を使うのは、現実とは違うことを考えているからだよ。",
  "つまり、今の自分とは違う状況を想像しているから過去形になるんだ。",
  "それによって、今とは違うことを表現できる。",
].join("");
ok(
  "つまり・それによっての言い換えは落とす",
  clipUnknownQuestionAnswer(restatedUnknown) ===
    "ifの後に過去形を使うのは、現実とは違うことを考えているからだよ。",
);
ok(
  "1〜2文優先の指示がある",
  explainPolicy.includes("基本は1〜2文") &&
    explainPolicy.includes("新しい情報がないなら、次の文を書かない"),
);

ok(
  "小5向け語彙ルールがある",
  explainPolicy.includes("小学5年生でも分かる言葉"),
);
ok(
  "難しい言葉を具体例に言い換える",
  explainPolicy.includes("本当はそうじゃないけど") &&
    explainPolicy.includes("もしそうだったら"),
);
ok(
  "専門用語は消さず説明を付ける",
  explainPolicy.includes("専門用語は消さない") &&
    explainPolicy.includes("その場で意味が分かる説明"),
);
ok(
  "やさしくしても嘘をつかない",
  explainPolicy.includes("簡単にするために嘘をつかない"),
);
ok(
  "evaluate が小5向けルールを使う",
  evalLib.includes("buildGrade5LearnerLanguagePolicy"),
);
ok(
  "Step5 teach が追加質問ルールを使う",
  teachEvalSrc.includes("buildFollowUpQuestionPolicy"),
);
const meaningCheckPolicy = readFileSync(
  join(root, "src/lib/meaning-check-follow-up.ts"),
  "utf8",
);
ok(
  "2問目は英文の意味確認",
  explainPolicy.includes("MEANING_CHECK_FOLLOW_UP_POLICY") &&
    meaningCheckPolicy.includes('MEANING_CHECK_QUESTION_JA = "この文はどんな意味？"'),
);
ok(
  "抽象的な追加質問は禁止",
  meaningCheckPolicy.includes("どんなときに使うと思う") &&
    meaningCheckPolicy.includes("3問目は出さない"),
);
ok(
  "Step4→Step5 の計測がある",
  evaluateSrc.includes("evaluate-to-answer") &&
    readFileSync(join(root, "src/components/AnswerCoach.tsx"), "utf8").includes(
      "evaluate-to-answer",
    ),
);
ok(
  "Step5 初回質問は固定（API増なし）",
  readFileSync(join(root, "src/components/AnswerCoach.tsx"), "utf8").includes(
    "getFixedCoachQuestion",
  ) &&
    (evaluateSrc.match(/\/api\/coach\/evaluate/g) ?? []).length === 1,
);
ok(
  "Step5 は question API を呼ばない",
  !readFileSync(join(root, "src/components/AnswerCoach.tsx"), "utf8").includes(
    "/api/coach/question",
  ),
);

ok(
  "Lesson5 fallback 英文は仮定法",
  pickMeaningCheckFallbackSentence("lesson-05-subjunctive") ===
    "If I were rich, I would travel around the world.",
);
ok(
  "2問目の表示は英文＋意味確認",
  formatMeaningCheckFollowUp("She is tired.") ===
    "She is tired.\nこの文はどんな意味？",
);
ok(
  "1問目のあとは英文 follow-up にする",
  applyMeaningCheckFollowUpGate(
    {
      outcome: "complete",
      followUpQuestion: null,
      closingMessage: "ok",
    },
    "lesson-01-be-verb",
    { isFollowUpAnswer: false, followUpCount: 0 },
  ).followUpQuestion ===
    "I am happy.\nこの文はどんな意味？",
);
ok(
  "2問目のあとに3問目を出さない",
  applyMeaningCheckFollowUpGate(
    {
      outcome: "followup",
      followUpQuestion: "もう一回聞いていい？",
    },
    "lesson-05-subjunctive",
    { isFollowUpAnswer: true, followUpCount: 1 },
  ).outcome === "complete",
);

const l1HouseOriginal = "this is the house .";
const l1HouseCheck = {
  isCorrect: true,
  correctedExample: null,
  errorReason: null,
};
const l1HouseFlow = runStep4ExampleFlow(
  {
    originalExample: l1HouseOriginal,
    userExampleCheck: l1HouseCheck,
    userExampleJapanese: null,
    userExampleJapaneseFor: null,
  },
  "これは家です。",
);
ok(
  "実機不具合: checkあり finalなし isCorrect → original を final に補完",
  l1HouseFlow.userExampleFinal === l1HouseOriginal.trim(),
);
ok(
  "実機不具合: translate-example が original を送る",
  l1HouseFlow.shouldTranslate === true &&
    l1HouseFlow.translateRequest?.url === TRANSLATE_EXAMPLE_API_PATH &&
    l1HouseFlow.translateRequest.body.english === l1HouseOriginal.trim(),
);
ok(
  "実機不具合: 和訳を保存する",
  l1HouseFlow.userExampleJapanese === "これは家です。" &&
    l1HouseFlow.userExampleJapaneseFor === l1HouseOriginal.trim(),
);
ok(
  "実機不具合: Step4 表示英文と翻訳対象が同じ",
  l1HouseFlow.displayedEnglish === l1HouseFlow.translateRequest?.body.english &&
    l1HouseFlow.displayedJapanese === "これは家です。",
);

const l3CorrectedFlow = runStep4ExampleFlow(
  {
    originalExample: l3Wrong,
    userExampleCheck: {
      isCorrect: false,
      correctedExample: l3Corrected,
      errorReason: "never と haven't が重なっているよ",
    },
    userExampleJapanese: null,
    userExampleJapaneseFor: null,
  },
  "私は北海道に行ったことがありません。",
);
ok(
  "修正あり finalなし → correctedExample を final に補完",
  l3CorrectedFlow.userExampleFinal === l3Corrected,
);
ok(
  "修正あり: 修正文を翻訳する",
  l3CorrectedFlow.shouldTranslate === true &&
    l3CorrectedFlow.translateRequest?.body.english === l3Corrected,
);
ok(
  "修正あり: 修正文と和訳を保存する",
  l3CorrectedFlow.userExampleJapanese === "私は北海道に行ったことがありません。" &&
    l3CorrectedFlow.userExampleJapaneseFor === l3Corrected,
);
ok(
  "修正あり: Step4 表示は修正文+和訳",
  l3CorrectedFlow.displayedEnglish === l3Corrected &&
    l3CorrectedFlow.displayedJapanese ===
      "私は北海道に行ったことがありません。",
);

const alreadyTranslated = resolveStep4Example({
  originalExample: l1HouseOriginal,
  userExampleCheck: l1HouseCheck,
  userExampleJapanese: "これは家です。",
  userExampleJapaneseFor: l1HouseOriginal.trim(),
});
ok(
  "既存和訳があるときは再翻訳しない",
  alreadyTranslated.shouldTranslate === false &&
    alreadyTranslated.translateRequest === null &&
    alreadyTranslated.displayedJapanese === "これは家です。",
);
ok(
  "既存和訳でも final は補完する",
  alreadyTranslated.finalEnglish === l1HouseOriginal.trim(),
);

const translationFailed = applyStep4TranslationResult(
  {
    originalExample: l1HouseOriginal,
    userExampleCheck: l1HouseCheck,
    userExampleJapanese: "これは家です。",
    userExampleJapaneseFor: l1HouseOriginal.trim(),
  },
  "",
);
ok(
  "翻訳失敗: 既存訳を空で消さない",
  translationFailed.userExampleJapanese === "これは家です。" &&
    translationFailed.displayedJapanese === "これは家です。",
);

const translationFailedNew = runStep4ExampleFlow(
  {
    originalExample: l1HouseOriginal,
    userExampleCheck: l1HouseCheck,
    userExampleJapanese: null,
    userExampleJapaneseFor: null,
  },
  null,
);
ok(
  "翻訳失敗: 英文の final は残る",
  translationFailedNew.userExampleFinal === l1HouseOriginal.trim(),
);
ok(
  "翻訳失敗: 和訳は空のままレッスンを止めない",
  translationFailedNew.userExampleJapanese === null &&
    translationFailedNew.displayedJapanese === "" &&
    translationFailedNew.canProceedWithoutJapanese === true &&
    translationFailedNew.shouldTranslate === true,
);

ok(
  "EvaluateCoach がキャッシュ経路でも persistFinalAndTranslate する",
  evaluateSrc.includes("draft.aiEvaluation?.overallMessage") &&
    evaluateSrc.includes("persistFinalAndTranslate"),
);

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
