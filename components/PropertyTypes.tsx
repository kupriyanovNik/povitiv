import {
  Building,
  Crane,
  Door,
  HouseLine,
  MapTrifold,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Reveal } from "./Reveal";

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
  return (
    <section id="nedvizhimost" className="scroll-mt-20 bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display max-w-[26ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Недвижимость, с которой мы работаем
          </h2>
          <p className="mt-4 max-w-[54ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Жилая, загородная и коммерческая недвижимость в Москве и
            Московской области.
          </p>
        </Reveal>

        <Reveal y={28} delay={0.08}>
          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-y-14">
            {TYPES.map(({ icon: TypeIcon, title, text }) => (
              <li key={title} className="flex gap-5">
                <span className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-2xl bg-wine text-white shadow-[0_14px_30px_-16px_rgba(125,27,36,0.7)] lg:h-[84px] lg:w-[84px]">
                  <TypeIcon size={40} weight="regular" aria-hidden />
                </span>
                <div className="pt-1.5">
                  <h3 className="text-lg font-bold leading-snug tracking-[-0.01em] lg:text-xl">
                    {title}
                  </h3>
                  <p className="mt-1.5 max-w-[36ch] text-[15px] leading-relaxed text-ink-soft">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
