import type { CheckQuestion, LessonMeta } from "@/types/lesson";

export const lesson03Meta: LessonMeta = {
  id: "lesson-03-present-perfect",
  title: "現在完了ってなに？",
  subtitle: "過去の出来事を、今とのつながりを含めて表そう",
  readingMinutes: 7,
  levelLabel: "中級",
};

/** レッスン3で教える内容（理解度テスト・AI質問の出題範囲） */
export const lesson03TaughtTopics = [
  "現在完了の中心イメージ：過去のこと ＋ 今とのつながり",
  "過去形との違い（I lost my key. / I have lost my key.）",
  "基本形：have / has + 過去分詞",
  "have / has の使い分け（I/you/we/they → have、he/she/it → has）",
  "経験（I have been to Kyoto. / ever / never）",
  "完了・結果（I have finished my homework. / already / yet）",
  "継続（I have lived here for three years. / for / since）",
  "経験・完了・継続はどれも「過去と今がつながっている」",
  "否定：haven't / hasn't + 過去分詞",
  "疑問：Have / Has + 主語 + 過去分詞？",
];

export const lesson03CheckQuestions: CheckQuestion[] = [
  {
    id: "q1",
    type: "choice",
    question: "現在完了の基本形として正しいのはどれ？",
    options: [
      "have / has + 過去分詞",
      "be動詞 + 動詞のing",
      "will + 動詞原形",
      "did + 過去分詞",
    ],
    answer: "have / has + 過去分詞",
    explanation:
      "現在完了は have または has のあとに過去分詞を置く形だよ。形だけでなく「過去と今のつながり」を表すのが大事だよ。",
    exampleSentence: "I have lost my key.",
    translation: "鍵をなくしてしまっている（今もその結果が続いている）。",
  },
  {
    id: "q2",
    type: "fill",
    question: "She _____ finished her homework.（彼女は宿題を終えている）",
    answer: "has",
    explanation:
      "She（彼女）は he / she / it のグループだから has を使うよ。I / you / we / they のときは have だよ。",
    exampleSentence: "She has finished her homework.",
    translation: "彼女は宿題を終えている。",
  },
  {
    id: "q3",
    type: "choice",
    question: "「経験」を表している文はどれ？",
    options: [
      "I have been to Kyoto.",
      "I go to Kyoto every year.",
      "I am in Kyoto now.",
      "I will go to Kyoto.",
    ],
    answer: "I have been to Kyoto.",
    explanation:
      "I have been to Kyoto. は「京都に行ったことがある」という経験を表すよ。過去の経験を、今の自分が持っているイメージだよ。",
    exampleSentence: "I have been to Kyoto.",
    translation: "私は京都に行ったことがある。",
  },
  {
    id: "q4",
    type: "choice",
    question: "「継続」（前から今まで続いている）を表している文はどれ？",
    options: [
      "I have lived here for three years.",
      "I lived here three years ago.",
      "I will live here for three years.",
      "I live here yesterday.",
    ],
    answer: "I have lived here for three years.",
    explanation:
      "for three years と一緒に使う現在完了は、過去に始まって今まで続いていることを表すよ。",
    exampleSentence: "I have lived here for three years.",
    translation: "私は3年間ここに住んでいる。",
  },
  {
    id: "q5",
    type: "choice",
    question: "「あなたは京都に行ったことがありますか？」に合う英文はどれ？",
    options: [
      "Have you been to Kyoto?",
      "Do you been to Kyoto?",
      "Are you been to Kyoto?",
      "Did you have been to Kyoto?",
    ],
    answer: "Have you been to Kyoto?",
    explanation:
      "現在完了の疑問文は Have / Has を文の前に出すよ。you のときは Have を使うよ。",
    exampleSentence: "Have you been to Kyoto?",
    translation: "あなたは京都に行ったことがありますか？",
  },
  {
    id: "q6",
    type: "choice",
    question:
      "I lost my key. と I have lost my key. のちがいとして、いちばん近いのはどれ？",
    options: [
      "過去形は過去の出来事だけを話し、現在完了は過去と今のつながりも含めて話す",
      "どちらもまったく同じ意味で、好みで使い分けるだけ",
      "現在完了は未来のことを表し、過去形は今のことを表す",
      "過去形は丁寧で、現在完了はカジュアルな言い方",
    ],
    answer:
      "過去形は過去の出来事だけを話し、現在完了は過去と今のつながりも含めて話す",
    explanation:
      "I lost my key. は「なくした」という過去の出来事。I have lost my key. はなくした結果が今にもつながっている、という感じだよ。",
    exampleSentence: "I have lost my key.",
    translation: "鍵をなくしてしまっている（今も困っている、など）。",
  },
  {
    id: "q7",
    type: "choice",
    question: "Have you ever been to Kyoto? 自然な返事はどれ？",
    options: ["Yes, I am.", "Yes, I do.", "Yes, I have.", "Yes, I did."],
    answer: "Yes, I have.",
    explanation:
      "「Have you ...?」で聞かれた質問には have を使って答えるよ。本文の Have you been to Kyoto? と同じ形で、経験を聞かれたときの返事だよ。Yes, I did. は過去形の返事だよ。",
    exampleSentence: "Yes, I have.",
    translation: "はい、行ったことがあります。",
  },
];
