"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { Phone } from "@phosphor-icons/react/dist/ssr";
import { phone } from "@/lib/site";
import { plural } from "@/lib/format";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import { useLead } from "./lead/LeadContext";
import cityPhoto from "@/public/photos/autumn-park.jpg";

/**
 * Первый экран — большое фото Москвы с надписями поверх (правки клиента
 * 26.10.2026). Фото снято агентством: без претензий по авторским правам.
 * Красные клёны на переднем плане перекликаются с фирменным бордовым.
 * Объекты в работе с сайта убраны, поэтому карусели больше нет.
 *
 * Факты об агентстве живут внизу первого экрана строкой предложений,
 * а не отдельной полосой крупных цифр со счётчиком: так они читаются
 * как сведения, а не как шаблонная «статистика».
 */
export function Hero({
  rating,
  cianYears,
}: {
  rating: number | null;
  cianYears: number;
}) {
  const { openLead } = useLead();
  const reduce = useReducedMotionSafe();
  const sectionRef = useRef<HTMLElement>(null);

  // лёгкий параллакс фото при прокрутке: глубина без отвлечения
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  // рейтинг может пропасть из data/agency.json: тогда факта нет
  const facts: { lead: string; rest: string }[] = [
    { lead: "С 2010 года", rest: "на рынке Москвы и области" },
    {
      lead: `${cianYears} ${plural(cianYears, "год", "года", "лет")} на ЦИАН`,
      rest: "статус «Суперагент»",
    },
    ...(rating != null
      ? [
          {
            lead: `Рейтинг ${rating.toFixed(1).replace(".", ",")}`,
            rest: "по оценкам сделок на Домклик",
          },
        ]
      : []),
    { lead: "20+ лет", rest: "опыта у команды риелторов" },
  ];

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.7,
      delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[max(680px,100svh)] items-end overflow-hidden bg-wine-ink text-white lg:min-h-[max(720px,min(100svh,1000px))]"
    >
      <motion.div
        aria-hidden
        className="absolute -inset-y-[8%] inset-x-0 -z-10"
        style={{ y: reduce ? "0%" : photoY }}
      >
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={cityPhoto}
            alt=""
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            // на узких экранах кадр смещён к клёнам и высотке за ними
            className="object-cover object-[38%_center] sm:object-center"
          />
        </motion.div>
      </motion.div>

      {/* скримы: сверху под белую шапку, снизу-слева под текст */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-ink/55 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-wine-ink/95 via-wine-ink/70 via-55% to-transparent to-90% sm:via-wine-ink/45 sm:via-45% sm:to-75%"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-wine-ink/60 via-transparent via-55% to-transparent lg:block"
      />

      <div className="mx-auto w-full max-w-[1280px] px-4 pb-10 pt-28 sm:px-6 sm:pb-14 lg:px-8 lg:pb-14 lg:pt-36">
        {/* слоган клиента со старого сайта: «ПОЗИТИВ» — игра слов с
            названием агентства. Заглавные даёт CSS, в тексте «Позитивное»:
            скринридер читает слово, а не буквы */}
        <motion.h1
          {...enter(0.15)}
          className="font-display max-w-[15ch] text-[40px] font-bold leading-[1.04] text-balance [text-shadow:0_2px_24px_rgba(51,10,15,0.35)] sm:text-6xl lg:text-[76px] xl:text-[84px]"
        >
          <span className="uppercase">Позитив</span>ное решение любого
          жилищного вопроса
        </motion.h1>

        <div className="mt-6 flex flex-col gap-8 lg:mt-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            {...enter(0.25)}
            className="max-w-[48ch] text-base leading-relaxed text-white/85 sm:text-lg"
          >
            {/* ключевые слова в видимом тексте рядом с заголовком: слоган
                клиента в H1 сам их не содержит */}
            Агентство недвижимости в Москве и Подмосковье с 2010 года.
            Продаём, покупаем и обмениваем жильё, подбираем новостройки,
            помогаем с ипотекой и ведём сделку до передачи ключей.
          </motion.p>

          <motion.div
            {...enter(0.35)}
            className="flex flex-col gap-3 sm:flex-row lg:shrink-0"
          >
            <button
              onClick={() => openLead()}
              className="flex h-14 items-center justify-center whitespace-nowrap rounded-full bg-wine px-8 text-base font-semibold text-white shadow-[0_14px_34px_-14px_rgba(0,0,0,0.6)] transition-[background-color,transform] hover:bg-wine-deep active:scale-[0.98]"
            >
              Получить консультацию
            </button>
            <a
              href={phone.href}
              className="tnum flex h-14 items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-white/40 bg-wine-ink/30 px-7 text-base font-semibold text-white transition-colors hover:border-white/70 hover:bg-wine-ink/50"
            >
              <Phone size={18} weight="bold" aria-hidden />
              {phone.display}
            </a>
          </motion.div>
        </div>

        <motion.ul
          {...enter(0.45)}
          aria-label="Об агентстве"
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/20 pt-6 text-[13px] leading-snug text-white/75 sm:text-sm lg:mt-14 lg:flex lg:gap-x-12 lg:pt-7"
        >
          {facts.map((f) => (
            <li key={f.lead} className="lg:max-w-[26ch]">
              <span className="tnum block font-semibold text-white">
                {f.lead}
              </span>
              {f.rest}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
