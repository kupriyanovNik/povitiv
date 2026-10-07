"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useReducedMotion,
} from "motion/react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { leadTasks, phones, type LeadTask } from "@/lib/site";
import { ConsentCheckbox } from "./lead/ConsentCheckbox";
import { normalizePhoneInput } from "./lead/phone";
import { useLeadSubmit } from "./lead/useLeadSubmit";
import { Reveal } from "./Reveal";

const RESULTS = [
  "Ориентир по рыночной стоимости",
  "Возможные сроки и сценарии",
  "Перечень необходимых документов",
  "Первые шаги без лишней подготовки",
];

export function LeadForm() {
  const { status, error, submit } = useLeadSubmit();
  const reduce = useReducedMotion();
  const [scope, animateEl] = useAnimate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [task, setTask] = useState<LeadTask>("Продать");
  const [object, setObject] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit({ name, phone, task, object, comment, consent });
    // короткий «шейк» формы как телесная обратная связь об ошибке
    if (!ok && !reduce && scope.current) {
      animateEl(
        scope.current,
        { x: [0, -6, 6, -3, 3, 0] },
        { duration: 0.3, ease: "easeInOut" },
      );
    }
  };

  return (
    <section id="zayavka" className="scroll-mt-20 bg-wine-ink py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <Reveal>
          <h2 className="font-display max-w-[20ch] text-3xl font-bold text-white sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Получите предварительную оценку и план сделки
          </h2>
          {/* «бесплатная консультация» из бывшего кикера — в подзаголовке */}
          <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-white/75 sm:text-lg">
            Расскажите об объекте или желаемой покупке. Мы уточним детали,
            оценим ситуацию и предложим последовательность действий — это
            бесплатная консультация.
          </p>
          <ul className="mt-8 space-y-3.5">
            {RESULTS.map((r) => (
              <li key={r} className="flex items-center gap-3 text-white/90">
                <CheckCircle
                  size={20}
                  weight="fill"
                  className="shrink-0 text-wine-tint"
                />
                <span className="text-[15px] font-medium">{r}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="rounded-2xl bg-surface p-6 shadow-2xl shadow-black/25 sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="py-10 text-center"
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
                <CheckCircle
                  size={64}
                  weight="fill"
                  className="mx-auto text-wine"
                />
              </motion.span>
              <h3 className="mt-5 text-2xl font-bold">
                Спасибо, заявка отправлена
              </h3>
              <p className="mx-auto mt-2 max-w-[36ch] leading-relaxed text-ink-soft">
                Мы получили ваши контактные данные. Специалист свяжется с вами
                по указанному номеру.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              ref={scope}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onSubmit={onSubmit}
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="lf-name" className="block text-sm font-semibold">
                    Имя
                  </label>
                  <input
                    id="lf-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Как к вам обращаться?"
                    className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lf-phone" className="block text-sm font-semibold">
                    Телефон
                  </label>
                  <input
                    id="lf-phone"
                    value={phone}
                    onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+7 900 000-00-00"
                    className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"
                  />
                </div>
              </div>

              <fieldset>
                <legend className="text-sm font-semibold">Что требуется?</legend>
                <div
                  className="mt-2.5 flex flex-wrap gap-2"
                  role="radiogroup"
                  aria-label="Что требуется?"
                >
                  {leadTasks.map((t) => (
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
              </fieldset>

              <div className="space-y-2">
                <label htmlFor="lf-object" className="block text-sm font-semibold">
                  Объект или район{" "}
                  <span className="font-normal text-ink-soft">
                    (необязательно)
                  </span>
                </label>
                <input
                  id="lf-object"
                  value={object}
                  onChange={(e) => setObject(e.target.value)}
                  placeholder="Например: двухкомнатная квартира, Химки"
                  className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lf-comment" className="block text-sm font-semibold">
                  Комментарий{" "}
                  <span className="font-normal text-ink-soft">
                    (необязательно)
                  </span>
                </label>
                <textarea
                  id="lf-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Кратко опишите ситуацию"
                  className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"
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
                id="lf-consent"
                checked={consent}
                onChange={setConsent}
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="h-13 w-full rounded-full bg-wine text-base font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.99] disabled:opacity-60"
              >
                {status === "sending" ? "Отправляем…" : "Отправить заявку"}
              </button>
              <p className="text-xs leading-relaxed text-ink-soft">
                Или позвоните:{" "}
                {phones.map((p, i) => (
                  <span key={p.href}>
                    {i > 0 && " или "}
                    <a href={p.href} className="tnum font-semibold whitespace-nowrap text-ink">
                      {p.display}
                    </a>
                  </span>
                ))}
              </p>
            </motion.form>
          )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
