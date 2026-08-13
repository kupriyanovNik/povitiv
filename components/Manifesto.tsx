import { Reveal } from "./Reveal";

export function Manifesto() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-[880px] px-4 text-center sm:px-6">
        <Reveal>
          <p className="font-display text-2xl font-semibold leading-[1.35] sm:text-3xl lg:text-[36px] lg:leading-[1.3]">
            Мы не сетевой гигант, а команда из семи специалистов, которые
            работают вместе почти десять лет и лично ведут каждую сделку. Нас
            можно проверить: профили, оценки и сделки открыты на ЦИАН и
            Домклик.
          </p>
          <p className="mt-6 text-[15px] font-semibold text-ink-soft">
            Команда агентства «Позитив ВТ», Москва, Палиха
          </p>
        </Reveal>
      </div>
    </section>
  );
}
