"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { FAQ_ITEMS } from "@/lib/faq";
import { Reveal } from "./Reveal";

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
          className="shrink-0 text-wine"
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
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-[44px]">
            Частые вопросы
          </h2>
        </Reveal>
        <div className="mt-8 border-t border-line lg:mt-10">
          {FAQ_ITEMS.map((item, i) => (
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
