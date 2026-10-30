"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ChartLineUp,
  FileText,
  Handshake,
  HouseLine,
  Key,
  MagnifyingGlass,
  Megaphone,
  Strategy,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import { useLead } from "./lead/LeadContext";

const STEPS: { icon: Icon; title: string; text: string }[] = [
  {
    icon: ChartLineUp,
    title: "Анализ рынка и оценка",
    text: "Изучаем похожие предложения, спрос, состояние объекта и документы. Называем обоснованный ценовой диапазон.",
  },
  {
    icon: Strategy,
    title: "Стратегия",
    text: "Согласовываем цену, сроки и порядок действий до начала активной работы.",
  },
  {
    icon: HouseLine,
    title: "Подготовка объекта",
    text: "Собираем сильное описание и решаем, как лучше представить объект покупателям.",
  },
  {
    icon: Megaphone,
    title: "Размещение и продвижение",
    text: "Публикуем объект на профильных площадках, следим за откликами и корректируем стратегию.",
  },
  {
    icon: MagnifyingGlass,
    title: "Поиск и показы",
    text: "Отбираем подходящих покупателей или варианты, проводим показы и собираем обратную связь.",
  },
  {
    icon: Handshake,
    title: "Переговоры",
    text: "Обсуждаем цену и условия, отстаиваем ваши интересы и фиксируем договорённости.",
  },
  {
    icon: FileText,
    title: "Документы и расчёты",
    text: "Проверяем документы и согласовываем безопасную схему расчётов.",
  },
  {
    icon: Key,
    title: "Регистрация и передача",
    text: "Сопровождаем подписание, регистрацию перехода права и передачу ключей.",
  },
];

function StepFill({
  progress,
  threshold,
  reduce,
  icon: StepIcon,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  threshold: number;
  reduce: boolean;
  icon: Icon;
}) {
  const opacity = useTransform(
    progress,
    [Math.max(0, threshold - 0.05), Math.min(1, threshold + 0.02)],
    [0, 1],
  );
  return (
    <motion.span
      aria-hidden
      style={{ opacity: reduce ? 1 : opacity }}
      className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-wine text-white"
    >
      <StepIcon size={28} weight="regular" />
    </motion.span>
  );
}

export function DealRoute() {
  const { openLead } = useLead();
  const reduce = useReducedMotionSafe();
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
          <div>
            <h2 className="font-display max-w-[16ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
              Вся работа по сделке в одном агентстве
            </h2>
            <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-ink-soft sm:text-lg">
              Вам не придётся самостоятельно координировать объявления, показы,
              переговоры, документы, банк и регистрацию. Мы собираем все этапы в
              один управляемый процесс: от первой консультации до
              регистрации и расчётов.
            </p>
            <button
              onClick={() => openLead()}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-wine px-6 font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98]"
            >
              Обсудить задачу
            </button>
          </div>
        </div>

        <div className="relative">
          {/* маршрут: линия прорисовывается по мере скролла */}
          <div
            aria-hidden
            className="absolute bottom-8 left-[27px] top-8 w-px bg-line sm:left-[31px]"
          />
          {mounted && (
            <motion.div
              aria-hidden
              style={{ scaleY: reduce ? 1 : scaleY }}
              className="absolute bottom-8 left-[27px] top-8 w-px origin-top bg-wine sm:left-[31px]"
            />
          )}
          <ol ref={listRef} className="space-y-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative flex gap-5 sm:gap-7">
                {/* иконки крупные (правки клиента 26.10.2026); кружок
                    «заполняется» бордовым, когда линия доходит до шага */}
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface text-wine sm:h-16 sm:w-16">
                  <step.icon size={28} weight="regular" aria-hidden />
                  {mounted && (
                    <StepFill
                      progress={scrollYProgress}
                      threshold={i / (STEPS.length - 1)}
                      reduce={Boolean(reduce)}
                      icon={step.icon}
                    />
                  )}
                </span>
                <div className="pt-1.5 sm:pt-2.5">
                  <h3 className="text-lg font-bold tracking-[-0.01em]">
                    <span className="tnum mr-2 text-wine">{i + 1}.</span>
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
