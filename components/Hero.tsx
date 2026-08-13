"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Listing } from "@/lib/data";
import { formatPrice } from "@/lib/data";
import { useLead } from "./lead/LeadContext";

export function Hero({ featured }: { featured: Listing }) {
  const { openLead } = useLead();

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
    <section className="relative overflow-hidden">
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
            Недвижимость: <span className="text-wine">спокойно</span> и
            под&nbsp;контролем
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

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0, delay: 0.15 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] max-h-[560px] w-full overflow-hidden rounded-2xl">
            <Image
              src={featured.photos[0]}
              alt={`${featured.title}, ${featured.address}`}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/60 to-transparent"
            />
            <a
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-xl border border-white/25 bg-white/85 p-4 backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:inset-x-5 sm:bottom-5"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-wine">
                  Сейчас в работе
                </p>
                <p className="mt-1 truncate text-[15px] font-bold leading-snug">
                  {featured.title}
                </p>
                <p className="truncate text-[13px] text-ink-soft">
                  {featured.address}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="tnum text-[15px] font-extrabold">
                  {formatPrice(featured.price, featured.priceNote)}
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
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
