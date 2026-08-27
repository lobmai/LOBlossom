/** 淡い桜の木（背景装飾） */

export function CherryBlossomTree() {

  return (

    <div

      aria-hidden

      className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center overflow-visible"

    >

      <div className="relative mt-2 flex justify-center">

        <div className="absolute left-1/2 top-8 h-32 w-32 -translate-x-1/2 rounded-full bg-blossom-200/30 blur-2xl sm:top-10 sm:h-40 sm:w-40" />

        <svg

          viewBox="0 0 200 160"

          className="relative h-44 w-56 opacity-[0.32] sm:h-52 sm:w-64"

          fill="none"

        >

          <path

            d="M100 150 L100 88"

            stroke="#be185d"

            strokeWidth="3.5"

            strokeLinecap="round"

            opacity="0.6"

          />

          <path

            d="M100 110 Q70 100 60 80 Q55 65 70 58 Q85 52 100 68"

            fill="#fce7f3"

            stroke="#f472b6"

            strokeWidth="1.2"

          />

          <path

            d="M100 100 Q130 95 140 75 Q145 60 128 55 Q112 50 100 65"

            fill="#fce7f3"

            stroke="#f472b6"

            strokeWidth="1.2"

          />

          <path

            d="M100 85 Q85 70 88 55 Q92 42 100 48 Q108 42 112 55 Q115 70 100 85"

            fill="#fdf2f8"

            stroke="#ec4899"

            strokeWidth="1.2"

          />

          <circle cx="72" cy="62" r="5" fill="#fda4af" opacity="0.85" />

          <circle cx="128" cy="58" r="4.5" fill="#fda4af" opacity="0.85" />

          <circle cx="100" cy="46" r="5" fill="#f472b6" opacity="0.75" />

          <circle cx="88" cy="72" r="3.5" fill="#fecdd3" opacity="0.9" />

          <circle cx="115" cy="68" r="3.5" fill="#fecdd3" opacity="0.9" />

          <circle cx="95" cy="55" r="2.5" fill="#fb7185" opacity="0.7" />

          <circle cx="108" cy="52" r="2" fill="#fb7185" opacity="0.6" />

        </svg>

      </div>

    </div>

  );

}

