import { Reveal } from "./Reveal";

export function Manifesto() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-[880px] px-4 text-center sm:px-6">
        <Reveal>
          <p className="text-2xl font-bold leading-[1.35] tracking-[-0.015em] sm:text-3xl lg:text-[34px]">
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
