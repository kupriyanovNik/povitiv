"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import { List, Phone, X } from "@phosphor-icons/react/dist/ssr";
import { phone } from "@/lib/site";
import { trapTabKey } from "./focusTrap";
import { useLead } from "./lead/LeadContext";
import { Logo } from "./Logo";

const NAV = [
  { href: "#uslugi", label: "Услуги" },
  { href: "#process", label: "Этапы" },
  { href: "#nedvizhimost", label: "Недвижимость" },
  { href: "#komanda", label: "Команда" },
  { href: "#otzyvy", label: "Отзывы" },
  { href: "#kontakty", label: "Контакты" },
];

export function Header() {
  const { openLead } = useLead();
  const reduce = useReducedMotionSafe();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Возврат фокуса на бургер — стандарт диалога: фокус возвращается к
  // триггеру, иначе после закрытия он падает в body и «Открыть меню»
  // выпадает из таб-порядка. «Получить консультацию» — без рестора:
  // фокус сразу перехватывает модалка заявки (её nameRef через 80 мс).
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    burgerRef.current?.focus();
  }, []);

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
      if (e.key === "Escape") closeMenu();
      else if (e.key === "Tab" && menuRef.current) trapTabKey(e, menuRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  // при открытии фокус уходит в панель (первый её элемент — «Закрыть меню»),
  // иначе скринридер и клавиатура остаются на кнопке под оверлеем
  useEffect(() => {
    if (!menuOpen) return;
    const t = setTimeout(() => closeBtnRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [menuOpen]);

  // панель и бургер на десктопе скрывает только CSS (lg:hidden): если меню
  // было открыто на мобильном и вьюпорт растянули до lg, состояние надо
  // сбросить — иначе body остаётся заблокированным, а trapTabKey ловит Tab
  // у display:none-меню (фокус проглатывается)
  useEffect(() => {
    // 64rem = Tailwind-брейкпоинт lg (--breakpoint-lg: 64rem в theme.css):
    // rem, а не 1024px, чтобы совпадать с lg:hidden при нестандартном
    // размере корневого шрифта
    const mq = window.matchMedia("(min-width: 64rem)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // пока шапка над фото города в хиро, она прозрачная и белая
  const onPhoto = !scrolled;

  return (
    <>
      <div id="top-sentinel" aria-hidden className="absolute top-0 h-px w-px" />
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 ${
          scrolled
            ? "border-b border-line/80 bg-paper/95 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-8 px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <a
            href="#"
            aria-label="Позитив ВТ, агентство недвижимости: в начало страницы"
            className={`shrink-0 transition-colors duration-300 ${onPhoto ? "text-white" : "text-wine"}`}
          >
            <Logo size={38} />
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  onPhoto
                    ? "text-white/85 hover:text-white"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-5 lg:ml-0">
            <a
              href={phone.href}
              className={`tnum hidden items-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors md:flex lg:hidden xl:flex ${
                onPhoto ? "text-white hover:text-white/80" : "text-ink hover:text-wine"
              }`}
            >
              <Phone
                size={15}
                weight="bold"
                className={onPhoto ? "text-white" : "text-wine"}
                aria-hidden
              />
              {phone.display}
            </a>
            <button
              onClick={() => openLead()}
              className="hidden h-10 items-center rounded-full bg-wine px-4 text-sm font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98] sm:inline-flex"
            >
              Получить консультацию
            </button>
            <button
              ref={burgerRef}
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Открыть меню" // состояние раскрытия сообщает aria-expanded, лейбл статичен
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors lg:hidden ${
                onPhoto
                  ? "border-white/40 bg-wine-ink/30 text-white"
                  : "border-line bg-surface text-ink"
              }`}
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
              onClick={closeMenu}
              tabIndex={-1}
            />
            <motion.div
              ref={menuRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Меню"
              className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto overscroll-contain rounded-b-2xl bg-surface p-6 pb-8 shadow-2xl shadow-ink/20"
              initial={reduce ? { opacity: 0 } : { y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -24, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-wine">
                  <Logo size={38} />
                </span>
                <button
                  ref={closeBtnRef}
                  onClick={closeMenu}
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
                    // дефолтная фрагментная навигация исполняется ПОСЛЕ onClick
                    // и (цели-якоря не фокусируемы) сбрасывает фокус в body,
                    // стирая рестор из closeMenu — закрытие уходим на макротаск
                    onClick={() => setTimeout(closeMenu, 0)}
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
                    openLead();
                  }}
                  className="h-12 rounded-full bg-wine font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98]"
                >
                  Получить консультацию
                </button>
                <a
                  href={phone.href}
                  className="tnum flex h-12 items-center justify-center gap-2 rounded-full border border-line text-[15px] font-semibold transition-colors active:bg-paper"
                >
                  <Phone size={16} weight="bold" className="text-wine" aria-hidden />
                  {phone.display}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
