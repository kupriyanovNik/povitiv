import { ArrowUpRight, Quotes, Star } from "@phosphor-icons/react/dist/ssr";
import type { Review } from "@/lib/data";
import { formatMonthYear } from "@/lib/data";
import { site } from "@/lib/site";
import { Reveal } from "./Reveal";

function shortAgentName(full: string): string {
  // «Гречишникова Наталья Ивановна» -> «Наталья Гречишникова»
  const parts = full.split(" ");
  if (parts.length >= 2) return `${parts[1]} ${parts[0]}`;
  return full;
}

export function Reviews({
  reviews,
  rating,
  votes,
}: {
  reviews: Review[];
  rating: number;
  votes: number;
}) {
  const textReview = reviews.find((r) => r.text);
  const rated = reviews.filter((r) => !r.text && r.rating === 5).slice(0, 2);

  return (
    <section id="otzyvy" className="scroll-mt-20 bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display max-w-[26ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Что говорят после проведённых сделок
          </h2>
          <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Оценки на Домклик привязаны к реальным сделкам: площадка указывает
            специалиста и дату. Все {votes} оценок агентства максимальные.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-[7fr_5fr]">
          {textReview && (
            <figure className="flex flex-col justify-between rounded-2xl bg-wine-tint p-7 sm:p-10">
              <Quotes size={36} weight="fill" className="text-wine/40" />
              <blockquote className="font-display mt-4 text-2xl font-semibold leading-[1.35] sm:text-[27px]">
                «{textReview.text}»
              </blockquote>
              <figcaption className="mt-6 text-[15px] text-ink-soft">
                <span className="font-bold text-ink">{textReview.author}</span>
                <br />
                Сделку проводила {shortAgentName(textReview.agent)},{" "}
                {formatMonthYear(textReview.createdAt)} Источник: Домклик
              </figcaption>
            </figure>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-1 flex-col justify-center rounded-2xl bg-wine-ink p-7 text-white sm:p-8">
              <div className="flex items-end gap-3">
                <span className="font-display text-6xl font-bold leading-none">
                  {rating.toFixed(1).replace(".", ",")}
                </span>
                <div className="mb-1 flex gap-0.5" aria-label="5 звёзд из 5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} weight="fill" className="text-white" />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-white/80">
                Общая оценка агентства на Домклик по {votes} оценкам после
                проведённых сделок
              </p>
            </div>

            {rated.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold">{r.author}</p>
                  <div className="flex gap-0.5" aria-label="Оценка 5 из 5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        weight="fill"
                        className="text-gold"
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  Оценка после сделки со специалистом{" "}
                  {shortAgentName(r.agent).split(" ")[0]}{" "}
                  {shortAgentName(r.agent).split(" ")[1]},{" "}
                  {formatMonthYear(r.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <a
          href={site.profiles.domclick}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-ink/15 bg-surface px-5 text-sm font-semibold transition-colors hover:border-ink/35"
        >
          Посмотреть отзывы на Домклик
          <ArrowUpRight size={15} weight="bold" />
        </a>
      </div>
    </section>
  );
}
