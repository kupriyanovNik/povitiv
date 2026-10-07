"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
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
import { burstConfetti } from "./confetti";
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
  burstRef,
}: {
  icon: Icon;
  progress: MotionValue<number>;
  threshold: number;
  reduce: boolean;
  big?: boolean;
  markerRef: (el: HTMLDivElement | null) => void;
  /** точка в центре маркера, откуда вылетает конфетти */
  burstRef?: React.Ref<HTMLSpanElement>;
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
      {burstRef && (
        <span
          ref={burstRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-20"
        />
      )}
    </div>
  );
}

export function Safety() {
  const reduce = useReducedMotionSafe();
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

  // маршрут дошёл до ключей: небольшой салют, один раз за визит. Только
  // когда точка на экране: прыжок по якорю мимо секции салют не тратит
  const burstRef = useRef<HTMLSpanElement>(null);
  const celebrated = useRef(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce || celebrated.current || v < 0.999) return;
    if ((scrollYProgress.getPrevious() ?? 0) >= 0.999) return;
    const host = burstRef.current;
    if (!host) return;
    const { top } = host.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight) return;
    celebrated.current = true;
    burstConfetti(host);
  });

  // строим SVG-змейку по реальным позициям остановок (и перестраиваем при ресайзе)
  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;
    const build = () => {
      // считаем по layout-позициям (offset*), а не по getBoundingClientRect:
      // строки в момент замера могут быть сдвинуты reveal-анимацией (y: 16),
      // а offset-координаты трансформы не учитывают
      const layoutCenter = (el: HTMLElement) => {
        let x = el.offsetWidth / 2;
        let y = el.offsetHeight / 2;
        let node: HTMLElement | null = el;
        while (node && node !== container) {
          x += node.offsetLeft;
          y += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        return node === container ? { x, y } : null;
      };
      const pts = markerEls.current
        .filter((el): el is HTMLDivElement => Boolean(el))
        .map(layoutCenter)
        .filter((p): p is { x: number; y: number } => p !== null);
      if (pts.length < 2) return;
      // Маршрут идёт только по свободным коридорам, поэтому не может
      // наехать на текст ни при какой ширине экрана: вертикаль — строго
      // по оси маркеров (тексты всегда правее), горизонталь — на уровне
      // центра следующего маркера (ниже текстов предыдущего шага),
      // между ними — скруглённый поворот.
      // pathLength нормируется по фактической длине пути, поэтому пороги
      // остановок считаем по длинам сегментов, а не равными долями.
      const R_MAX = 64;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      const cumLen = [0];
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const dx = b.x - a.x;
        if (Math.abs(dx) < 1) {
          // маркеры на одной оси: обычная вертикаль
          d += ` L ${b.x} ${b.y}`;
          cumLen.push(cumLen[i - 1] + Math.hypot(dx, b.y - a.y));
          continue;
        }
        const r = Math.min(R_MAX, Math.abs(dx) / 2, Math.abs(b.y - a.y) / 2);
        const sx = Math.sign(dx);
        d += ` L ${a.x} ${b.y - r}`;
        d += ` Q ${a.x} ${b.y}, ${a.x + sx * r} ${b.y}`;
        d += ` L ${b.x} ${b.y}`;
        // длина: две прямые + четверть-дуга (сэмплируем квадратичную Безье)
        let arc = 0;
        let prev = { x: a.x, y: b.y - r };
        for (let s = 1; s <= 16; s++) {
          const t = s / 16;
          const u = 1 - t;
          const p = { x: a.x + sx * r * t * t, y: b.y - r * u * u };
          arc += Math.hypot(p.x - prev.x, p.y - prev.y);
          prev = p;
        }
        const seg =
          Math.abs(b.y - r - a.y) + arc + Math.abs(b.x - (a.x + sx * r));
        cumLen.push(cumLen[i - 1] + seg);
      }
      const total = cumLen[cumLen.length - 1] || 1;
      setGeo({
        w: container.offsetWidth,
        h: container.offsetHeight,
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
                className="mx-auto flex w-full max-w-xl items-start gap-5 sm:gap-6"
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
                burstRef={burstRef}
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
