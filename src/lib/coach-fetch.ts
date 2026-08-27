import {
  fetchWithTimeoutAndRetry,
  logDevTiming,
} from "@/lib/fetch-with-timeout";

const inflight = new Map<string, Promise<{ status: number; data: unknown }>>();

/**
 * コーチ API を1本化する。
 * 同一 inFlightKey の並行呼び出しは同じ Promise を共有し、二重送信しない。
 * 一時障害時の自動リトライは fetchWithTimeoutAndRetry 内で最大1回。
 */
export async function postCoachApi(
  url: string,
  body: unknown,
  inFlightKey: string,
  timingLabel: string,
): Promise<{ status: number; data: unknown }> {
  const existing = inflight.get(inFlightKey);
  if (existing) {
    return existing;
  }

  const startedAt = performance.now();
  const request = (async () => {
    try {
      const response = await fetchWithTimeoutAndRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      logDevTiming(timingLabel, startedAt);
      let data: unknown = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      return { status: response.status, data };
    } catch (error) {
      logDevTiming(`${timingLabel} (failed)`, startedAt);
      throw error;
    } finally {
      inflight.delete(inFlightKey);
    }
  })();

  inflight.set(inFlightKey, request);
  return request;
}
