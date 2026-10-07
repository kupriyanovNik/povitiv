"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import { Phone, X } from "@phosphor-icons/react/dist/ssr";
import { phones } from "@/lib/site";
import { useLead } from "./lead/LeadContext";
import { PhoneIcon } from "./PhoneIcon";

/**
 * Нижняя панель на мобильных: телефон + заявка всегда под рукой.
 * Появляется после первого экрана, чтобы не перекрывать hero.
 * Номеров два, поэтому кнопка звонка раскрывает выбор над панелью.
 */
export function MobileBar() {
  const { openLead } = useLead();
  const reduce = useReducedMotionSafe();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (v) => {
    const show = v > window.innerHeight * 0.7;
    setVisible(show);
    if (!show) setCallOpen(false);
  });

  // выбор номера закрывается по Escape и по тапу мимо панели
  useEffect(() => {
    if (!callOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCallOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setCallOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [callOpen]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={rootRef}
          initial={{ y: "100%", opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0.6 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-x-0 bottom-0 z-30 sm:hidden"
        >
          <AnimatePresence>
            {callOpen && (
              <motion.div
                id={panelId}
                role="group"
                aria-label="Позвонить"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                transition={{ type: "spring", duration: 0.32, bounce: 0 }}
                className="mx-3 mb-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_18px_40px_-20px_rgba(33,29,28,0.45)]"
              >
                {phones.map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    onClick={() => setCallOpen(false)}
                    className="flex h-15 items-center gap-3.5 border-b border-line px-4 last:border-b-0 active:bg-paper"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wine-tint text-wine">
                      <PhoneIcon kind={p.kind} size={18} />
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="tnum text-[17px] font-semibold">
                        {p.display}
                      </span>
                      <span className="text-[13px] text-ink-soft">{p.label}</span>
                    </span>
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-line bg-surface/90 p-3 backdrop-blur-xl">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setCallOpen((o) => !o)}
                aria-expanded={callOpen}
                aria-controls={callOpen ? panelId : undefined}
                aria-label={callOpen ? "Скрыть номера" : "Позвонить"}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  callOpen
                    ? "border-wine bg-wine text-white"
                    : "border-line text-wine"
                }`}
              >
                {callOpen ? (
                  <X size={20} weight="bold" />
                ) : (
                  <Phone size={20} weight="bold" />
                )}
              </button>
              <button
                onClick={() => openLead()}
                className="h-12 flex-1 rounded-full bg-wine font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.99]"
              >
                Получить консультацию
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
