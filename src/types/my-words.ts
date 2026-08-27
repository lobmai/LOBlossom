/** My Words：単語の学習状態 */
export type WordStatus = "new" | "practicing" | "learned" | "weak";

/** 復習結果（正解 / 不正解） */
export type ReviewResult = "correct" | "incorrect";

/** 教材側の単語マスター（全ユーザー共通） */
export interface WordMasterEntry {
  /** 英単語を正規化した ID（重複防止の鍵） */
  wordId: string;
  english: string;
  japanese: string;
  exampleEnglish: string;
  exampleJapanese: string;
  /** 音声ファイル参照（将来追加） */
  audioRef?: string;
  /** この単語が登場する Lesson 番号 */
  introducedInLessons: number[];
}

/** ユーザーが単語を使って作った例文（将来用） */
export interface UserWordExample {
  english: string;
  createdAt: string;
  aiChecked: boolean;
}

/** ユーザー専用の単語学習データ */
export interface MyWordUserEntry {
  wordId: string;
  english: string;
  japanese: string;
  exampleEnglish: string;
  exampleJapanese: string;
  audioRef?: string;

  /** 登場した Lesson 番号（複数可） */
  lessonNumbers: number[];
  status: WordStatus;

  /** 初めて My Words に追加された日時（ISO） */
  firstLearnedAt: string;
  /** 最後に復習した日時 */
  lastReviewedAt: string | null;
  /** 次回復習予定日（ISO date または ISO datetime） */
  nextReviewAt: string | null;

  correctCount: number;
  incorrectCount: number;
  /** 0〜5：復習間隔の段階 */
  masteryLevel: number;

  /** 連続正解回数（status 判定用） */
  consecutiveCorrect: number;
  /** 連続不正解回数（status 判定用） */
  consecutiveIncorrect: number;
  /** 直前の復習結果 */
  lastReviewResult: ReviewResult | null;

  /**
   * ユーザーが詳細画面で指定した表示状態（practicing / weak）。
   * 自動判定の status / mastery / 履歴は変更しない。
   * 未指定または null のときは status（自動判定）を表示する。
   */
  userStatusOverride?: "practicing" | "weak" | null;

  /** 将来：ユーザー作成例文 */
  userExamples?: UserWordExample[];
  /** 将来：AI コーチ連携用タグ */
  aiWeaknessTags?: string[];
}

export type MyWordsSaveResult = { ok: true } | { ok: false; error: string };

/** 復習処理後に更新されるフィールド */
export interface ReviewUpdateResult {
  masteryLevel: number;
  correctCount: number;
  incorrectCount: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  lastReviewResult: ReviewResult;
  lastReviewedAt: string;
  nextReviewAt: string;
}

/** 学習状態ごとの件数 */
export type WordStatusCounts = Record<WordStatus, number>;
