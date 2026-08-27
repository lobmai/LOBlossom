import type { CheckQuestion, LessonMeta, TeachQuestion } from "@/types/lesson";

export const lesson01Meta: LessonMeta = {
  id: "lesson-01-be-verb",
  title: "be動詞ってなに？",
  subtitle: "英語の「です」「います」を使えるようにしよう",
  readingMinutes: 5,
};

/** レッスン1で教える内容（理解度テスト・AI質問の出題範囲） */
export const lesson01TaughtTopics = [
  "be動詞の意味（「です」「います」と同じ役割）",
  "am / is / are の3つの形",
  "主語 I/you/he/she/it/we/they の意味",
  "I → am、he/she/it（1つ）→ is、you/we/they（2人以上）→ are",
  "物が1つのとき it / 単数の名詞 → is",
  "物が2つ以上のとき they / 複数の名詞 → are",
  "状態・属性・場所の表現",
  "否定形：be動詞の後ろに not",
  "省略形 isn't（is not）・aren't（are not）",
  "疑問文：be動詞を主語の前に出す",
];

export const lesson01CheckQuestions: CheckQuestion[] = [
  {
    id: "q1",
    type: "choice",
    question: "be動詞「am」を使うのはどれ？",
    options: ["he", "she", "I", "they"],
    answer: "I",
    explanation: "「am」は I（私）のときだけ使うよ。「I am」とセットで覚えよう。",
    exampleSentence: "I am happy.",
    translation: "私はうれしいです。",
  },
  {
    id: "q2",
    type: "fill",
    question: "She _____ a teacher.",
    answer: "is",
    explanation: "She（彼女）は1人だから、be動詞は is を使うよ。",
    exampleSentence: "She is a teacher.",
    translation: "彼女は先生です。",
  },
  {
    id: "q3",
    type: "choice",
    question: "「They are friends.」の意味は？",
    options: [
      "彼は友達です",
      "彼女は友達です",
      "彼らは友達です",
      "私は友達です",
    ],
    answer: "彼らは友達です",
    explanation: "They（彼ら）は2人以上。are を使うよ。",
    exampleSentence: "They are friends.",
    translation: "彼らは友達です。",
  },
  {
    id: "q4",
    type: "reorder",
    question: "ことばを並べかえて、正しい英文をつくろう。",
    options: ["student", "a", "am", "I"],
    answer: "I am a student.",
    explanation: "I → am → a student の順だよ。",
    exampleSentence: "I am a student.",
    translation: "私は学生です。",
  },
  {
    id: "q5",
    type: "choice",
    question: "「He is not happy.」と同じ意味はどれ？",
    options: [
      "He is happy.",
      "He isn't happy.",
      "He are not happy.",
      "He am not happy.",
    ],
    answer: "He isn't happy.",
    explanation: "is not は isn't と短く書けるよ。He（彼）には is を使うよ。",
    exampleSentence: "He isn't happy.",
    translation: "彼はうれしくありません。",
  },
  {
    id: "q6",
    type: "choice",
    question: "「あなたは学生ですか？」に合う英文はどれ？",
    options: [
      "Are you a student?",
      "You are a student.",
      "Is you a student.",
      "Am you a student.",
    ],
    answer: "Are you a student?",
    explanation:
      "疑問文は be動詞を主語の前に出すよ。you（あなた）には are を使う。",
    exampleSentence: "Are you a student?",
    translation: "あなたは学生ですか？",
  },
];

export const lesson01TeachPrompt =
  "お友だちに教えるつもりで、be動詞を話してみよう。";

export const lesson01TeachQuestions: TeachQuestion[] = [
  {
    id: "meaning",
    label: "be動詞を使うと、どんな意味になるの？",
    placeholder: "自分のことばで、be動詞の意味を書いてみよう。",
  },
  {
    id: "forms",
    label: "be動詞には何がある？どう使い分けるの？",
    placeholder: "am / is / are について、自分のことばで書いてみよう。",
  },
  {
    id: "example",
    label: "be動詞を使った文を1つ作ってみよう",
    placeholder: "英文でも、日本語でもOK。自分で例を書いてみよう。",
  },
];
