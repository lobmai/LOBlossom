import { getLessonById } from "@/lib/lessons/registry";
import {
  FINAL_MY_SUMMARY_ID,
  USER_EXAMPLE_AFFIRM_ID,
  USER_EXAMPLE_APPLIED_ID,
  USER_EXAMPLE_ID,
  USER_EXAMPLE_NEG_ID,
} from "@/lib/lessons/types";
import type { AiEvaluation, LabeledAnswer } from "@/types/record";

const LESSON1_FALLBACK_SUMMARY = [
  "・be動詞は「～です」「～にいる・ある」などを表す。",
  "・am / is / are は、I / he / they など、だれについて話すかで使い分ける。",
  "・ない文は、be動詞のうしろに not を置く。",
  "・質問の文は、be動詞を主語（文のはじめの人やもの）の前に出す。",
].join("\n");

const LESSON2_FALLBACK_SUMMARY = [
  "・一般動詞は、「する」「好き」など、動作や気持ちを表すことば。",
  "・he / she / it のときは、動詞に s をつける。",
  "・ない文は don't / doesn't を使う。",
  "・質問の文は、文の最初に Do / Does を置く。",
  "・does / doesn't / Does のうしろの動詞には、s をつけない。",
].join("\n");

const LESSON3_FALLBACK_SUMMARY = [
  "・現在完了は、前に起こったことと、今がつながっているときに使う。",
  "・過去形は「前に起こったこと」だけを話す。現在完了は「今とのつながり」も話す。",
  "・かたちは have / has ＋ 過去分詞（動詞を変えた形）。",
  "・「行ったことがある」「終わっている」「ずっと続いている」は、どれも前のことと今がつながっている。",
  "・I / you / we / they は have。he / she / it は has。",
].join("\n");

const LESSON4_FALLBACK_SUMMARY = [
  "・関係代名詞を使うと、2つの文を1つにつなげられる。",
  "・つなげるときは、2つの文に出てくる同じ人やものを見る。",
  "・人をつなぐときは who を使う。",
  "・ものをつなぐときは which を使う。",
  "・that は、人にもものにも使えることがある。",
].join("\n");

const LESSON5_FALLBACK_SUMMARY = [
  "・仮定法は、本当のこととは違うことを想像するときに使う。",
  "・このレッスンの仮定法では、if のあとを過去の形にする。",
  "・過去の形でも、昔の話とは限らない。",
  "・あとの文は would ＋ 動詞のふつうの形を使う。",
  "・If I were ... はよく使う。had や knew でも作れる。",
].join("\n");

function fallbackForLesson(lessonNumber: number): string {
  if (lessonNumber === 1) return LESSON1_FALLBACK_SUMMARY;
  if (lessonNumber === 2) return LESSON2_FALLBACK_SUMMARY;
  if (lessonNumber === 3) return LESSON3_FALLBACK_SUMMARY;
  if (lessonNumber === 4) return LESSON4_FALLBACK_SUMMARY;
  if (lessonNumber === 5) return LESSON5_FALLBACK_SUMMARY;
  return "・今日学んだ内容の要点を整理できた。";
}

/** Step 6：API 未使用時のフォールバック（評価コメントは含めない） */
export function buildFinalSummary(
  lessonId: string,
  trajectoryEntries: LabeledAnswer[],
  _aiEvaluation: AiEvaluation | null,
  finalizedEntries?: LabeledAnswer[] | null,
): LabeledAnswer[] {
  if (finalizedEntries && finalizedEntries.length > 0) {
    return finalizedEntries;
  }

  const lesson = getLessonById(lessonId);
  if (!lesson) {
    throw new Error(`Unknown lessonId: ${lessonId}`);
  }

  return [
    {
      id: FINAL_MY_SUMMARY_ID,
      label: "レッスンの要約",
      answer: fallbackForLesson(lesson.number),
    },
  ];
}

export function isFinalSummaryEntry(entry: LabeledAnswer): boolean {
  return entry.id === FINAL_MY_SUMMARY_ID && entry.answer.trim().length > 0;
}

export { FINAL_MY_SUMMARY_ID as FINAL_MY_SUMMARY_ID_EXPORT };

export function getUserExampleText(map: Record<string, string>): string {
  const single = map[USER_EXAMPLE_ID]?.trim();
  if (single) return single;
  return (
    [map[USER_EXAMPLE_AFFIRM_ID], map[USER_EXAMPLE_NEG_ID], map[USER_EXAMPLE_APPLIED_ID]]
      .map((s) => s?.trim())
      .filter(Boolean)[0] ?? ""
  );
}
