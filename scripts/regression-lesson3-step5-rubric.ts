/**
 * Lesson3 Step5 rubric 登録
 * 実行: npx tsx scripts/regression-lesson3-step5-rubric.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getCoachRubricByLessonNumber,
  getCoachRubricForLesson,
} from "../src/lib/coach-rubric";
import { lesson03CoachRubric } from "../src/lib/coach-rubric/lesson03";
import { getRubricForLesson } from "../src/lib/coach-teach-hints";
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

const l3 = getCoachRubricForLesson("lesson-03-present-perfect");
ok("getCoachRubricForLesson が Lesson3 を返す", l3 != null);
ok(
  "Lesson3 lessonId",
  l3?.lessonId === "lesson-03-present-perfect",
);
ok(
  "Step5 getRubricForLesson も同じ Lesson3 rubric",
  getRubricForLesson("lesson-03-present-perfect") === l3,
);
ok(
  "番号指定でも Lesson3 を返す",
  getCoachRubricByLessonNumber(3)?.lessonId === "lesson-03-present-perfect",
);
ok(
  "取得した rubric は既存 lesson03CoachRubric と同じ",
  l3 === lesson03CoachRubric,
);
ok(
  "既存 Lesson3 rubric の point id は変わっていない",
  (l3?.points.map((p) => p.id) ?? []).join(",") ===
    "pp-connection,past-vs-present-perfect,form-have-pp,three-uses,have-has",
);
ok(
  "Step4 が使う registry rubric も同じオブジェクト",
  getLesson(3)?.coach.rubric === lesson03CoachRubric,
);

ok(
  "L1 は 4点のまま",
  getCoachRubricForLesson("lesson-01-be-verb")?.points.length === 4,
);
ok(
  "L2 は 4点のまま",
  getCoachRubricForLesson("lesson-02-regular-verb")?.points.length === 4,
);
ok(
  "L4 は 4点のまま",
  getCoachRubricForLesson("lesson-04-relative-pronoun")?.points.length === 4,
);
ok(
  "L1 lessonId は維持",
  getCoachRubricForLesson("lesson-01-be-verb")?.lessonId === "lesson-01-be-verb",
);
ok(
  "L2 lessonId は維持",
  getCoachRubricForLesson("lesson-02-regular-verb")?.lessonId ===
    "lesson-02-regular-verb",
);
ok(
  "L4 lessonId は維持",
  getCoachRubricForLesson("lesson-04-relative-pronoun")?.lessonId ===
    "lesson-04-relative-pronoun",
);

const l3Src = readFileSync(
  join(process.cwd(), "src/lib/coach-rubric/lesson03.ts"),
  "utf8",
);
ok(
  "lesson03.ts の既存 point 定義は残っている",
  l3Src.includes('id: "pp-connection"') &&
    l3Src.includes('id: "past-vs-present-perfect"') &&
    l3Src.includes('id: "have-has"'),
);

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
