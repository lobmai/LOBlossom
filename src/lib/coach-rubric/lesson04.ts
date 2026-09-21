import type { CoachRubric } from "@/lib/coach-rubric/types";
import {
  RP_MEANING_ID,
  RP_SUBJECT_OBJECT_ID,
  RP_WHO_WHICH_THAT_ID,
} from "@/lib/lessons/lesson04-summary";

/** Lesson 4（関係代名詞）の評価基準 */
export const lesson04CoachRubric: CoachRubric = {
  lessonId: "lesson-04-relative-pronoun",
  title: "関係代名詞レッスン",
  points: [
    {
      id: "relative-explains",
      label: "前の名詞を説明する",
      coachQuestion: "関係代名詞って、何をしているの？",
      coachHints: ["説明", "前の名詞", "あとから"],
      mustUnderstand: [
        "関係代名詞は、前の名詞にあとから説明を足す",
        "the girl who speaks English は「英語を話す女の子」",
      ],
      commonMisconceptions: [
        "関係代名詞はただの接続詞",
        "関係代名詞は文を丁寧にするだけ",
        "関係代名詞は過去の話に変える",
      ],
      okIfIncludes: ["説明", "足", "後ろ", "前", "名詞", "詳しく"],
      relatedFieldIds: [RP_MEANING_ID],
    },
    {
      id: "who-which-that",
      label: "who / which / that",
      coachQuestion: "who と which って、何が違うの？",
      coachHints: ["who", "which", "that", "人", "もの"],
      mustUnderstand: [
        "人を説明するときは who",
        "ものを説明するときは which",
        "that は人・ものの両方に使えることがある",
      ],
      commonMisconceptions: [
        "who はものにも使う",
        "which は人にも使う",
        "that は疑問文のときだけ使う",
        "迷ったら that を使えばよい",
      ],
      okIfIncludes: ["who", "which", "that", "人", "もの"],
      relatedFieldIds: [RP_WHO_WHICH_THAT_ID],
    },
    {
      id: "two-sentences",
      label: "2文を1文に",
      coachQuestion: "2つの文を1つにするとき、どこに who を置くの？",
      coachHints: ["2つの文", "who", "the girl"],
      mustUnderstand: [
        "2つの文の情報を1つの文につなげられる",
        "I know the girl. + She speaks English. → I know the girl who speaks English.",
      ],
      commonMisconceptions: [
        "2文をそのまま並べればよい",
        "She を残したまま who を足す",
        "who を文のいちばん前に置く",
      ],
      okIfIncludes: ["2つ", "文", "つな", "1つ", "who"],
      relatedFieldIds: [RP_MEANING_ID],
    },
    {
      id: "subject-vs-object",
      label: "主格と目的格の基本",
      coachQuestion: "who speaks English と that I bought って、文の形はどう違う？",
      coachHints: ["speaks", "I bought", "直後"],
      mustUnderstand: [
        "who speaks English では、who 自身が「英語を話す人」になっている",
        "that I bought では、that が「私が買ったもの」を指している",
        "関係代名詞の直後が動詞か、I / you かで違いが見える",
      ],
      commonMisconceptions: [
        "主格・目的格という用語を言えたら十分",
        "2文の役割は同じ",
        "後ろの並びは見なくてよい",
      ],
      okIfIncludes: ["動詞", "speaks", "bought", "I", "直後", "ちが", "違う"],
      relatedFieldIds: [RP_SUBJECT_OBJECT_ID],
    },
  ],
};
