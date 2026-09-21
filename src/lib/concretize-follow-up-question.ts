/**
 * Step5 follow-up が抽象的すぎるとき、rubric の具体質問へ置き換える。
 * 新しいAI呼び出しはしない。レッスン専用の固定文は持たない。
 */

const VAGUE_QUESTION =
  /どう考えていますか|どう考えますか|どうして重要|理解していますか|役割を認識|想像や現実の違い/;

function hasConcreteHook(question: string): boolean {
  return /[A-Za-z]/.test(question) || /[「『]/.test(question);
}

function isVagueLearnerQuestion(question: string): boolean {
  const q = question.trim();
  if (!q) return true;
  if (VAGUE_QUESTION.test(q)) return true;
  if (/について[、,]/.test(q) && /どう/.test(q)) return true;
  if (/現実|状況|認識|役割/.test(q) && !hasConcreteHook(q)) return true;
  return false;
}

export function concretizeFollowUpQuestion(
  aiQuestion: string | null | undefined,
  rubricQuestion: string | null | undefined,
): string | null {
  const ai = aiQuestion?.trim() || null;
  const fallback = rubricQuestion?.trim() || null;
  if (!ai) return fallback;
  if (!isVagueLearnerQuestion(ai)) return ai;
  return fallback || ai;
}
