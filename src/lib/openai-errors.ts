import OpenAI from "openai";

/** OpenAI API エラーを安全にログ出力（APIキーは含めない） */
export function logOpenAiError(context: string, error: unknown): void {
  if (error instanceof OpenAI.APIError) {
    console.error(
      `[${context}] OpenAI API error: status=${error.status} code=${error.code ?? "unknown"}`,
    );
    return;
  }
  const message = error instanceof Error ? error.message : "";
  console.error(
    `[${context}] Unexpected error${message ? `: ${message}` : ""}`,
  );
}

/** クライアント向けの安全なエラーコード */
export function getOpenAiErrorResponse(error: unknown): {
  status: number;
  code: string;
} {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401) {
      return { status: 401, code: "invalid_api_key" };
    }
    if (error.status === 429) {
      return { status: 429, code: "quota_or_rate_limit" };
    }
    if (error.status === 403) {
      return { status: 403, code: "access_denied" };
    }
  }
  return { status: 500, code: "evaluation_failed" };
}
