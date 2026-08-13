"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

/**
 * Фото-карусель с 1:1 перетаскиванием и пружинной доводкой.
 * Свайп учитывает скорость отпускания: слайд «добрасывается» по инерции.
 */
export function PhotoCarousel({
  photos,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  photos: string[];
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
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

  if (count === 0) return null;

  return (
    <div
      ref={viewportRef}
      role="group"
      aria-roledescription="карусель"
      aria-label={alt}
      className={`group/carousel relative overflow-hidden ${className}`}
    >
      <motion.div
        className="flex h-full"
        style={{ x }}
        drag={count > 1 ? "x" : false}
        dragConstraints={{ left: -(count - 1) * width, right: 0 }}
        dragElastic={0.12}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          // проекция точки остановки по скорости, затем ближайший слайд
          const projected = -x.get() - info.velocity.x * 0.18;
          goTo(Math.round(projected / width), info.velocity.x);
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
            role="tablist"
            aria-label="Фотографии"
          >
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={index === i}
                aria-label={`Фото ${i + 1} из ${count}`}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === i ? "w-5 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
