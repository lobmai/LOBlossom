import { NextResponse } from "next/server";
import { evaluateSummary } from "@/lib/coach-evaluate";
import { isOpenAiApiKeyConfigured } from "@/lib/openai-config";
import { getOpenAiErrorResponse, logOpenAiError } from "@/lib/openai-errors";
import type { LabeledAnswer } from "@/types/record";

interface EvaluateRequestBody {
  lessonId: string;
  lessonTitle: string;
  summaryEntries: LabeledAnswer[];
}

function isValidBody(body: unknown): body is EvaluateRequestBody {
  if (!body || typeof body !== "object") return false;
  const { lessonId, lessonTitle, summaryEntries } = body as EvaluateRequestBody;
  return (
    typeof lessonId === "string" &&
    typeof lessonTitle === "string" &&
    Array.isArray(summaryEntries) &&
    summaryEntries.every(
      (a) =>
        a &&
        typeof a.id === "string" &&
        typeof a.label === "string" &&
        typeof a.answer === "string",
    )
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
    const evaluation = await evaluateSummary(
      body.lessonId,
      body.lessonTitle,
      body.summaryEntries,
    );
    console.info(`[coach/evaluate] openai ${Date.now() - startedAt}ms`);

    return NextResponse.json({
      ...evaluation,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logOpenAiError("coach/evaluate", error);
    const { status, code } = getOpenAiErrorResponse(error);
    return NextResponse.json({ error: code }, { status });
  }
}
