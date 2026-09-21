/**
 * 理解度テスト：会話の返事問題（L1/L2/L3 各1問追加）
 * 実行: npx tsx scripts/regression-check-reply.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { lesson01CheckQuestions } from "../src/data/lesson01";
import { lesson02CheckQuestions } from "../src/data/lesson02";
import { lesson03CheckQuestions } from "../src/data/lesson03";
import { lesson04CheckQuestions } from "../src/data/lesson04";
import { lesson05CheckQuestions } from "../src/data/lesson05";
import { resolveAudioRef } from "../src/data/fixed-audio-catalog";
import { checkChoiceAnswer } from "../src/lib/check-answers";
import {
  correctChoiceIndex,
  shuffleChoicesStable,
} from "../src/lib/check-choice-order";
import { getLesson } from "../src/lib/lessons/registry";

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

ok("L1 は7問", lesson01CheckQuestions.length === 7);
ok("L2 は7問", lesson02CheckQuestions.length === 7);
ok("L3 は7問", lesson03CheckQuestions.length === 7);
ok("registry L1 も7問", getLesson(1)?.checkQuestions.length === 7);
ok("registry L2 も7問", getLesson(2)?.checkQuestions.length === 7);
ok("registry L3 も7問", getLesson(3)?.checkQuestions.length === 7);

ok("L1 既存 q1 は残る", lesson01CheckQuestions[0]?.id === "q1");
ok("L2 既存 q6 は残る", lesson02CheckQuestions[5]?.answer === "Do you like music?");
ok("L3 既存 q6 は残る", Boolean(lesson03CheckQuestions[5]?.question.includes("I lost my key.")));

const l1q7 = lesson01CheckQuestions[6]!;
const l2q7 = lesson02CheckQuestions[6]!;
const l3q7 = lesson03CheckQuestions[6]!;

ok("L1 q7 id", l1q7.id === "q7");
ok("L2 q7 id", l2q7.id === "q7");
ok("L3 q7 id", l3q7.id === "q7");
ok("3問とも choice", [l1q7, l2q7, l3q7].every((q) => q.type === "choice"));

ok("L1 質問は Are you tired?", l1q7.question.includes("Are you tired?"));
ok("L2 質問は Do you like music?", l2q7.question.includes("Do you like music?"));
ok(
  "L3 質問は Have you ever been to Kyoto?",
  l3q7.question.includes("Have you ever been to Kyoto?"),
);

ok("L1 正解 Yes, I am.", l1q7.answer === "Yes, I am.");
ok("L2 正解 Yes, I do.", l2q7.answer === "Yes, I do.");
ok("L3 正解 Yes, I have.", l3q7.answer === "Yes, I have.");

ok("L1 正解判定", checkChoiceAnswer("Yes, I am.", l1q7));
ok("L1 不正解判定 do", !checkChoiceAnswer("Yes, I do.", l1q7));
ok("L2 正解判定", checkChoiceAnswer("Yes, I do.", l2q7));
ok("L2 不正解判定 am", !checkChoiceAnswer("Yes, I am.", l2q7));
ok("L3 正解判定", checkChoiceAnswer("Yes, I have.", l3q7));
ok("L3 不正解判定 did", !checkChoiceAnswer("Yes, I did.", l3q7));

ok("L1 解説に be動詞", Boolean(l1q7.explanation.includes("be動詞")));
ok("L2 解説に do", Boolean(l2q7.explanation.includes("do")));
ok("L3 解説に have", Boolean(l3q7.explanation.includes("have")));
ok("L3 解説に Kyoto", Boolean(l3q7.explanation.includes("Kyoto")));

const l1Audio = resolveAudioRef("lesson1.check.q7");
const l1Reuse = resolveAudioRef("lesson1.body.31");
ok("L1 check 音声テキスト", l1Audio?.text === "Yes, I am.");
ok("L1 は既存 Yes, I am. を再利用", l1Audio?.fileId === l1Reuse?.fileId);

const l2Audio = resolveAudioRef("lesson2.check.q7");
const l2Reuse = resolveAudioRef("lesson2.body.13");
ok("L2 check 音声テキスト", l2Audio?.text === "Yes, I do.");
ok("L2 は既存 Yes, I do. を再利用", l2Audio?.fileId === l2Reuse?.fileId);

const l3Audio = resolveAudioRef("lesson3.check.q7");
ok("L3 check 音声テキスト", l3Audio?.text === "Yes, I have.");
ok(
  "L3 は Have you been to Kyoto? と別ファイル",
  l3Audio?.fileId !== resolveAudioRef("lesson3.body.08")?.fileId,
);

ok(
  "CheckQuiz は questions.length でスコア",
  readFileSync(join(process.cwd(), "src/components/CheckQuiz.tsx"), "utf8").includes(
    "const TOTAL = questions.length",
  ),
);
ok(
  "CheckQuiz は表示時だけ choice を並べ替える",
  readFileSync(join(process.cwd(), "src/components/CheckQuiz.tsx"), "utf8").includes(
    "shuffleChoicesStable",
  ),
);

const definedFirstCount = lesson05CheckQuestions.filter(
  (q) => q.type === "choice" && q.options?.[0] === q.answer,
).length;
ok(
  "L5 定義上は先頭正解が偏っている（表示で分散する前提）",
  definedFirstCount === lesson05CheckQuestions.length,
);

function displayedIndexes(
  lessonId: string,
  questions: typeof lesson05CheckQuestions,
): number[] {
  return questions
    .filter((q) => q.type === "choice" && q.options)
    .map((q) =>
      correctChoiceIndex(
        shuffleChoicesStable(lessonId, q.id, q.options ?? [], String(q.answer)),
        String(q.answer),
      ),
    );
}

const l5Idx = displayedIndexes("lesson-05-subjunctive", lesson05CheckQuestions);
const l4Idx = displayedIndexes("lesson-04-relative-pronoun", lesson04CheckQuestions);
const l3Idx = displayedIndexes(
  "lesson-03-present-perfect",
  lesson03CheckQuestions,
);
const l2Idx = displayedIndexes("lesson-02-regular-verb", lesson02CheckQuestions);
const l1Idx = displayedIndexes("lesson-01-be-verb", lesson01CheckQuestions);

ok("L5 表示の正解位置が全部先頭ではない", l5Idx.some((i) => i > 0));
ok("L5 表示の正解位置が1種類だけではない", new Set(l5Idx).size > 1);
ok(
  "L5 表示は 2,4,1,3,2,4,1 番目",
  l5Idx.map((i) => i + 1).join(",") === "2,4,1,3,2,4,1",
);
ok("L4 表示の正解位置が全部先頭ではない", l4Idx.some((i) => i > 0));
ok("L3 表示の正解位置が全部先頭ではない", l3Idx.some((i) => i > 0));
ok("L2 表示の正解位置が全部先頭ではない", l2Idx.some((i) => i > 0));
ok("L1 表示の正解位置が全部先頭ではない", l1Idx.some((i) => i > 0));

const l5q1a = shuffleChoicesStable(
  "lesson-05-subjunctive",
  "q1",
  lesson05CheckQuestions[0]!.options!,
  String(lesson05CheckQuestions[0]!.answer),
);
const l5q1b = shuffleChoicesStable(
  "lesson-05-subjunctive",
  "q1",
  lesson05CheckQuestions[0]!.options!,
  String(lesson05CheckQuestions[0]!.answer),
);
ok("同じ問題の並びは安定", l5q1a.join("|") === l5q1b.join("|"));
ok(
  "shuffle後も正解判定は文字列一致",
  l5q1a.includes("現実とは違うことや、実際にはそうではないことを想像する") &&
    checkChoiceAnswer(
      "現実とは違うことや、実際にはそうではないことを想像する",
      lesson05CheckQuestions[0]!,
    ),
);
ok(
  "exampleSentence は並び替えと独立",
  lesson05CheckQuestions[0]?.exampleSentence ===
    "If I were rich, I would travel around the world.",
);
ok(
  "check 音声テキストは exampleSentence のまま",
  resolveAudioRef("lesson5.check.q1")?.text ===
    lesson05CheckQuestions[0]?.exampleSentence,
);

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
