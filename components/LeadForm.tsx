"use client";

import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { leadTasks, site, type LeadTask } from "@/lib/site";
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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [task, setTask] = useState<LeadTask>("Продать");
  const [object, setObject] = useState("");
  const [comment, setComment] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({ name, phone, task, object, comment });
  };

  return (
    <section id="zayavka" className="scroll-mt-20 bg-wine-ink py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-wine-tint">
            Бесплатная консультация
          </p>
          <h2 className="font-display mt-3 max-w-[20ch] text-3xl font-bold text-white sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Получите предварительную оценку и план сделки
          </h2>
          <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-white/75 sm:text-lg">
            Расскажите об объекте или желаемой покупке. Мы уточним детали,
            оценим ситуацию и предложим последовательность действий.
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
          <p className="mt-8 text-sm text-white/60">
            Это не автоматический расчёт: ситуацию разбирает специалист
            агентства. Документы заранее готовить не нужно.
          </p>
        </Reveal>

        <div className="rounded-2xl bg-surface p-6 shadow-2xl shadow-black/25 sm:p-8">
          {status === "success" ? (
            <div className="py-10 text-center">
              <CheckCircle
                size={64}
                weight="fill"
                className="mx-auto text-wine"
              />
              <h3 className="mt-5 text-2xl font-bold">
                Спасибо, заявка отправлена
              </h3>
              <p className="mx-auto mt-2 max-w-[36ch] leading-relaxed text-ink-soft">
                Мы получили ваши контактные данные. Специалист свяжется с вами
                по указанному номеру.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
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
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+7 900 000-00-00"
                    className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"
                  />
                </div>
              </div>

              <fieldset>
                <legend className="text-sm font-semibold">Что требуется?</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
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
                <p className="text-sm font-medium text-[#b3261e]" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="h-13 w-full rounded-full bg-wine text-base font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.99] disabled:opacity-60"
              >
                {status === "sending" ? "Отправляем…" : "Отправить заявку"}
              </button>
              <p className="text-xs leading-relaxed text-ink-soft">
                Нажимая кнопку, вы соглашаетесь с{" "}
                <a href="/privacy" className="underline hover:text-ink">
                  политикой обработки персональных данных
                </a>
                . Или позвоните:{" "}
                <a href={site.phoneHref} className="tnum font-semibold text-ink">
                  {site.phone}
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
