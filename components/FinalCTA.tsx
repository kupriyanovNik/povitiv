"use client";

import { Phone } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";
import { useLead } from "./lead/LeadContext";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  const { openLead } = useLead();
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[760px] px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-[48px] lg:leading-[1.08]">
            Начните с понятного первого шага
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Расскажите, какую задачу нужно решить. Мы разберём возможные
            сценарии и объясним, что потребуется для начала работы.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => openLead()}
              className="inline-flex h-13 items-center rounded-full bg-wine px-7 text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgba(125,27,36,0.45)] transition-colors hover:bg-wine-deep active:scale-[0.98]"
            >
              Обсудить задачу
            </button>
            <a
              href={site.phoneHref}
              className="tnum inline-flex h-13 items-center gap-2.5 rounded-full border border-ink/15 bg-surface px-7 text-base font-semibold transition-colors hover:border-ink/35"
            >
              <Phone size={18} weight="bold" className="text-wine" />
              {site.phone}
            </a>
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Первая беседа ни к чему не обязывает. Сначала задача и факты, затем
            решение.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
