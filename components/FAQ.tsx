"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "Сколько стоят услуги агентства?",
    a: "Стоимость зависит от типа объекта, задачи и объёма сопровождения. После первой консультации мы определим перечень работ и зафиксируем стоимость в договоре.",
  },
  {
    q: "Как определяется стоимость недвижимости?",
    a: "Мы учитываем похожие предложения, состояние объекта, расположение, документы и текущий спрос. В результате предлагаем ценовой диапазон и стратегию выхода на рынок.",
  },
  {
    q: "За какой срок можно продать объект?",
    a: "Единого честного срока для всех объектов не существует: он зависит от цены, ликвидности, готовности документов и спроса. После анализа мы предложим реалистичный сценарий и контрольные точки.",
  },
  {
    q: "Можно ли продать квартиру, которая находится в ипотеке?",
    a: "Во многих случаях да. Сначала уточняем остаток задолженности, требования банка и подходящую схему расчётов. Окончательный сценарий определяется после изучения документов.",
  },
  {
    q: "Вы проводите альтернативные сделки и обмен?",
    a: "Да. Мы связываем продажу одного объекта и покупку другого в единую последовательность, синхронизируем участников, документы и расчёты.",
  },
  {
    q: "Можно заказать только юридическое сопровождение?",
    a: "Да. Агентство оказывает отдельную услугу юридического сопровождения сделки без обязательного поиска или продажи объекта.",
  },
  {
    q: "В каких регионах вы работаете?",
    a: "Основной регион: Москва и Московская область. Возможность работы с объектом в другом регионе обсуждается отдельно.",
  },
  {
    q: "Какие документы нужны для первой консультации?",
    a: "На первом этапе документы не нужны. Достаточно описать объект, форму собственности и вашу задачу. После разговора специалист даст конкретный список.",
  },
];

function Item({
  item,
  open,
  onToggle,
}: {
  item: { q: string; a: string };
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-[17px] font-bold tracking-[-0.01em]">
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={
            reduce ? { duration: 0 } : { type: "spring", duration: 0.35, bounce: 0 }
          }
          className="shrink-0 text-pine"
        >
          <Plus size={20} weight="bold" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={
              reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }
            }
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-[68ch] pb-6 text-[15px] leading-relaxed text-ink-soft">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-20 bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[880px] px-4 sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl lg:text-[44px]">
            Частые вопросы
          </h2>
        </Reveal>
        <div className="mt-8 border-t border-line lg:mt-10">
          {ITEMS.map((item, i) => (
            <Item
              key={item.q}
              item={item}
              open={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
