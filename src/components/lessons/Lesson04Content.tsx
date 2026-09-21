import { EnLine } from "@/components/EnLine";

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold underline decoration-red-400 decoration-2 underline-offset-4">
      {children}
    </span>
  );
}

function DownArrow() {
  return (
    <p className="py-1 text-center text-blossom-400" aria-hidden>
      ↓
    </p>
  );
}

function SameMark({
  top,
  bottom,
  label,
}: {
  top: string;
  bottom: string;
  label: string;
}) {
  return (
    <div className="mt-4 flex flex-col items-center gap-1 rounded-lg border border-blossom-100 bg-blossom-50/40 px-3 py-3 text-center text-sm text-gray-800">
      <p className="font-mono font-semibold">{top}</p>
      <p className="text-xs font-bold text-blossom-600">↑ {label} ↓</p>
      <p className="font-mono font-semibold">{bottom}</p>
    </div>
  );
}

export function Lesson04Content() {
  return (
    <article className="max-w-none rounded-2xl border border-blossom-100 bg-white/80 p-6 shadow-sm sm:p-8">
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">🌱 きょうのテーマ</h2>
        <p className="mt-4 leading-relaxed text-gray-700">
          きょうは <Highlight>関係代名詞（かんけいだいめいし）</Highlight> について学ぶよ。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          関係代名詞を使うと、同じ人・ものが出てくる
          <Highlight>2つの文を、1つの文につなげられる</Highlight>よ。
        </p>

        <div className="mt-5 flex flex-col items-center gap-1 rounded-xl border border-blossom-100 bg-blossom-50/40 px-4 py-4 text-center text-sm font-semibold text-gray-800">
          <p>2つの文</p>
          <p className="text-blossom-400" aria-hidden>
            ↓
          </p>
          <p>who / which / that でつなぐ</p>
          <p className="text-blossom-400" aria-hidden>
            ↓
          </p>
          <p>1つの文になる</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">1. 人の文をつなぐ</h2>

        <div className="mt-5 rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
          <p className="text-xs font-bold text-blossom-600">【2つの文】</p>
          <ul className="mt-2 space-y-2 text-sm text-gray-700">
            <EnLine
              en={<>I know the girl.</>}
              ja="私はその女の子を知っています。"
              audioRef="lesson4.body.01"
            />
            <EnLine
              en={<>She speaks English.</>}
              ja="彼女は英語を話します。"
              audioRef="lesson4.body.02"
            />
          </ul>
        </div>

        <DownArrow />

        <div className="rounded-xl border border-blossom-100 bg-white p-4">
          <p className="text-xs font-bold text-blossom-600">【同じ人】</p>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            <Highlight>the girl</Highlight> と <Highlight>She</Highlight> は同じ人を表している。
          </p>
          <SameMark top="the girl" bottom="She" label="同じ人" />
        </div>

        <DownArrow />

        <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
          <p className="text-xs font-bold text-blossom-600">【who でつなぐ】</p>
          <p className="mt-3 font-mono text-sm text-gray-700">I know the girl.</p>
          <p className="mt-1 text-sm text-gray-500">+</p>
          <p className="font-mono text-sm text-gray-700">She speaks English.</p>
          <p className="mt-2 text-center text-blossom-400" aria-hidden>
            ↓
          </p>
          <ul className="mt-1 space-y-1 text-sm text-gray-700">
            <EnLine
              en={
                <>
                  I know the girl <Highlight>who speaks English</Highlight>.
                </>
              }
              ja="私は英語を話す女の子を知っています。"
              audioRef="lesson4.body.03"
            />
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            同じ人が出てくる2つの文を、<Highlight>who</Highlight> を使って1つの文につなげられる。
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">2. ものの文をつなぐ</h2>

        <div className="mt-5 rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
          <p className="text-xs font-bold text-blossom-600">【2つの文】</p>
          <ul className="mt-2 space-y-2 text-sm text-gray-700">
            <EnLine
              en={<>This is the book.</>}
              ja="これはその本です。"
              audioRef="lesson4.body.04"
            />
            <EnLine
              en={<>I bought it yesterday.</>}
              ja="私はそれを昨日買いました。"
              audioRef="lesson4.body.05"
            />
          </ul>
        </div>

        <DownArrow />

        <div className="rounded-xl border border-blossom-100 bg-white p-4">
          <p className="text-xs font-bold text-blossom-600">【同じもの】</p>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            <Highlight>the book</Highlight> と <Highlight>it</Highlight> は同じものを表している。
          </p>
          <SameMark top="the book" bottom="it" label="同じもの" />
        </div>

        <DownArrow />

        <div className="rounded-xl border border-blossom-100 bg-blossom-50/40 p-4">
          <p className="text-xs font-bold text-blossom-600">【that でつなぐ】</p>
          <p className="mt-3 font-mono text-sm text-gray-700">This is the book.</p>
          <p className="mt-1 text-sm text-gray-500">+</p>
          <p className="font-mono text-sm text-gray-700">I bought it yesterday.</p>
          <p className="mt-2 text-center text-blossom-400" aria-hidden>
            ↓
          </p>
          <ul className="mt-1 space-y-1 text-sm text-gray-700">
            <EnLine
              en={
                <>
                  This is the book{" "}
                  <Highlight>that I bought yesterday</Highlight>.
                </>
              }
              ja="これは私が昨日買った本です。"
              audioRef="lesson4.body.06"
            />
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            同じものが出てくる2つの文を、<Highlight>that</Highlight> を使って1つの文につなげられる。
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900">3. who / which / that</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          つなぐことばは、人かものかで使い分ける。
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-blossom-100 bg-white p-4">
            <p className="text-sm font-bold text-blossom-600">■ 人をつなぐとき → who</p>
            <ul className="mt-3 space-y-3 text-sm text-gray-700">
              <EnLine
                en={
                  <>
                    I know the girl <Highlight>who</Highlight> speaks English.
                  </>
                }
                ja="私は英語を話す女の子を知っています。"
                audioRef="lesson4.body.03"
              />
            </ul>
          </div>

          <div className="rounded-xl border border-blossom-100 bg-white p-4">
            <p className="text-sm font-bold text-blossom-600">■ ものをつなぐとき → which</p>
            <ul className="mt-3 space-y-3 text-sm text-gray-700">
              <EnLine
                en={
                  <>
                    This is the book <Highlight>which</Highlight> is interesting.
                  </>
                }
                ja="これはおもしろい本です。"
                audioRef="lesson4.body.07"
              />
            </ul>
          </div>

          <div className="rounded-xl border border-blossom-100 bg-white p-4">
            <p className="text-sm font-bold text-blossom-600">
              ■ that → 人・ものの両方に使えることがある
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              ものの文では that を使える。人の文でも使えることがある。
            </p>
            <ul className="mt-3 space-y-3 text-sm text-gray-700">
              <EnLine
                en={
                  <>
                    This is the book <Highlight>that</Highlight> I bought yesterday.
                  </>
                }
                ja="これは私が昨日買った本です。"
                audioRef="lesson4.body.06"
              />
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border-2 border-blossom-300 bg-gradient-to-br from-blossom-50 via-sakura-50 to-white p-6 shadow-md">
        <p className="text-base font-bold text-blossom-600">🌸 きょうのポイント</p>
        <p className="mt-3 text-base leading-relaxed text-gray-800">
          同じ人・ものが出てくる2つの文を、who / which / that で1つの文につなげられる。
          <br />
          人なら who。ものなら which。that は人・ものの両方に使えることがある。
        </p>
      </section>
    </article>
  );
}
