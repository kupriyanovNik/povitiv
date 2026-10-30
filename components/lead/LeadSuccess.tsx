"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

/**
 * Экран успеха заявки, общий для инлайн-формы и модалки.
 * - role="status": скринридер обязан анонсировать смену статуса (WCAG 4.1.3);
 * - фокус на заголовок: после размонтирования формы он иначе падает в body
 *   и не возвращается; в модалке это даёт осмысленный restart таб-порядка.
 */
export function LeadSuccess({
  variant,
  onDone,
}: {
  variant: "section" | "modal";
  onDone?: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // ветка монтируется только после выхода формы (AnimatePresence
  // mode="wait"), поэтому фокусируем прямо по факту монтирования —
  // таймеры не нужны; ~150 мс фокус в body между ветками неизбежен
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // размеры как в прежних блоках: section — крупнее, modal — компактнее
  const sizes =
    variant === "section"
      ? {
          wrap: "py-10 text-center",
          icon: 64,
          heading: "mt-5 text-2xl font-bold",
          text: "mx-auto mt-2 max-w-[36ch] leading-relaxed text-ink-soft",
        }
      : {
          wrap: "py-6 text-center",
          icon: 56,
          heading: "mt-4 text-xl font-bold",
          text: "mt-2 text-sm leading-relaxed text-ink-soft",
        };

  return (
    <motion.div
      role="status" // aria-live="polite" + aria-atomic: анонс всей сводки разом
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={sizes.wrap}
    >
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3, delay: 0.1 }}
        className="inline-block"
      >
        <CheckCircle size={sizes.icon} weight="fill" className="mx-auto text-wine" />
      </motion.span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        // focus:outline-none: обводка :focus-visible из globals.css рисовала
        // бы рамку вокруг заголовка при программном фокусе после сабмита с
        // клавиатуры; сам заголовок уже прочитан анонсом role="status"
        className={`${sizes.heading} focus:outline-none`}
      >
        Спасибо, заявка отправлена
      </h3>
      <p className={sizes.text}>
        Мы получили ваши контактные данные. Специалист свяжется с вами по
        указанному номеру.
      </p>
      {onDone && (
        <button
          onClick={onDone}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-wine px-6 font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98]"
        >
          Готово
        </button>
      )}
    </motion.div>
  );
}
