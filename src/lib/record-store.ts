import type {
  AiEvaluation,
  CheckQuizState,
  CoachQuestion,
  CoachSession,
  LabeledAnswer,
  LessonRecord,
  SaveResult,
} from "@/types/record";

const STORAGE_KEY_RECORDS = "loblossom:records";
const STORAGE_KEY_DRAFT_PREFIX = "loblossom:draft:";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function draftKey(lessonId: string): string {
  return `${STORAGE_KEY_DRAFT_PREFIX}${lessonId}`;
}

function createRecordId(): string {
  if (isBrowser() && typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `record-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function safeParseRecords(raw: string | null): LessonRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as LessonRecord[]) : [];
  } catch {
    return [];
  }
}

function safeParseRecord(raw: string | null): LessonRecord | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LessonRecord;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): SaveResult {
  if (!isBrowser()) {
    return { ok: false, error: "browser unavailable" };
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return { ok: false, error: "localStorage write failed" };
  }
}

/** 新しい学習記録（下書き）を作成する */
export function createDraft(lessonId: string, lessonTitle: string): LessonRecord {
  return {
    recordId: createRecordId(),
    lessonId,
    lessonTitle,
    startedAt: new Date().toISOString(),
    completedAt: null,
    isCompleted: false,
    teachAnswers: [],
    trajectoryEntries: [],
    coachAnswer: null,
    coachQuestion: null,
    coachSession: null,
    finalSummary: null,
    userExampleJapanese: null,
    feeling: null,
    feelingLabel: null,
    aiEvaluation: null,
  };
}

/** 進行中の下書きを読み込む（なければ null） */
export function loadDraft(lessonId: string): LessonRecord | null {
  if (!isBrowser()) return null;
  try {
    return safeParseRecord(localStorage.getItem(draftKey(lessonId)));
  } catch {
    return null;
  }
}

/** 下書きを保存する（入力の自動保存用） */
export function saveDraft(record: LessonRecord): SaveResult {
  return writeJson(draftKey(record.lessonId), record);
}

/** 下書きを削除する */
export function clearDraft(lessonId: string): SaveResult {
  if (!isBrowser()) {
    return { ok: false, error: "browser unavailable" };
  }
  try {
    localStorage.removeItem(draftKey(lessonId));
    return { ok: true };
  } catch {
    return { ok: false, error: "localStorage remove failed" };
  }
}

/** 完了した記録を My Loop 用リストに保存し、下書きを消す（同一 lessonId は上書き） */
export function finalizeRecord(record: LessonRecord): SaveResult {
  if (!isBrowser()) {
    return { ok: false, error: "browser unavailable" };
  }

  try {
    const records = safeParseRecords(localStorage.getItem(STORAGE_KEY_RECORDS));
    const completed: LessonRecord = {
      ...record,
      isCompleted: true,
      completedAt: record.completedAt ?? new Date().toISOString(),
    };

    const existing = records.find(
      (r) => r.isCompleted && r.lessonId === completed.lessonId,
    );

    const recordToSave: LessonRecord = existing
      ? { ...completed, recordId: existing.recordId }
      : completed;

    const withoutLesson = records.filter(
      (r) => !(r.isCompleted && r.lessonId === completed.lessonId),
    );
    const saveResult = writeJson(STORAGE_KEY_RECORDS, [recordToSave, ...withoutLesson]);
    if (!saveResult.ok) return saveResult;

    return clearDraft(record.lessonId);
  } catch {
    return { ok: false, error: "finalize failed" };
  }
}

/** My Loop：lessonId で完了済み記録を取得 */
export function loadRecordByLessonId(lessonId: string): LessonRecord | null {
  return loadAllRecords().find((r) => r.lessonId === lessonId) ?? null;
}

/** My Loop：完了済みの記録一覧（新しい順） */
export function loadAllRecords(): LessonRecord[] {
  if (!isBrowser()) return [];
  try {
    const records = safeParseRecords(localStorage.getItem(STORAGE_KEY_RECORDS));
    return records
      .filter((r) => r.isCompleted)
      .sort((a, b) => {
        const aTime = a.completedAt ?? a.startedAt;
        const bTime = b.completedAt ?? b.startedAt;
        return bTime.localeCompare(aTime);
      });
  } catch {
    return [];
  }
}

/** My Loop：1件の記録を ID で取得 */
export function loadRecordById(recordId: string): LessonRecord | null {
  const record = loadAllRecords().find((r) => r.recordId === recordId);
  return record ?? null;
}

/**
 * 下書きに AI 評価結果を保存する（Step 4 で使用）。
 */
export function saveDraftAiEvaluation(
  lessonId: string,
  aiEvaluation: AiEvaluation,
): SaveResult {
  const draft = loadDraft(lessonId);
  if (!draft) {
    return { ok: false, error: "draft not found" };
  }
  return saveDraft({ ...draft, aiEvaluation });
}

/** 下書きに AI コーチの質問を保存する（Step 5 で使用）。 */
export function saveDraftCoachQuestion(
  lessonId: string,
  coachQuestion: CoachQuestion,
): SaveResult {
  const draft = loadDraft(lessonId);
  if (!draft) {
    return { ok: false, error: "draft not found" };
  }
  return saveDraft({ ...draft, coachQuestion });
}

/** 下書きに Step5 会話セッションを保存する */
export function saveDraftCoachSession(
  lessonId: string,
  coachSession: CoachSession,
  coachAnswer?: string,
): SaveResult {
  const draft = loadDraft(lessonId);
  if (!draft) {
    return { ok: false, error: "draft not found" };
  }
  return saveDraft({
    ...draft,
    coachSession,
    ...(coachAnswer !== undefined ? { coachAnswer } : {}),
  });
}

/** 下書きに AI コーチへの回答を保存する（Step 5 で使用）。 */
export function saveDraftCoachAnswer(lessonId: string, coachAnswer: string): SaveResult {
  const draft = loadDraft(lessonId);
  if (!draft) {
    return { ok: false, error: "draft not found" };
  }
  return saveDraft({ ...draft, coachAnswer });
}

/** 下書きに最終まとめを保存する（Step 6 で使用）。 */
export function saveDraftFinalSummary(
  lessonId: string,
  finalSummary: LabeledAnswer[],
): SaveResult {
  return saveDraftFinalizeResult(lessonId, finalSummary);
}

/** 下書きに最終まとめと自作例文の訳を保存する（Step 6 で使用）。 */
export function saveDraftFinalizeResult(
  lessonId: string,
  finalSummary: LabeledAnswer[],
  userExampleJapanese?: string | null,
): SaveResult {
  const draft = loadDraft(lessonId);
  if (!draft) {
    return { ok: false, error: "draft not found" };
  }
  return saveDraft({
    ...draft,
    finalSummary,
    ...(userExampleJapanese !== undefined ? { userExampleJapanese } : {}),
  });
}

/** 下書きに理解度テストの状態を保存する（Step 2） */
export function saveDraftCheckQuizState(
  lessonId: string,
  checkQuizState: CheckQuizState,
): SaveResult {
  const draft = loadDraft(lessonId);
  if (!draft) {
    return { ok: false, error: "draft not found" };
  }
  return saveDraft({ ...draft, checkQuizState });
}

/** Step3 変更時に AI 評価以降の下書きをリセット */
export function resetDraftAfterSummarize(
  lessonId: string,
  trajectoryEntries: LabeledAnswer[],
): SaveResult {
  const draft = loadDraft(lessonId);
  if (!draft) {
    return { ok: false, error: "draft not found" };
  }
  return saveDraft({
    ...draft,
    trajectoryEntries,
    aiEvaluation: null,
    coachQuestion: null,
    coachAnswer: null,
    coachSession: null,
    finalSummary: null,
    userExampleJapanese: null,
  });
}

/**
 * 完了済み記録に AI 評価結果を追加保存する。
 */
export function updateRecordAiEvaluation(
  recordId: string,
  aiEvaluation: AiEvaluation,
): SaveResult {
  if (!isBrowser()) {
    return { ok: false, error: "browser unavailable" };
  }

  try {
    const records = safeParseRecords(localStorage.getItem(STORAGE_KEY_RECORDS));
    const index = records.findIndex((r) => r.recordId === recordId);
    if (index === -1) {
      return { ok: false, error: "record not found" };
    }

    records[index] = { ...records[index], aiEvaluation };
    return writeJson(STORAGE_KEY_RECORDS, records);
  } catch {
    return { ok: false, error: "update ai evaluation failed" };
  }
}

/** Record<string, string> → LabeledAnswer[]（ラベルを保存時にスナップショット） */
export function toLabeledAnswers(
  values: Record<string, string>,
  definitions: { id: string; label: string }[],
): LabeledAnswer[] {
  return definitions.map((def) => ({
    id: def.id,
    label: def.label,
    answer: (values[def.id] ?? "").trim(),
  }));
}

/** LabeledAnswer[] → Record<string, string>（フォーム復元用） */
export function fromLabeledAnswers(entries: LabeledAnswer[]): Record<string, string> {
  return Object.fromEntries(entries.map((e) => [e.id, e.answer]));
}
