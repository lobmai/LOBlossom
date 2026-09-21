import type { CoachRubric } from "@/lib/coach-rubric/types";
import {
  HYPO_IF_WOULD_ID,
  HYPO_MEANING_ID,
  HYPO_PAST_NOT_TIME_ID,
} from "@/lib/lessons/lesson05-summary";

/** Lesson 5（仮定法）の評価基準 */
export const lesson05CoachRubric: CoachRubric = {
  lessonId: "lesson-05-subjunctive",
  title: "仮定法レッスン",
  points: [
    {
      id: "hypothetical-meaning",
      label: "現実とは違う想像",
      coachQuestion: "If I were rich... って言った人は、今本当にお金持ちなのかな？",
      coachHints: ["想像", "現実", "違う"],
      mustUnderstand: [
        "仮定法は、現実とは違うこと・実際にはそうではないことを想像するときに使える",
        "例文から、今の現実と想像の違いを読み取れる",
      ],
      commonMisconceptions: [
        "仮定法は丁寧な言い方",
        "仮定法は必ず昔の出来事を話す",
        "If I were rich と言う人は今お金持ちだ",
      ],
      okIfIncludes: ["想像", "現実", "違う", "もし", "ない"],
      relatedFieldIds: [HYPO_MEANING_ID],
    },
    {
      id: "past-not-past-time",
      label: "過去形でも昔とは限らない",
      coachQuestion: "どうして過去形なのに、昔の話とは限らないの？",
      coachHints: ["過去形", "昔", "想像"],
      mustUnderstand: [
        "今回の仮定法で使う過去形は、「昔起きた出来事」とは限らない",
        "現実から距離を置いた想像を表せる",
      ],
      commonMisconceptions: [
        "were は昔お金持ちだったという意味",
        "had は昨日時間がたくさんあったという意味",
        "過去形だから必ず昔の話",
      ],
      okIfIncludes: ["昔", "限ら", "想像", "今", "違う"],
      relatedFieldIds: [HYPO_PAST_NOT_TIME_ID],
    },
    {
      id: "if-past",
      label: "今回の仮定法の if側",
      coachQuestion: "if の部分と would の部分は、それぞれ何を表している？",
      coachHints: ["if", "were", "had", "knew"],
      mustUnderstand: [
        "現実とは違う想像をする今回の仮定法では、If I were / had / knew のように if側を過去形にする",
      ],
      commonMisconceptions: [
        "if の後ろはいつでも過去形",
        "If I am you が基本",
        "起こりそうな話も if側は過去形にする",
      ],
      okIfIncludes: ["if", "過去形", "were", "had", "knew"],
      relatedFieldIds: [HYPO_IF_WOULD_ID],
    },
    {
      id: "would-base",
      label: "would + 原形",
      coachQuestion: "if の部分と would の部分は、それぞれ何を表している？",
      coachHints: ["would", "結果", "原形"],
      mustUnderstand: [
        "結果側は would + 動詞の原形を使う",
        "「もしそうなら、〜するのに」という想像の結果を表す",
      ],
      commonMisconceptions: [
        "結果側は will を使う",
        "would のあとに過去形を置く",
        "would は昔したことの話",
      ],
      okIfIncludes: ["would", "原形", "結果", "のに"],
      relatedFieldIds: [HYPO_IF_WOULD_ID],
    },
  ],
};
