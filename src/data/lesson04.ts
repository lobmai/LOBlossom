import type { CheckQuestion, LessonMeta } from "@/types/lesson";

export const lesson04Meta: LessonMeta = {
  id: "lesson-04-relative-pronoun",
  title: "関係代名詞ってなに？",
  subtitle: "2つの情報を、1つの文につなげよう",
  readingMinutes: 7,
  levelLabel: "中級",
};

/** レッスン4で教える内容（理解度テスト・AI質問の出題範囲） */
export const lesson04TaughtTopics = [
  "関係代名詞は、前の名詞についてあとから説明を足す",
  "2つの文の情報を1文につなげられる",
  "説明される前の名詞（先行詞）",
  "人 → who",
  "もの → which",
  "that は人・ものの両方に使えることがある",
  "the girl who speaks English = 「英語を話す女の子」",
  "主格：who / which / that の直後が動詞（自身が動作する側）",
  "目的格：that I bought のように、直後に I / you などが続く",
  "目的格では関係代名詞を省略できることがある",
];

export const lesson04CheckQuestions: CheckQuestion[] = [
  {
    id: "q1",
    type: "choice",
    question: "関係代名詞のいちばん近い役割はどれ？",
    options: [
      "前の名詞について、あとから説明を足す",
      "文を過去の話に変える",
      "丁寧な挨拶のことば",
      "主語がIのときだけ使う語",
    ],
    answer: "前の名詞について、あとから説明を足す",
    explanation:
      "関係代名詞は、前の人やものに説明を付け足すよ。2つの文の情報を1文にできる、という感覚が大事だよ。",
    exampleSentence: "I know the girl who speaks English.",
    translation: "私は英語を話す女の子を知っています。",
  },
  {
    id: "q2",
    type: "choice",
    question: "人を説明するときに使う代表的な関係代名詞はどれ？",
    options: ["who", "when", "where", "how"],
    answer: "who",
    explanation:
      "人を説明するときは who を使うよ。that を使える場合もあるけれど、まずは「人 → who」という基本を覚えよう。",
    exampleSentence: "I know the girl who speaks English.",
    translation: "私は英語を話す女の子を知っています。",
  },
  {
    id: "q3",
    type: "choice",
    question: "ものを説明している文はどれ？",
    options: [
      "This is the book which is interesting.",
      "I know the girl who speaks English.",
      "She is my teacher.",
      "Do you like music?",
    ],
    answer: "This is the book which is interesting.",
    explanation: "which は、ものを説明するときに使うよ。",
    exampleSentence: "This is the book which is interesting.",
    translation: "これはおもしろい本です。",
  },
  {
    id: "q4",
    type: "choice",
    question: "that の使い方としていちばん近いのはどれ？",
    options: [
      "人にもものにも使えることがある",
      "人にだけ使える",
      "ものにだけ使える",
      "疑問文のときだけ使える",
    ],
    answer: "人にもものにも使えることがある",
    explanation:
      "that は、人にもものにも使えることがあるよ。This is the book that I bought yesterday. は、ものを説明している例だよ。",
    exampleSentence: "This is the book that I bought yesterday.",
    translation: "これは私が昨日買った本です。",
  },
  {
    id: "q5",
    type: "choice",
    question:
      "次の2文を1文にするとき、いちばん自然なのはどれ？\nI know the girl.\nShe speaks English.",
    options: [
      "I know the girl who speaks English.",
      "I know the girl she speaks English.",
      "I know who the girl speaks English.",
      "The girl speaks I know English.",
    ],
    answer: "I know the girl who speaks English.",
    explanation:
      "2つ目の文の She は、1つ目の the girl を指しているよ。そのつなぎ目に who を置くと、1つの文にできるよ。",
    exampleSentence: "I know the girl who speaks English.",
    translation: "私は英語を話す女の子を知っています。",
  },
  {
    id: "q6",
    type: "choice",
    question:
      "A. The girl who speaks English is my friend.\nB. This is the book that I bought yesterday.\nこの2文のちがいにいちばん近いのはどれ？",
    options: [
      "Aは the girl について「英語を話します」と足している。Bは the book について「私が昨日買いました」と足している。",
      "Aは過去、Bは未来。",
      "Aは丁寧、Bはカジュアル。",
      "どちらも文の役割は同じ。",
    ],
    answer:
      "Aは the girl について「英語を話します」と足している。Bは the book について「私が昨日買いました」と足している。",
    explanation:
      "A は、The girl speaks English. という考え方だよ。the girl と who は同じ人だから、who speaks English が the girl に「英語を話します」という説明を足しているよ。B は、I bought the book yesterday. という考え方だよ。the book と that は同じものだから、that I bought yesterday が the book に「私が昨日買いました」という説明を足しているよ。文法ではこの2つを主格・目的格と呼ぶこともあるよ。",
    exampleSentence: "The girl who speaks English is my friend.",
    translation: "英語を話すその女の子は私の友達です。",
  },
  {
    id: "q7",
    type: "choice",
    question:
      "A: Do you know the woman who is talking to Ken?\nB の自然な返事はどれ？",
    options: [
      "Yes. She's my teacher.",
      "Yes. Ken is my teacher.",
      "Yes, I have.",
      "No. I don't like music.",
    ],
    answer: "Yes. She's my teacher.",
    explanation:
      "who is talking to Ken は Ken ではなく、the woman を説明しているよ。だから She's は「Ken と話している女性」を指しているよ。Ken is my teacher. だと、説明されている人がずれるよ。",
    exampleSentence: "Do you know the woman who is talking to Ken?",
    translation: "Ken と話している女性を知っていますか？",
  },
];
