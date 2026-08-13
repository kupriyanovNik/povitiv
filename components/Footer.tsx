import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer id="kontakty" className="scroll-mt-20 border-t border-line bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[5fr_4fr_3fr]">
          <div>
            <p className="font-display text-xl font-extrabold">
              Позитив ВТ
            </p>
            <p className="mt-1 text-sm text-ink-soft">{site.tagline}</p>
            <address className="mt-6 space-y-2 not-italic">
              <p className="font-semibold">{site.address}</p>
              <p className="text-sm text-ink-soft">{site.workHours}</p>
              <p>
                <a
                  href={site.phoneHref}
                  className="tnum text-lg font-bold transition-colors hover:text-wine"
                >
                  {site.phone}
                </a>
              </p>
            </address>
            <a
              href={site.routeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/15 px-4 text-sm font-semibold transition-colors hover:border-ink/35"
            >
              Построить маршрут
              <ArrowUpRight size={14} weight="bold" />
            </a>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-ink-soft">
              Разделы
            </p>
            <nav className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[15px]">
              <a href="#uslugi" className="font-medium transition-colors hover:text-wine">
                Услуги
              </a>
              <a href="#obekty" className="font-medium transition-colors hover:text-wine">
                Объекты
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
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.08em] text-ink-soft">
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
          <nav className="flex gap-5">
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
