import {
  ChatsCircle,
  FileMagnifyingGlass,
  Handshake,
  Keyhole,
  Scales,
  Signature,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";

const POINTS = [
  {
    icon: Signature,
    title: "Работаем по договору",
    text: "Заранее фиксируем объём услуг, ответственность сторон и размер вознаграждения.",
  },
  {
    icon: FileMagnifyingGlass,
    title: "Проверяем исходные документы",
    text: "Анализируем документы на объект и участников до ключевых договорённостей.",
  },
  {
    icon: Scales,
    title: "Согласовываем схему сделки",
    text: "Определяем последовательность подписания, расчётов, банковских процедур и регистрации.",
  },
  {
    icon: Handshake,
    title: "Фиксируем условия",
    text: "Цена, сроки и состав имущества закрепляются документально.",
  },
  {
    icon: Keyhole,
    title: "Сопровождаем до передачи объекта",
    text: "Координируем регистрацию, расчёты и передачу ключей, а не заканчиваем на подписании.",
  },
  {
    icon: ChatsCircle,
    title: "Объясняем решения",
    text: "Вы понимаете, что происходит сейчас, зачем нужен каждый документ и каким будет следующий шаг.",
  },
];

export function Safety() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="max-w-[22ch] text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl lg:text-[44px] lg:leading-[1.08]">
            Критические этапы сделки под контролем
          </h2>
          <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Недвижимость связана с крупными расчётами, документами и несколькими
            участниками. Наша задача: сделать процесс последовательным и
            понятным.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-x-10 gap-y-8 border-t border-line pt-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title} className="flex gap-4">
              <p.icon
                size={26}
                weight="duotone"
                className="mt-0.5 shrink-0 text-pine"
              />
              <div>
                <h3 className="font-bold tracking-[-0.01em]">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {p.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
