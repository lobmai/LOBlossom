"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ui } from "@/lib/ui-text";

interface StepNavigationProps {
  backHref?: string;
  backLabel?: string;
  nextHref?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  /** 指定時は Link の代わりにボタンでクリックを処理（入力チェックなど） */
  onNextClick?: () => void;
}

export function StepNavigation({
  backHref,
  backLabel = ui.nav.back,
  nextHref,
  nextLabel = ui.nav.next,
  nextDisabled = false,
  nextLoading = false,
  onNextClick,
}: StepNavigationProps) {
  const router = useRouter();

  useEffect(() => {
    if (nextHref) router.prefetch(nextHref);
    if (backHref) router.prefetch(backHref);
  }, [nextHref, backHref, router]);

  const nextButtonClass =
    "rounded-xl bg-blossom-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blossom-600 disabled:cursor-not-allowed disabled:opacity-60";

  const isNextDisabled = nextDisabled || nextLoading;

  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {backHref ? (
        <Link
          href={backHref}
          prefetch
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          {backLabel}
        </Link>
      ) : (
        <div />
      )}
      {nextHref &&
        (isNextDisabled && !onNextClick ? (
          <span className="cursor-not-allowed rounded-xl bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-400">
            {nextLabel}
          </span>
        ) : onNextClick ? (
          <button
            type="button"
            onClick={onNextClick}
            disabled={isNextDisabled}
            className={nextButtonClass}
          >
            {nextLoading ? ui.nav.processing : nextLabel}
          </button>
        ) : (
          <Link href={nextHref} prefetch className={nextButtonClass}>
            {nextLabel}
          </Link>
        ))}
    </div>
  );
}
