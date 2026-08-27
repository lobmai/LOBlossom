"use client";

import {
  hasCategorizedExamples,
  isExampleSection,
  looksLikeBulletList,
  parseBulletLines,
  parseCategorizedExampleLines,
  parseExampleLines,
} from "@/lib/bullet-summary";

export function BulletSummaryContent({
  sectionId,
  text,
}: {
  sectionId: string;
  text: string;
}) {
  if (!text.trim()) return null;

  if (isExampleSection(sectionId)) {
    if (hasCategorizedExamples(text)) {
      const examples = parseCategorizedExampleLines(text);
      return (
        <ul className="space-y-4">
          {examples.map((ex, index) => {
            const showCategory =
              index === 0 || examples[index - 1]?.category !== ex.category;
            return (
              <li key={`${ex.category}-${ex.english}`} className="leading-relaxed">
                {showCategory && (
                  <p className="mb-1 text-xs font-medium text-blossom-600">{ex.category}</p>
                )}
                <p className="font-mono text-sm text-gray-800">・{ex.english}</p>
                {ex.japanese && (
                  <p className="mt-0.5 pl-3 text-sm text-gray-600">→ {ex.japanese}</p>
                )}
              </li>
            );
          })}
        </ul>
      );
    }

    const examples = parseExampleLines(text);
    if (examples.length > 0) {
      return (
        <ul className="space-y-3">
          {examples.map((ex) => (
            <li key={ex.english} className="leading-relaxed">
              <p className="font-mono text-sm text-gray-800">・{ex.english}</p>
              {ex.japanese && (
                <p className="mt-0.5 pl-3 text-sm text-gray-600">→ {ex.japanese}</p>
              )}
            </li>
          ))}
        </ul>
      );
    }
  }

  if (looksLikeBulletList(text)) {
    const items = parseBulletLines(text);
    return (
      <ul className="list-none space-y-1.5 pl-0">
        {items.map((item) => (
          <li key={item} className="flex gap-1.5 leading-relaxed">
            <span className="shrink-0 text-blossom-400">・</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;
}
