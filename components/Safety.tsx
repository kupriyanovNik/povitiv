"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  ChatsCircle,
  FileMagnifyingGlass,
  Handshake,
  Key,
  Keyhole,
  Scales,
  Signature,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Reveal } from "./Reveal";

const POINTS: { icon: Icon; title: string; text: string }[] = [
  {
    icon: Signature,
    title: "Работаем по договору",
    text: "Заранее фиксируем объём услуг, ответственность сторон и размер вознаграждения.",
  },
  {
    icon: FileMagnifyingGlass,
    title: "Проверяем исходные документы",
    text: "Анализируем документы на объект и участников до ключевых договорённостей.",
  },
  {
    icon: Scales,
    title: "Согласовываем схему сделки",
    text: "Определяем последовательность подписания, расчётов, банковских процедур и регистрации.",
  },
  {
    icon: Handshake,
    title: "Фиксируем условия",
    text: "Цена, сроки и состав имущества закрепляются документально.",
  },
  {
    icon: Keyhole,
    title: "Сопровождаем до передачи объекта",
    text: "Координируем регистрацию, расчёты и передачу ключей, а не заканчиваем на подписании.",
  },
  {
    icon: ChatsCircle,
    title: "Объясняем решения",
    text: "Вы понимаете, что происходит сейчас, зачем нужен каждый документ и каким будет следующий шаг.",
  },
];

const ANCHORS = POINTS.length + 1; // шаги + финальная точка «ключи»

/** Остановка маршрута: иконка в круге, заливается бордовым, когда тропа доходит. */
function StopMarker({
  icon: IconCmp,
  progress,
  threshold,
  reduce,
  big = false,
  markerRef,
}: {
  icon: Icon;
  progress: MotionValue<number>;
  threshold: number;
  reduce: boolean;
  big?: boolean;
  markerRef: (el: HTMLDivElement | null) => void;
}) {
  const fill = useTransform(
    progress,
    [Math.max(0, threshold - 0.015), Math.min(1, threshold + 0.015)],
    [0, 1],
  );
  const size = big ? "h-16 w-16" : "h-12 w-12";
  const iconSize = big ? 28 : 22;
  return (
    <div
      ref={markerRef}
      className={`relative z-10 flex ${size} shrink-0 items-center justify-center rounded-full border border-line bg-surface shadow-[0_2px_10px_-4px_rgba(33,29,28,0.2)]`}
    >
      <IconCmp size={iconSize} weight="duotone" className="text-wine" />
      <motion.span
        aria-hidden
        style={{ opacity: reduce ? 1 : fill }}
        className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-wine"
      >
        <IconCmp size={iconSize} weight="duotone" className="text-white" />
      </motion.span>
    </div>
  );
}

export function Safety() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const markerEls = useRef<(HTMLDivElement | null)[]>([]);
  const [geo, setGeo] = useState<{
    w: number;
    h: number;
    d: string;
    thresholds: number[];
  } | null>(null);

  // тропа прорисовывается по мере прокрутки секции
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.72", "end 0.72"],
  });

  // строим SVG-змейку по реальным позициям остановок (и перестраиваем при ресайзе)
  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;
    const build = () => {
      const crect = container.getBoundingClientRect();
      const pts = markerEls.current
        .filter(Boolean)
        .map((el) => {
          const r = el!.getBoundingClientRect();
          return {
            x: r.left - crect.left + r.width / 2,
            y: r.top - crect.top + r.height / 2,
          };
        });
      if (pts.length < 2) return;
      // pathLength нормируется по фактической длине кривой, поэтому пороги
      // остановок считаем по длинам дуг сегментов, а не равными долями
      const cubic = (
        a: { x: number; y: number },
        c1: { x: number; y: number },
        c2: { x: number; y: number },
        b: { x: number; y: number },
        t: number,
      ) => {
        const u = 1 - t;
        return {
          x:
            u * u * u * a.x +
            3 * u * u * t * c1.x +
            3 * u * t * t * c2.x +
            t * t * t * b.x,
          y:
            u * u * u * a.y +
            3 * u * u * t * c1.y +
            3 * u * t * t * c2.y +
            t * t * t * b.y,
        };
      };
      let d = `M ${pts[0].x} ${pts[0].y}`;
      const cumLen = [0];
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        // глубокие контрольные точки: линия дольше идёт вниз и огибает текст
        const dip = (b.y - a.y) * 0.68;
        const c1 = { x: a.x, y: a.y + dip };
        const c2 = { x: b.x, y: b.y - dip };
        d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
        let seg = 0;
        let prev = a;
        for (let s = 1; s <= 32; s++) {
          const p = cubic(a, c1, c2, b, s / 32);
          seg += Math.hypot(p.x - prev.x, p.y - prev.y);
          prev = p;
        }
        cumLen.push(cumLen[i - 1] + seg);
      }
      const total = cumLen[cumLen.length - 1] || 1;
      setGeo({
        w: crect.width,
        h: crect.height,
        d,
        thresholds: cumLen.map((v) => v / total),
      });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display max-w-[22ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Критические этапы сделки под контролем
          </h2>
          <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Недвижимость связана с крупными расчётами, документами и несколькими
            участниками. Мы ведём вас по понятному маршруту: шаг за шагом, до
            самых ключей.
          </p>
        </Reveal>

        <div ref={trackRef} className="relative mt-14 lg:mt-16">
          {/* тропа: пунктир как маршрут на карте + бордовая прорисовка */}
          {geo && (
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0"
              width={geo.w}
              height={geo.h}
              viewBox={`0 0 ${geo.w} ${geo.h}`}
              fill="none"
            >
              <path
                d={geo.d}
                stroke="var(--line)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1 8"
              />
              <motion.path
                d={geo.d}
                stroke="var(--wine)"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ pathLength: reduce ? 1 : scrollYProgress }}
              />
            </svg>
          )}

          <div className="space-y-14 lg:space-y-20">
            {POINTS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`flex items-start gap-5 sm:gap-6 md:w-[46%] ${
                  i % 2 === 1 ? "md:ml-[54%]" : ""
                }`}
              >
                <StopMarker
                  key={`m-${(geo?.thresholds[i] ?? i / (ANCHORS - 1)).toFixed(4)}`}
                  icon={p.icon}
                  progress={scrollYProgress}
                  threshold={geo?.thresholds[i] ?? i / (ANCHORS - 1)}
                  reduce={Boolean(reduce)}
                  markerRef={(el) => {
                    markerEls.current[i] = el;
                  }}
                />
                <div className="pt-1.5">
                  <h3 className="text-lg font-bold tracking-[-0.01em]">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 max-w-[46ch] text-[15px] leading-relaxed text-ink-soft">
                    {p.text}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* конечная точка маршрута */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3 pt-2 text-center"
            >
              <StopMarker
                icon={Key}
                progress={scrollYProgress}
                threshold={1}
                reduce={Boolean(reduce)}
                big
                markerRef={(el) => {
                  markerEls.current[POINTS.length] = el;
                }}
              />
              <div>
                <p className="font-display text-xl font-bold">Ключи у вас</p>
                <p className="mt-1 max-w-[42ch] text-sm text-ink-soft">
                  Сделка завершена: расчёты проведены, объект передан. Мы рядом
                  на каждом из этих шагов
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
