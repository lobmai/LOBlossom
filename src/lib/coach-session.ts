import type { CoachExchange, CoachSession, CoachSessionStatus } from "@/types/record";

export {
  buildCoachAnswerFromSession,
  getMeaningfulUserAnswers,
  synthesizeCoachPointsFromSession,
} from "@/lib/coach-synthesize-answer";

export function createInitialCoachSession(initialQuestion: string): CoachSession {
  return {
    status: "awaiting-initial",
    followUpCount: 0,
    hintLevel: 0,
    exchanges: [
      {
        role: "coach",
        kind: "question",
        text: initialQuestion,
        at: new Date().toISOString(),
      },
    ],
  };
}

export function isCoachSessionFinished(session: CoachSession | null | undefined): boolean {
  if (!session) return false;
  return session.status === "complete" || session.status === "taught";
}

export function appendExchange(
  session: CoachSession,
  exchange: Omit<CoachExchange, "at">,
): CoachSession {
  return {
    ...session,
    exchanges: [
      ...session.exchanges,
      { ...exchange, at: new Date().toISOString() },
    ],
  };
}

export function updateSessionStatus(
  session: CoachSession,
  status: CoachSessionStatus,
  patch: Partial<Omit<CoachSession, "exchanges" | "status">> = {},
): CoachSession {
  return { ...session, status, ...patch };
}

export function resetHintRound(session: CoachSession): CoachSession {
  return { ...session, hintLevel: 0 };
}
