import type { CheckQuestion, LessonMeta, TeachQuestion } from "@/types/lesson";

export const lesson02Meta: LessonMeta = {
  id: "lesson-02-regular-verb",
  title: "一般動詞ってなに？",
  subtitle: "「する・食べる・好き」などを使えるようにしよう",
  readingMinutes: 6,
};

export const lesson02TaughtTopics = [
  "一般動詞の意味（動作・行動・気持ちなどを表す）",
  "play / eat / like / go / study などの基本動詞",
  "be動詞との違い（一般動詞は「する・好き」などを表す）",
  "肯定文：主語 ＋ 一般動詞",
  "he / she のとき、一般動詞に s を付ける",
  "否定文：I/you/we/they → don't、he/she → doesn't",
  "doesn't の後の動詞は原形（sを付けない）",
  "疑問文：Do + 主語 + 動詞？ / Does + 主語 + 動詞？",
  "Does のとき、動詞に s を付けない",
];

export const lesson02CheckQuestions: CheckQuestion[] = [
  {
    id: "q1",
    type: "choice",
    question: "一般動詞の意味として正しいのはどれ？",
    options: [
      "「です」「います」を表す",
      "動作や行動、気持ちなどを表す",
      "名詞を修飾する",
      "過去の出来事だけを表す",
    ],
    answer: "動作や行動、気持ちなどを表す",
    explanation: "一般動詞は play（遊ぶ）、like（好き）など、動作や気持ちを表すよ。",
    exampleSentence: "I like music.",
    translation: "私は音楽が好きです。",
  },
  {
    id: "q2",
    type: "fill",
    question: "I _____ music.（音楽が好き）",
    answer: "like",
    explanation: "I（私）のときは、動詞 like をそのまま使うよ。",
    exampleSentence: "I like music.",
    translation: "私は音楽が好きです。",
  },
  {
    id: "q3",
    type: "fill",
    question: "She _____ music.（彼女は音楽が好き）",
    answer: "likes",
    explanation: "She（彼女）のときは、動詞 like に s を付けるよ。",
    exampleSentence: "She likes music.",
    translation: "彼女は音楽が好きです。",
  },
  {
    id: "q4",
    type: "choice",
    question: "「私はテニスをしません」の英文はどれ？",
    options: [
      "I don't play tennis.",
      "I doesn't play tennis.",
      "I not play tennis.",
      "I don't plays tennis.",
    ],
    answer: "I don't play tennis.",
    explanation: "I のときは don't を使い、その後の動詞 play は原形のままだよ。",
    exampleSentence: "I don't play tennis.",
    translation: "私はテニスをしません。",
  },
  {
    id: "q5",
    type: "choice",
    question: "「She doesn't like music.」と同じ意味はどれ？",
    options: [
      "She likes music.",
      "She doesn't likes music.",
      "She does not like music.",
      "She don't like music.",
    ],
    answer: "She does not like music.",
    explanation: "doesn't = does not。doesn't の後は like（原形）だよ。",
    exampleSentence: "She doesn't like music.",
    translation: "彼女は音楽が好きではありません。",
  },
  {
    id: "q6",
    type: "choice",
    question: "「あなたは音楽が好きですか？」に合う英文はどれ？",
    options: [
      "Do you like music?",
      "Does you like music?",
      "You like music?",
      "Do you likes music?",
    ],
    answer: "Do you like music?",
    explanation: "you のときは Do を使い、like は原形のままだよ。",
    exampleSentence: "Do you like music?",
    translation: "あなたは音楽が好きですか？",
  },
];

export const lesson02TeachPrompt =
  "お友だちに教えるつもりで、一般動詞を話してみよう。";

export const lesson02TeachQuestions: TeachQuestion[] = [
  {
    id: "meaning",
    label: "一般動詞を使うと、どんな意味になるの？",
    placeholder: "自分のことばで、一般動詞の意味を書いてみよう。",
  },
  {
    id: "he-she",
    label: "he / she のとき、動詞はどう変わる？",
    placeholder: "動詞にsを付けるルールを、自分のことばで書いてみよう。",
  },
  {
    id: "example",
    label: "一般動詞を使った文を1つ作ってみよう",
    placeholder: "英文でも、日本語でもOK。",
  },
];
