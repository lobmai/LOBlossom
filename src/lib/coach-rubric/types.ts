/**
 * AIコーチの理解度レベル（Phase5b 以降で evaluate が返す）
 */
export type CoachOverallLevel =
  | "understood"
  | "partial"
  | "misconception"
  | "insufficient";

/**
 * Phase5b 以降：AI evaluate の構造化返却
 *
 * 【重要】該当がない項目は無理に生成しない
 * - gaps / misconceptions → 空配列 []
 * - nextQuestion → null（追加で聞く必要がなければ）
 * - strengths → 理解できている点のみ（十分理解なら gaps/misconceptions は空のまま）
 *
 * 後方互換：overallMessage は従来どおり必須。Step6 finalize は Phase5b でもこれを参照可能。
 */
export type StructuredCoachEvaluationFields = {
  /** 理解できている点。該当がなければ空配列（通常は1件以上） */
  strengths: string[];
  /** 一部不足。該当がなければ [] */
  gaps: string[];
  /** 誤解。該当がなければ [] */
  misconceptions: string[];
  /** 追加で確認したい質問。不要なら null */
  nextQuestion: string | null;
  /** 全体の理解度 */
  overallLevel: CoachOverallLevel;
};

/** Phase5b の AI プロンプトに含める「無理に指摘しない」ルール（文言） */
export const COACH_EVAL_EMPTY_FIELD_RULES = [
  "ユーザーが十分理解できている場合、gaps・misconceptions・nextQuestion を無理に作らない",
  "gaps は本当に不足があるときだけ。空配列 [] でよい",
  "misconceptions は本当に誤解があるときだけ。空配列 [] でよい",
  "nextQuestion は追加確認が必要なときだけ。不要なら null",
  "overallLevel が understood のときは gaps と misconceptions を空にし、nextQuestion は null にする",
  "完璧を求めない。大きな誤解や重要点の抜けがなければ understood とする",
  "意味不明な文字列・1文字だけ・質問と無関係な回答・極端に情報不足の場合は overallLevel を insufficient とし、無理に understood にしない",
  "判断できない場合は strengths を空配列 [] にし、overallMessage でやさしく再回答を促す",
] as const;

/** Lesson 内の1評価ポイント */
export type CoachRubricPoint = {
  /** 評価ポイント ID（将来：質問項目との紐付け用） */
  id: string;
  /** 表示用ラベル */
  label: string;
  /** 必ず理解してほしい内容 */
  mustUnderstand: string[];
  /** よくある誤解・間違い */
  commonMisconceptions: string[];
  /** これらが含まれていれば OK とみなしてよいキーワード・概念 */
  okIfIncludes?: string[];
  /** Step3 の trajectoryEntries フィールド ID（関連付け） */
  relatedFieldIds?: string[];
  /** Step5 初回質問（1問・具体的） */
  coachQuestion?: string;
  /** Step5 ヒントキーワード */
  coachHints?: string[];
};

/** Lesson 別評価基準（rubric） */
export type CoachRubric = {
  lessonId: string;
  title: string;
  points: CoachRubricPoint[];
};
