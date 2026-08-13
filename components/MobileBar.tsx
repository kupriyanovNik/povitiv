"use client";

import { Phone } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";
import { useLead } from "./lead/LeadContext";

/** Нижняя панель на мобильных: телефон + заявка всегда под рукой. */
export function MobileBar() {
  const { openLead } = useLead();
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 p-3 backdrop-blur-xl sm:hidden">
      <div className="flex gap-2.5">
        <a
          href={site.phoneHref}
          aria-label={`Позвонить: ${site.phone}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line text-pine"
        >
          <Phone size={20} weight="bold" />
        </a>
        <button
          onClick={() => openLead()}
          className="h-12 flex-1 rounded-xl bg-pine font-semibold text-white transition-colors hover:bg-pine-deep active:scale-[0.99]"
        >
          Получить консультацию
        </button>
      </div>
    </div>
  );
}
