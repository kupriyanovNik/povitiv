"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useMotionValue } from "motion/react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useAutoplayProgress } from "./useAutoplayProgress";

// хук автопрокрутки нельзя вызывать условно, поэтому в «ручном» режиме он
// просто крутит суточный таймер, чей advance ни на что не влияет
const AUTOPLAY_OFF_S = 86_400;

/**
 * Фото-карусель с 1:1 перетаскиванием и пружинной доводкой.
 * Свайп учитывает скорость отпускания: слайд «добрасывается» по инерции.
 * autoplaySeconds включает автопрокрутку; когда круг фотографий пройден,
 * зовётся onLoop — вернув true, родитель сообщает, что сменил контент
 * (карусель размонтируется по key), иначе она сама вернётся к первому фото.
 */
export function PhotoCarousel({
  photos,
  alt,
  sizes,
  priority = false,
  className = "",
  autoplaySeconds,
  onLoop,
}: {
  photos: string[];
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  autoplaySeconds?: number;
  onLoop?: () => boolean | void;
}) {
  const reduce = useReducedMotionSafe();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);
  const count = photos.length;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback(
    (next: number, velocity = 0) => {
      const clamped = Math.max(0, Math.min(count - 1, next));
      setIndex(clamped);
      animate(x, -clamped * width, {
        type: "spring",
        duration: reduce ? 0 : 0.5,
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

  // автоплей: пауза при наведении и перетаскивании; cycle в resetKey
  // перезапускает таймер и когда индекс не изменился (одно фото по кругу)
  const [cycle, setCycle] = useState(0);
  const autoAdvance = useCallback(() => {
    if (autoplaySeconds == null) return;
    setCycle((c) => c + 1);
    if (index < count - 1) {
      goTo(index + 1);
      return;
    }
    // круг пройден: родитель либо меняет объект, либо крутим сначала
    if (!onLoop?.()) goTo(0);
  }, [autoplaySeconds, index, count, goTo, onLoop]);

  const { progress, setPaused } = useAutoplayProgress({
    seconds: autoplaySeconds ?? AUTOPLAY_OFF_S,
    targetRef: viewportRef,
    advance: autoAdvance,
    resetKey: cycle * 100 + index,
  });

  if (count === 0) return null;

  return (
    <div
      ref={viewportRef}
      role="group"
      aria-roledescription="карусель"
      aria-label={alt}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={`group/carousel relative overflow-hidden ${className}`}
    >
      <motion.div
        className="flex h-full"
        style={{ x }}
        drag={count > 1 ? "x" : false}
        dragConstraints={{ left: -(count - 1) * width, right: 0 }}
        dragElastic={0.12}
        dragMomentum={false}
        onDragStart={() => setPaused(true)}
        onDragEnd={(_, info) => {
          // проекция точки остановки по скорости, затем ближайший слайд
          const projected = -x.get() - info.velocity.x * 0.18;
          goTo(Math.round(projected / width), info.velocity.x);
          setPaused(false);
        }}
      >
        {photos.map((src, i) => (
          <div key={src} className="relative h-full w-full shrink-0">
            <Image
              src={src}
              alt={i === 0 ? alt : `${alt}, фото ${i + 1}`}
              fill
              sizes={sizes}
              priority={priority && i === 0}
              draggable={false}
              className="pointer-events-none select-none object-cover"
            />
          </div>
        ))}
      </motion.div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Предыдущее фото"
            disabled={index === 0}
            onClick={(e) => {
              e.preventDefault();
              goTo(index - 1);
            }}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink opacity-0 shadow-md backdrop-blur-sm transition-opacity hover:bg-white focus-visible:opacity-100 disabled:!opacity-0 group-hover/carousel:opacity-100"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            aria-label="Следующее фото"
            disabled={index === count - 1}
            onClick={(e) => {
              e.preventDefault();
              goTo(index + 1);
            }}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink opacity-0 shadow-md backdrop-blur-sm transition-opacity hover:bg-white focus-visible:opacity-100 disabled:!opacity-0 group-hover/carousel:opacity-100"
          >
            <CaretRight size={16} weight="bold" />
          </button>
          <div
            className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-ink/35 px-2.5 py-1.5 backdrop-blur-sm"
            role="group"
            aria-label="Фотографии"
          >
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-current={index === i || undefined}
                aria-label={`Фото ${i + 1} из ${count}`}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(i);
                }}
                className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                  index === i
                    ? autoplaySeconds != null
                      ? "w-6 bg-white/35"
                      : "w-5 bg-white"
                    : "w-1.5 bg-white/55 hover:bg-white/80"
                }`}
              >
                {/* при автоплее активная точка заполняется ходом таймера */}
                {index === i && autoplaySeconds != null && (
                  <motion.span
                    aria-hidden
                    style={{ scaleX: reduce ? 1 : progress }}
                    className="absolute inset-0 origin-left rounded-full bg-white"
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
