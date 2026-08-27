/** 英単語から wordId を生成する（小文字・前後空白除去） */
export function normalizeWordId(english: string): string {
  return english.trim().toLowerCase();
}
