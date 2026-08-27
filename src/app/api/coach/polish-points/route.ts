import { NextResponse } from "next/server";
import { polishMyPointsFromAnswers } from "@/lib/polish-my-points";
import { isOpenAiApiKeyConfigured } from "@/lib/openai-config";
import { getOpenAiErrorResponse, logOpenAiError } from "@/lib/openai-errors";

interface PolishPointsBody {
  userAnswers: string[];
}

function isValidBody(body: unknown): body is PolishPointsBody {
  if (!body || typeof body !== "object") return false;
  const { userAnswers } = body as PolishPointsBody;
  return (
    Array.isArray(userAnswers) &&
    userAnswers.every((a) => typeof a === "string") &&
    userAnswers.some((a) => a.trim().length > 0)
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

    const polishedText = await polishMyPointsFromAnswers(body.userAnswers);
    if (!polishedText) {
      return NextResponse.json({ error: "polish_failed" }, { status: 500 });
    }

    return NextResponse.json({ polishedText });
  } catch (error) {
    logOpenAiError("coach/polish-points", error);
    const { status, code } = getOpenAiErrorResponse(error);
    return NextResponse.json({ error: code }, { status });
  }
}
