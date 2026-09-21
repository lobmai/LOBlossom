import { NextResponse } from "next/server";
import { translateUserExampleEnglish } from "@/lib/translate-user-example";
import { isOpenAiApiKeyConfigured } from "@/lib/openai-config";
import { logOpenAiError } from "@/lib/openai-errors";

interface TranslateExampleBody {
  english: string;
}

function isValidBody(body: unknown): body is TranslateExampleBody {
  if (!body || typeof body !== "object") return false;
  const { english } = body as TranslateExampleBody;
  return typeof english === "string" && english.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    if (!isOpenAiApiKeyConfigured()) {
      return NextResponse.json({ translation: null });
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

    const translation = await translateUserExampleEnglish(body.english);
    return NextResponse.json({ translation });
  } catch (error) {
    logOpenAiError("coach/translate-example", error);
    return NextResponse.json({ translation: null });
  }
}
