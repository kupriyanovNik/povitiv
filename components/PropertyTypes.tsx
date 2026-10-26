import {
  Building,
  Crane,
  Door,
  HouseLine,
  MapTrifold,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

/**
 * Виды недвижимости вместо витрины объектов (правки клиента 26.10.2026):
 * конкретные объекты в работе на сайте больше не показываются, а виды
 * недвижимости даны крупными иконками на фирменном бордовом.
 */
const TYPES: { icon: Icon; title: string; text: string }[] = [
  {
    icon: Building,
    title: "Квартиры",
    text: "Вторичное жильё в Москве и Подмосковье: от студий до многокомнатных квартир.",
  },
  {
    icon: Crane,
    title: "Новостройки",
    text: "Квартиры от проверенных застройщиков с проверкой документов и сопровождением сделки.",
  },
  {
    icon: HouseLine,
    title: "Загородные дома",
    text: "Дома, коттеджи и дачи в Подмосковье вместе с участком и постройками.",
  },
  {
    icon: MapTrifold,
    title: "Земельные участки",
    text: "Участки под строительство и садоводство с проверкой документов и границ.",
  },
  {
    icon: Door,
    title: "Комнаты и доли",
    text: "Комнаты в квартирах и доли в собственности, с учётом прав совладельцев.",
  },
  {
    icon: Storefront,
    title: "Коммерческая недвижимость",
    text: "Помещения под офис, магазин или сервис для собственного бизнеса.",
  },
];

export function PropertyTypes() {
  // бордовая полоса: единственный тёмный блок в середине страницы,
  // список строками, а не сетка одинаковых карточек
  return (
    <section
      id="nedvizhimost"
      className="scroll-mt-20 bg-wine-ink py-20 text-white lg:py-28"
    >
      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 sm:px-6 lg:grid-cols-[5fr_7fr] lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display max-w-[14ch] text-3xl font-bold text-balance sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Недвижимость, с которой мы работаем
          </h2>
          <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-white/70 sm:text-lg">
            Жилая, загородная и коммерческая недвижимость в Москве и
            Московской области.
          </p>
        </div>

        <ul className="border-b border-white/15">
          {TYPES.map(({ icon: TypeIcon, title, text }) => (
            <li
              key={title}
              className="flex items-center gap-5 border-t border-white/15 py-6 sm:gap-8 sm:py-7"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-wine text-white sm:h-[88px] sm:w-[88px]">
                <TypeIcon size={44} weight="light" aria-hidden className="h-9 w-9 sm:h-11 sm:w-11" />
              </span>
              <div className="sm:grid sm:flex-1 sm:grid-cols-[minmax(0,15ch)_1fr] sm:items-baseline sm:gap-8">
                <h3 className="text-lg font-bold leading-snug tracking-[-0.01em] sm:text-2xl">
                  {title}
                </h3>
                <p className="mt-1 text-[15px] leading-relaxed text-white/70 sm:mt-0">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
