/**
 * Phase8 回帰確認：My Words MVP 最終仕上げ（UI・導線）
 * 実行: npx tsx scripts/regression-phase8.ts
 *
 * 出題自動選択・mastery表示・Lesson2 Special は対象外。
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createInitialUserEntry } from "../src/lib/my-words/merge";
import { findWordMasterById } from "../src/data/my-words/index";
import { setUserStatusOverride } from "../src/lib/my-words/status-override";
import { getDisplayedWordStatus } from "../src/lib/my-words/display-status";
import { applyReviewResultToStore } from "../src/lib/my-words/review-sync";
import { clearMyWords, getMyWordById, saveMyWords } from "../src/lib/my-words/store";
import { getSpecialLessonPath } from "../src/lib/special-lessons/registry";

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
const NOW = new Date("2026-08-24T12:00:00.000Z");

function installLocalStorageMock() {
  const mem = new Map<string, string>();
  const localStorage = {
    getItem(key: string) {
      return mem.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      mem.set(key, String(value));
    },
    removeItem(key: string) {
      mem.delete(key);
    },
    clear() {
      mem.clear();
    },
  };
  Object.defineProperty(globalThis, "window", {
    value: { localStorage },
    configurable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorage,
    configurable: true,
  });
}

installLocalStorageMock();

const listSrc = readFileSync(join(root, "src/components/my-words/MyWordsList.tsx"), "utf8");
ok("カード全体から詳細へ移動できる", listSrc.includes('aria-label={`${word.english} の詳細`}'));
ok("カードに inset-0 の詳細 Link がある", listSrc.includes("absolute inset-0"));
ok("音声ボタンはカードより前面", listSrc.includes("relative z-20") && listSrc.includes("SpeakButton"));
ok("音声ボタン操作で詳細へ誤遷移しない", listSrc.includes("stopCardNavigation") || listSrc.includes("SpeakButton"));
ok("SpeakButton が stopPropagation する", readFileSync(join(root, "src/components/SpeakButton.tsx"), "utf8").includes("stopPropagation"));
ok("フィルター仕様維持", listSrc.includes("toggleStatus") && listSrc.includes("getDisplayedWordStatus"));
ok("復習導線が Lesson1 Special へ進む", listSrc.includes("getSpecialLessonPath(1)") && listSrc.includes("reviewSpecialCta"));
ok("復習導線は固定パス", listSrc.includes("LESSON1_SPECIAL_PATH") && getSpecialLessonPath(1) === "/lesson/1/special");
ok("自動出題候補は一覧で使わない", !listSrc.includes("getDueReviewCandidatesForLesson"));
ok("復習候補関数は一覧で使わない", !listSrc.includes("getReviewCandidatesForLesson"));

const statsSrc = readFileSync(join(root, "src/components/my-words/MyWordsStats.tsx"), "utf8");
ok("フィルター見出しがある", statsSrc.includes("filterHeading"));
ok("フィルター ON/OFF 表示がある", statsSrc.includes("filterOn") && statsSrc.includes("filterOff"));
ok("4状態トグルは維持", statsSrc.includes('"practicing"') && statsSrc.includes('"new"') && statsSrc.includes('"weak"') && statsSrc.includes('"learned"'));
ok("状態ボタンは独立トグル", statsSrc.includes("onToggle"));

const detailSrc = readFileSync(join(root, "src/components/my-words/MyWordsDetail.tsx"), "utf8");
ok("前後移動維持", detailSrc.includes("prevWord") && detailSrc.includes("nextWord"));
ok("キーボード前後維持", detailSrc.includes("ArrowLeft") && detailSrc.includes("ArrowRight"));
ok("入力中はキー移動しない", detailSrc.includes("isTypingTarget"));
ok("手動status維持", detailSrc.includes("setLearned") && detailSrc.includes("setPracticing") && detailSrc.includes("setWeak") && detailSrc.includes("setUserStatusOverride"));
ok("自動判定に戻す維持", detailSrc.includes("clearOverride"));
ok("例文・レッスン・次回復習・初学日を表示", detailSrc.includes("example") && detailSrc.includes("lessonNumbers") && detailSrc.includes("nextReviewAt") && detailSrc.includes("firstLearnedAt"));
ok("詳細に単語音声がある", detailSrc.includes("SpeakButton"));
ok("正誤回数の新規表示はしない", !detailSrc.includes("correctCount") && !detailSrc.includes("masteryLevel"));

const quizSrc = readFileSync(join(root, "src/components/special/VocabSpecialQuiz.tsx"), "utf8");
ok("Special 正誤反映維持", quizSrc.includes("applyReviewResultToStore") && quizSrc.includes('"correct"') && quizSrc.includes('"incorrect"'));

const specialSrc = readFileSync(join(root, "src/data/special/lesson01-vocab.ts"), "utf8");
ok("Special 固定7問維持", (specialSrc.match(/wordId:/g) ?? []).length === 7);

const speakSrc = readFileSync(join(root, "src/components/SpeakButton.tsx"), "utf8");
ok("音声無しでもクラッシュしない", speakSrc.includes("wordAudioFileExists") && speakSrc.includes("catch"));

const master = findWordMasterById("happy");
if (!master) {
  ok("happy マスターがある", false);
} else {
  const entry = createInitialUserEntry(master, 1, NOW);
  saveMyWords([entry]);
  setUserStatusOverride("happy", "learned");
  ok(
    "習得済み手動statusは override のみ",
    getMyWordById("happy")?.userStatusOverride === "learned" &&
      getMyWordById("happy")?.status === "new" &&
      getDisplayedWordStatus(getMyWordById("happy")!) === "learned",
  );
  setUserStatusOverride("happy", "weak");
  ok(
    "手動statusは override のみ",
    getMyWordById("happy")?.userStatusOverride === "weak" &&
      getMyWordById("happy")?.status === "new",
  );

  applyReviewResultToStore("happy", "correct", 1, NOW);
  const stored = getMyWordById("happy");
  ok("Special正誤で override が解除される", stored?.userStatusOverride == null);
  ok(
    "復習間隔ロジックは残る",
    typeof stored?.nextReviewAt === "string" && stored?.masteryLevel === 1,
  );
}

clearMyWords();

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
