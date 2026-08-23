"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { useLead } from "./lead/LeadContext";
import { useAutoplayProgress } from "./useAutoplayProgress";

const AUTOPLAY_S = 6;

/**
 * «Спокойно» дышит: небольшое увеличение перекатывается по буквам
 * медленной волной, между волнами — долгая пауза. Буквы анимируются
 * по отдельности (aria-hidden), для скринридеров слово продублировано.
 */
const CALM_WORD = "спокойно";
const CALM_SCALE = 1.12; // «чуть больше»: заметно, но без крика
const CALM_BUMP_S = 1.4; // подъём и спад одной буквы
const CALM_STAGGER_S = 0.28; // шаг волны между соседними буквами
const CALM_REST_S = 4.6; // тишина между волнами

function CalmWord() {
  const reduce = useReducedMotion();
  if (reduce) return <span className="text-wine">{CALM_WORD}</span>;
  return (
    <>
      <span className="sr-only">{CALM_WORD}</span>
      {/* inline-block + nowrap: буквы-спаны не переносятся поодиночке,
          слово ведёт себя как единое при переносе строк */}
      <span className="inline-block whitespace-nowrap text-wine" aria-hidden>
        {[...CALM_WORD].map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block origin-bottom"
            animate={{ scale: [1, CALM_SCALE, 1] }}
            transition={{
              duration: CALM_BUMP_S,
              // первая волна стартует после въезда заголовка
              delay: 1.2 + i * CALM_STAGGER_S,
              repeat: Infinity,
              repeatDelay: CALM_REST_S,
              ease: "easeInOut",
            }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
    </>
  );
}

export function Hero({ listings }: { listings: Listing[] }) {
  const { openLead } = useLead();
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const count = listings.length;

  // лёгкий параллакс фото при прокрутке: создаёт глубину, не отвлекая
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  // карусель объектов: как в отзывах и команде — автопрокрутка с
  // прогресс-точками, паузой при наведении и уважением к reduced motion
  const [index, setIndex] = useState(0);
  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );
  const { progress, setPaused } = useAutoplayProgress({
    seconds: AUTOPLAY_S,
    targetRef: photoRef,
    advance: () => {
      if (count > 1) goTo(index + 1);
    },
    resetKey: index,
  });

  const current = listings[index];

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.65,
      delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 pb-14 pt-24 sm:px-6 lg:grid-cols-[11fr_9fr] lg:gap-14 lg:px-8 lg:pb-20 lg:pt-36">
        <div>
          <motion.p
            {...enter(0)}
            className="text-[13px] font-semibold uppercase tracking-[0.14em] text-wine"
          >
            Москва и Московская область, с 2010 года
          </motion.p>
          <motion.h1
            {...enter(0.08)}
            className="font-display mt-4 max-w-[14ch] text-[40px] font-bold leading-[1.07] sm:text-5xl sm:leading-[1.07] lg:text-[64px]"
          >
            Недвижимость: <CalmWord /> и под&nbsp;контролем
          </motion.h1>
          <motion.p
            {...enter(0.16)}
            className="mt-5 max-w-[46ch] text-base leading-relaxed text-ink-soft sm:text-lg"
          >
            Продаём, покупаем, обмениваем и сдаём жильё. Берём на себя оценку,
            продвижение, показы, переговоры, документы и сопровождение до
            передачи ключей.
          </motion.p>
          <motion.div {...enter(0.24)} className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => openLead("Продать")}
              className="inline-flex h-13 items-center rounded-full bg-wine px-7 text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgba(125,27,36,0.45)] transition-[background-color,transform] hover:bg-wine-deep active:scale-[0.98]"
            >
              Оценить объект
            </button>
            <button
              onClick={() => openLead("Купить")}
              className="inline-flex h-13 items-center rounded-full border border-ink/15 bg-surface px-7 text-base font-semibold text-ink transition-colors hover:border-ink/35 active:scale-[0.98]"
            >
              Подобрать недвижимость
            </button>
          </motion.div>
        </div>

        {current && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0, delay: 0.15 }}
          className="relative"
        >
          <div
            ref={photoRef}
            role="group"
            aria-roledescription="карусель"
            aria-label="Объекты агентства в работе"
            className="relative aspect-[4/5] max-h-[560px] w-full overflow-hidden rounded-2xl bg-ink/10"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <motion.div
              className="absolute -inset-y-[6%] inset-x-0"
              style={{ y: reduce ? "0%" : photoY }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.9, ease: "easeInOut" }}
                >
                  <Image
                    src={current.photos[0]}
                    alt={`${current.title}, ${current.address}`}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/60 to-transparent"
            />

            {count > 1 && (
              <div
                className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-ink/35 px-2.5 py-1.5 backdrop-blur-sm"
                role="group"
                aria-label="Объекты"
              >
                {listings.map((l, i) => (
                  <button
                    key={l.id}
                    type="button"
                    aria-current={index === i || undefined}
                    aria-label={`Объект ${i + 1} из ${count}: ${l.title}`}
                    onClick={() => goTo(i)}
                    className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                      index === i
                        ? "w-6 bg-white/35"
                        : "w-1.5 bg-white/55 hover:bg-white/80"
                    }`}
                  >
                    {index === i && (
                      <motion.span
                        aria-hidden
                        style={{ scaleX: reduce ? 1 : progress }}
                        className="absolute inset-0 origin-left rounded-full bg-white"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            <a
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group absolute inset-x-4 bottom-4 block rounded-xl border border-white/25 bg-white/85 p-4 backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:inset-x-5 sm:bottom-5"
            >
              {/* popLayout: старый контент растворяется поверх нового,
                  карточка при смене слайда не пустеет ни на кадр */}
              <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: "easeOut" }}
                className="flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-wine">
                    Сейчас в работе
                  </p>
                  <p className="mt-1 truncate text-[15px] font-bold leading-snug">
                    {current.title}
                  </p>
                  <p className="truncate text-[13px] text-ink-soft">
                    {current.address}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="tnum text-[15px] font-extrabold">
                    {formatPrice(current.price, current.priceNote)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-wine">
                    Смотреть
                    <ArrowUpRight
                      size={14}
                      weight="bold"
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </motion.div>
              </AnimatePresence>
            </a>
          </div>
        </motion.div>
        )}
      </div>
    </section>
  );
}
