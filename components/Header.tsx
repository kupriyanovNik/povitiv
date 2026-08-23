"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { List, Phone, X } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";
import { trapTabKey } from "./focusTrap";
import { useLead } from "./lead/LeadContext";

const NAV = [
  { href: "#uslugi", label: "Услуги" },
  { href: "#process", label: "Этапы" },
  { href: "#obekty", label: "Объекты" },
  { href: "#komanda", label: "Команда" },
  { href: "#otzyvy", label: "Отзывы" },
  { href: "#kontakty", label: "Контакты" },
];

export function Header() {
  const { openLead } = useLead();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: "24px 0px 0px 0px" },
    );
    const sentinel = document.getElementById("top-sentinel");
    if (sentinel) obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // как и в модалке: Escape закрывает меню, Tab не уходит под оверлей
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      else if (e.key === "Tab" && menuRef.current) trapTabKey(e, menuRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <div id="top-sentinel" aria-hidden className="absolute top-0 h-px w-px" />
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 ${
          scrolled
            ? "border-b border-line/80 bg-paper/80 shadow-[0_8px_30px_-18px_rgba(31,36,31,0.25)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-8 px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <a href="#" className="flex shrink-0 flex-col leading-tight">
            <span className="font-display text-[19px] font-extrabold leading-none">
              Позитив ВТ
            </span>
            <span className="hidden text-[11px] font-medium text-ink-soft sm:block">
              агентство недвижимости
            </span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-0">
            <a
              href={site.phoneHref}
              className="tnum hidden items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-wine md:flex"
            >
              <Phone size={16} weight="bold" className="text-wine" />
              {site.phone}
            </a>
            <button
              onClick={() => openLead("Продать")}
              className="hidden h-10 items-center rounded-full bg-wine px-4 text-sm font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98] sm:inline-flex"
            >
              Оценить объект
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Открыть меню"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink lg:hidden"
            >
              <List size={20} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              aria-label="Закрыть меню"
              className="absolute inset-0 bg-ink/45"
              onClick={() => setMenuOpen(false)}
              tabIndex={-1}
            />
            <motion.div
              ref={menuRef}
              className="absolute inset-x-0 top-0 rounded-b-2xl bg-surface p-6 pb-8 shadow-2xl shadow-ink/20"
              initial={reduce ? { opacity: 0 } : { y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -24, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[19px] font-extrabold">Позитив ВТ</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Закрыть меню"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col divide-y divide-line">
                {NAV.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="py-3.5 text-lg font-semibold"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openLead("Продать");
                  }}
                  className="h-12 rounded-full bg-wine font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98]"
                >
                  Оценить объект
                </button>
                <a
                  href={site.phoneHref}
                  className="tnum flex h-12 items-center justify-center gap-2 rounded-xl border border-line font-semibold"
                >
                  <Phone size={18} weight="bold" className="text-wine" />
                  {site.phone}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
