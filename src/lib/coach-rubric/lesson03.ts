import type { CoachRubric } from "@/lib/coach-rubric/types";
import {
  HAVE_HAS_ID,
  PAST_VS_PP_ID,
  PP_MEANING_ID,
  THREE_USES_ID,
} from "@/lib/lessons/lesson03-summary";

/** Lesson 3（現在完了）の評価基準 */
export const lesson03CoachRubric: CoachRubric = {
  lessonId: "lesson-03-present-perfect",
  title: "現在完了レッスン",
  points: [
    {
      id: "pp-connection",
      label: "過去と今のつながり",
      coachQuestion: "現在完了って、どんなことを表すの？",
      coachHints: ["過去", "今", "つながり", "have"],
      mustUnderstand: [
        "現在完了は過去の出来事を、今とのつながりを含めて表す",
        "ただの過去の事実だけを話す表現ではない",
      ],
      commonMisconceptions: [
        "現在完了は過去形と同じ意味",
        "have + 過去分詞と書けば意味は考えなくてよい",
        "現在完了は未来を表す",
      ],
      okIfIncludes: ["過去", "今", "つながり", "つなが", "結果", "続"],
      relatedFieldIds: [PP_MEANING_ID, PAST_VS_PP_ID],
    },
    {
      id: "past-vs-present-perfect",
      label: "過去形と現在完了の違い",
      coachQuestion: "現在完了と過去形って、何が違うの？",
      coachHints: ["過去形", "現在完了", "今", "lost"],
      mustUnderstand: [
        "過去形は過去の出来事そのものを話す",
        "現在完了は過去の出来事と今のつながりの両方を含む",
        "I lost my key. と I have lost my key. は視点が違う",
      ],
      commonMisconceptions: [
        "どちらもまったく同じ",
        "現在完了は丁寧な過去形",
        "過去形のほうがいつも正しい",
      ],
      okIfIncludes: ["過去形", "今", "つながり", "ちが", "違う", "lost"],
      relatedFieldIds: [PAST_VS_PP_ID, PP_MEANING_ID],
    },
    {
      id: "form-have-pp",
      label: "have / has + 過去分詞",
      coachQuestion: "現在完了の形って、どう作るの？",
      coachHints: ["have", "has", "過去分詞"],
      mustUnderstand: [
        "基本形は have / has + 過去分詞",
        "形だけでなく意味（今とのつながり）も大切",
      ],
      commonMisconceptions: [
        "have + 動詞原形",
        "be + 過去分詞が現在完了",
        "形さえ合えば意味は不要",
      ],
      okIfIncludes: ["have", "has", "過去分詞"],
      relatedFieldIds: [HAVE_HAS_ID, PP_MEANING_ID],
    },
    {
      id: "three-uses",
      label: "経験・完了・継続",
      coachQuestion: "経験・完了・継続って、それぞれどんな感じ？",
      coachHints: ["経験", "完了", "継続", "for"],
      mustUnderstand: [
        "経験・完了・継続の3つの使い方がある",
        "どれも過去と今がつながっているという点では同じ",
      ],
      commonMisconceptions: [
        "3つはまったく別の文法で関係ない",
        "継続だけが現在完了",
        "経験は過去形だけで表す",
      ],
      okIfIncludes: ["経験", "完了", "継続", "結果", "続"],
      relatedFieldIds: [THREE_USES_ID],
    },
    {
      id: "have-has",
      label: "have / has の使い分け",
      coachQuestion: "have と has って、どう使い分けるの？",
      coachHints: ["have", "has", "she"],
      mustUnderstand: [
        "I / you / we / they → have",
        "he / she / it → has",
      ],
      commonMisconceptions: [
        "She have ...",
        "I has ...",
        "いつも have でよい",
      ],
      okIfIncludes: ["have", "has", "she", "he"],
      relatedFieldIds: [HAVE_HAS_ID],
    },
  ],
};
