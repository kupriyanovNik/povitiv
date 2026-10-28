import { ArrowUpRight, Clock, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { phone, site } from "@/lib/site";
import { Logo } from "./Logo";
import { OfficeMap } from "./OfficeMap";

export function Footer({ mapApiKey }: { mapApiKey?: string }) {
  return (
    <footer id="kontakty" className="scroll-mt-20 border-t border-line bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-14">
          <div>
            <div className="text-wine">
              <Logo />
            </div>
            <p className="font-display mt-7 max-w-[24ch] text-2xl font-semibold leading-[1.25] text-balance sm:text-[28px]">
              {site.welcome}
            </p>

            <address className="mt-8 space-y-4 not-italic">
              <p className="flex gap-3">
                <MapPin size={20} weight="bold" className="mt-0.5 shrink-0 text-wine" />
                <span className="font-semibold">{site.address}</span>
              </p>
              <p className="flex gap-3">
                <Clock size={20} weight="bold" className="mt-0.5 shrink-0 text-wine" />
                <span className="tnum">{site.workHours}</span>
              </p>
              <p className="flex items-center gap-3 pt-1">
                <Phone size={20} weight="bold" className="shrink-0 text-wine" aria-hidden />
                <a
                  href={phone.href}
                  className="tnum whitespace-nowrap text-lg font-bold transition-colors hover:text-wine"
                >
                  {phone.display}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <EnvelopeSimple size={20} weight="bold" className="shrink-0 text-wine" aria-hidden />
                <a
                  href={`mailto:${site.email}`}
                  className="font-semibold transition-colors hover:text-wine"
                >
                  {site.email}
                </a>
              </p>
            </address>
          </div>

          <OfficeMap apiKey={mapApiKey} />
        </div>

        <div className="mt-14 grid gap-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-[5fr_3fr_4fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-semibold text-ink-soft">
              Разделы
            </p>
            <nav className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[15px] sm:max-w-[360px]">
              <a href="#uslugi" className="font-medium transition-colors hover:text-wine">
                Услуги
              </a>
              <a href="#nedvizhimost" className="font-medium transition-colors hover:text-wine">
                Недвижимость
              </a>
              <a href="#process" className="font-medium transition-colors hover:text-wine">
                Как мы работаем
              </a>
              <a href="#komanda" className="font-medium transition-colors hover:text-wine">
                Команда
              </a>
              <a href="#otzyvy" className="font-medium transition-colors hover:text-wine">
                Отзывы
              </a>
              <a href="#zayavka" className="font-medium transition-colors hover:text-wine">
                Оставить заявку
              </a>
            </nav>
          </div>

          <div>
            <p className="text-[15px] font-semibold text-ink-soft">
              Мы на площадках
            </p>
            <nav className="mt-4 flex gap-6 text-[15px]">
              <a
                href={site.profiles.cian}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium transition-colors hover:text-wine"
              >
                ЦИАН
                <ArrowUpRight size={13} weight="bold" />
              </a>
              <a
                href={site.profiles.domclick}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium transition-colors hover:text-wine"
              >
                Домклик
                <ArrowUpRight size={13} weight="bold" />
              </a>
            </nav>
          </div>

          <div className="text-sm leading-relaxed text-ink-soft">
            <p className="font-semibold text-ink">{site.legal.name}</p>
            <p className="tnum mt-2">ИНН {site.legal.inn}</p>
            <p className="tnum">ОГРН {site.legal.ogrn}</p>
            <p className="mt-2">Работаем с 2010 года</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[13px] text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Агентство недвижимости «Позитив ВТ»</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="/privacy" className="transition-colors hover:text-ink">
              Политика конфиденциальности
            </a>
            <a href="/consent" className="transition-colors hover:text-ink">
              Согласие на обработку данных
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
