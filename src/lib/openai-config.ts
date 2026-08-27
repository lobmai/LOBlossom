/**
 * OpenAI API キーを安全に取得する。
 * プレースホルダーや未設定の場合は null を返す。
 */
export function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  if (key === "your-api-key-here") return null;
  if (!key.startsWith("sk-")) return null;
  return key;
}

export function isOpenAiApiKeyConfigured(): boolean {
  return getOpenAiApiKey() !== null;
}
