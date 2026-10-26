import {
  Bank,
  Scales,
  SealCheck,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

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
        <h2 className="font-display max-w-[22ch] text-3xl font-bold text-balance sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
          Специалисты, которые ведут сделку
        </h2>
        <p className="mt-4 max-w-[54ch] text-base leading-relaxed text-ink-soft sm:text-lg">
          На каждом этапе у клиента есть конкретный человек, который отвечает
          за процесс.
        </p>

        {/* иконка рядом с ролью (правки клиента): вместо фото и имени */}
        <ul className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2 lg:mt-16 lg:gap-y-14">
          {ROLES.map(({ icon: RoleIcon, title, text }) => (
            <li key={title} className="flex items-start gap-6">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-wine text-white lg:h-24 lg:w-24">
                <RoleIcon weight="light" aria-hidden className="h-10 w-10 lg:h-12 lg:w-12" />
              </span>
              <div className="pt-2 lg:pt-3">
                <h3 className="text-xl font-bold leading-snug tracking-[-0.01em] lg:text-2xl">
                  {title}
                </h3>
                <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-ink-soft sm:text-base">
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
