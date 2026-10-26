import {
  Bank,
  Scales,
  SealCheck,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Reveal } from "./Reveal";

/**
 * Специалисты без фото и имён (правки клиента 26.10.2026): вместо
 * карточек сотрудников — роли в сделке крупными иконками на бордовом.
 */
const ROLES: { icon: Icon; title: string; text: string }[] = [
  {
    icon: UsersThree,
    title: "Специалисты по недвижимости",
    text: "Ведут вашу сделку от первой встречи до передачи ключей: оценка, показы, переговоры.",
  },
  {
    icon: Scales,
    title: "Юридическое сопровождение",
    text: "Проверка документов и истории объекта, безопасная схема расчётов и регистрация.",
  },
  {
    icon: Bank,
    title: "Ипотечные специалисты",
    text: "Помогают подать заявку в банк и встроить ипотеку в общий график сделки.",
  },
  {
    icon: SealCheck,
    title: "Руководитель агентства",
    text: "Следит за ходом сделок и всегда на связи, если нужно решение.",
  },
];

export function Team() {
  return (
    <section id="komanda" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display max-w-[24ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Специалисты, которые ведут сделку
          </h2>
          <p className="mt-4 max-w-[54ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Профессиональная команда. На каждом этапе у клиента есть
            конкретный человек, который отвечает за процесс.
          </p>
        </Reveal>

        <Reveal y={28} delay={0.08}>
          <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-8">
            {ROLES.map(({ icon: RoleIcon, title, text }) => (
              <li key={title}>
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-wine text-white ring-8 ring-wine-tint lg:h-28 lg:w-28">
                  <RoleIcon size={48} weight="regular" aria-hidden />
                </span>
                <h3 className="mt-7 text-lg font-bold leading-snug tracking-[-0.01em] lg:text-xl">
                  {title}
                </h3>
                <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
