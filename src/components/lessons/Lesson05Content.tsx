import { EnLine } from "@/components/EnLine";

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold underline decoration-red-400 decoration-2 underline-offset-4">
      {children}
    </span>
  );
}

export function Lesson05Content() {
  return (
    <article className="max-w-none rounded-2xl border border-blossom-100 bg-white/80 p-6 shadow-sm sm:p-8">
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">🌱 きょうのテーマ</h2>
        <p className="mt-4 leading-relaxed text-gray-700">
          きょうは <Highlight>仮定法（かていほう）</Highlight> について学ぶよ。
          <br />
          難しい用語を暗記するより、まず
          <Highlight>「現実とは違うことを想像して話す」</Highlight>
          感覚をつかもう。
        </p>

        <div className="mt-5 flex flex-col items-center gap-1 rounded-xl border border-blossom-100 bg-blossom-50/40 px-4 py-4 text-center text-sm font-semibold text-gray-800">
          <p>現実</p>
          <p className="text-blossom-400" aria-hidden>
            ↓
          </p>
          <p>もし違ったら？</p>
          <p className="text-blossom-400" aria-hidden>
            ↓
          </p>
          <p>想像</p>
        </div>

        <ul className="mt-5 space-y-3 text-sm text-gray-700">
          <EnLine
            en={<>I am rich.</>}
            ja="私はお金持ちです。"
            audioRef="lesson5.body.01"
          />
        </ul>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          これは <Highlight>今の事実</Highlight> を表す普通の文だよ。
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
            <p className="text-xs font-bold text-blossom-600">【現実】</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <EnLine
                en={<>I am not rich.</>}
                ja="私はお金持ちではありません。"
                audioRef="lesson5.body.02"
              />
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              → 今の本当の状態
            </p>
          </div>
          <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
            <p className="text-xs font-bold text-blossom-600">【想像】</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <EnLine
                en={
                  <>
                    If I <Highlight>were</Highlight> rich, I{" "}
                    <Highlight>would travel</Highlight> around the world.
                  </>
                }
                ja="もし私がお金持ちなら、世界中を旅行するのにな。"
                audioRef="lesson5.body.03"
              />
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              → 今はそうではないけれど、「もしそうだったら？」という想像
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-gray-700">
          ここでの were は、<Highlight>昔の話ではない</Highlight>よ。
          <br />
          「今はお金持ちではないけれど、もしそうだったら？」と想像しているだけだよ。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">1. 基本の形</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          現実とは違う想像をする<Highlight>今回の仮定法</Highlight>では、次の形を使うよ。
          <br />
          <Highlight>If + 過去形, would + 動詞の原形</Highlight>
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
            <p className="text-xs font-bold text-blossom-600">【現実】</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <EnLine
                en={<>I don&apos;t have much time.</>}
                ja="あまり時間がありません。"
                audioRef="lesson5.body.04"
              />
            </ul>
          </div>
          <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
            <p className="text-xs font-bold text-blossom-600">【想像】</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <EnLine
                en={
                  <>
                    If I <Highlight>had</Highlight> more time, I{" "}
                    <Highlight>would study</Highlight> English.
                  </>
                }
                ja="もしもっと時間があれば、英語を勉強するのにな。"
                audioRef="lesson5.body.05"
              />
            </ul>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          had は「昨日時間があった」ではないよ。
          <br />
          今は時間があまりない → もしもっと時間があったら？ という想像だよ。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">2. If I were ...</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          会話でもよく使う形だよ。
        </p>
        <ul className="mt-5 space-y-4 text-sm text-gray-700">
          <EnLine
            en={
              <>
                If I <Highlight>were</Highlight> rich, I would travel around the world.
              </>
            }
            ja="もし私がお金持ちなら、世界中を旅行するのにな。"
            audioRef="lesson5.body.03"
          />
          <EnLine
            en={
              <>
                If I <Highlight>were you</Highlight>, I would talk to her.
              </>
            }
            ja="もし私があなたなら、彼女に話しかけるかな。"
            audioRef="lesson5.body.06"
          />
        </ul>
        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm text-gray-700">
          <p className="font-bold text-gray-900">I なのに was ではなく were？</p>
          <p className="mt-2 text-sm leading-relaxed">
            仮定法では、<Highlight>If I were ...</Highlight> という形を基本として覚えよう。
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">3. had / knew</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          be動詞だけでなく、普通の動詞でも作れるよ。
        </p>
        <ul className="mt-5 space-y-4 text-sm text-gray-700">
          <EnLine
            en={
              <>
                If I <Highlight>had</Highlight> more money, I would buy a new computer.
              </>
            }
            ja="もしもっとお金があれば、新しいパソコンを買うのにな。"
            audioRef="lesson5.body.07"
          />
          <EnLine
            en={
              <>
                If I <Highlight>knew</Highlight> the answer, I would tell you.
              </>
            }
            ja="もし答えを知っていたら、教えるのにな。"
            audioRef="lesson5.body.08"
          />
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          had / knew も「昔の出来事」ではなく、<Highlight>今とは違う想像</Highlight>だよ。
          <br />
          If I knew the answer ... には、「実際には今、答えを知らない」という含みがあるよ。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">4. would</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          <Highlight>would + 動詞の原形</Highlight> は、「もしそうなら、〜するのに」という想像の結果だよ。
        </p>
        <ul className="mt-5 space-y-4 text-sm text-gray-700">
          <EnLine
            en={
              <>
                If I had a car, I <Highlight>would drive</Highlight> to the beach.
              </>
            }
            ja="もし車を持っていたら、海まで運転していくのにな。"
            audioRef="lesson5.body.09"
          />
        </ul>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-blossom-100 bg-white p-4 text-sm text-gray-700">
            <p className="text-xs font-bold text-blossom-600">if側</p>
            <p className="mt-2">もし車を持っていたら</p>
            <p className="mt-1 text-xs text-gray-500">＝想像の条件</p>
          </div>
          <div className="rounded-xl border border-blossom-100 bg-white p-4 text-sm text-gray-700">
            <p className="text-xs font-bold text-blossom-600">would側</p>
            <p className="mt-2">海まで運転していくのにな</p>
            <p className="mt-1 text-xs text-gray-500">＝想像の結果</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">5. 起こりそうな話とのちがい</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          if を使う文は、いつも今回の仮定法と同じ形ではないよ。
        </p>
        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <p className="text-xs font-bold text-gray-600">【実際に起こるかもしれない話】</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <EnLine
                en={<>If it rains tomorrow, I will stay home.</>}
                ja="もし明日雨が降ったら、家にいます。"
                audioRef="lesson5.body.10"
              />
            </ul>
          </div>
          <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
            <p className="text-xs font-bold text-blossom-600">【今とは違う想像】</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <EnLine
                en={<>If I were rich, I would travel around the world.</>}
                ja="もし私がお金持ちなら、世界中を旅行するのにな。"
                audioRef="lesson5.body.03"
              />
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">6. could</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          would のほかに、could を使うこともあるよ。短く見ておこう。
        </p>
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm text-gray-700">
          <p>would → 〜するのに</p>
          <p className="mt-1">could → 〜できるのに</p>
        </div>
        <ul className="mt-4 space-y-3 text-sm text-gray-700">
          <EnLine
            en={
              <>
                If I had more time, I <Highlight>could study</Highlight> English.
              </>
            }
            ja="もしもっと時間があれば、英語を勉強できるのに。"
            audioRef="lesson5.body.11"
          />
        </ul>
      </section>

      <section className="rounded-2xl border-2 border-blossom-300 bg-gradient-to-br from-blossom-50 via-sakura-50 to-white p-6 shadow-md">
        <p className="text-base font-bold text-blossom-600">🌸 きょうのポイント</p>
        <p className="mt-3 text-base leading-relaxed text-gray-800">
          仮定法は、現実とは違うことを想像するときに使える。
          <br />
          今回の仮定法では、if側を過去形にする。
          <br />
          過去形でも、昔の話とは限らない。
          <br />
          結果側は would + 動詞の原形。
          <br />
          If I were ... はよく使う。had / knew など、普通の動詞でも作れる。
        </p>
      </section>
    </article>
  );
}
