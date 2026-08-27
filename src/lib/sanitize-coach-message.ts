/** AIコーチのメッセージから内部ID・フィールド名を除去 */
export function sanitizeCoachMessage(text: string): string {
  return text
    .replace(/\bid\s*=\s*[\w-]+/gi, "")
    .replace(/id\s*=\s*[\w-]+について/gi, "")
    .replace(/\b(meaning|usage|points|unclear)(-\w+)?\b/gi, "")
    .replace(/について\s*[:：]/g, "：")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
