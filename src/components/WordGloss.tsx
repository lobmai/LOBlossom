import type { ReactNode } from "react";

/** 英単語の下に小さく日本語意味を表示 */
export function WordGloss({
  word,
  meaning,
}: {
  word: string;
  meaning: string;
}) {
  return (
    <span className="inline-flex flex-col items-start align-baseline">
      <span>{word}</span>
      <span className="text-[10px] font-normal leading-tight text-gray-400">
        {meaning}
      </span>
    </span>
  );
}

/** 主語＋日本語意味（テーブル等用） */
export function SubjectLabel({
  en,
  ja,
}: {
  en: string;
  ja: string;
}) {
  return (
    <span>
      <span className="font-medium">{en}</span>
      <span className="ml-1 text-xs text-gray-400">「{ja}」</span>
    </span>
  );
}

/** Step3 例文＋キーワードの意味補足 */
export function ExampleWithGloss({
  sentence,
  keyword,
  meaning,
  children,
}: {
  sentence: string;
  keyword?: string;
  meaning?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-sm font-medium text-gray-800">{sentence}</p>
      {keyword && meaning && (
        <p className="mt-0.5 text-[11px] text-gray-400">
          {keyword} → 「{meaning}」
        </p>
      )}
      {children}
    </div>
  );
}
