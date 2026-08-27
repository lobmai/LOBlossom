const DEFAULT_TIMEOUT_MS = 45_000;

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function logDevTiming(label: string, startedAt: number): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[LOBlossom] ${label}: ${Math.round(performance.now() - startedAt)}ms`);
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * 一時的な通信・サーバー障害だけ自動リトライ対象。
 * 400 / 401 / 403 / 503（APIキー未設定）やタイムアウト打ち切りは対象外。
 */
export function shouldRetryCoachRequest(
  status: number | null,
  error: unknown,
): boolean {
  if (error && isAbortError(error)) return false;
  if (status === 400 || status === 401 || status === 403 || status === 503) {
    return false;
  }
  if (status === 429 || status === 500 || status === 502 || status === 504) {
    return true;
  }
  if (status === null && error) return true;
  return false;
}

/** 一時障害時のみ、同じリクエストを最大1回だけやり直す */
export async function fetchWithTimeoutAndRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  try {
    const response = await fetchWithTimeout(input, init, timeoutMs);
    if (!shouldRetryCoachRequest(response.status, null)) {
      return response;
    }
    if (process.env.NODE_ENV === "development") {
      const url = typeof input === "string" ? input : input.toString();
      console.info(`[LOBlossom] retrying ${url} after HTTP ${response.status}`);
    }
    return await fetchWithTimeout(input, init, timeoutMs);
  } catch (error) {
    if (!shouldRetryCoachRequest(null, error)) {
      throw error;
    }
    if (process.env.NODE_ENV === "development") {
      const url = typeof input === "string" ? input : input.toString();
      console.info(`[LOBlossom] retrying ${url} after network error`);
    }
    return await fetchWithTimeout(input, init, timeoutMs);
  }
}
