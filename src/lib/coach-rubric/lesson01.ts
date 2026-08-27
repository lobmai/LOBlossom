import type { CoachRubric } from "@/lib/coach-rubric/types";

import { NEGATION_RULE_ID, QUESTION_HOW_ID } from "@/lib/lessons/lesson01-ids";



/** Lesson 1（be動詞）の評価基準 */

export const lesson01CoachRubric: CoachRubric = {

  lessonId: "lesson-01-be-verb",

  title: "be動詞レッスン",

  points: [

    {

      id: "be-verb-meaning",

      label: "be動詞の意味",

      coachQuestion: "be動詞ってなに？",

      coachHints: ["be動詞", "です", "状態"],

      mustUnderstand: [

        "be動詞は「～です」「～にいる・ある」など状態・属性を表す",

        "一般動詞（動きを表す動詞）とは役割が違う",

      ],

      commonMisconceptions: [

        "be動詞を「動く」意味の動詞だと思っている",

        "すべての動詞に s を付けるルールを be動詞に当てはめる",

      ],

      okIfIncludes: ["be動詞", "です", "いる", "ある", "状態"],

      relatedFieldIds: ["be-verb-meaning"],

    },

    {

      id: "am-is-are",

      label: "am / is / are の使い分け",

      coachQuestion: "am / is / are ってどう使い分けるの？",

      coachHints: ["I", "am", "is", "are"],

      mustUnderstand: [

        "I → am",

        "he / she / it や1人・1つの名前 → is",

        "you / we / they や2人以上 → are",

      ],

      commonMisconceptions: ["I is", "you is", "he are", "they is"],

      okIfIncludes: ["am", "is", "are", "I", "he", "she", "they"],

      relatedFieldIds: ["usage-am", "usage-is", "usage-are"],

    },

    {

      id: "be-negation",

      label: "be動詞の否定文",

      coachQuestion: "否定文はどう作るの？",

      coachHints: ["not", "否定", "am not"],

      mustUnderstand: [

        "否定は be動詞の後ろに not を置く",

        "is not / are not / am not の形",

      ],

      commonMisconceptions: [

        "not を主語の前に置く",

        "am not を don't で言い換える",

      ],

      okIfIncludes: ["not", "否定", "is not", "are not", "am not"],

      relatedFieldIds: [NEGATION_RULE_ID],

    },

    {

      id: "be-question",

      label: "be動詞の疑問文",

      coachQuestion: "疑問文はどう作るの？",

      coachHints: ["be動詞", "前", "Are", "Is"],

      mustUnderstand: [

        "疑問文は be動詞を主語の前に出す",

        "例：Are you ...? / Is he ...?",

      ],

      commonMisconceptions: [

        "疑問文でも語順を変えない",

        "Do / Does を be動詞の疑問に使う",

      ],

      okIfIncludes: ["疑問", "be動詞", "前", "Are", "Is"],

      relatedFieldIds: [QUESTION_HOW_ID],

    },

  ],

};

