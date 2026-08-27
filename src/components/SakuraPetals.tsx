"use client";

import { useEffect, useState } from "react";

const PETALS = [
  { left: "20%", delay: "0ms", rotate: "15deg" },
  { left: "40%", delay: "80ms", rotate: "-10deg" },
  { left: "60%", delay: "160ms", rotate: "20deg" },
  { left: "75%", delay: "120ms", rotate: "-5deg" },
  { left: "50%", delay: "200ms", rotate: "10deg" },
];

export function SakuraPetals({ active }: { active: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="sakura-petals pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="sakura-petal absolute top-1/3 h-2 w-2 rounded-full bg-blossom-300 opacity-80"
          style={{
            left: p.left,
            animationDelay: p.delay,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  );
}
