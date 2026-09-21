import { EnLine } from "@/components/EnLine";
import { WordGloss } from "@/components/WordGloss";

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold underline decoration-red-400 decoration-2 underline-offset-4">
      {children}
    </span>
  );
}

export function Lesson03Content() {
  return (
    <article className="max-w-none rounded-2xl border border-blossom-100 bg-white/80 p-6 shadow-sm sm:p-8">
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">🌱 きょうのテーマ</h2>
        <p className="mt-4 leading-relaxed text-gray-700">
          きょうは <Highlight>現在完了（げんざいかんりょう）</Highlight> について学ぶよ。
          <br />
          最初から公式を暗記するより、まず
          <Highlight>「過去のこと」と「今」がどうつながるか</Highlight>
          を感じ取ろう。
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
            <p className="text-xs font-bold text-blossom-600">【過去形】</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <EnLine
                en={<>I lost my key.</>}
                ja="私は鍵をなくした。"
                audioRef="lesson3.body.01"
              />
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              → 過去に起きた出来事を話している
            </p>
          </div>
          <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
            <p className="text-xs font-bold text-blossom-600">【現在完了】</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <EnLine
                en={<>I have lost my key.</>}
                ja="鍵をなくしてしまっている（今もその結果が残っている）"
                audioRef="lesson3.body.02"
              />
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              → なくした結果が、今にもつながっている
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-gray-700">
          つまり現在完了は、
          <Highlight>過去のこと ＋ 今とのつながり</Highlight>
          をいっしょに表す表現だよ。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">1. 基本の形</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          意味のイメージがつかめたら、形を見てみよう。
          <br />
          現在完了の基本形は <Highlight>have / has + 過去分詞</Highlight> だよ。
        </p>
        <ul className="mt-5 space-y-4 text-sm text-gray-700">
          <EnLine
            en={
              <>
                I <Highlight>have lost</Highlight> my key.
              </>
            }
            ja="鍵をなくしてしまっている。"
            audioRef="lesson3.body.02"
          />
          <EnLine
            en={
              <>
                She <Highlight>has finished</Highlight> her homework.
              </>
            }
            ja="彼女は宿題を終えている。"
            audioRef="lesson3.body.03"
          />
        </ul>

        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm text-gray-700">
          <p className="font-bold text-gray-900">have / has の使い分け</p>
          <ul className="mt-2 space-y-1">
            <li>I / you / we / they → <span className="font-mono">have</span></li>
            <li>he / she / it → <span className="font-mono">has</span></li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            過去分詞は、動詞の「〜した／〜してしまった」形（例：lost, finished, been, lived）。
            まずはよく使うものを少しずつ覚えよう。
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">2. 代表的な3つの使い方</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          よく出てくる使い方は3つあるよ。でも、別々の丸暗記にしないで。
          <br />
          どれも <Highlight>過去と今がつながっている</Highlight> という点では同じだよ。
        </p>

        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-blossom-100 bg-white p-4">
            <p className="text-sm font-bold text-blossom-600">① 経験</p>
            <p className="mt-2 text-sm text-gray-700">
              過去の経験を、今の自分が持っているイメージ。
            </p>
            <ul className="mt-3 space-y-3 text-sm text-gray-700">
              <EnLine
                en={
                  <>
                    I <Highlight>have been</Highlight> to Kyoto.
                  </>
                }
                ja="私は京都に行ったことがある。"
                audioRef="lesson3.body.05"
              />
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              <WordGloss word="ever" meaning="今までに" /> や{" "}
              <WordGloss word="never" meaning="一度も〜ない" /> と一緒に使うことも多いよ。
            </p>
          </div>

          <div className="rounded-xl border border-blossom-100 bg-white p-4">
            <p className="text-sm font-bold text-blossom-600">② 完了・結果</p>
            <p className="mt-2 text-sm text-gray-700">
              過去に終えたことの結果が、今の状態につながっている。
            </p>
            <ul className="mt-3 space-y-3 text-sm text-gray-700">
              <EnLine
                en={
                  <>
                    I <Highlight>have finished</Highlight> my homework.
                  </>
                }
                ja="宿題を終えた／もう終わっている。"
                audioRef="lesson3.body.04"
              />
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              <WordGloss word="already" meaning="もう" /> や{" "}
              <WordGloss word="yet" meaning="まだ・もう（疑問・否定）" /> と一緒に使うことも多いよ。
            </p>
          </div>

          <div className="rounded-xl border border-blossom-100 bg-white p-4">
            <p className="text-sm font-bold text-blossom-600">③ 継続</p>
            <p className="mt-2 text-sm text-gray-700">
              過去に始まって、今まで続いていること。
            </p>
            <ul className="mt-3 space-y-3 text-sm text-gray-700">
              <EnLine
                en={
                  <>
                    I <Highlight>have lived</Highlight> here for three years.
                  </>
                }
                ja="私は3年間ここに住んでいる。"
                audioRef="lesson3.body.06"
              />
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              <WordGloss word="for" meaning="〜の間" /> や{" "}
              <WordGloss word="since" meaning="〜以来" /> と一緒に使うことも多いよ。
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-gray-700">
          経験でも、完了でも、継続でも、いちばん大事なのは
          <Highlight>「過去 ＋ 今とのつながり」</Highlight> だよ。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">3. 否定文と疑問文</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          否定は <Highlight>haven&apos;t / hasn&apos;t + 過去分詞</Highlight>。
          <br />
          疑問は <Highlight>Have / Has + 主語 + 過去分詞？</Highlight>
        </p>
        <ul className="mt-5 space-y-4 text-sm text-gray-700">
          <EnLine
            en={
              <>
                I <Highlight>haven&apos;t finished</Highlight> my homework yet.
              </>
            }
            ja="まだ宿題を終えていない。"
            audioRef="lesson3.body.07"
          />
          <EnLine
            en={
              <>
                <Highlight>Have</Highlight> you <Highlight>been</Highlight> to Kyoto?
              </>
            }
            ja="京都に行ったことがありますか？"
            audioRef="lesson3.body.08"
          />
        </ul>
      </section>

      <section className="rounded-2xl border-2 border-blossom-300 bg-gradient-to-br from-blossom-50 via-sakura-50 to-white p-6 shadow-md">
        <p className="text-base font-bold text-blossom-600">🌸 きょうのポイント</p>
        <p className="mt-3 text-base leading-relaxed text-gray-800">
          現在完了 = 過去のこと ＋ 今とのつながり。
          <br />
          形は have / has + 過去分詞。
          <br />
          経験・完了・継続も、どれも「過去と今がつながっている」点では同じ。
          <br />
          過去形は過去の出来事だけ、現在完了は今へのつながりも含めて話す。
        </p>
      </section>
    </article>
  );
}
