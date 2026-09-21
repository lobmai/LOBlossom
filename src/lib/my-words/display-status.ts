import type { MyWordUserEntry, WordStatus } from "@/types/my-words";

export type UserStatusOverride = "learned" | "practicing" | "weak";

function isStatusOverride(
  value: MyWordUserEntry["userStatusOverride"],
): value is UserStatusOverride {
  return value === "learned" || value === "practicing" || value === "weak";
}

/** 一覧・詳細・フィルター用の表示状態（override 優先） */
export function getDisplayedWordStatus(entry: MyWordUserEntry): WordStatus {
  if (isStatusOverride(entry.userStatusOverride)) {
    return entry.userStatusOverride;
  }
  return entry.status;
}

export function hasUserStatusOverride(entry: MyWordUserEntry): boolean {
  return isStatusOverride(entry.userStatusOverride);
}
