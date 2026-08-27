import type { CoachRubric } from "@/lib/coach-rubric/types";
import { NEGATION_RULE_ID } from "@/lib/lessons/lesson02-summary";

/** Lesson 2（一般動詞）の評価基準 */
export const lesson02CoachRubric: CoachRubric = {
  lessonId: "lesson-02-regular-verb",
  title: "一般動詞レッスン",
  points: [
    {
      id: "general-verb-meaning",
      label: "一般動詞の意味",
      coachQuestion: "一般動詞ってなに？",
      coachHints: ["一般動詞", "動き", "like"],
      mustUnderstand: [
        "一般動詞は動きや状態・好みなどを表す",
        "like のように動作ではない一般動詞もある",
        "be動詞とは別の種類",
      ],
      commonMisconceptions: [
        "一般動詞はすべて「動き」だけを表す",
        "be動詞と同じ使い方だと思っている",
      ],
      okIfIncludes: ["一般動詞", "動き", "状態", "like", "好き"],
      relatedFieldIds: ["usage-general"],
    },
    {
      id: "third-person-s",
      label: "he / she / it の三単現（s）",
      coachQuestion: "he / she のとき、動詞はどう変わるの？",
      coachHints: ["s", "he", "she", "plays"],
      mustUnderstand: [
        "he / she / it や1人・1つの名前が主語のとき、動詞に s を付ける",
        "I / you / we / they のときは原形",
      ],
      commonMisconceptions: [
        "I plays",
        "he play（s がない）",
        "すべての主語に s を付ける",
      ],
      okIfIncludes: ["s", "三人称", "he", "she", "plays", "likes"],
      relatedFieldIds: ["he-she-rule", "usage-general"],
    },
    {
      id: "general-negation",
      label: "一般動詞の否定文",
      coachQuestion: "否定文はどう作るの？",
      coachHints: ["don't", "doesn't", "not"],
      mustUnderstand: [
        "I / you / we / they → don't + 動詞原形",
        "he / she / it → doesn't + 動詞原形",
        "doesn't の後は動詞原形（s を付けない）",
      ],
      commonMisconceptions: [
        "She don't",
        "He doesn't plays",
        "don't の後に s を付ける",
      ],
      okIfIncludes: ["don't", "doesn't", "not", "否定", "原形"],
      relatedFieldIds: [NEGATION_RULE_ID],
    },
    {
      id: "general-question",
      label: "一般動詞の疑問文",
      coachQuestion: "疑問文はどう作るの？",
      coachHints: ["Do", "Does", "疑問"],
      mustUnderstand: [
        "you / we / they → Do + 主語 + 動詞原形?",
        "he / she / it → Does + 主語 + 動詞原形?",
        "Does の後は動詞原形",
      ],
      commonMisconceptions: [
        "Do he ...?",
        "Does she likes ...?",
        "be動詞の疑問文と同じ作り方",
      ],
      okIfIncludes: ["Do", "Does", "疑問", "原形"],
      relatedFieldIds: ["usage-general"],
    },
  ],
};
