/** My Words データ層の公開 API */
export {
  loadMyWords,
  saveMyWords,
  getMyWordById,
  getMyWordsStorageKey,
  clearMyWords,
  isMyWordsEmpty,
} from "@/lib/my-words/store";

export {
  createInitialUserEntry,
  mergeLessonWordsIntoEntries,
  applyReviewResult,
} from "@/lib/my-words/merge";

export { mergeAndSaveLessonWords } from "@/lib/my-words/lesson-sync";

export {
  REVIEW_INTERVALS_DAYS,
  MAX_MASTERY_LEVEL,
  getInitialNextReviewAt,
  getReviewIntervalDays,
  calculateNextReview,
  isReviewDue,
} from "@/lib/my-words/review-schedule";

export { computeWordStatus, updateWordStatus } from "@/lib/my-words/status";

export { countWordsByStatus, countTotalWords } from "@/lib/my-words/stats";

export {
  getWordStatusLabel,
  getWordStatusBadgeClass,
  formatLessonNumbers,
  formatNextReviewAt,
  isWordReviewDue,
  formatFirstLearnedAt,
} from "@/lib/my-words/display";

export {
  getDisplayedWordStatus,
  hasUserStatusOverride,
} from "@/lib/my-words/display-status";
export { setUserStatusOverride } from "@/lib/my-words/status-override";
export {
  saveMyWordsNavOrder,
  loadMyWordsNavOrder,
  resolveWordNavOrder,
  getWordNavState,
} from "@/lib/my-words/nav-order";

export { applyReviewResultToStore, resolveWordMaster } from "@/lib/my-words/review-sync";

export {
  getWordMasterForLesson,
  getAllWordMasters,
  findWordMasterById,
} from "@/data/my-words/index";

export type {
  WordStatus,
  ReviewResult,
  WordMasterEntry,
  UserWordExample,
  MyWordUserEntry,
  MyWordsSaveResult,
  ReviewUpdateResult,
  WordStatusCounts,
} from "@/types/my-words";
