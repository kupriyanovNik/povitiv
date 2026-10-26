import Image from "next/image";

/**
 * «Мы партнёры банков» (замечания клиента, п. 12).
 *
 * Логотипы в public/partners/ (товарные знаки банков, используются как
 * указание на партнёрство):
 * - Сбер, ВТБ, Альфа-Банк — Wikimedia Commons, общественное достояние;
 * - Райффайзенбанк — Wikimedia Commons, © АО «Райффайзенбанк», CC BY 4.0
 *   (атрибуция — в подсказке логотипа);
 * - Фора-Банк — CDN Сравни.ру, М² — cdn.m2.ru, Домклик — statics.dmclk.ru.
 *
 * В покое логотипы приглушены до серого, чтобы семь фирменных цветов не
 * спорили с бордовой палитрой; цвет возвращается при наведении.
 */
type Bank = {
  name: string;
  logo: string;
  /** исходные пропорции файла: ширина / высота */
  ratio: number;
  /** оптическая высота в px: плотные знаки ниже, воздушные выше */
  height: number;
  credit?: string;
};

const BANKS: Bank[] = [
  { name: "Сбер", logo: "/partners/sber.svg", ratio: 302 / 50, height: 26 },
  { name: "ВТБ", logo: "/partners/vtb.svg", ratio: 92 / 33, height: 30 },
  { name: "Альфа-Банк", logo: "/partners/alfa.svg", ratio: 728.6 / 146.4, height: 24 },
  {
    name: "Райффайзенбанк",
    logo: "/partners/raiffeisen.svg",
    ratio: 143.92 / 40,
    height: 34,
    credit: "Логотип: АО «Райффайзенбанк», CC BY 4.0",
  },
  { name: "Фора-Банк", logo: "/partners/fora.svg", ratio: 653 / 162, height: 28 },
  { name: "М²", logo: "/partners/m2.svg", ratio: 124 / 32, height: 32 },
  { name: "Домклик", logo: "/partners/domclick.svg", ratio: 133 / 32, height: 28 },
];

export function BankPartners() {
  return (
    <section aria-labelledby="banks-title" className="border-y border-line bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div>
          <h2
            id="banks-title"
            className="font-display text-2xl font-bold sm:text-3xl lg:text-[32px]"
          >
            Мы партнёры банков
          </h2>
          <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-9 sm:gap-x-14 lg:mt-10 lg:flex-nowrap lg:justify-between lg:gap-x-6">
            {BANKS.map((bank) => {
              const width = Math.round(bank.height * bank.ratio);
              return (
                <li key={bank.name} className="flex h-10 items-center">
                  <Image
                    src={bank.logo}
                    alt={bank.name}
                    title={bank.credit}
                    width={width}
                    height={bank.height}
                    className="opacity-70 grayscale transition-[filter,opacity] duration-300 hover:opacity-100 hover:grayscale-0"
                    style={{ height: bank.height, width }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
