import { LessonLayout } from "@/components/LessonLayout";
import { EnLine } from "@/components/EnLine";
import { SpeakableEnglish } from "@/components/SpeakableEnglish";
import { StepNavigation } from "@/components/StepNavigation";
import { SubjectLabel, WordGloss } from "@/components/WordGloss";
import { lesson01Meta } from "@/data/lesson01";
import { ui } from "@/lib/ui-text";

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold underline decoration-red-400 decoration-2 underline-offset-4">
      {children}
    </span>
  );
}

export default function Lesson1Page() {
  return (
    <LessonLayout
      lessonNumber={1}
      currentStep="lesson"
      title={lesson01Meta.title}
      subtitle={ui.lesson1.readSubtitle(lesson01Meta.readingMinutes)}
      lessonId={lesson01Meta.id}
      showMemo
    >
      <article className="max-w-none rounded-2xl border border-blossom-100 bg-white/80 p-8 shadow-sm">
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900">
            🌱 {ui.lesson1.todayTheme}
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            きょうは <Highlight>be動詞（ビーどうし）</Highlight> について学ぶよ。
            <br />
            日本語の「です」「います」と同じような働きをする、大切なことばだよ。
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            be動詞には、主に2つの使い方があるよ。
          </p>
          <ul className="mt-3 space-y-3 text-sm text-gray-700">
            <li>
              ① <Highlight>～です / ～である</Highlight>
              <br />
              <span className="text-xs text-gray-500">例：I am a student. ＝ 私は学生です。</span>
            </li>
            <li>
              ② <Highlight>～にいる / ～にある</Highlight>
              <br />
              <span className="text-xs text-gray-500">
                例：
                <SpeakableEnglish audioRef="lesson1.body.28">She is at home.</SpeakableEnglish>{" "}
                ＝ 彼女は家にいます。
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900">1. be動詞ってなに？</h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            be動詞は、「だれ・なに」と「どんな状態か」を
            <Highlight>つなぐ</Highlight>ことばだよ。
          </p>
          <ul className="mt-5 space-y-4 text-sm leading-relaxed text-gray-600">
            <EnLine
              en={
                <>
                  私は<WordGloss word="student" meaning="生徒・学生" />です → I{" "}
                  <Highlight>am</Highlight> a student.
                </>
              }
              ja="私は学生です。"
              audioRef="lesson1.body.01"
            />
            <EnLine
              en={
                <>
                  彼は<WordGloss word="teacher" meaning="先生" />です → He{" "}
                  <Highlight>is</Highlight> a teacher.
                </>
              }
              ja="彼は先生です。"
              audioRef="lesson1.body.02"
            />
            <EnLine
              en={
                <>
                  彼らは<WordGloss word="friends" meaning="友達（複数）" />です → They{" "}
                  <Highlight>are</Highlight> friends.
                </>
              }
              ja="彼らは友達です。"
              audioRef="lesson1.body.03"
            />
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900">
            2. 形は3つ — am / is / are
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            主語（だれ・なにについて話すか）によって、形が変わるよ。
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-gray-100 text-sm">
            <table className="w-full">
              <thead className="bg-blossom-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">形</th>
                  <th className="px-4 py-3 text-left font-medium">主語</th>
                  <th className="px-4 py-3 text-left font-medium">例</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 font-medium">am</td>
                  <td className="px-4 py-3">
                    <SubjectLabel en="I" ja="私" />
                  </td>
                  <td className="px-4 py-3">
                    <SpeakableEnglish audioRef="lesson1.body.04" layout="block">
                      I am <WordGloss word="happy" meaning="うれしい・幸せな" />.
                    </SpeakableEnglish>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">is</td>
                  <td className="px-4 py-3">
                    <SubjectLabel en="he" ja="彼" /> /{" "}
                    <SubjectLabel en="she" ja="彼女" /> /{" "}
                    <SubjectLabel en="it" ja="それ" />
                    <span className="ml-1 text-xs text-gray-400">（1人・1つ）</span>
                  </td>
                  <td className="px-4 py-3">
                    <SpeakableEnglish audioRef="lesson1.body.05" layout="block">
                      She is a <WordGloss word="doctor" meaning="医者" />.
                    </SpeakableEnglish>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">are</td>
                  <td className="px-4 py-3">
                    <SubjectLabel en="you" ja="あなた・あなたたち" /> /{" "}
                    <SubjectLabel en="we" ja="私たち" /> /{" "}
                    <SubjectLabel en="they" ja="彼ら・彼女ら・それら" />
                    <span className="ml-1 text-xs text-gray-400">（2人以上）</span>
                  </td>
                  <td className="px-4 py-3">
                    <SpeakableEnglish audioRef="lesson1.body.06" layout="block">
                      We are <WordGloss word="students" meaning="生徒・学生（複数）" />.
                    </SpeakableEnglish>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm">
            <p className="font-medium text-gray-800">名前や普通の名詞の場合</p>
            <p className="mt-2 leading-relaxed text-gray-600">
              <Highlight>I だけ am</Highlight>、<Highlight>you は1人でも are</Highlight>。
              <br />
              それ以外は、<Highlight>1人・1つなら基本 is</Highlight>、
              <Highlight>2人以上・複数なら基本 are</Highlight> だよ。
            </p>
            <ul className="mt-4 space-y-3 text-gray-700">
              <EnLine
                en={<>Tom is a student.</>}
                ja="トムは学生です。"
                audioRef="lesson1.body.29"
              />
              <EnLine
                en={<>My friends are happy.</>}
                ja="私の友達たちはうれしいです。"
                audioRef="lesson1.body.30"
              />
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900">
            3. 物について話すとき
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            be動詞は人だけでなく、<Highlight>物</Highlight>について話すときにも使うよ。
            人でも物でも、主語が1つなら <Highlight>is</Highlight>、2つ以上なら{" "}
            <Highlight>are</Highlight> だよ。
          </p>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-xl bg-blossom-50/50 p-4">
              <p className="font-medium text-gray-800">物が1つの場合</p>
              <p className="mt-1 text-xs text-gray-500">
                <SubjectLabel en="it" ja="それ" /> / 単数の名詞 → is
              </p>
              <ul className="mt-3 space-y-3 text-gray-700">
                <EnLine
                  en={
                    <>
                      It is a <WordGloss word="book" meaning="本" />.
                    </>
                  }
                  ja="これは本です。"
                  audioRef="lesson1.body.07"
                />
                <EnLine
                  en={
                    <>
                      The book is <WordGloss word="new" meaning="新しい" />.
                    </>
                  }
                  ja="その本は新しいです。"
                  audioRef="lesson1.body.08"
                />
              </ul>
            </div>
            <div className="rounded-xl bg-blossom-50/50 p-4">
              <p className="font-medium text-gray-800">物が2つ以上の場合</p>
              <p className="mt-1 text-xs text-gray-500">
                <SubjectLabel en="they" ja="彼ら・彼女ら・それら" /> / 複数の名詞 → are
              </p>
              <ul className="mt-3 space-y-3 text-gray-700">
                <EnLine
                  en={
                    <>
                      They are <WordGloss word="books" meaning="本（複数）" />.
                    </>
                  }
                  ja="それらは本です。"
                  audioRef="lesson1.body.09"
                />
                <EnLine
                  en={
                    <>
                      The books are <WordGloss word="new" meaning="新しい" />.
                    </>
                  }
                  ja="その本たちは新しいです。"
                  audioRef="lesson1.body.10"
                />
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900">4. いつ使う？</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-gray-700">
            <li>
              気分や状態（
              <SpeakableEnglish audioRef="lesson1.body.11">
                I am <WordGloss word="tired" meaning="疲れている" />.
              </SpeakableEnglish>{" "}
              ＝ 疲れている）
            </li>
            <li>
              どんな人・ものか（
              <SpeakableEnglish audioRef="lesson1.body.12">
                He is <WordGloss word="Japanese" meaning="日本人・日本の" />.
              </SpeakableEnglish>{" "}
              ＝ 日本人）
            </li>
            <li>
              どこにいるか（
              <SpeakableEnglish audioRef="lesson1.body.13">I am at home.</SpeakableEnglish>{" "}
              ＝ 家にいる）
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900">
            5. 否定したい時（〜ではありません・〜ありません）、質問したい時（〜ですか？）
          </h2>

          <h3 className="mt-5 text-base font-bold text-gray-800">否定文</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            ルール：<Highlight>be動詞の後ろに not</Highlight> を置くよ。
          </p>
          <ul className="mt-4 space-y-4 text-sm text-gray-700">
            <EnLine
              en={
                <>
                  I am <WordGloss word="tired" meaning="疲れている" />.
                  <br />
                  ↓
                  <br />I am not tired.
                </>
              }
              ja="私は疲れていません。"
              audioRefs={["lesson1.body.11", "lesson1.body.14"]}
            />
            <EnLine
              en={
                <>
                  He is <WordGloss word="happy" meaning="うれしい・幸せな" />.
                  <br />
                  ↓
                  <br />He is not happy.
                </>
              }
              ja="彼はうれしくありません。"
              audioRefs={["lesson1.body.15", "lesson1.body.16"]}
            />
            <EnLine
              en={
                <>
                  They are <WordGloss word="here" meaning="ここ" />.
                  <br />
                  ↓
                  <br />They are not here.
                </>
              }
              ja="彼らはここにいません。"
              audioRefs={["lesson1.body.17", "lesson1.body.18"]}
            />
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-gray-700">
            not は短く書くと省略形になるよ。
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
            <li>
              is not → <Highlight>isn&apos;t</Highlight>
              <br />
              <span className="text-xs text-gray-500">
                <SpeakableEnglish audioRef="lesson1.body.16">He is not happy.</SpeakableEnglish> ＝{" "}
                <SpeakableEnglish audioRef="lesson1.body.20">He isn&apos;t happy.</SpeakableEnglish>
              </span>
            </li>
            <li>
              are not → <Highlight>aren&apos;t</Highlight>
              <br />
              <span className="text-xs text-gray-500">
                <SpeakableEnglish audioRef="lesson1.body.21">They are not here.</SpeakableEnglish> ＝{" "}
                <SpeakableEnglish audioRef="lesson1.body.22">They aren&apos;t here.</SpeakableEnglish>
              </span>
            </li>
          </ul>

          <h3 className="mt-8 text-base font-bold text-gray-800">疑問文</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            ルール：普通の文は「主語 ＋ be動詞 ＋ 〜」。
            <br />
            疑問文は <Highlight>be動詞を主語の前に出して</Highlight>「？」をつけるよ。
          </p>
          <ul className="mt-4 space-y-4 text-sm text-gray-700">
            <EnLine
              en={
                <>
                  You are a <WordGloss word="student" meaning="生徒・学生" />.
                  <br />
                  ↓
                  <br />
                  Are you a student?
                </>
              }
              ja="あなたは学生ですか？"
              audioRefs={["lesson1.body.23", "lesson1.body.24"]}
            />
            <EnLine
              en={
                <>
                  She is <WordGloss word="tired" meaning="疲れている" />.
                  <br />
                  ↓
                  <br />
                  Is she tired?
                </>
              }
              ja="彼女は疲れていますか？"
              audioRefs={["lesson1.body.25", "lesson1.body.26"]}
            />
            <EnLine
              en={
                <>
                  They are <WordGloss word="friends" meaning="友達（複数）" />.
                  <br />
                  ↓
                  <br />
                  Are they friends?
                </>
              }
              ja="彼らは友達ですか？"
              audioRefs={["lesson1.body.03", "lesson1.body.27"]}
            />
          </ul>

          <h3 className="mt-8 text-base font-bold text-gray-800">答え方（Yes / No）</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            疑問文を聞かれたときは、<Highlight>Yes</Highlight> または <Highlight>No</Highlight> で答えるよ。
          </p>
          <ul className="mt-4 space-y-4 text-sm text-gray-700">
            <EnLine
              en={
                <>
                  Are you a student?
                  <br />
                  ↓
                  <br />
                  Yes, I am.
                </>
              }
              ja="はい、そうです。"
              audioRefs={["lesson1.body.24", "lesson1.body.31"]}
            />
            <EnLine
              en={
                <>
                  Are you a student?
                  <br />
                  ↓
                  <br />
                  No, I&apos;m not.
                </>
              }
              ja="いいえ、違います。"
              audioRefs={["lesson1.body.24", "lesson1.body.32"]}
            />
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900">6. 会話でよく使う省略形</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            会話や文章では、be動詞を短くすることがよくあるよ。
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-gray-100 text-sm">
            <table className="w-full">
              <thead className="bg-blossom-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">普通の形</th>
                  <th className="px-4 py-3 text-left font-medium">短い形</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr><td className="px-4 py-3">I am</td><td className="px-4 py-3 font-medium">I&apos;m</td></tr>
                <tr><td className="px-4 py-3">you are</td><td className="px-4 py-3 font-medium">you&apos;re</td></tr>
                <tr><td className="px-4 py-3">he is</td><td className="px-4 py-3 font-medium">he&apos;s</td></tr>
                <tr><td className="px-4 py-3">she is</td><td className="px-4 py-3 font-medium">she&apos;s</td></tr>
                <tr><td className="px-4 py-3">it is</td><td className="px-4 py-3 font-medium">it&apos;s</td></tr>
                <tr><td className="px-4 py-3">we are</td><td className="px-4 py-3 font-medium">we&apos;re</td></tr>
                <tr><td className="px-4 py-3">they are</td><td className="px-4 py-3 font-medium">they&apos;re</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-800">否定の短い形</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            <li>I am not → <Highlight>I&apos;m not</Highlight></li>
            <li>is not → <Highlight>isn&apos;t</Highlight></li>
            <li>are not → <Highlight>aren&apos;t</Highlight></li>
          </ul>
        </section>

        <section className="rounded-2xl border-2 border-blossom-300 bg-gradient-to-br from-blossom-50 via-sakura-50 to-white p-6 shadow-md">
          <p className="text-base font-bold text-blossom-600">
            {ui.lesson1.summaryBox}
          </p>
          <p className="mt-3 text-base leading-relaxed text-gray-800">
            be動詞 = 「～です」「～にいる・ある」などを表すことば。
            <br />
            形は <Highlight>am / is / are</Highlight> の3つ。主語によって使い分ける。
            <br />
            否定は be動詞 + not、疑問は be動詞を前に出す。
          </p>
        </section>
      </article>

      <StepNavigation
        backHref="/lessons"
        backLabel={ui.nav.top}
        nextHref="/lesson/1/check"
        nextLabel={ui.lesson1.toCheck}
      />
    </LessonLayout>
  );
}
