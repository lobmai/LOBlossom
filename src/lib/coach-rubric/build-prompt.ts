import type { CoachRubric } from "@/lib/coach-rubric/types";
import { COACH_EVAL_EMPTY_FIELD_RULES } from "@/lib/coach-rubric/types";

/** rubric を AI プロンプト用テキストに変換（Lesson 本文は含めない） */
export function buildRubricPromptSection(rubric: CoachRubric): string {
  const lines: string[] = [`【評価基準：${rubric.title}】`, ""];

  for (const point of rubric.points) {
    lines.push(`■ ${point.label}（id: ${point.id}）`);
    lines.push("理解してほしい点：");
    for (const item of point.mustUnderstand) {
      lines.push(`  - ${item}`);
    }
    lines.push("よくある誤解：");
    for (const item of point.commonMisconceptions) {
      lines.push(`  - ${item}`);
    }
    if (point.okIfIncludes?.length) {
      lines.push(`OKの目安：${point.okIfIncludes.join("、")}`);
    }
    if (point.relatedFieldIds?.length) {
      lines.push(`対応するまとめ欄 id：${point.relatedFieldIds.join("、")}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/** 構造化評価の出力ルールをプロンプト用テキストに */
export function buildStructuredEvalRulesSection(): string {
  return ["【構造化評価のルール】", ...COACH_EVAL_EMPTY_FIELD_RULES].join("\n");
}
