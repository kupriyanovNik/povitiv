"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { Phone } from "@phosphor-icons/react/dist/ssr";
import { phone } from "@/lib/site";
import { useLead } from "./lead/LeadContext";

/**
 * Нижняя панель на мобильных: телефон + заявка всегда под рукой.
 * Появляется после первого экрана, чтобы не перекрывать hero.
 */
export function MobileBar() {
  const { openLead } = useLead();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    setVisible(v > window.innerHeight * 0.7);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%", opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0.6 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-x-0 bottom-0 z-30 sm:hidden"
        >
          <div className="border-t border-line bg-surface/90 p-3 backdrop-blur-xl">
            <div className="flex gap-2.5">
              <a
                href={phone.href}
                aria-label={`Позвонить: ${phone.display}`}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line text-wine transition-colors active:bg-paper"
              >
                <Phone size={20} weight="bold" />
              </a>
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
