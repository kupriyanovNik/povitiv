"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { LeadTask } from "@/lib/site";
import { useLead } from "./lead/LeadContext";
import whiteTower from "@/public/photos/white-tower.jpg";
import entrance from "@/public/photos/entrance.jpg";
import towersUp from "@/public/photos/towers-up.jpg";
import brick from "@/public/photos/brick.jpg";
import embankment from "@/public/photos/embankment.jpg";
import courtyard from "@/public/photos/courtyard.jpg";

/**
 * Услуги на фотографиях недвижимости (правки клиента 26.10.2026): аренды
 * больше нет, добавлены новостройки. Фото сняты агентством.
 */
type TaskCard = {
  task: LeadTask;
  title: string;
  text: string;
  cta: string;
  photo: StaticImageData;
  /** фокус кадра при обрезке: здания в кадре стоят по-разному */
  focus?: string;
};

const PRIMARY: TaskCard[] = [
  {
    task: "Продать",
    title: "Продать недвижимость",
    text: "Определим рыночную цену, подготовим объект, запустим продвижение, организуем показы и проведём переговоры с покупателями.",
    cta: "Оценить и продать",
    photo: whiteTower,
    focus: "object-[center_30%]",
  },
  {
    task: "Купить",
    title: "Купить недвижимость",
    text: "Подберём варианты под ваш бюджет и задачу, проверим документы, согласуем условия и сопроводим расчёты и регистрацию.",
    cta: "Подобрать вариант",
    photo: entrance,
  },
];

const SECONDARY: TaskCard[] = [
  {
    task: "Новостройка",
    title: "Новостройки",
    text: "Поможем выбрать квартиру в новостройке в Москве и Московской области, оформить документы и провести сделку без лишних затрат. Работаем только с проверенными застройщиками и гарантируем юридическую чистоту сделки.",
    cta: "Подобрать новостройку",
    photo: towersUp,
    focus: "object-[center_35%]",
  },
  {
    task: "Обменять",
    title: "Обменять или разъехаться",
    text: "Свяжем продажу и покупку в одну последовательную схему: участники, документы, расчёты.",
    cta: "Обсудить обмен",
    photo: brick,
    focus: "object-[center_25%]",
  },
  {
    task: "Сопровождение",
    title: "Ипотека и рефинансирование",
    text: "Поможем собрать документы и встроим банковские этапы в общий процесс сделки.",
    cta: "Спросить про ипотеку",
    // фото клиента (28.10.2026) вместо слишком тёмной ночной высотки;
    // кадр горизонтальный, фокус на домах, вывески справа за кадром
    photo: embankment,
    focus: "object-[64%_center]",
  },
  {
    task: "Другое",
    title: "Нестандартная задача",
    text: "Субсидии, сертификаты, приватизация, срочный выкуп и отдельное юридическое сопровождение.",
    cta: "Рассказать о ситуации",
    photo: courtyard,
    focus: "object-[center_35%]",
  },
];

/**
 * Ширина картинки для srcset. Вертикальный кадр в карточке тянется по
 * ширине, а горизонтальный — по высоте, и тогда реальная ширина больше
 * ширины карточки: считаем её от высоты (карточки до ~480px), иначе
 * браузер берёт слишком маленький файл и растягивает его.
 */
function photoSizes(photo: StaticImageData, lg: boolean) {
  const byWidth = lg
    ? "(min-width: 768px) 50vw, 100vw"
    : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";
  if (photo.width <= photo.height) return byWidth;
  return `${Math.round((480 * photo.width) / photo.height)}px`;
}

function PhotoCard({
  card,
  size,
  onClick,
}: {
  card: TaskCard;
  size: "lg" | "sm";
  onClick: () => void;
}) {
  const lg = size === "lg";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={card.cta}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", duration: 0.35, bounce: 0 }}
      className={`group relative isolate flex w-full flex-col justify-end overflow-hidden rounded-2xl bg-wine-ink text-left text-white ${
        lg ? "min-h-[380px] p-6 sm:min-h-[460px] sm:p-8" : "min-h-[420px] p-6"
      }`}
    >
      <Image
        src={card.photo}
        alt=""
        fill
        placeholder="blur"
        sizes={photoSizes(card.photo, lg)}
        className={`-z-10 object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] ${card.focus ?? ""}`}
      />
      {/* скрим держит контраст белого текста на любом кадре */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-wine-ink via-wine-ink/70 to-wine-ink/0"
      />
      <h3
        className={`font-bold tracking-[-0.01em] ${
          lg ? "text-[28px] leading-tight sm:text-[32px]" : "text-xl leading-snug"
        }`}
      >
        {card.title}
      </h3>
      <p
        className={`mt-2 leading-relaxed text-white/85 ${
          lg ? "max-w-[46ch] text-[15px] sm:text-base" : "text-sm"
        }`}
      >
        {card.text}
      </p>
      <span
        className={`mt-5 inline-flex items-center gap-2 font-semibold ${
          lg ? "text-[15px]" : "text-sm"
        }`}
      >
        {card.cta}
        <ArrowRight
          size={lg ? 16 : 14}
          weight="bold"
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </motion.button>
  );
}

export function Tasks() {
  const { openLead } = useLead();

  return (
    <section id="uslugi" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-display max-w-[24ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            С какой задачей вам помочь?
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Выберите направление. Мы разберём ситуацию, предложим подходящий
            сценарий и объясним следующие шаги.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-12">
          {PRIMARY.map((card) => (
            <PhotoCard
              key={card.title}
              card={card}
              size="lg"
              onClick={() => openLead(card.task)}
            />
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECONDARY.map((card) => (
            <PhotoCard
              key={card.title}
              card={card}
              size="sm"
              onClick={() => openLead(card.task)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
