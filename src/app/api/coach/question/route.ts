import { NextResponse } from "next/server";
import { generateCoachQuestion } from "@/lib/coach-question";
import { isOpenAiApiKeyConfigured } from "@/lib/openai-config";
import { getOpenAiErrorResponse, logOpenAiError } from "@/lib/openai-errors";
import type { AiEvaluation, LabeledAnswer } from "@/types/record";

interface QuestionRequestBody {
  lessonId: string;
  lessonTitle: string;
  summaryEntries: LabeledAnswer[];
  aiEvaluation: AiEvaluation;
}

function isValidAiEvaluation(ai: unknown): ai is AiEvaluation {
  if (!ai || typeof ai !== "object") return false;
  const e = ai as AiEvaluation;
  return (
    typeof e.overallMessage === "string" &&
    Array.isArray(e.corrections) &&
    Array.isArray(e.polishedEntries)
  );
}

function isValidBody(body: unknown): body is QuestionRequestBody {
  if (!body || typeof body !== "object") return false;
  const { lessonId, lessonTitle, summaryEntries, aiEvaluation } = body as QuestionRequestBody;
  return (
    typeof lessonId === "string" &&
    typeof lessonTitle === "string" &&
    Array.isArray(summaryEntries) &&
    isValidAiEvaluation(aiEvaluation)
  );
}

export async function POST(request: Request) {
  try {
    if (!isOpenAiApiKeyConfigured()) {
      return NextResponse.json(
        { error: "api_key_not_configured" },
        { status: 503 },
      );
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

    const result = await generateCoachQuestion(
      body.lessonId,
      body.lessonTitle,
      body.summaryEntries,
      body.aiEvaluation,
    );

    return NextResponse.json({
      ...result,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logOpenAiError("coach/question", error);
    const { status, code } = getOpenAiErrorResponse(error);
    return NextResponse.json({ error: code }, { status });
  }
}
