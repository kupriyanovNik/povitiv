"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

type Stat = {
  value: string;
  label: string;
  numeric?: number;
  suffix?: string;
};

function CountUp({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  // SSR и первый клиентский рендер всегда показывают итоговое значение,
  // иначе возможен hydration mismatch при reduced-motion
  const [display, setDisplay] = useState(stat.value);

  useEffect(() => {
    if (reduce || stat.numeric === undefined || !inView) return;
    const target = stat.numeric;
    const dur = 900;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(target * eased);
      setDisplay(`${v}${stat.suffix ?? ""}`);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(stat.value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, stat]);

  return (
    <span ref={ref} className="tnum">
      {display}
    </span>
  );
}

export function TrustBar({
  dealsCount,
  rating,
  agentsCount,
  updatedAt,
}: {
  dealsCount: number;
  rating: number;
  agentsCount: number;
  updatedAt: string;
}) {
  const stats: Stat[] = [
    { value: "С 2010", label: "года на рынке недвижимости Москвы и области" },
    { value: "14 лет", numeric: 14, suffix: " лет", label: "профиль на ЦИАН, статус «Суперагент»" },
    {
      value: String(dealsCount),
      numeric: dealsCount,
      label: "сделок за последние 12 месяцев",
    },
    {
      value: rating.toFixed(1).replace(".", ","),
      label: "рейтинг по оценкам сделок на Домклик",
    },
    {
      value: String(agentsCount),
      numeric: agentsCount,
      label: "специалистов в команде агентства",
    },
  ];

  const updated = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(new Date(updatedAt));

  return (
    <section aria-label="Ключевые показатели" className="border-y border-line bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-10 lg:py-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-1.5 lg:border-l lg:border-line lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
            >
              <dt className="order-2 text-[13px] leading-snug text-ink-soft">
                {s.label}
              </dt>
              <dd className="font-display order-1 text-3xl font-bold lg:text-[38px] lg:leading-none">
                <CountUp stat={s} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-line py-3.5 text-xs text-ink-soft">
          По данным открытых профилей агентства на ЦИАН и Домклик, {updated}.
        </p>
      </div>
    </section>
  );
}
