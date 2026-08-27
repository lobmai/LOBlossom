import { NextResponse } from "next/server";
import { finalizeSummary } from "@/lib/coach-evaluate";
import { isOpenAiApiKeyConfigured } from "@/lib/openai-config";
import { getOpenAiErrorResponse, logOpenAiError } from "@/lib/openai-errors";
import type { AiEvaluation, LabeledAnswer } from "@/types/record";

interface FinalizeRequestBody {
  lessonId: string;
  summaryEntries: LabeledAnswer[];
  aiEvaluation: AiEvaluation;
  coachAnswer: string | null;
}

function isValidAiEvaluation(ai: unknown): ai is AiEvaluation {
  if (!ai || typeof ai !== "object") return false;
  const e = ai as AiEvaluation;
  return typeof e.overallMessage === "string" && Array.isArray(e.polishedEntries);
}

function isValidBody(body: unknown): body is FinalizeRequestBody {
  if (!body || typeof body !== "object") return false;
  const { lessonId, summaryEntries, aiEvaluation, coachAnswer } = body as FinalizeRequestBody;
  return (
    typeof lessonId === "string" &&
    Array.isArray(summaryEntries) &&
    isValidAiEvaluation(aiEvaluation) &&
    (coachAnswer === null || typeof coachAnswer === "string")
  );
}

export async function POST(request: Request) {
  try {
    if (!isOpenAiApiKeyConfigured()) {
      return NextResponse.json({ error: "api_key_not_configured" }, { status: 503 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    if (!isValidBody(body)) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const finalSummary = await finalizeSummary(
      body.lessonId,
      body.summaryEntries,
      body.aiEvaluation,
      body.coachAnswer,
    );

    return NextResponse.json(finalSummary);
  } catch (error) {
    logOpenAiError("coach/finalize", error);
    const { status, code } = getOpenAiErrorResponse(error);
    return NextResponse.json({ error: code }, { status });
  }
}
