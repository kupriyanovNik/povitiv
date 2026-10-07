"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { useLead } from "./lead/LeadContext";
import { useAutoplayProgress } from "./useAutoplayProgress";

// чуть бодрее отзывов (6 с): карточка объекта читается за пару секунд,
// а посетитель успевает увидеть больше объектов до скролла
const AUTOPLAY_S = 4.5;

export function Hero({ listings }: { listings: Listing[] }) {
  const { openLead } = useLead();
  const reduce = useReducedMotionSafe();
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const count = listings.length;

  // лёгкий параллакс фото при прокрутке: создаёт глубину, не отвлекая
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  // настоящая карусель объектов, как PhotoCarousel и отзывы: слайды
  // (фото + карточка едины) тянутся мышью или пальцем со свайп-инерцией,
  // автопрокрутка с прогресс-точками, пауза при наведении и перетаскивании
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    const el = photoRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    setWidth(el.clientWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback(
    (next: number, velocity = 0) => {
      const clamped = ((next % count) + count) % count;
      setIndex(clamped);
      animate(x, -clamped * width, {
        type: "spring",
        duration: reduce ? 0 : 0.55,
        bounce: 0,
        velocity,
      });
    },
    [count, width, x, reduce],
  );

  // при ресайзе держим текущий слайд на месте
  useEffect(() => {
    x.set(-index * width);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const { progress, setPaused } = useAutoplayProgress({
    seconds: AUTOPLAY_S,
    targetRef: photoRef,
    advance: () => {
      if (count > 1) goTo(index + 1);
    },
    resetKey: index,
  });

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
          {/* география — в подзаголовке, «с 2010 года» — в TrustBar ниже:
              строка-кикер над заголовком дублировала обе и выглядела шаблонно */}
          {/* слоган клиента со старого сайта (замечания 02.10.2026, п. 3):
              «ПОЗИТИВ» — игра слов с названием агентства. Заглавные даёт
              CSS, в тексте «Позитивное»: скринридер читает слово, а не буквы */}
          <motion.h1
            {...enter(0)}
            className="font-display max-w-[17ch] text-[38px] font-bold leading-[1.08] text-balance sm:text-5xl sm:leading-[1.07] lg:text-[52px] xl:text-[60px]"
          >
            <span className="uppercase text-wine">Позитив</span>ное решение
            любого жилищного вопроса
          </motion.h1>
          {/* max-w живёт на обёртке с типографикой абзаца, поэтому кнопка
              и текст совпадают по ширине на любом брейкпоинте (ch зависит
              от шрифта: у кнопки и абзаца он разный) */}
          <div className="max-w-[46ch] text-base sm:text-lg">
            <motion.p
              {...enter(0.08)}
              className="mt-5 leading-relaxed text-ink-soft"
            >
              {/* «агентство недвижимости в Москве и Подмосковье» — ключевые
                  слова в видимом тексте рядом с заголовком: слоган клиента
                  в H1 сам их не содержит */}
              Агентство недвижимости в Москве и Подмосковье. Продаём,
              покупаем, обмениваем и сдаём жильё, берём на себя оценку,
              продвижение, показы, переговоры, документы и сопровождение до
              передачи ключей.
            </motion.p>
            {/* одна кнопка вместо пары «Оценить/Подобрать»: на узких экранах
                и при крупном масштабе две разъезжались на строки; задачу
                посетитель выбирает в модалке */}
            <motion.div {...enter(0.16)} className="mt-8">
              <button
                onClick={() => openLead()}
                className="flex h-13 w-full items-center justify-center rounded-full bg-wine px-8 text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgba(125,27,36,0.45)] transition-[background-color,transform] hover:bg-wine-deep active:scale-[0.98]"
              >
                Получить консультацию
              </button>
            </motion.div>
          </div>
        </div>

        {count > 0 && (
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
            {/* absolute inset-0, а не h-full: в Safari проценты высоты внутри
                aspect-ratio + max-height считаются от aspect-высоты без учёта
                клампа — трек вырастал выше контейнера и карточки срезались */}
            <motion.div
              className="absolute inset-0 flex cursor-grab active:cursor-grabbing"
              style={{ x }}
              drag={count > 1 ? "x" : false}
              dragConstraints={{ left: -(count - 1) * width, right: 0 }}
              dragElastic={0.12}
              dragMomentum={false}
              onDragStart={() => setPaused(true)}
              onDragEnd={(_, info) => {
                // проекция точки остановки по скорости, затем ближайший слайд
                const projected = -x.get() - info.velocity.x * 0.18;
                goTo(
                  Math.max(
                    0,
                    Math.min(count - 1, Math.round(projected / width)),
                  ),
                  info.velocity.x,
                );
                setPaused(false);
              }}
            >
              {listings.map((l, i) => (
                <div key={l.id} className="relative h-full w-full shrink-0">
                  {/* параллакс — внутри слайда, чтобы карточка не уезжала
                      вместе с фото при прокрутке страницы */}
                  <motion.div
                    className="absolute -inset-y-[6%] inset-x-0"
                    style={{ y: reduce ? "0%" : photoY }}
                  >
                    <Image
                      src={l.photos[0]}
                      alt={`${l.title}, ${l.address}`}
                      fill
                      priority={i === 0}
                      // соседние слайды спрятаны за overflow: ленивую
                      // загрузку выключаем, чтобы свайп не показывал пустоту
                      loading="eager"
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      draggable={false}
                      className="pointer-events-none select-none object-cover"
                    />
                  </motion.div>
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/60 to-transparent"
                  />
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group absolute inset-x-4 bottom-4 block rounded-xl border border-white/25 bg-white/85 p-4 backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:inset-x-5 sm:bottom-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-wine">
                          Сейчас в работе
                        </p>
                        <p className="mt-1 truncate text-[15px] font-bold leading-snug">
                          {l.title}
                        </p>
                        <p className="truncate text-[13px] text-ink-soft">
                          {l.address}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="tnum text-[15px] font-extrabold">
                          {formatPrice(l.price, l.priceNote)}
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
                    </div>
                  </a>
                </div>
              ))}
            </motion.div>

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

          </div>
        </motion.div>
        )}
      </div>
    </section>
  );
}
