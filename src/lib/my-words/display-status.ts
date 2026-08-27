import type { MyWordUserEntry, WordStatus } from "@/types/my-words";

export type UserStatusOverride = "practicing" | "weak";

/** 一覧・詳細・フィルター用の表示状態（override 優先） */
export function getDisplayedWordStatus(entry: MyWordUserEntry): WordStatus {
  if (entry.userStatusOverride === "practicing" || entry.userStatusOverride === "weak") {
    return entry.userStatusOverride;
  }
  return entry.status;
}

export function hasUserStatusOverride(entry: MyWordUserEntry): boolean {
  return (
    entry.userStatusOverride === "practicing" ||
    entry.userStatusOverride === "weak"
  );
}
