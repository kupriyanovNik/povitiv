"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  motion,
  useScroll,
  type MotionValue,
  useTransform,
} from "motion/react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";

// текст клиента (замечания 02.10.2026, п. 6–7). «20 лет» — личный опыт
// специалистов, а не срок работы вместе: агентство работает с 2010 года.
// 30.10.2026: «которые» отнесено к специалистам, а не к годам
const TEXT =
  "Мы не сетевой гигант, а команда специалистов, которые лично ведут каждую сделку. Наш опыт — более 20 лет. Нас можно найти на ЦИАН и Домклик.";

function Word({
  word,
  progress,
  start,
  end,
}: {
  word: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

export function Manifesto() {
  const reduce = useReducedMotionSafe();
  // на сервере и до маунта рендерим обычный текст: разметка совпадает,
  // эффект включается только на клиенте
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const ref = useRef<HTMLParagraphElement>(null);
  // текст «проявляется» слово за словом по мере прокрутки
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.5"],
  });
  const words = TEXT.split(" ");
  const animated = mounted && !reduce;

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-[880px] px-4 text-center sm:px-6">
        <p
          ref={ref}
          className="font-display text-2xl font-semibold leading-[1.35] sm:text-3xl lg:text-[36px] lg:leading-[1.3]"
        >
          {!animated
            ? TEXT
            : words.map((word, i) => (
                <Word
                  key={i}
                  word={word}
                  progress={scrollYProgress}
                  start={i / words.length}
                  end={(i + 1) / words.length}
                />
              ))}
        </p>
      </div>
    </section>
  );
}
