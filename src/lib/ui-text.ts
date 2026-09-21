/** ユーザー向け画面のやさしい日本語（企画書の概念名とは別） */

export const ui = {
  app: {
    title: "LOBlossom — 教えることで、学ぶ",
    description:
      "覚えるために学ぶ、忘れない為に教える。自分の言葉で話して、学び方を身につけるアプリ。",
  },

  titleScreen: {
    tagline: "少しずつ、理解の花が咲く",
    lead: "覚えるために学ぶ、忘れない為に教える",
    lead2: "自分の言葉で話して、学び方を身につけよう",
    startButton: "はじめる",
    myLoopLink: "My Loop",
    myWordsLink: "My Words",
  },

  lessonSelect: {
    title: "どのレッスンを学ぶ？",
    subtitle: "学びたいテーマを選んでね",
    myLoopLink: "My Loop",
    myWordsLink: "My Words",
    specialLabel: "🌸 Special",
    specialButton: "単語練習をする →",
  },

  home: {
    tagline: "少しずつ、理解の花が咲く",
    lead: "覚えるために学ぶ、忘れない為に教える",
    lead2: "自分の言葉で話して、学び方を身につけよう",
    lessonBadge: "🌱 レッスン1",
    startButton: "レッスンをはじめる →",
    footer: "約5分 · 7つのステップ",
  },

  steps: {
    lesson: "レッスン",
    check: "理解度テスト",
    summarize: "まとめる",
    evaluate: "確認",
    answer: "質問",
    finalize: "完成",
    save: "保存",
  },

  lesson1: {
    readSubtitle: (minutes: number) =>
      `約${minutes}分 · まずは読んでみよう\n大事なところや気になったところはメモしておこう！`,
    todayTheme: "きょうのテーマ",
    summaryBox: "🌸 きょうのポイント",
    toCheck: "理解度テストへ →",
  },

  check: {
    title: "理解度テスト",
    subtitle: "自分の理解度をチェックしよう！\n（全問正解じゃなくても大丈夫！）",
    questionLabel: (n: number) => `もんだい ${n}`,
    unanswered: "未回答",
    fillInputPlaceholder: "ここに答えを書こう",
    submitAnswer: "答える",
    reorderYourAnswer: "あなたの答え",
    reorderEmpty: "下のことばをタップして並べよう",
    reorderWords: "ことば",
    correct: "正解！",
    incorrect: "おしい！",
    correctAnswer: (answer: string) => `正解は「${answer}」だよ。`,
    translation: "和訳：",
    score: (total: number, correct: number) =>
      `${total}問中${correct}問正解`,
    unansweredHint: (numbers: number[]) =>
      `まだ答えていないもんだい：${numbers.map((n) => `もんだい ${n}`).join("、")}`,
    toSummarize: "まとめを書く →",
  },

  summarize: {
    title: "学んだ内容を自分の言葉でまとめる",
    subtitle: "具体的な問いに短く答えていくだけで、自分のまとめが完成するよ。",
    emptyHint:
      "空欄をすべて埋めると、次に進めるよ。「分からなかったところ」は「なし」か「ある」を選んでね。例文も1つ書こう 🌱",
    qualityHint:
      "もう少し具体的に書いてみよう。1文字だけの入力や、意味が伝わりにくい内容は次に進めないよ。",
    toEvaluate: "まとめる",
    navigating: "質問へ移動中…",
  },

  evaluate: {
    title: "まとめを確認する",
    subtitle: "あなたの理解度をまとめます！",
    overall: "確認の結果",
    corrections: "直した方がいいところ",
    polishTitle: "読みやすく整えた文章",
    polishNote: "意味はそのまま。あなたの考えを残して、読み返しやすく整えました。",
    praise: "よくできたところ",
    grow: "もっとよくなるところ",
    hint: "コツ",
    loading: "確認中…",
    error: "メッセージを取得できませんでした。もう一度試してみてね。",
    apiKeyError:
      "OpenAI APIキーが正しく設定されていません。.env.local を確認して、開発サーバーを再起動してね。",
    retry: "もう一度試す",
    next: "質問に答える →",
    structuredStrengths: "できていること",
    structuredConfirm: "もう少し確認したいこと",
    structuredNextQuestion: "次の質問",
    insufficientMessage:
      "まだ理解度を確認できませんでした。もう一度、自分の言葉でまとめてみませんか？",
    backToSummarize: "まとめを書き直す",
    retryAfterEdit: "もう一度確認する",
    qualityHint:
      "もう少し具体的に書いてみよう。1文字だけや意味が伝わりにくい入力は、次に進めないことがあるよ。",
    exampleCheckTitle: "例文を確認しよう",
    exampleCheckYourExample: "あなたの例文",
    exampleCheckFixHeading: "ここを直そう",
    exampleCheckCorrected: "修正版",
    exampleCheckCorrect: "この例文でだいじょうぶだよ。",
    unknownQuestionTitle: "分からなかったところを確認しよう",
    unknownAnswerFallback: "今回はうまく説明を作れませんでした。",
  },

  answer: {
    title: "質問があるみたい！",
    subtitle: "あなたの言葉で教えてあげよう",
    placeholder: "自分の言葉で説明してみよう",
    inputLabel: "自分の言葉で説明してみよう",
    inputPlaceholder: "例：am / is / are の使い分け",
    emptyHint: "答えを書くと、次に進めるよ。",
    qualityHint:
      "もう少し具体的に書いてみよう。1文字だけの入力は、まとめを完成できないよ。",
    needEvaluateFirst: "先にまとめの確認を終えてから、ここに来てね。",
    backToEvaluate: "確認に戻る",
    loading: "質問を読み込み中…",
    evaluating: "考え中…",
    error: "うまく確認できませんでした。もう一度試してみてね。",
    apiKeyError:
      "OpenAI APIキーが正しく設定されていません。.env.local を確認して、開発サーバーを再起動してね。",
    retry: "もう一度試す",
    submit: "回答を送る",
    submitAgain: "もう一度答える",
    next: "まとめを完成させる →",
    navigating: "まとめ作成へ移動中…",
    conversationTitle: "💬 教えてみよう",
    hintsLabel: "こんなことを入れてみよう",
    sessionIncomplete: "質問に答えてから、次に進もう。",
  },

  finalize: {
    title: "完成したまとめ",
    subtitle:
      "あなたがまとめた内容を、あとから見返しやすく整理しました。\n足りないところは書き足して完成させよう！",
    subtitleShort: "今回理解した内容を、後から見返しやすくまとめたよ。",
    loading: "まとめを整理中…",
    error: "まとめを読み込めませんでした。前のステップに戻ってみてね。",
    blockedCoachAnswer:
      "回答が短すぎるか、内容を確認できませんでした。もう一度、自分の言葉で答えてみてね。",
    blockedTrajectory:
      "まとめの内容を確認できませんでした。Step3 に戻って、もう一度書き直してみてね。",
    blockedEvaluation:
      "まとめの確認がまだ終わっていないようです。ひとつ前のステップに戻ってみてね。",
    backToFix: "前のステップに戻る",
    next: "My Loop に保存する →",
    navigating: "保存画面へ移動中…",
    savedPreviewTitle: "My Loopに保存される内容",
    savedPreviewNote: "あとから見返す内容は、これと同じです。",
    edit: "編集する",
    saveEdit: "保存",
    cancelEdit: "キャンセル",
    exampleJapanese: "例文の日本語訳",
  },

  save: {
    title: "レッスン1 クリア！",
    subtitle:
      "まとめ完成！\nレッスンお疲れさまでした☺️\nMy Loopに、あなたのまとめを保存したよ。",
    master: "レッスン1 クリア！",
    message:
      "まとめ完成！\nレッスンお疲れさまでした☺️\nMy Loopに、あなたのまとめを保存したよ。",
    selfEval: "きょうの気持ち",
    feelings: [
      { id: "got-it", label: "わかった！" },
      { id: "a-bit-hard", label: "ちょっとむずかしかった" },
      { id: "want-again", label: "もう一回やりたい" },
    ],
    savedHint: "My Loop に保存したよ 🌸",
    saving: "My Loop に保存中…",
    toMyLoop: "My Loop を見る →",
    backToLessons: "レッスン選択に戻る →",
    backHome: "トップに戻る",
  },

  storage: {
    saveError: "保存できませんでした。もう一度試してみてね。",
  },

  myLoop: {
    title: "My Loop",
    subtitle: "これまでの学びを見返そう",
    empty: "まだ記録がありません。レッスンを終えると、ここに残るよ。",
    startLesson: "レッスンをはじめる →",
    backHome: "← レッスン選択",
    studiedAt: (date: string) => `${date} に学習`,
    feeling: "きょうの気持ち",
    notFound: "この記録は見つかりませんでした。",
    finalSummarySection: "完成したまとめ",
    lessonSummary: "レッスンの要約",
    mySummary: "わたしのまとめ",
    myPoints: "わたしが大事だと思ったこと",
    myExample: "わたしが作った例文",
    reviewLesson: "レッスン内容をもう一度見る →",
    noSummary: "要約が保存されていません。",
    noPoints: "（未入力）",
    noExample: "（未入力）",
    backToList: "← My Loop にもどる",
  },

  myWords: {
    title: "My Words",
    subtitle: "レッスンで学んだ単語を確認しよう",
    backHome: "← レッスン選択",
    backToList: "← My Words にもどる",
    empty: "まだ単語がありません。レッスンを終えると、ここに単語が追加されるよ。",
    startLesson: "レッスンをはじめる →",
    notFound: "この単語は見つかりませんでした。",
    statsTotal: "総単語数",
    statsNew: "新しい単語",
    statsPracticing: "練習中",
    statsLearned: "習得済み",
    statsWeak: "苦手",
    filterHeading: "表示する状態",
    filterHint: "タップで ON / OFF。複数選べます",
    filterOn: "表示中",
    filterOff: "非表示",
    reviewSpecialCta: "Lesson1 Specialで復習する →",
    filterEmpty: "表示する単語がありません",
    listHeading: "単語一覧",
    nextReview: "次回復習",
    nextReviewToday: "今日復習",
    status: "学習状態",
    lessons: "登場したレッスン",
    example: "例文",
    exampleJa: "例文の和訳",
    firstLearned: "初めて学習した日",
    reviewDueHint: "復習の時間です",
    stillUnsure: "この単語、まだ覚えきれていない？",
    switchStatus: "この単語の習得状況を切り替えられるよ！",
    currentStatus: "現在",
    statusManualHint: "自分で変更",
    setLearned: "習得済み",
    setPracticing: "練習中",
    setWeak: "苦手",
    clearOverride: "自動判定に戻す",
    prevWord: "前の単語",
    nextWord: "次の単語",
  },

  nav: {
    back: "← もどる",
    top: "← レッスン選択",
    backToTop: "← トップへ",
    next: "つぎへ →",
    processing: "処理中…",
  },

  homeLink: {
    myLoop: "My Loop を見る →",
  },

  memo: {
    button: "メモ",
    title: "📝 学習メモ",
    hint: "学習しながら、項目ごとに書いておけるよ。",
    meaning: "意味",
    meaningPlaceholder: "この文法・表現が、どういう意味かを書こう",
    grammar: "文法",
    grammarPlaceholder: "形・ルール・使い方を書こう",
    important: "大事なこと",
    importantPlaceholder: "自分が覚えておきたいポイントを書こう",
    other: "その他メモ",
    otherPlaceholder: "上の3つに当てはまらないことを自由に書こう",
    close: "とじる",
  },
} as const;
