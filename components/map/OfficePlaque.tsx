import { NavigationArrow } from "@phosphor-icons/react/dist/ssr";
import { Phone } from "@phosphor-icons/react/dist/ssr";
import { phone, site } from "@/lib/site";

/**
 * Плашка агентства вместо стандартной метки: карточка с телефонами и
 * маршрутом, хвостик и бордовая точка ровно на координатах офиса.
 * Рендерится порталом в HTML-элемент YMapMarker; обёртка смещена так,
 * что центр точки совпадает с координатой маркера.
 */
export function OfficePlaque() {
  return (
    <div className="absolute left-0 top-0 flex -translate-x-1/2 -translate-y-full flex-col items-center">
      <div className="relative z-10 w-[232px] rounded-2xl bg-surface p-4 text-ink shadow-[0_16px_36px_-14px_rgba(51,10,15,0.4)] ring-1 ring-ink/5 sm:w-[248px]">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="block h-[22px] w-11 shrink-0 bg-wine"
            style={{
              maskImage: "url(/brand/emblem.svg)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskImage: "url(/brand/emblem.svg)",
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
            }}
          />
          <div className="min-w-0 leading-tight">
            <p className="font-display text-[15px] font-bold">Позитив ВТ</p>
            <p className="mt-0.5 truncate text-xs text-ink-soft">{site.addressShort}</p>
          </div>
        </div>

        <a
          href={phone.href}
          className="tnum mt-3 flex items-center gap-2 text-[14px] font-semibold transition-colors hover:text-wine"
        >
          <Phone size={14} weight="bold" className="text-wine" aria-hidden />
          {phone.display}
        </a>

        <a
          href={site.routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-full bg-wine text-[13px] font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98]"
        >
          <NavigationArrow size={14} weight="fill" className="-scale-x-100" aria-hidden />
          Построить маршрут
        </a>
      </div>

      {/* хвостик поверх нижнего края карточки (иначе его серит тень
          карточки) и точка офиса */}
      <span
        aria-hidden
        className="relative z-20 -mt-[7px] h-3.5 w-3.5 rotate-45 bg-surface shadow-[2px_2px_3px_-1px_rgba(51,10,15,0.12)]"
      />
      <span
        aria-hidden
        className="mt-0.5 h-3.5 w-3.5 translate-y-1/2 rounded-full border-[3px] border-white bg-wine shadow-[0_2px_6px_rgba(51,10,15,0.45)]"
      />
    </div>
  );
}
