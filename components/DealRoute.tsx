"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useLead } from "./lead/LeadContext";
import { Reveal } from "./Reveal";

const STEPS: { title: string; text: string }[] = [
  {
    title: "Анализ рынка и оценка",
    text: "Изучаем похожие предложения, спрос, состояние объекта и документы. Называем обоснованный ценовой диапазон.",
  },
  {
    title: "Стратегия",
    text: "Согласовываем цену, сроки и порядок действий до начала активной работы.",
  },
  {
    title: "Подготовка объекта",
    text: "Собираем сильное описание и решаем, как лучше представить объект покупателям.",
  },
  {
    title: "Размещение и продвижение",
    text: "Публикуем объект на профильных площадках, следим за откликами и корректируем стратегию.",
  },
  {
    title: "Поиск и показы",
    text: "Отбираем подходящих покупателей или варианты, проводим показы и собираем обратную связь.",
  },
  {
    title: "Переговоры",
    text: "Обсуждаем цену и условия, отстаиваем ваши интересы и фиксируем договорённости.",
  },
  {
    title: "Документы и расчёты",
    text: "Проверяем документы и согласовываем безопасную схему расчётов.",
  },
  {
    title: "Регистрация и передача",
    text: "Сопровождаем подписание, регистрацию перехода права и передачу ключей.",
  },
];

export function DealRoute() {
  const { openLead } = useLead();
  const reduce = useReducedMotion();
  // линия-маршрут появляется только после маунта: на сервере её нет,
  // поэтому нет и hydration mismatch при reduced-motion
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.75", "end 0.7"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" className="scroll-mt-20 bg-surface py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 sm:px-6 lg:grid-cols-[5fr_7fr] lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <h2 className="max-w-[16ch] text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl lg:text-[44px] lg:leading-[1.08]">
              Вся работа по сделке в одном агентстве
            </h2>
            <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-ink-soft sm:text-lg">
              Вам не придётся самостоятельно координировать объявления, показы,
              переговоры, документы, банк и регистрацию. Мы собираем все этапы в
              один управляемый процесс: от первой консультации до передачи
              ключей.
            </p>
            <button
              onClick={() => openLead()}
              className="mt-8 inline-flex h-12 items-center rounded-xl bg-pine px-6 font-semibold text-white transition-colors hover:bg-pine-deep active:scale-[0.98]"
            >
              Обсудить задачу
            </button>
          </Reveal>
        </div>

        <div className="relative">
          {/* маршрут: линия прорисовывается по мере скролла */}
          <div
            aria-hidden
            className="absolute bottom-6 left-[15px] top-6 w-px bg-line"
          />
          {mounted && (
            <motion.div
              aria-hidden
              style={{ scaleY: reduce ? 1 : scaleY }}
              className="absolute bottom-6 left-[15px] top-6 w-px origin-top bg-pine"
            />
          )}
          <ol ref={listRef} className="space-y-9">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative flex gap-6">
                <span className="tnum relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-[13px] font-bold text-pine">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <h3 className="text-lg font-bold tracking-[-0.01em]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
