"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimate,
} from "motion/react";
import { useReducedMotionSafe } from "../useReducedMotionSafe";
import { X } from "@phosphor-icons/react/dist/ssr";
import { phone as officePhone, type LeadTask } from "@/lib/site";
import { trapTabKey } from "../focusTrap";
import { TaskRadiogroup } from "./TaskRadiogroup";
import { LeadSuccess } from "./LeadSuccess";
import { ConsentCheckbox } from "./ConsentCheckbox";
import { normalizePhoneInput } from "./phone";
import { useLeadSubmit } from "./useLeadSubmit";

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
  const reduce = useReducedMotionSafe();
  const { status, error, submit } = useLeadSubmit();
  const [formScope, animateEl] = useAnimate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [task, setTask] = useState<LeadTask>(initialTask ?? "Продать");
  const [comment, setComment] = useState("");
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
      if (e.key === "Tab" && dialogRef.current) {
        trapTabKey(e, dialogRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const company = String(new FormData(e.currentTarget).get("company") ?? "");
    // комментарий уходит только вместе с «Другое»: для остальных задач
    // поле скрыто и его содержимое не должно утекать в заявку
    const ok = await submit({
      name,
      phone,
      task,
      comment: task === "Другое" ? comment : "",
      consent,
      company,
    });
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
        className="relative max-h-[100dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-2xl bg-surface p-6 shadow-2xl shadow-ink/20 sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl sm:p-8"
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
          <LeadSuccess key="success" variant="modal" onDone={onClose} />
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
              <TaskRadiogroup ariaLabel="Задача" value={task} onChange={setTask} />
              {/* «Другое» без места для рассказа оставляло бы заявку пустой:
                  поле мягко раскрывается только для этой задачи */}
              <AnimatePresence initial={false}>
                {task === "Другое" && (
                  <motion.div
                    key="modal-comment"
                    initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={
                      reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }
                    }
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    // -mx/px: фокус-обводка (outline 2px + offset 2px из
                    // globals.css) рисуется за границей поля — даём ей 6px
                    // внутри overflow-hidden, иначе она режется по краям
                    className="-mx-1.5 overflow-hidden"
                  >
                    <div className="space-y-2 px-1.5 pb-1.5">
                      <label
                        htmlFor="lead-modal-comment"
                        className="block text-sm font-semibold"
                      >
                        Расскажите о ситуации{" "}
                        <span className="font-normal text-ink-soft">
                          (необязательно)
                        </span>
                      </label>
                      <textarea
                        id="lead-modal-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        placeholder="Кратко опишите задачу своими словами"
                        className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                  onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
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
                {status === "sending" ? "Отправляем…" : "Отправить заявку"}
              </button>
              <p className="text-xs leading-relaxed text-ink-soft">
                Или позвоните:{" "}
                <a
                  href={officePhone.href}
                  className="tnum font-medium whitespace-nowrap text-ink underline"
                >
                  {officePhone.display}
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
