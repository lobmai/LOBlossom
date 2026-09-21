import { isMeaningfulText, isValidUserExample } from "@/lib/answer-quality";
import { toStoredMyPointsFinal } from "@/lib/polish-my-points";

export type FinalizePreviewEditKind = "points" | "example" | "japanese";

/** 空・空白は拒否して、編集前の最終値を残す */
export function resolveEditedPreviewValue(
  kind: FinalizePreviewEditKind,
  raw: string,
): string | null {
  if (kind === "points") return toStoredMyPointsFinal(raw);
  if (kind === "example") {
    const t = raw.trim();
    return t && isValidUserExample(t) ? t : null;
  }
  const t = raw.trim();
  return t && isMeaningfulText(t) ? t : null;
}

export function canEditFinalizePreview(lessonId: string): boolean {
  return lessonId !== "lesson-01-be-verb";
}
