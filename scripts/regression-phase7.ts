/**
 * Phase7 回帰確認：Special 復習結果 → My Words 反映の固定
 * 実行: npx tsx scripts/regression-phase7.ts
 *
 * Special の出題内容・通常レッスン保存は変更せず、
 * 既存の applyReviewResult / applyReviewResultToStore 経路を検証する。
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { lesson01SpecialConfig } from "../src/data/special/lesson01-vocab";
import { findWordMasterById } from "../src/data/my-words/index";
import {
  applyReviewResult,
  createInitialUserEntry,
  mergeLessonWordsIntoEntries,
} from "../src/lib/my-words/merge";
import {
  applyReviewResultToStore,
  resolveWordMaster,
} from "../src/lib/my-words/review-sync";
import {
  REVIEW_INTERVALS_DAYS,
  calculateNextReview,
  getInitialNextReviewAt,
  getReviewIntervalDays,
} from "../src/lib/my-words/review-schedule";
import { countWordsByStatus, countTotalWords } from "../src/lib/my-words/stats";
import {
  getDisplayedWordStatus,
  hasUserStatusOverride,
} from "../src/lib/my-words/display-status";
import { setUserStatusOverride } from "../src/lib/my-words/status-override";
import {
  getWordNavState,
  resolveWordNavOrder,
} from "../src/lib/my-words/nav-order";
import {
  clearMyWords,
  getMyWordById,
  loadMyWords,
  saveMyWords,
} from "../src/lib/my-words/store";
import { isVocabAnswerCorrect } from "../src/lib/special-lessons/answer-check";
import { buildSpecialQuestions } from "../src/lib/special-lessons/build-questions";
import { resolveAudioRef } from "../src/data/fixed-audio-catalog";
import { resolveWordAudioRef } from "../src/lib/word-audio";
import { shouldRetryCoachRequest } from "../src/lib/fetch-with-timeout";
import type { MyWordUserEntry } from "../src/types/my-words";

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

const NOW = new Date("2026-08-24T12:00:00.000Z");

function freshEntry(wordId: string, now: Date = NOW): MyWordUserEntry {
  const master = findWordMasterById(wordId);
  if (!master) {
    throw new Error(`word master not found: ${wordId}`);
  }
  return createInitialUserEntry(master, 1, now);
}

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
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorage,
    configurable: true,
  });
  Object.defineProperty(globalThis, "window", {
    value: globalThis,
    configurable: true,
  });
}

// --- Special 7問・判定は現状維持 ---
const questions = buildSpecialQuestions(lesson01SpecialConfig);
ok("Special は7問", questions.length === 7);
ok(
  "Special wordId 順",
  questions.map((q) => q.wordId).join(",") ===
    "student,teacher,tired,happy,friend,new,book",
);
ok("q1 は en-to-ja", questions[0]?.type === "en-to-ja");
ok("q6 は ja-to-en", questions[5]?.type === "ja-to-en");
ok("q1 選択肢4つ", questions[0]?.options.length === 4);
ok(
  "q1 正解判定 学生",
  Boolean(questions[0] && isVocabAnswerCorrect("学生", questions[0])),
);
ok(
  "q1 不正解判定 先生",
  Boolean(questions[0] && !isVocabAnswerCorrect("先生", questions[0])),
);
ok(
  "q6 正解判定 new",
  Boolean(questions[5] && isVocabAnswerCorrect("new", questions[5])),
);
ok("補助単語 friend のマスターあり", resolveWordMaster("friend")?.english === "friend");
ok("補助単語 new のマスターあり", resolveWordMaster("new")?.english === "new");
ok("補助単語 book のマスターあり", resolveWordMaster("book")?.english === "book");

// --- 正解：mastery / 連続 / nextReviewAt / status ---
const student0 = freshEntry("student");
ok("初期 status は new", student0.status === "new");
ok("初期 lastReviewedAt は null", student0.lastReviewedAt === null);
ok("初期 masteryLevel は 0", student0.masteryLevel === 0);

const expectedCorrect = calculateNextReview(student0, "correct", NOW);
const studentCorrect1 = applyReviewResult(student0, "correct", NOW);
ok("1回正解: masteryLevel +1", studentCorrect1.masteryLevel === 1);
ok("1回正解: correctCount +1", studentCorrect1.correctCount === 1);
ok("1回正解: consecutiveCorrect +1", studentCorrect1.consecutiveCorrect === 1);
ok("1回正解: consecutiveIncorrect 0", studentCorrect1.consecutiveIncorrect === 0);
ok("1回正解: lastReviewResult correct", studentCorrect1.lastReviewResult === "correct");
ok(
  "1回正解: nextReviewAt は既存計算どおり",
  studentCorrect1.nextReviewAt === expectedCorrect.nextReviewAt,
);
ok("1回正解: 間隔は1日", getReviewIntervalDays(1) === REVIEW_INTERVALS_DAYS[1]);
ok("1回正解: status は practicing", studentCorrect1.status === "practicing");
ok(
  "1回正解: lessonNumbers 維持",
  studentCorrect1.lessonNumbers.join(",") === student0.lessonNumbers.join(","),
);
ok("1回正解: firstLearnedAt 維持", studentCorrect1.firstLearnedAt === student0.firstLearnedAt);
ok("1回正解: english 維持", studentCorrect1.english === student0.english);

const studentCorrect2 = applyReviewResult(studentCorrect1, "correct", NOW);
const studentCorrect3 = applyReviewResult(studentCorrect2, "correct", NOW);
ok("3回正解: masteryLevel 3", studentCorrect3.masteryLevel === 3);
ok("3回正解: correctCount 3", studentCorrect3.correctCount === 3);
ok("3回正解: consecutiveCorrect 3", studentCorrect3.consecutiveCorrect === 3);
ok("3回正解: status は learned", studentCorrect3.status === "learned");

const learnedWithOverride = {
  ...studentCorrect3,
  userStatusOverride: "practicing" as const,
};
ok(
  "override 表示は練習中",
  getDisplayedWordStatus(learnedWithOverride) === "practicing",
);
ok("override 中も自動 status は learned", learnedWithOverride.status === "learned");
ok(
  "override 中も mastery 維持",
  learnedWithOverride.masteryLevel === studentCorrect3.masteryLevel,
);
ok(
  "override 中も correctCount 維持",
  learnedWithOverride.correctCount === studentCorrect3.correctCount,
);
ok(
  "override 中も consecutiveCorrect 維持",
  learnedWithOverride.consecutiveCorrect === studentCorrect3.consecutiveCorrect,
);
ok("override あり判定", hasUserStatusOverride(learnedWithOverride));

const afterCorrectClear = applyReviewResult(learnedWithOverride, "correct", NOW);
ok("正解後 override 解除", afterCorrectClear.userStatusOverride === null);
ok(
  "正解後は自動判定へ戻る",
  afterCorrectClear.status === "learned" &&
    getDisplayedWordStatus(afterCorrectClear) === "learned",
);
ok(
  "正解後も correctCount は増える",
  afterCorrectClear.correctCount === studentCorrect3.correctCount + 1,
);

const weakOverride = { ...studentCorrect3, userStatusOverride: "weak" as const };
const afterIncorrectClear = applyReviewResult(weakOverride, "incorrect", NOW);
ok("不正解後も override 解除", afterIncorrectClear.userStatusOverride === null);
ok(
  "不正解後は既存自動 status",
  afterIncorrectClear.status === "practicing",
);
ok(
  "不正解後 nextReviewAt は既存計算",
  afterIncorrectClear.nextReviewAt ===
    applyReviewResult(studentCorrect3, "incorrect", NOW).nextReviewAt,
);

const overrideCounts = countWordsByStatus([learnedWithOverride]);
ok("件数は表示状態を優先", overrideCounts.practicing === 1 && overrideCounts.learned === 0);
ok("総単語数は status で変わらない", countTotalWords([learnedWithOverride]) === 1);

const navAll = ["student", "happy", "teacher"];
ok(
  "最初は prev なし",
  getWordNavState("student", navAll).isFirst &&
    getWordNavState("student", navAll).prevId === null,
);
ok(
  "最後は next なし",
  getWordNavState("teacher", navAll).isLast &&
    getWordNavState("teacher", navAll).nextId === null,
);
ok(
  "happy の前後",
  getWordNavState("happy", navAll).prevId === "student" &&
    getWordNavState("happy", navAll).nextId === "teacher",
);
ok(
  "フィルター順を維持",
  resolveWordNavOrder("happy", ["a", "b"], ["teacher", "happy", "student"]).join(",") ===
    "teacher,happy,student",
);
ok(
  "直接URLは全件順",
  resolveWordNavOrder("happy", ["student", "happy"], ["other"]).join(",") ===
    "student,happy",
);


// --- 不正解：間隔低下・連続リセット ---
const studentIncorrect1 = applyReviewResult(studentCorrect1, "incorrect", NOW);
ok("1回不正解: consecutiveCorrect 0", studentIncorrect1.consecutiveCorrect === 0);
ok("1回不正解: consecutiveIncorrect 1", studentIncorrect1.consecutiveIncorrect === 1);
ok("1回不正解: incorrectCount +1", studentIncorrect1.incorrectCount === 1);
ok(
  "1回不正解: masteryLevel -1（下限0）",
  studentIncorrect1.masteryLevel === 0,
);
ok("1回不正解: まだ weak ではない", studentIncorrect1.status === "practicing");
ok(
  "1回不正解: nextReviewAt は間隔0日",
  studentIncorrect1.nextReviewAt ===
    calculateNextReview(studentCorrect1, "incorrect", NOW).nextReviewAt,
);

// --- weak リセット ---
const studentWeak = applyReviewResult(studentIncorrect1, "incorrect", NOW);
ok("2回連続不正解: status は weak", studentWeak.status === "weak");
ok("weak: consecutiveIncorrect 2", studentWeak.consecutiveIncorrect === 2);
ok("weak: masteryLevel は 0 にリセット", studentWeak.masteryLevel === 0);
ok(
  "weak: nextReviewAt は初期値（翌日）",
  studentWeak.nextReviewAt === getInitialNextReviewAt(NOW),
);

// --- learned → 1回不正解 → practicing ---
const afterLearnedMiss = applyReviewResult(studentCorrect3, "incorrect", NOW);
ok("learned 後の不正解: status は practicing", afterLearnedMiss.status === "practicing");
ok("learned 後の不正解: lastReviewResult incorrect", afterLearnedMiss.lastReviewResult === "incorrect");
ok("learned 後の不正解: consecutiveCorrect 0", afterLearnedMiss.consecutiveCorrect === 0);

// --- weak 回復（既存ルール。判定ロジックは変更しない） ---
// 正解1回＋不正解2回で weak になった語は、次の1回正解で不正解率 2/4=50% となり weak を外れる
const weakThenCorrect1 = applyReviewResult(studentWeak, "correct", NOW);
ok(
  "weak(正1誤2) 後1回正解: 不正解率50%で practicing",
  weakThenCorrect1.status === "practicing",
);

// 不正解2回のみで weak になった語は、1回正解でも不正解率 2/3>50% のため weak のまま
const twoMissWeak = applyReviewResult(
  applyReviewResult(freshEntry("happy"), "incorrect", NOW),
  "incorrect",
  NOW,
);
ok("不正解2回のみ: status は weak", twoMissWeak.status === "weak");
const twoMissThenHit = applyReviewResult(twoMissWeak, "correct", NOW);
ok("不正解2回後の1回正解: 不正解率で weak 維持", twoMissThenHit.status === "weak");
const twoMissThenTwoHits = applyReviewResult(twoMissThenHit, "correct", NOW);
ok(
  "不正解2回後の2回正解: status は practicing",
  twoMissThenTwoHits.status === "practicing",
);
ok(
  "不正解2回後の2回正解: consecutiveCorrect 2",
  twoMissThenTwoHits.consecutiveCorrect === 2,
);

// --- 件数カード用集計 ---
const mixed = [
  student0,
  studentCorrect1,
  studentCorrect3,
  studentWeak,
];
const counts = countWordsByStatus(mixed);
ok("件数 new", counts.new === 1);
ok("件数 practicing", counts.practicing === 1);
ok("件数 learned", counts.learned === 1);
ok("件数 weak", counts.weak === 1);

// --- Lesson マージが進捗を壊さない ---
const merged = mergeLessonWordsIntoEntries(1, [studentCorrect3], NOW, [
  "student",
]);
const mergedStudent = merged.find((entry) => entry.wordId === "student");
ok("マージ後も1件の student", Boolean(mergedStudent) && merged.length === 1);
ok("マージ後 mastery 維持", mergedStudent?.masteryLevel === studentCorrect3.masteryLevel);
ok("マージ後 status 維持", mergedStudent?.status === "learned");
ok("マージ後 correctCount 維持", mergedStudent?.correctCount === 3);
ok(
  "マージ後 lessonNumbers 維持",
  mergedStudent?.lessonNumbers.join(",") === "1",
);

const emptyMerge = mergeLessonWordsIntoEntries(1, [], NOW);
ok("遭遇指定なし Lesson1 マージは5語", emptyMerge.length === 5);

// --- store 反映（Special と同じ applyReviewResultToStore） ---
installLocalStorageMock();
const cleared = clearMyWords();
ok("store clear", cleared.ok);

const savedInitial = saveMyWords([freshEntry("student"), freshEntry("teacher")]);
ok("既存2語を保存", savedInitial.ok && loadMyWords().length === 2);

const reviewExisting = applyReviewResultToStore("student", "correct", 1, NOW);
ok("既存語の復習保存", reviewExisting.ok);
const storedStudent = getMyWordById("student");
const storedTeacher = getMyWordById("teacher");
ok("既存語 student が practicing", storedStudent?.status === "practicing");
ok("既存語 student の correctCount 1", storedStudent?.correctCount === 1);
ok("既存語 student の lessonNumbers 維持", storedTeacher !== null && storedStudent?.lessonNumbers.join(",") === "1");
ok("他方 teacher は new のまま", storedTeacher?.status === "new");
ok("他方 teacher の correctCount 0", storedTeacher?.correctCount === 0);
ok("他方 teacher の masteryLevel 0", storedTeacher?.masteryLevel === 0);

const overrideSave = setUserStatusOverride("student", "weak");
ok("手動で苦手にできる", overrideSave.ok);
const overriddenStudent = getMyWordById("student");
ok(
  "手動後の表示は苦手",
  getDisplayedWordStatus(overriddenStudent!) === "weak",
);
ok("手動後も自動 status は practicing", overriddenStudent?.status === "practicing");
ok("手動後も correctCount 維持", overriddenStudent?.correctCount === 1);
ok("手動後も mastery 維持", overriddenStudent?.masteryLevel === 1);
ok(
  "手動後も nextReviewAt 維持",
  overriddenStudent?.nextReviewAt === storedStudent?.nextReviewAt,
);
const afterManualReview = applyReviewResultToStore("student", "correct", 1, NOW);
const afterManual = getMyWordById("student");
ok("次回復習正解で override 解除", afterManual?.userStatusOverride === null);
ok(
  "解除後は自動判定",
  afterManual?.status === "practicing" &&
    getDisplayedWordStatus(afterManual) === "practicing",
);

ok("補助 friend は未登録", getMyWordById("friend") === null);
const addFriend = applyReviewResultToStore("friend", "incorrect", 1, NOW);
ok("補助 friend を回答後に追加", addFriend.ok);
const storedFriend = getMyWordById("friend");
ok("補助 friend が My Words にある", storedFriend?.english === "friend");
ok("補助 friend の lessonNumbers に1", storedFriend?.lessonNumbers.includes(1) === true);
ok("補助 friend は1回不正解なので practicing", storedFriend?.status === "practicing");
ok("補助 friend の incorrectCount 1", storedFriend?.incorrectCount === 1);
ok("既存語は補助追加後も残る", loadMyWords().length === 3);

const addFriendAgain = applyReviewResultToStore("friend", "incorrect", 1, NOW);
ok("補助 friend 2回目不正解を保存", addFriendAgain.ok);
const weakFriend = getMyWordById("friend");
ok("補助 friend が weak", weakFriend?.status === "weak");
ok("補助 friend の mastery リセット", weakFriend?.masteryLevel === 0);
ok(
  "補助追加後も teacher は未復習",
  getMyWordById("teacher")?.status === "new" &&
    getMyWordById("teacher")?.correctCount === 0,
);

// --- 配線が Special / 件数UI から外れていない ---
const root = process.cwd();
const quizSrc = readFileSync(
  join(root, "src/components/special/VocabSpecialQuiz.tsx"),
  "utf8",
);
ok(
  "Special が applyReviewResultToStore を呼ぶ",
  quizSrc.includes("applyReviewResultToStore"),
);
ok(
  "Special が correct/incorrect を渡す",
  quizSrc.includes('"correct"') && quizSrc.includes('"incorrect"'),
);
ok("Special に SpeakButton がある", quizSrc.includes("SpeakButton"));
ok("Special 終了に My Words リンクがある", quizSrc.includes('href="/my-words"'));

const statsSrc = readFileSync(
  join(root, "src/components/my-words/MyWordsStats.tsx"),
  "utf8",
);
ok("状態ボタンは独立トグル", statsSrc.includes("onToggle"));
ok("状態ボタンは2列", statsSrc.includes("grid-cols-2"));
ok("新しい単語ラベル", statsSrc.includes("statsNew"));
ok("練習中ボタン", statsSrc.includes('"practicing"'));
ok("習得済みボタン", statsSrc.includes('"learned"'));
ok("苦手ボタン", statsSrc.includes('"weak"'));

const listSrc = readFileSync(
  join(root, "src/components/my-words/MyWordsList.tsx"),
  "utf8",
);
ok("一覧が countWordsByStatus を使う", listSrc.includes("countWordsByStatus"));
ok("一覧が loadMyWords を使う", listSrc.includes("loadMyWords"));
ok("一覧に表示フィルターがある", listSrc.includes("getDisplayedWordStatus"));
ok("一覧がナビ順を保存する", listSrc.includes("saveMyWordsNavOrder"));
ok("一覧が詳細を prefetch する", listSrc.includes("router.prefetch"));
ok("一覧に SpeakButton がある", listSrc.includes("SpeakButton"));
ok("空フィルター文言がある", listSrc.includes("filterEmpty"));

const detailSrc = readFileSync(
  join(root, "src/components/my-words/MyWordsDetail.tsx"),
  "utf8",
);
ok("詳細が getMyWordById を使う", detailSrc.includes("getMyWordById"));
ok("詳細が nextReviewAt を表示", detailSrc.includes("word.nextReviewAt"));
ok("詳細に SpeakButton がある", detailSrc.includes("SpeakButton"));
ok("詳細に前後ナビがある", detailSrc.includes("prevWord") && detailSrc.includes("nextWord"));
ok("詳細に練習中にするがある", detailSrc.includes("setPracticing"));
ok("詳細に苦手にするがある", detailSrc.includes("setWeak"));
ok("詳細が override を保存する", detailSrc.includes("setUserStatusOverride"));
ok("詳細がキーボード移動する", detailSrc.includes("ArrowLeft") && detailSrc.includes("ArrowRight"));
ok("詳細が入力中はキー移動しない", detailSrc.includes("isTypingTarget"));
ok("詳細が prefetch する", detailSrc.includes("router.prefetch"));

const uiSrc = readFileSync(join(root, "src/lib/ui-text.ts"), "utf8");
ok("UI文言が新しい単語", uiSrc.includes('statsNew: "新しい単語"'));
ok("新しく覚えた は使わない", !uiSrc.includes("新しく覚えた"));

const displaySrc = readFileSync(join(root, "src/lib/my-words/display.ts"), "utf8");
ok("バッジが新しい単語", displaySrc.includes('"新しい単語"'));

const catalogSrc = readFileSync(
  join(root, "src/data/fixed-audio-catalog.ts"),
  "utf8",
);
ok(
  "カタログが mywords を例文テキストに紐づけない",
  !catalogSrc.includes('ref: "mywords.student"'),
);
ok(
  "単語単体音声は例文カタログで解決しない",
  resolveAudioRef("mywords.student") === null,
);
ok(
  "student は /audio/words/student.mp3 を指す",
  resolveWordAudioRef("mywords.student")?.url === "/audio/words/student.mp3",
);
ok(
  "teacher は /audio/words/teacher.mp3 を指す",
  resolveWordAudioRef("mywords.teacher")?.url === "/audio/words/teacher.mp3",
);
ok(
  "friend は /audio/words/friend.mp3 を指す",
  resolveWordAudioRef("mywords.friend")?.url === "/audio/words/friend.mp3",
);
ok(
  "happy は /audio/words/happy.mp3 を指す",
  resolveWordAudioRef("mywords.happy")?.url === "/audio/words/happy.mp3",
);
const wordAudioSrc = readFileSync(join(root, "src/lib/word-audio.ts"), "utf8");
ok("単語音声が public/audio/words を使う", wordAudioSrc.includes("/audio/words/"));
ok("単語音声の実在確認がある", wordAudioSrc.includes("wordAudioFileExists"));
ok(
  "単語フォルダがある",
  existsSync(join(root, "public/audio/words")),
);
const speakSrc = readFileSync(
  join(root, "src/components/SpeakButton.tsx"),
  "utf8",
);
ok("SpeakButton が単語単体解決を使う", speakSrc.includes("resolveWordAudioRef"));
ok("SpeakButton が mywords を例文再生しない", speakSrc.includes('startsWith("mywords.")'));
ok("SpeakButton が単語ファイルの実在を確認する", speakSrc.includes("wordAudioFileExists"));

const saveSrc = readFileSync(join(root, "src/components/SaveForm.tsx"), "utf8");
ok(
  "通常レッスン保存は mergeAndSaveLessonWords のまま",
  saveSrc.includes("mergeAndSaveLessonWords"),
);
ok(
  "SaveForm は applyReviewResultToStore を呼ばない",
  !saveSrc.includes("applyReviewResultToStore"),
);

ok("429 は自動リトライ対象", shouldRetryCoachRequest(429, null));
ok("500 は自動リトライ対象", shouldRetryCoachRequest(500, null));
ok("401 は自動リトライしない", shouldRetryCoachRequest(401, null) === false);
ok("503 は自動リトライしない", shouldRetryCoachRequest(503, null) === false);
ok("400 は自動リトライしない", shouldRetryCoachRequest(400, null) === false);
ok(
  "AbortError は自動リトライしない",
  shouldRetryCoachRequest(null, Object.assign(new Error("aborted"), { name: "AbortError" })) ===
    false,
);
ok(
  "通信エラーは自動リトライ対象",
  shouldRetryCoachRequest(null, new TypeError("Failed to fetch")),
);

const evaluateSrc = readFileSync(
  join(root, "src/components/EvaluateCoach.tsx"),
  "utf8",
);
ok("評価が postCoachApi を使う", evaluateSrc.includes("postCoachApi"));
ok("評価が同一リクエストを共有する", evaluateSrc.includes("evaluate:${lessonId}"));

const answerSrc = readFileSync(
  join(root, "src/components/AnswerCoach.tsx"),
  "utf8",
);
ok("回答評価が postCoachApi を使う", answerSrc.includes("postCoachApi"));
ok("回答送信ロックがある", answerSrc.includes("submitLockRef"));
ok("無意味入力チェックは残る", answerSrc.includes("isMeaningfulCoachAnswer"));

const loopListSrc = readFileSync(
  join(root, "src/components/MyLoopList.tsx"),
  "utf8",
);
ok("My Loop一覧が localStorage を即時読む", loopListSrc.includes("readRecords"));
ok("My Loop一覧が詳細を prefetch する", loopListSrc.includes("router.prefetch"));
ok("My Loop一覧の Link が prefetch", loopListSrc.includes("prefetch"));

const loopDetailSrc = readFileSync(
  join(root, "src/components/MyLoopDetail.tsx"),
  "utf8",
);
ok("My Loop詳細が localStorage を即時読む", loopDetailSrc.includes("readRecord"));
ok("My Loop詳細が一覧キャッシュを再利用する", loopDetailSrc.includes("peekCachedMyLoopRecord"));
ok("My Loop詳細が loadRecordById を使う", loopDetailSrc.includes("loadRecordById"));
ok("My Loop詳細に要約がある", loopDetailSrc.includes("getMySummary"));
ok("My Loop詳細に大事なことがある", loopDetailSrc.includes("getMyPoints"));
ok("My Loop詳細に例文がある", loopDetailSrc.includes("getMyExampleSentence"));

const coachFetchSrc = readFileSync(join(root, "src/lib/coach-fetch.ts"), "utf8");
ok("コーチ fetch が in-flight 共有する", coachFetchSrc.includes("inflight"));
ok(
  "コーチ fetch が1回リトライを使う",
  coachFetchSrc.includes("fetchWithTimeoutAndRetry"),
);
const timeoutSrc = readFileSync(join(root, "src/lib/fetch-with-timeout.ts"), "utf8");
ok("自動リトライ関数がある", timeoutSrc.includes("fetchWithTimeoutAndRetry"));
ok("自動リトライに while ループはない", !timeoutSrc.includes("while ("));

console.log("\n---");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
