"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { plural } from "@/lib/format";

type Stat = {
  value: string;
  label: string;
  numeric?: number;
  suffix?: string;
};

function CountUp({ stat, start }: { stat: Stat; start: boolean }) {
  const reduce = useReducedMotion();
  // SSR и первый клиентский рендер всегда показывают итоговое значение,
  // иначе возможен hydration mismatch при reduced-motion
  const [display, setDisplay] = useState(stat.value);

  useEffect(() => {
    if (reduce || stat.numeric === undefined || !start) return;
    const target = stat.numeric;
    const dur = 900;
    let raf = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - startedAt) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(target * eased);
      setDisplay(`${v}${stat.suffix ?? ""}`);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(stat.value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, reduce, stat]);

  return <span className="tnum">{display}</span>;
}

export function TrustBar({
  dealsCount,
  rating,
  agentsCount,
  cianYears,
}: {
  dealsCount: number;
  rating: number | null;
  agentsCount: number;
  cianYears: number;
}) {
  // отсчёт стартует, когда блок цифр видen наполовину, а не когда его
  // край задел низ экрана: иначе анимация отыгрывала бы до того, как
  // пользователь реально увидел цифры. Один наблюдатель на все ячейки —
  // цифры оживают одновременно. Если порог недостижим (экстремальный
  // зум), цифры просто остаются финальными значениями.
  const listRef = useRef<HTMLDListElement>(null);
  const inView = useInView(listRef, { once: true, amount: 0.5 });

  // все цифры либо константы, либо ночной синк (Домклик), либо вычисляются
  // от даты регистрации на ЦИАН — сноска «по данным на такой-то месяц»
  // не нужна: данные не сталеют
  const yearsWord = plural(cianYears, "год", "года", "лет");
  const stats: Stat[] = [
    { value: "С 2010", label: "года на рынке недвижимости Москвы и области" },
    {
      value: `${cianYears} ${yearsWord}`,
      numeric: cianYears,
      suffix: ` ${yearsWord}`,
      label: "профиль на ЦИАН, статус «Суперагент»",
    },
    {
      value: String(dealsCount),
      numeric: dealsCount,
      label: `${plural(dealsCount, "сделка", "сделки", "сделок")} за последние 12 месяцев`,
    },
    // рейтинг из синка может пропасть: без значения ячейку не показываем
    ...(rating != null
      ? [
          {
            value: rating.toFixed(1).replace(".", ","),
            label: "рейтинг по оценкам сделок на Домклик",
          },
        ]
      : []),
    {
      value: String(agentsCount),
      numeric: agentsCount,
      label: `${plural(agentsCount, "специалист", "специалиста", "специалистов")} в команде агентства`,
    },
  ];

  return (
    <section aria-label="Ключевые показатели" className="border-y border-line bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <dl
          ref={listRef}
          className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-10 lg:py-12"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-1.5 lg:border-l lg:border-line lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
            >
              <dt className="order-2 text-[13px] leading-snug text-ink-soft">
                {s.label}
              </dt>
              <dd className="font-display order-1 text-3xl font-bold lg:text-[38px] lg:leading-none">
                <CountUp stat={s} start={inView} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
