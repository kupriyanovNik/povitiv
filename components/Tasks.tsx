"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { LeadTask } from "@/lib/site";
import { useLead } from "./lead/LeadContext";
import { Reveal } from "./Reveal";

type TaskCard = {
  task: LeadTask;
  title: string;
  text: string;
  cta: string;
};

const PRIMARY: TaskCard[] = [
  {
    task: "Продать",
    title: "Продать объект",
    text: "Определим рыночную цену, подготовим объект, запустим продвижение, организуем показы и проведём переговоры с покупателями.",
    cta: "Продать недвижимость",
  },
  {
    task: "Купить",
    title: "Купить объект",
    text: "Подберём варианты под ваш бюджет и задачу, проверим документы, согласуем условия и сопроводим расчёты и регистрацию.",
    cta: "Подобрать недвижимость",
  },
];

const SECONDARY: TaskCard[] = [
  {
    task: "Сдать",
    title: "Сдать или снять",
    text: "Найдём подходящего арендатора или объект, организуем показы и подготовим договор.",
    cta: "Решить вопрос с арендой",
  },
  {
    task: "Обменять",
    title: "Обменять или разъехаться",
    text: "Свяжем продажу и покупку в одну последовательную схему: участники, документы, расчёты.",
    cta: "Обсудить обмен",
  },
  {
    task: "Сопровождение",
    title: "Ипотека и рефинансирование",
    text: "Поможем собрать документы и встроим банковские этапы в общий процесс сделки.",
    cta: "Спросить про ипотеку",
  },
  {
    task: "Другое",
    title: "Нестандартная задача",
    text: "Субсидии, сертификаты, приватизация, срочный выкуп и отдельное юридическое сопровождение.",
    cta: "Рассказать о ситуации",
  },
];

function CardShell({
  children,
  onClick,
  className,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className: string;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", duration: 0.35, bounce: 0 }}
      className={`group flex flex-col justify-between rounded-2xl p-6 text-left sm:p-7 ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Tasks({ photo }: { photo: string }) {
  const { openLead } = useLead();

  return (
    <section id="uslugi" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display max-w-[24ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            С какой задачей вам помочь?
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Выберите направление. Мы разберём ситуацию, предложим подходящий
            сценарий и объясним следующие шаги.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-12">
          <CardShell
            onClick={() => openLead("Продать")}
            label="Продать недвижимость"
            className="relative min-h-[280px] overflow-hidden bg-wine-ink text-white"
          >
            <Image
              src={photo}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover opacity-35 transition-opacity duration-500 group-hover:opacity-45"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-wine-ink via-wine-ink/55 to-transparent"
            />
            <div className="relative mt-auto">
              <h3 className="text-2xl font-bold tracking-[-0.01em]">
                {PRIMARY[0].title}
              </h3>
              <p className="mt-2 max-w-[44ch] text-[15px] leading-relaxed text-white/85">
                {PRIMARY[0].text}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-white">
                {PRIMARY[0].cta}
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </CardShell>

          <CardShell
            onClick={() => openLead("Купить")}
            label="Купить недвижимость"
            className="min-h-[280px] bg-wine-tint"
          >
            <div className="mt-auto">
              <h3 className="text-2xl font-bold tracking-[-0.01em]">
                {PRIMARY[1].title}
              </h3>
              <p className="mt-2 max-w-[44ch] text-[15px] leading-relaxed text-ink-soft">
                {PRIMARY[1].text}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-wine">
                {PRIMARY[1].cta}
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </CardShell>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECONDARY.map((card) => (
            <CardShell
              key={card.title}
              onClick={() => openLead(card.task)}
              label={card.cta}
              className="border border-line bg-surface"
            >
              <div>
                <h3 className="text-lg font-bold leading-snug tracking-[-0.01em]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {card.text}
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-wine">
                {card.cta}
                <ArrowRight
                  size={14}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </CardShell>
          ))}
        </div>
      </div>
    </section>
  );
}
