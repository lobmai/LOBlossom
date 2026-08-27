/** 完成まとめの箇条書き表示用ユーティリティ */

export const EXAMPLE_CATEGORIES = ["肯定文", "否定文", "応用"] as const;

/** テキストを箇条書き行に分割（・ または - で始まる行） */
export function parseBulletLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      if (line.startsWith("・")) return line.slice(1).trim();
      if (line.startsWith("-")) return line.slice(1).trim();
      if (line.startsWith("•")) return line.slice(1).trim();
      return line;
    });
}

/** 箇条書きテキストかどうか */
export function looksLikeBulletList(text: string): boolean {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return false;
  return lines.some((l) => /^[・\-•]/.test(l.trim()));
}

/** 例文＋訳形式（・英文 / → 訳） */
export function parseExampleLines(text: string): { english: string; japanese?: string }[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const result: { english: string; japanese?: string }[] = [];
  let current: { english: string; japanese?: string } | null = null;

  for (const line of lines) {
    if (EXAMPLE_CATEGORIES.includes(line as (typeof EXAMPLE_CATEGORIES)[number])) {
      continue;
    }
    if (line.startsWith("・") || line.startsWith("-")) {
      if (current) result.push(current);
      current = { english: line.replace(/^[・\-•]\s*/, "") };
    } else if ((line.startsWith("→") || line.startsWith("⇒")) && current) {
      current.japanese = line.replace(/^[→⇒]\s*/, "");
    } else if (current && !current.japanese) {
      current.japanese = line;
    }
  }
  if (current) result.push(current);

  return result;
}

export type CategorizedExample = {
  category: string;
  english: string;
  japanese?: string;
};

/** 肯定文・否定文・応用 区分付き例文 */
export function parseCategorizedExampleLines(text: string): CategorizedExample[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const result: CategorizedExample[] = [];
  let category = "例文";
  let current: { english: string; japanese?: string } | null = null;

  const flush = () => {
    if (current) {
      result.push({ category, english: current.english, japanese: current.japanese });
      current = null;
    }
  };

  for (const line of lines) {
    if (EXAMPLE_CATEGORIES.includes(line as (typeof EXAMPLE_CATEGORIES)[number])) {
      flush();
      category = line;
      continue;
    }
    if (line.startsWith("・") || line.startsWith("-")) {
      flush();
      current = { english: line.replace(/^[・\-•]\s*/, "") };
    } else if ((line.startsWith("→") || line.startsWith("⇒")) && current) {
      current.japanese = line.replace(/^[→⇒]\s*/, "");
    }
  }
  flush();

  return result.length > 0 ? result : parseExampleLines(text).map((ex) => ({
    category: "例文",
    english: ex.english,
    japanese: ex.japanese,
  }));
}

export function isExampleSection(sectionId: string): boolean {
  return sectionId === "final-examples";
}

export function hasCategorizedExamples(text: string): boolean {
  return EXAMPLE_CATEGORIES.some((cat) => text.includes(cat));
}
