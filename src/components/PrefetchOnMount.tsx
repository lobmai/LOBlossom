"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 画面表示時に遷移先を事前取得する。データや表示内容は変えない。 */
export function PrefetchOnMount({
  hrefs,
}: {
  hrefs: (string | null | undefined)[];
}) {
  const router = useRouter();
  const key = hrefs.filter(Boolean).join("\0");

  useEffect(() => {
    if (!key) return;
    for (const href of key.split("\0")) {
      router.prefetch(href);
    }
  }, [key, router]);

  return null;
}
