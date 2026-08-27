export type LessonStep =
  | "lesson"
  | "check"
  | "summarize"
  | "evaluate"
  | "answer"
  | "finalize"
  | "save";

export interface LessonStepConfig {
  id: LessonStep;
  stepNumber: number;
  label: string;
  path: string;
}

export interface SummarySection {
  id: string;
  label: string;
  placeholder: string;
}

export interface TeachQuestion {
  id: string;
  label: string;
  placeholder: string;
}

export interface CheckQuestion {
  id: string;
  type: "choice" | "fill" | "reorder";
  question: string;
  options?: string[];
  answer: string | string[];
  explanation: string;
  /** 和訳表示用の英文（回答後に表示） */
  exampleSentence: string;
  /** 和訳（回答後に表示） */
  translation: string;
}

export interface LessonMeta {
  id: string;
  title: string;
  subtitle: string;
  readingMinutes: number;
}

/** @deprecated SummarySection を使用 */
export type TrajectorySection = SummarySection;
