import { NextResponse } from "next/server";
import {
  evaluateTeachAnswer,
  type TeachEvaluateRequest,
} from "@/lib/coach-teach-evaluate";
import { isOpenAiApiKeyConfigured } from "@/lib/openai-config";
import { getOpenAiErrorResponse, logOpenAiError } from "@/lib/openai-errors";

function isValidHistory(
  history: unknown,
): history is { role: "coach" | "user"; text: string }[] {
  if (!Array.isArray(history)) return false;
  return history.every(
    (h) =>
      h &&
      typeof h === "object" &&
      (h.role === "coach" || h.role === "user") &&
      typeof h.text === "string",
  );
}

function isValidBody(body: unknown): body is TeachEvaluateRequest {
  if (!body || typeof body !== "object") return false;
  const b = body as TeachEvaluateRequest;
  return (
    typeof b.lessonId === "string" &&
    typeof b.initialQuestion === "string" &&
    typeof b.userAnswer === "string" &&
    typeof b.followUpCount === "number" &&
    b.followUpCount >= 0 &&
    b.followUpCount <= 1 &&
    typeof b.isFollowUpAnswer === "boolean" &&
    isValidHistory(b.conversationHistory)
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

    const startedAt = Date.now();
    const result = await evaluateTeachAnswer(body);
    console.info(`[coach/teach-evaluate] openai ${Date.now() - startedAt}ms`);
    return NextResponse.json(result);
  } catch (error) {
    logOpenAiError("coach/teach-evaluate", error);
    const { status, code } = getOpenAiErrorResponse(error);
    return NextResponse.json({ error: code }, { status });
  }
}
