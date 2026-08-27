const NAV_ORDER_KEY = "loblossom:my-words-nav-order";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** 一覧の表示順（フィルター後）を詳細の前後移動用に保存 */
export function saveMyWordsNavOrder(wordIds: string[]): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(NAV_ORDER_KEY, JSON.stringify(wordIds));
  } catch {
    // sessionStorage 不可でも詳細は全件順で動く
  }
}

export function loadMyWordsNavOrder(): string[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(NAV_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const ids = parsed.filter((id): id is string => typeof id === "string");
    return ids.length > 0 ? ids : null;
  } catch {
    return null;
  }
}

/** フィルター順があればそれを使い、無ければ全件順 */
export function resolveWordNavOrder(
  currentId: string,
  allWordIds: string[],
  savedOrder: string[] | null = loadMyWordsNavOrder(),
): string[] {
  if (savedOrder && savedOrder.includes(currentId)) {
    return savedOrder;
  }
  return allWordIds;
}

export function getWordNavState(
  currentId: string,
  orderedIds: string[],
): {
  prevId: string | null;
  nextId: string | null;
  isFirst: boolean;
  isLast: boolean;
} {
  const index = orderedIds.indexOf(currentId);
  if (index < 0) {
    return { prevId: null, nextId: null, isFirst: true, isLast: true };
  }
  return {
    prevId: index > 0 ? orderedIds[index - 1] : null,
    nextId: index < orderedIds.length - 1 ? orderedIds[index + 1] : null,
    isFirst: index === 0,
    isLast: index === orderedIds.length - 1,
  };
}
