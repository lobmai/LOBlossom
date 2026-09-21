/** レッスンクリア時の「きょうの気持ち」 */
export type FeelingId = "got-it" | "a-bit-hard" | "want-again";

/** 質問・項目 ID とラベル、回答のセット（レッスンごとに項目数が変わっても使える） */
export interface LabeledAnswer {
  id: string;
  label: string;
  answer: string;
}

/** Step 4：AIが整えた文章（項目ごと） */
export interface SummaryPolishItem {
  id: string;
  polishedAnswer: string | null;
}

import type { CoachOverallLevel } from "@/lib/coach-rubric/types";

/** Step 4：自作例文の文法チェック（optional・旧評価互換） */
export type UserExampleCheck = {
  isCorrect: boolean;
  correctedExample: string | null;
  errorReason: string | null;
};

/** Step 4：AIコーチによるまとめの評価 */
export interface AiEvaluation {
  overallMessage: string;
  corrections: string[];
  polishedEntries: SummaryPolishItem[];
  hasPolish: boolean;
  evaluatedAt: string;
  unclearAdvice?: string | null;
  /** Step3「分からなかったところ」への説明。疑問がなければ null */
  unknownQuestionAnswer?: string | null;
  /** Phase5b：理解できている点 */
  strengths?: string[];
  /** Phase5b：一部不足（該当なしは [] または省略） */
  gaps?: string[];
  /** Phase5b：誤解（該当なしは [] または省略） */
  misconceptions?: string[];
  /** Phase5b：追加確認質問（不要なら null または省略） */
  nextQuestion?: string | null;
  /** Phase5b：全体の理解度 */
  overallLevel?: CoachOverallLevel;
  /** 自作例文チェック（取得できないときは省略または null） */
  userExampleCheck?: UserExampleCheck | null;
  /** 旧フロー互換 */
  goodPoints?: string[];
  improvementPoints?: string[];
  tip?: string;
}

/** Step 5：AIコーチからの質問とキーワードヒント */
export interface CoachQuestion {
  question: string;
  keywords: string[];
  generatedAt: string;
  /** rubric point ID（Phase6 追質問用） */
  rubricPointId?: string;
  /** 質問の出所 */
  source?: "rubric" | "ai-followup";
}

/** Phase6：Step5 会話の1発言 */
export type CoachExchangeKind =
  | "question"
  | "answer"
  | "hint"
  | "followup-question"
  | "closing"
  | "teach";

export type CoachExchange = {
  role: "coach" | "user";
  kind: CoachExchangeKind;
  text: string;
  rubricPointId?: string;
  at: string;
};

/** Phase6：Step5 教える体験のセッション状態 */
export type CoachSessionStatus =
  | "awaiting-initial"
  | "awaiting-followup"
  | "showing-hint"
  | "complete"
  | "taught";

export type CoachSession = {
  status: CoachSessionStatus;
  /** 追加質問を出した回数（0〜2） */
  followUpCount: number;
  /** 現在のラウンドで表示したヒント段階（0〜2、ローカル） */
  hintLevel: number;
  activeRubricPointId?: string;
  pendingFollowUpQuestion?: string;
  exchanges: CoachExchange[];
  closingMessage?: string;
};

/** Phase6：teach-evaluate API の結果 */
export type TeachEvaluateOutcome = "complete" | "followup" | "teach";

export type TeachEvaluateResult = {
  outcome: TeachEvaluateOutcome;
  paraphrase?: string | null;
  closingMessage?: string | null;
  followUpQuestion?: string | null;
  followUpSentence?: string | null;
  targetRubricPointId?: string | null;
  teachContent?: string | null;
};

/** Step2 理解度テストの回答状態（draft 永続化用） */
export interface CheckQuizState {
  results: Record<string, { answered: boolean; correct: boolean; userAnswer?: string }>;
  fillInputs: Record<string, string>;
  reorderSelected?: string[];
  reorderPool?: string[];
}

/** 1回のレッスン学習記録（My Loop に表示する単位） */
export interface LessonRecord {
  recordId: string;
  lessonId: string;
  lessonTitle: string;
  startedAt: string;
  completedAt: string | null;
  isCompleted: boolean;
  /** 旧フロー互換 */
  teachAnswers: LabeledAnswer[];
  /** Step 3：ユーザーが書いたまとめ（原文） */
  trajectoryEntries: LabeledAnswer[];
  coachAnswer: string | null;
  coachQuestion: CoachQuestion | null;
  /** Phase6：Step5 会話セッション（optional・旧 draft 互換） */
  coachSession?: CoachSession | null;
  /** Step 6：完成した最終まとめ */
  finalSummary: LabeledAnswer[] | null;
  /** Step 4：最終例文が確定したときの日本語訳。未取得の旧レコードは省略 */
  userExampleJapanese?: string | null;
  /** userExampleJapanese がどの英文に対する訳か。未取得の旧レコードは省略 */
  userExampleJapaneseFor?: string | null;
  /** My Loop に出す確定例文（正しい原文 or 修正版）。未取得の旧レコードは省略 */
  userExampleFinal?: string | null;
  /** 間違っていた場合の簡潔な理由 */
  userExampleCorrectionReason?: string | null;
  /** 自作例文が文法的に正しいか。未判定の旧レコードは省略 */
  userExampleIsCorrect?: boolean | null;
  /** My Loop「大事だと思ったこと」の整形済み文章。未取得の旧レコードは省略 */
  myPointsFinal?: string | null;
  feeling: FeelingId | null;
  feelingLabel: string | null;
  aiEvaluation: AiEvaluation | null;
  /** Step2 理解度テストの回答（optional・旧 draft 互換） */
  checkQuizState?: CheckQuizState | null;
}

export type SaveResult = { ok: true } | { ok: false; error: string };
