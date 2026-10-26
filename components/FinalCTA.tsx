"use client";

import Image from "next/image";
import { Phone } from "@phosphor-icons/react/dist/ssr";
import { phone } from "@/lib/site";
import { useLead } from "./lead/LeadContext";
import skyline from "@/public/photos/city-skyline.jpg";

/**
 * Финальный призыв — вторая «рамка» страницы: как и первый экран, на фото
 * Москвы, снятом агентством. Вертикальный кадр стоит половиной экрана,
 * а не режется в узкую полосу.
 */
export function FinalCTA() {
  const { openLead } = useLead();
  return (
    <section className="grid bg-wine-ink text-white lg:min-h-[640px] lg:grid-cols-2">
      <div className="relative h-[320px] sm:h-[420px] lg:order-2 lg:h-auto">
        <Image
          src={skyline}
          alt="Деловой центр Москва-Сити"
          fill
          placeholder="blur"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[center_40%]"
        />
      </div>

      <div className="flex items-center px-4 py-16 sm:px-6 lg:justify-end lg:px-10 lg:py-24 xl:px-20">
        <div className="max-w-[520px]">
          <h2 className="font-display text-[34px] font-bold leading-[1.08] text-balance sm:text-5xl lg:text-[56px]">
            Начните с понятного первого шага
          </h2>
          <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-white/75 sm:text-lg">
            Расскажите, какую задачу нужно решить. Мы разберём возможные
            сценарии и объясним, что потребуется для начала работы.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={() => openLead()}
              className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-full bg-white px-7 text-base font-semibold text-wine-ink transition-colors hover:bg-wine-tint active:scale-[0.98]"
            >
              Обсудить задачу
            </button>
            <a
              href={phone.href}
              className="tnum inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/35 px-6 text-base font-semibold transition-colors hover:border-white/70"
            >
              <Phone size={18} weight="bold" aria-hidden />
              {phone.display}
            </a>
          </div>
          <p className="mt-6 text-sm text-white/60">
            Первая беседа ни к чему не обязывает. Сначала задача и факты, затем
            решение.
          </p>
        </div>
      </div>
    </section>
  );
}
