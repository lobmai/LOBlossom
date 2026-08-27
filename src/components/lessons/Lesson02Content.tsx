import { EnLine } from "@/components/EnLine";
import { SubjectLabel, WordGloss } from "@/components/WordGloss";

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold underline decoration-red-400 decoration-2 underline-offset-4">
      {children}
    </span>
  );
}

function VerbChange({ from, to }: { from: string; to: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-sm">
      <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-600 line-through decoration-red-300">
        {from}
      </span>
      <span className="text-gray-400">→</span>
      <span className="rounded bg-leaf-50 px-1.5 py-0.5 font-semibold text-leaf-700">
        {to}
      </span>
    </span>
  );
}

function CorrectWrong({ correct, wrong }: { correct: string; wrong: string }) {
  return (
    <div className="mt-3 space-y-1 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm">
      <p className="font-mono text-leaf-700">○ {correct}</p>
      <p className="font-mono text-gray-400">× {wrong}</p>
    </div>
  );
}

export function Lesson02Content() {
  return (
    <article className="max-w-none rounded-2xl border border-blossom-100 bg-white/80 p-8 shadow-sm">
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">🌱 きょうのテーマ</h2>
        <p className="mt-4 leading-relaxed text-gray-700">
          きょうは <Highlight>一般動詞（いっぱんどうし）</Highlight> について学ぶよ。
          <br />
          レッスン1で学んだ be動詞とは<Highlight>違う</Highlight>、もう1つの動詞のグループだよ。
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
            <p className="text-xs font-bold text-blossom-600">【be動詞】</p>
            <p className="mt-2 font-mono text-sm text-gray-800">I am tired.</p>
            <p className="mt-1 text-xs text-gray-600">私は疲れています。</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              → 「です・います・状態」などを表す
            </p>
          </div>
          <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
            <p className="text-xs font-bold text-blossom-600">【一般動詞】</p>
            <p className="mt-2 font-mono text-sm text-gray-800">I play tennis.</p>
            <p className="mt-1 text-xs text-gray-600">私はテニスをします。</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              → 「する・食べる・好き」などを表す
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">1. 一般動詞ってなに？</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          一般動詞は、be動詞<Highlight>以外</Highlight>で、
          「する・食べる・好き」などを表す動詞だよ。
          <br />
          be動詞とは<Highlight>役割が違う</Highlight>、もう1つの動詞のグループと考えてね。
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">例えば、こんな言葉があるよ。</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>
            <WordGloss word="play" meaning="する" /> — play tennis（テニスをする）
          </li>
          <li>
            <WordGloss word="eat" meaning="食べる" /> — eat lunch（昼ごはんを食べる）
          </li>
          <li>
            <WordGloss word="like" meaning="好き" /> — like music（音楽が好き）
          </li>
          <li>
            <WordGloss word="go" meaning="行く" /> — go to school（学校へ行く）
          </li>
          <li>
            <WordGloss word="study" meaning="勉強する" /> — study English（英語を勉強する）
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">2. 基本の肯定文</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          ルール：<Highlight>主語 ＋ 一般動詞</Highlight>
        </p>
        <ul className="mt-5 space-y-4 text-sm text-gray-700">
          <EnLine
            en={
              <>
                I <Highlight>play</Highlight> tennis.
              </>
            }
            ja="私はテニスをします。"
            audioRef="lesson2.body.01"
          />
          <EnLine
            en={
              <>
                I <Highlight>like</Highlight> music.
              </>
            }
            ja="私は音楽が好きです。"
            audioRef="lesson2.body.02"
          />
          <EnLine
            en={
              <>
                We <Highlight>study</Highlight> English.
              </>
            }
            ja="私たちは英語を勉強します。"
            audioRef="lesson2.body.03"
          />
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">3. 三人称単数（3単現）とは？</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          <Highlight>he / she / it</Highlight> や、人の名前・1つのものなど、
          「私（I）」「あなた（you）」<Highlight>以外</Highlight>の
          <Highlight>1人・1つ</Highlight>を表す主語で、
          <Highlight>現在のこと</Highlight>を話すとき、一般動詞には基本的に{" "}
          <Highlight>s</Highlight> がつくよ。
          <br />
          このルールを <Highlight>「三人称単数現在（3単現）」</Highlight> と呼ぶよ。
        </p>
        <ul className="mt-4 space-y-2 text-xs leading-relaxed text-gray-600">
          <li>・<strong>三人称</strong>＝ I / you 以外の人・もの（he, she, Tom, the cat など）</li>
          <li>・<strong>単数</strong>＝ 1人・1つ</li>
          <li>・<strong>現在形</strong>＝ 今のこと・いつものこと</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">4. 3単現の s ってなに？</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          3単現のとき、動詞のうしろに付く <Highlight>s</Highlight> のことを
          「<Highlight>3単現の s</Highlight>」と言うよ。
          基本は <Highlight>動詞 ＋ s</Highlight> だよ。
        </p>
        <div className="mt-5 overflow-hidden rounded-xl border border-gray-100 text-sm">
          <table className="w-full">
            <thead className="bg-blossom-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">基本形</th>
                <th className="px-4 py-3 text-left font-medium">3単現（s付き）</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              <tr><td className="px-4 py-3 font-mono">play</td><td className="px-4 py-3 font-mono font-medium">plays</td></tr>
              <tr><td className="px-4 py-3 font-mono">like</td><td className="px-4 py-3 font-mono font-medium">likes</td></tr>
              <tr><td className="px-4 py-3 font-mono">study</td><td className="px-4 py-3 font-mono font-medium">studies</td></tr>
              <tr><td className="px-4 py-3 font-mono">go</td><td className="px-4 py-3 font-mono font-medium">goes</td></tr>
              <tr><td className="px-4 py-3 font-mono">watch</td><td className="px-4 py-3 font-mono font-medium">watches</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          最初は play → plays、like → likes だけ覚えればOK。study → studies などは後からで大丈夫だよ。
        </p>
        <ul className="mt-5 space-y-5 text-sm text-gray-700">
          <EnLine
            en={
              <>
                I play tennis.
                <br />
                <span className="text-xs text-gray-500">↓ 主語を「彼」にすると</span>
                <br />
                He <Highlight>plays</Highlight> tennis.
              </>
            }
            ja="彼はテニスをします。"
            audioRefs={["lesson2.body.01", "lesson2.body.04"]}
          />
          <EnLine
            en={
              <>
                I like music.
                <br />
                <span className="text-xs text-gray-500">↓ 主語を「彼女」にすると</span>
                <br />
                She <Highlight>likes</Highlight> music.
              </>
            }
            ja="彼女は音楽が好きです。"
            audioRefs={["lesson2.body.02", "lesson2.body.05"]}
          />
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">5. 否定文</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          <SubjectLabel en="I" ja="私" /> / <SubjectLabel en="you" ja="あなた" /> /{" "}
          <SubjectLabel en="we" ja="私たち" /> / <SubjectLabel en="they" ja="彼ら" /> →{" "}
          <Highlight>do not / don&apos;t</Highlight>
          <br />
          <SubjectLabel en="he" ja="彼" /> / <SubjectLabel en="she" ja="彼女" /> /{" "}
          <SubjectLabel en="it" ja="それ" /> → <Highlight>does not / doesn&apos;t</Highlight>
        </p>
        <ul className="mt-5 space-y-4 text-sm text-gray-700">
          <EnLine
            en={
              <>
                I don&apos;t play tennis.
              </>
            }
            ja="私はテニスをしません。"
            audioRef="lesson2.body.06"
          />
          <EnLine
            en={
              <>
                She doesn&apos;t play tennis.
              </>
            }
            ja="彼女はテニスをしません。"
            audioRef="lesson2.body.07"
          />
        </ul>

        <div className="mt-6 rounded-xl border-2 border-blossom-200 bg-blossom-50/30 p-4">
          <p className="text-sm font-bold text-gray-800">
            <Highlight>doesn&apos;t</Highlight> のとき、動詞は元の形に戻る！
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            doesn&apos;t の中に「三単現の s」の役割が入っているから、
            <Highlight>後ろの一般動詞には s を付けない</Highlight>よ。
          </p>
          <ul className="mt-4 space-y-4 text-sm text-gray-700">
            <EnLine
              en={
                <>
                  She <Highlight>likes</Highlight> music.
                  <br />
                  <span className="text-xs text-gray-500">↓</span>
                  <br />
                  She doesn&apos;t <Highlight>like</Highlight> music.
                  <br />
                  <span className="mt-2 inline-block text-xs text-gray-600">
                    変化：<VerbChange from="likes" to="like" />
                  </span>
                </>
              }
              ja="彼女は音楽が好きではありません。"
              audioRefs={["lesson2.body.05", "lesson2.body.08"]}
            />
          </ul>
          <CorrectWrong
            correct="She doesn't like music."
            wrong="She doesn't likes music."
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">6. 疑問文</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          ルール：
          <br />
          <Highlight>Do ＋ 主語 ＋ 動詞？</Highlight>
          <br />
          <Highlight>Does ＋ 主語 ＋ 動詞？</Highlight>
        </p>
        <ul className="mt-5 space-y-4 text-sm text-gray-700">
          <EnLine
            en={
              <>
                You like music.
                <br />
                <span className="text-xs text-gray-500">↓</span>
                <br />
                Do you like music?
              </>
            }
            ja="あなたは音楽が好きですか？"
            audioRefs={["lesson2.body.09", "lesson2.body.10"]}
          />
        </ul>

        <div className="mt-6 rounded-xl border-2 border-blossom-200 bg-blossom-50/30 p-4">
          <p className="text-sm font-bold text-gray-800">
            <Highlight>Does</Highlight> を使ったら、動詞は元の形に戻る！
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            否定文と同じく、
            <Highlight>does / doesn&apos;t を使うときは、後ろの一般動詞に s を付けない</Highlight>
            よ。
          </p>
          <ul className="mt-4 space-y-4 text-sm text-gray-700">
            <EnLine
              en={
                <>
                  She <Highlight>likes</Highlight> music.
                  <br />
                  <span className="text-xs text-gray-500">↓</span>
                  <br />
                  Does she <Highlight>like</Highlight> music?
                  <br />
                  <span className="mt-2 inline-block text-xs text-gray-600">
                    変化：<VerbChange from="likes" to="like" />
                  </span>
                </>
              }
              ja="彼女は音楽が好きですか？"
              audioRefs={["lesson2.body.05", "lesson2.body.11"]}
            />
          </ul>
          <CorrectWrong correct="Does she like music?" wrong="Does she likes music?" />
        </div>

        <h3 className="mt-8 text-base font-bold text-gray-800">答え方（Yes / No）</h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          <Highlight>Do</Highlight> で聞かれたら <Highlight>do / don&apos;t</Highlight>、
          <Highlight>Does</Highlight> で聞かれたら <Highlight>does / doesn&apos;t</Highlight>{" "}
          で答えるよ。
        </p>
        <ul className="mt-4 space-y-4 text-sm text-gray-700">
          <EnLine
            en={
              <>
                Do you play tennis?
                <br />
                ↓
                <br />
                Yes, I do. / No, I don&apos;t.
              </>
            }
            ja="はい、します。／ いいえ、しません。"
            audioRefs={["lesson2.body.12", "lesson2.body.13", "lesson2.body.14"]}
          />
          <EnLine
            en={
              <>
                Does she like music?
                <br />
                ↓
                <br />
                Yes, she does. / No, she doesn&apos;t.
              </>
            }
            ja="はい、好きです。／ いいえ、好きではありません。"
            audioRefs={["lesson2.body.11", "lesson2.body.15", "lesson2.body.16"]}
          />
        </ul>
      </section>

      <section className="rounded-2xl border-2 border-blossom-300 bg-gradient-to-br from-blossom-50 via-sakura-50 to-white p-6 shadow-md">
        <p className="text-base font-bold text-blossom-600">🌸 きょうのポイント</p>
        <p className="mt-3 text-base leading-relaxed text-gray-800">
          一般動詞 = be動詞以外で「する・食べる・好き」などを表す言葉。
          <br />
          3単現：he / she / it など1人・1つ → 動詞に s（plays, likes）
          <br />
          否定・疑問：does / doesn&apos;t / Does の後ろの動詞は原形（s を付けない）
        </p>
      </section>
    </article>
  );
}
