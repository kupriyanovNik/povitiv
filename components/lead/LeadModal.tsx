"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useReducedMotion,
} from "motion/react";
import { CheckCircle, X } from "@phosphor-icons/react/dist/ssr";
import { site, type LeadTask } from "@/lib/site";
import { ConsentCheckbox } from "./ConsentCheckbox";
import { useLeadSubmit } from "./useLeadSubmit";

const MODAL_TASKS: LeadTask[] = [
  "Продать",
  "Купить",
  "Обменять",
  "Сдать",
  "Снять",
  "Сопровождение",
];

export function LeadModal({
  open,
  initialTask,
  onClose,
}: {
  open: boolean;
  initialTask?: LeadTask;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <ModalContent key="lead-modal" initialTask={initialTask} onClose={onClose} />
      )}
    </AnimatePresence>
  );
}

function ModalContent({
  initialTask,
  onClose,
}: {
  initialTask?: LeadTask;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const { status, error, submit } = useLeadSubmit();
  const [formScope, animateEl] = useAnimate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [task, setTask] = useState<LeadTask>(initialTask ?? "Продать");
  const [consent, setConsent] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 80);
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // ловушка фокуса: Tab не должен уводить на страницу под оверлеем
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        const inside = dialogRef.current.contains(active);
        if (e.shiftKey && (active === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit({ name, phone, task, consent });
    // короткий «шейк» формы как телесная обратная связь об ошибке
    if (!ok && !reduce && formScope.current) {
      animateEl(
        formScope.current,
        { x: [0, -6, 6, -3, 3, 0] },
        { duration: 0.3, ease: "easeInOut" },
      );
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <button
        aria-label="Закрыть"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
        tabIndex={-1}
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Заявка на консультацию"
        className="relative w-full max-w-md rounded-t-2xl bg-surface p-6 shadow-2xl shadow-ink/20 sm:rounded-2xl sm:p-8"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        transition={{ type: "spring", duration: 0.45, bounce: 0 }}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть окно"
          className="absolute right-4 top-4 rounded-full p-2 text-ink-soft transition-colors hover:bg-paper hover:text-ink"
        >
          <X size={20} weight="bold" />
        </button>

        <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="py-6 text-center"
          >
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                duration: 0.5,
                bounce: 0.3,
                delay: 0.1,
              }}
              className="inline-block"
            >
              <CheckCircle size={56} weight="fill" className="mx-auto text-wine" />
            </motion.span>
            <h3 className="mt-4 text-xl font-bold">
              Спасибо, заявка отправлена
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Мы получили ваши контактные данные. Специалист свяжется с вами по
              указанному номеру.
            </p>
            <button
              onClick={onClose}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-wine px-6 font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98]"
            >
              Готово
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <h3 className="pr-8 text-xl font-bold tracking-[-0.01em]">
              Расскажите, что нужно сделать
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              Оставьте номер и выберите задачу. Специалист свяжется с вами и
              уточнит детали.
            </p>
            <form ref={formScope} onSubmit={onSubmit} className="mt-5 space-y-4">
              <div
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label="Задача"
              >
                {MODAL_TASKS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={task === t}
                    onClick={() => setTask(t)}
                    className={`h-9 rounded-full border px-3.5 text-sm font-medium transition-colors ${
                      task === t
                        ? "border-wine bg-wine text-white"
                        : "border-line bg-surface text-ink hover:border-ink/30"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lead-modal-name"
                  className="block text-sm font-semibold"
                >
                  Имя
                </label>
                <input
                  ref={nameRef}
                  id="lead-modal-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Как к вам обращаться?"
                  className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lead-modal-phone"
                  className="block text-sm font-semibold"
                >
                  Телефон
                </label>
                <input
                  id="lead-modal-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+7 900 000-00-00"
                  className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"
                />
              </div>
              {/* honeypot для ботов, посетители поле не видят */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              {status === "error" && error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="text-sm font-medium text-[#b3261e]"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}
              <ConsentCheckbox
                id="lead-modal-consent"
                checked={consent}
                onChange={setConsent}
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="h-12 w-full rounded-full bg-wine font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98] disabled:opacity-60"
              >
                {status === "sending" ? "Отправляем…" : "Обсудить задачу"}
              </button>
              <p className="text-xs leading-relaxed text-ink-soft">
                Или позвоните:{" "}
                <a
                  href={site.phoneHref}
                  className="tnum font-medium text-ink underline"
                >
                  {site.phone}
                </a>
              </p>
            </form>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
