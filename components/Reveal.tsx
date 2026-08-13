"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Мягкое появление при входе в вьюпорт. Использовать точечно:
 * заголовки секций и ключевые блоки, не каждый элемент подряд.
 * Reduced motion обрабатывает MotionConfig reducedMotion="user"
 * (transform отключается, остаётся мягкий фейд).
 */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
