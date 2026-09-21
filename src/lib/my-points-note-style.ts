/**
 * myPointsFinal 専用。AIが学習者へ説明する口調とは別物。
 * 復習ノートとして読める文体。特定レッスンの固定文ではない。
 */
export const MY_POINTS_NOTE_STYLE_POLICY = `【わたしが大事だと思ったこと — 復習ノートの文体】
この欄は、AIがユーザーへ話しかける場所ではない。あとから見返す復習ノートである。

やさしい日本語を使う。ただし説明口調・先生口調・会話調にはしない。
小学5年生向けの「〜だよ」で教え直す文にしてはいけない。

守ること：
- 復習ノートとして読める
- 会話調にしない。ユーザーへ話しかけない
- 「〜だね」「〜だよ」「〜だと思うよ」「〜しよう」「〜してみよう」「〜なんだ」「〜になるよ」は使わない
- 「覚えておこう」「大事だね」「いいね」「分かりやすいね」も使わない
- 意味は足さない。本人が言っていない知識・ルール・例を追加しない
- 短く自然な文にする
- 箇条書きでも読める文体
- 小学生でも分かる語彙を使う。ただし説明口調にしない

説明AI（使わない）：
「本当はそうじゃないけど、もしそうだったらと考えるときに使うよ。」
復習ノート（こう書く）：
「本当はそうではないことを、『もし〜だったら』と考えるときに使う。」`;

export function buildMyPointsNoteStylePolicy(): string {
  return MY_POINTS_NOTE_STYLE_POLICY;
}

/**
 * 会話調の文末だけを復習ノート調へ最小整形する。
 * 意味の書き換えや新しいAI呼び出しはしない。
 */
export function toReviewNoteStyle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  const converted = trimmed
    .replace(/だと思うよ(?=[。！]|$)/g, "だと思う")
    .replace(/んだよ(?=[。！]|$)/g, "んだ")
    .replace(/になるよ(?=[。！]|$)/g, "になる")
    .replace(/だよ(?=[。！]|$)/g, "だ")
    .replace(/だね(?=[。！]|$)/g, "だ")
    .replace(/なんだ(?=[。！]|$)/g, "だ");

  return converted.replace(/\s{2,}/g, " ").trim();
}
