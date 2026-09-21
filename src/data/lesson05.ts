import type { CheckQuestion, LessonMeta } from "@/types/lesson";

export const lesson05Meta: LessonMeta = {
  id: "lesson-05-subjunctive",
  title: "仮定法ってなに？",
  subtitle: "現実とは違うことを、想像して話そう",
  readingMinutes: 7,
  levelLabel: "中級",
};

/** レッスン5で教える内容（理解度テスト・AI質問の出題範囲） */
export const lesson05TaughtTopics = [
  "仮定法は、現実とは違うこと・実際にはそうではないことを想像するときに使う",
  "if を使った「もし〜なら」",
  "現実とは違う想像をする今回の仮定法では、if側を過去形にする",
  "過去形でも、昔の話とは限らない",
  "結果側は would + 動詞の原形",
  "If I were ... / If I were you ...",
  "If I had ... / If I knew ...",
  "現在の事実との違い（今はそうではない、という含み）",
  "would は「もしそうなら、〜するのに」という想像の結果",
];

export const lesson05CheckQuestions: CheckQuestion[] = [
  {
    id: "q1",
    type: "choice",
    question: "仮定法のいちばん近い使い方はどれ？",
    options: [
      "現実とは違うことや、実際にはそうではないことを想像する",
      "必ず昔の出来事を話す",
      "丁寧な挨拶をする",
      "疑問文だけに使う",
    ],
    answer: "現実とは違うことや、実際にはそうではないことを想像する",
    explanation:
      "仮定法は「もし〜なら」と、現実とは違うことを想像する言い方だよ。今の事実そのものを話す文とは違うよ。",
    exampleSentence: "If I were rich, I would travel around the world.",
    translation: "もし私がお金持ちなら、世界中を旅行するのにな。",
  },
  {
    id: "q2",
    type: "choice",
    question:
      "If I were rich, I would travel around the world. の were の意味にいちばん近いのはどれ？",
    options: [
      "今はお金持ちではないけれど、もしそうだったら、という想像",
      "昔、本当にお金持ちだった",
      "明日お金持ちになる予定",
      "今、本当にお金持ちだ",
    ],
    answer: "今はお金持ちではないけれど、もしそうだったら、という想像",
    explanation:
      "ここでの過去形は「昔の話」ではないよ。現実から少し距離を置いて、「もしそうだったら」と想像しているよ。",
    exampleSentence: "If I were rich, I would travel around the world.",
    translation: "もし私がお金持ちなら、世界中を旅行するのにな。",
  },
  {
    id: "q3",
    type: "choice",
    question:
      "現実とは違う想像をする今回の仮定法の基本の形としていちばん近いのはどれ？",
    options: [
      "If + 過去形, would + 動詞の原形",
      "If + 動詞の原形, will + 過去形",
      "have / has + 過去分詞",
      "be動詞 + 動詞のing",
    ],
    answer: "If + 過去形, would + 動詞の原形",
    explanation:
      "現実とは違う想像をする今回の仮定法では、if のあとを過去形、結果の側を would + 動詞の原形にするよ。起こりそうな話（If it rains..., I will...）とは形が違うよ。",
    exampleSentence: "If I had more time, I would study English.",
    translation: "もしもっと時間があれば、英語を勉強するのにな。",
  },
  {
    id: "q4",
    type: "choice",
    question: "「もし私があなたなら、彼女に話しかけるかな」にいちばん近い文はどれ？",
    options: [
      "If I were you, I would talk to her.",
      "If I am you, I would talk to her.",
      "If I were you, I will talk to her.",
      "If I were you, I talking to her.",
    ],
    answer: "If I were you, I would talk to her.",
    explanation:
      "仮定法では If I were ... を基本にするよ。結果の側は would + 動詞の原形だよ。",
    exampleSentence: "If I were you, I would talk to her.",
    translation: "もし私があなたなら、彼女に話しかけるかな。",
  },
  {
    id: "q5",
    type: "choice",
    question:
      "「今はあまり時間がないけれど、もしあったら英語を勉強するのにな」にいちばん近い文はどれ？",
    options: [
      "If I had more time, I would study English.",
      "I had more time yesterday.",
      "I have finished my homework.",
      "If it rains tomorrow, I will stay home.",
    ],
    answer: "If I had more time, I would study English.",
    explanation:
      "had は「昨日時間があった」ではなく、「今とは違う想像」だよ。If it rains tomorrow, I will stay home. は、実際に起こるかもしれない話だよ。",
    exampleSentence: "If I had more time, I would study English.",
    translation: "もしもっと時間があれば、英語を勉強するのにな。",
  },
  {
    id: "q6",
    type: "choice",
    question:
      "If I knew the answer, I would tell you. から読み取れることにいちばん近いのはどれ？",
    options: [
      "今は答えを知らない",
      "昔、答えを知っていた",
      "今、本当に答えを知っている",
      "明日、答えが分かる予定",
    ],
    answer: "今は答えを知らない",
    explanation:
      "knew は昔の出来事というより、「もし知っていたら」という想像だよ。実際には今、答えを知らない、という含みがあるよ。",
    exampleSentence: "If I knew the answer, I would tell you.",
    translation: "もし答えを知っていたら、教えるのにな。",
  },
  {
    id: "q7",
    type: "choice",
    question:
      "A: I want to talk to her, but I'm nervous.\nB: If I were you, I would talk to her.\nB がいちばん伝えていることはどれ？",
    options: [
      "もし自分があなただったら話しかけると思う、という助言",
      "Bは昔、本当に彼女に話しかけた",
      "Bは今、A本人になっている",
      "明日雨が降ったら家にいる、という予定",
    ],
    answer: "もし自分があなただったら話しかけると思う、という助言",
    explanation:
      "If I were you は「もし私があなたなら」という想像の助言でよく使うよ。B が昔そうした、という意味ではないよ。",
    exampleSentence: "If I were you, I would talk to her.",
    translation: "もし私があなたなら、彼女に話しかけるかな。",
  },
];
