import type { CoachSession } from "@/types/record";
import { isMeaningfulText } from "@/lib/answer-quality";
import { isStruggleAnswer } from "@/lib/coach-teach-hints";

/** Step5 会話から「わからない」等を除いた、意味のあるユーザー回答 */
export function getMeaningfulUserAnswers(session: CoachSession): string[] {
  return session.exchanges
    .filter((e) => e.role === "user" && e.kind === "answer")
    .map((e) => e.text.trim())
    .filter((t) => t && !isStruggleAnswer(t) && isMeaningfulText(t));
}

type AmIsAreMapping = {
  iAm: boolean;
  isThird: boolean;
  arePlural: boolean;
};

function extractAmIsAreMapping(text: string): AmIsAreMapping {
  const n = text.toLowerCase();
  return {
    iAm:
      /\bam\b.{0,20}\b(i|私)\b|\b(i|私)\b.{0,20}\bam\b|am\s*[-–—:：]\s*i/i.test(
        n,
      ),
    isThird:
      /\bis\b.{0,20}(he|she|it|単数|三人称)|\b(he|she|it)\b.{0,20}\bis\b|is\s*[-–—:：]/i.test(
        n,
      ),
    arePlural:
      /\bare\b.{0,20}(you|we|they|複数)|\b(you|we|they)\b.{0,20}\bare\b|are\s*[-–—:：]/i.test(
        n,
      ),
  };
}

function normalizeUserClause(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (!t) return "";
  return t.endsWith("。") ? t : `${t}。`;
}

function dedupeJoinClauses(clauses: string[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of clauses) {
    const key = c.replace(/[。\s]/g, "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out.join("");
}

function synthesizeL1CoachPoints(answers: string[]): string {
  const combined = answers.join("\n");
  const mapping = extractAmIsAreMapping(combined);
  const mentionsBe =
    /be動詞|ビー動詞|\bam\b|\bis\b|\bare\b/i.test(combined) ||
    mapping.iAm ||
    mapping.isThird ||
    mapping.arePlural;

  const clauses: string[] = [];

  if (mentionsBe && (mapping.iAm || mapping.isThird || mapping.arePlural)) {
    clauses.push("be動詞にはam・is・areがあり、主語によって使い分ける。");
    const parts: string[] = [];
    if (mapping.iAm) parts.push("Iにはam");
    if (mapping.isThird) parts.push("he・she・itにはis");
    if (mapping.arePlural) parts.push("you・we・theyにはare");
    if (parts.length > 0) {
      clauses.push(`${parts.join("、")}を使う。`);
    }
  }

  for (const answer of answers) {
    const a = answer.trim();
    if (/否定|not\b|ない/.test(a) && !clauses.some((c) => c.includes("否定"))) {
      clauses.push(normalizeUserClause(a));
    }
    if (/疑問|質問文/.test(a) && !clauses.some((c) => c.includes("疑問"))) {
      clauses.push(normalizeUserClause(a));
    }
  }

  if (clauses.length > 0) {
    return dedupeJoinClauses(clauses);
  }

  if (mentionsBe) {
    return dedupeJoinClauses(
      answers.map((a) => normalizeUserClause(a)).filter(Boolean),
    );
  }

  return dedupeJoinClauses(
    answers.map((a) => normalizeUserClause(a)).filter(Boolean),
  );
}

function summaryFromTeachExchange(teachText: string): string {
  return teachText
    .replace(/^こう覚えておこう！\s*/u, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => normalizeUserClause(line))
    .join("");
}

/** 完成まとめ「私が大事だと思ったこと」用：会話から自然な1段落を組み立てる */
export function synthesizeCoachPointsFromSession(
  session: CoachSession,
  lessonId: string,
): string {
  const answers = getMeaningfulUserAnswers(session);
  if (answers.length > 0) {
    if (lessonId === "lesson-01-be-verb") {
      return synthesizeL1CoachPoints(answers);
    }
    return dedupeJoinClauses(
      answers.map((a) => normalizeUserClause(a)).filter(Boolean),
    );
  }

  if (session.status === "taught") {
    const teachText = session.exchanges.find(
      (e) => e.role === "coach" && e.kind === "teach",
    )?.text;
    if (teachText) {
      return summaryFromTeachExchange(teachText);
    }
  }

  return "";
}

/** 生ログ結合（後方互換） */
export function buildCoachAnswerFromSession(session: CoachSession): string {
  return getMeaningfulUserAnswers(session).join("\n\n");
}
