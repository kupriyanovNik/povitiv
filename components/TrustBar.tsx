"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import { plural } from "@/lib/format";

type Stat = {
  value: string;
  label: string;
  numeric?: number;
  /** промежуточные значения отсчёта: склонение меняется с числом */
  format?: (v: number) => string;
};

const yearsWord = (n: number) => plural(n, "год", "года", "лет");

/**
 * static — показываем итог без анимации (цифры уже были на экране при
 * загрузке или включено уменьшение движения); armed — блок ниже экрана,
 * цифры заранее стоят на нуле; run — блок показался, идёт отсчёт.
 */
type Phase = "static" | "armed" | "run";

function CountUp({ stat, phase }: { stat: Stat; phase: Phase }) {
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    if (phase !== "run" || stat.numeric === undefined) return;
    const target = stat.numeric;
    const dur = 900;
    let raf = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - startedAt) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setCurrent(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, stat]);

  let display = stat.value;
  if (stat.numeric !== undefined && phase !== "static") {
    const v = phase === "armed" ? 0 : (current ?? 0);
    display = v >= stat.numeric ? stat.value : (stat.format?.(v) ?? String(v));
  }
  return <span className="tnum">{display}</span>;
}

export function TrustBar({
  rating,
  cianYears,
}: {
  rating: number | null;
  cianYears: number;
}) {
  // SSR и первый клиентский рендер показывают итоговые цифры (иначе
  // hydration mismatch). Сброс до нуля пользователь видеть не должен:
  // если блок хоть краем виден при загрузке, анимации нет вовсе; если он
  // ниже экрана, цифры обнуляются заранее, пока их не видно, и отсчёт
  // идёт, как только блок показался снизу. Один наблюдатель на все
  // ячейки — цифры оживают одновременно.
  const reduce = useReducedMotionSafe();
  const listRef = useRef<HTMLDListElement>(null);
  const [armed, setArmed] = useState(false);
  const inView = useInView(listRef, { once: true, margin: "0px 0px -10% 0px" });

  useEffect(() => {
    const el = listRef.current;
    if (reduce || !el) return;
    if (el.getBoundingClientRect().top >= window.innerHeight) setArmed(true);
  }, [reduce]);

  // reduce учитываем и здесь: при гидрации он ещё false (серверный
  // снимок), и эффект мог успеть «взвести» отсчёт
  const phase: Phase = reduce || !armed ? "static" : inView ? "run" : "armed";

  // все цифры либо константы, либо data/agency.json (рейтинг Домклик),
  // либо вычисляются от даты регистрации на ЦИАН
  const stats: Stat[] = [
    { value: "С 2010", label: "года на рынке недвижимости Москвы и области" },
    {
      value: `${cianYears} ${yearsWord(cianYears)}`,
      numeric: cianYears,
      format: (v) => `${v} ${yearsWord(v)}`,
      label: "профиль на ЦИАН, статус «Суперагент»",
    },
    // рейтинга может не быть в данных: без значения ячейку не показываем
    ...(rating != null
      ? [
          {
            value: rating.toFixed(1).replace(".", ","),
            label: "рейтинг по оценкам сделок на Домклик",
          },
        ]
      : []),
    // формулировка клиента (04.10.2026) вместо числа сделок и размера команды
    {
      value: "20+ лет",
      numeric: 20,
      format: (v) => `${v}+ ${yearsWord(v)}`,
      label: "опыт профессиональной команды риелторов",
    },
  ];

  return (
    <section aria-label="Ключевые показатели" className="border-y border-line bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <dl
          ref={listRef}
          className={`grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:gap-x-10 lg:py-12 ${
            stats.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
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
                <CountUp stat={s} phase={phase} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
