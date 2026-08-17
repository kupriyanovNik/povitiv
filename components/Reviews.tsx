"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  CaretLeft,
  CaretRight,
  Quotes,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { formatMonthYear, plural } from "@/lib/format";
import type { ExternalReview, QuoteReview, Review } from "@/lib/types";
import { site } from "@/lib/site";
import { Reveal } from "./Reveal";
import { useAutoplayProgress } from "./useAutoplayProgress";

const GAP = 16;
const AUTOPLAY_S = 6;

function shortAgentName(full: string): string {
  // «Гречишникова Наталья Ивановна» -> «Наталья Гречишникова»
  const parts = full.split(" ");
  if (parts.length >= 2) return `${parts[1]} ${parts[0]}`;
  return full;
}

function buildQuotes(
  reviews: Review[],
  external: ExternalReview[],
): QuoteReview[] {
  const fromDomclick: QuoteReview[] = reviews
    .filter((r) => r.text)
    .map((r) => ({
      id: `domclick-${r.id}`,
      text: r.text!,
      author: r.author,
      date: r.createdAt,
      rating: r.rating,
      sourceLabel: "Домклик",
      url: site.profiles.domclick,
      agentNote: `Сделку проводила ${shortAgentName(r.agent)}`,
    }));
  const fromExternal: QuoteReview[] = external.map((r) => ({
    id: `${r.source}-${r.date}-${r.author}`,
    text: r.text,
    author: r.author,
    date: r.date,
    rating: r.rating,
    sourceLabel: r.sourceLabel,
    url: r.url,
    agentNote: r.agent,
  }));
  return [...fromDomclick, ...fromExternal].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

function QuoteSlide({ quote }: { quote: QuoteReview }) {
  return (
    <figure
      className="flex w-full shrink-0 flex-col p-7 sm:p-9"
      style={{ marginRight: GAP }}
    >
      <div className="flex items-center justify-between">
        <Quotes size={32} weight="fill" className="text-wine/40" />
        <div className="flex gap-0.5" aria-label={`Оценка ${quote.rating} из 5`}>
          {Array.from({ length: quote.rating }).map((_, i) => (
            <Star key={i} size={15} weight="fill" className="text-gold" />
          ))}
        </div>
      </div>
      <blockquote className="font-display mt-4 text-xl font-semibold leading-[1.4] sm:text-2xl sm:leading-[1.4]">
        «{quote.text}»
      </blockquote>
      <figcaption className="mt-auto pt-6 text-[15px] text-ink-soft">
        <span className="font-bold text-ink">{quote.author}</span>
        <br />
        {quote.agentNote ? `${quote.agentNote}, ` : ""}
        {formatMonthYear(quote.date)}{" "}
        <a
          href={quote.url}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap font-semibold text-wine hover:underline"
        >
          Источник: {quote.sourceLabel}
        </a>
      </figcaption>
    </figure>
  );
}

export function Reviews({
  reviews,
  external,
  rating,
  votes,
}: {
  reviews: Review[];
  external: ExternalReview[];
  rating: number | null;
  votes: number;
}) {
  const reduce = useReducedMotion();
  const quotes = buildQuotes(reviews, external);
  const count = quotes.length;

  const viewportRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);
  const step = width + GAP;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    setWidth(el.clientWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback(
    (next: number, velocity = 0) => {
      const clamped = ((next % count) + count) % count;
      setIndex(clamped);
      animate(x, -clamped * step, {
        type: "spring",
        duration: reduce ? 0 : 0.55,
        bounce: 0,
        velocity,
      });
    },
    [count, step, x, reduce],
  );

  useEffect(() => {
    x.set(-index * step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const { progress, setPaused } = useAutoplayProgress({
    seconds: AUTOPLAY_S,
    targetRef: viewportRef,
    advance: () => goTo(index + 1),
    resetKey: index,
  });

  // данные приходят из ночного синка: без цитат секция не рендерится
  if (count === 0) return null;

  return (
    <section id="otzyvy" className="scroll-mt-20 bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display max-w-[26ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Что говорят после проведённых сделок
          </h2>
          <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Только настоящие отзывы с открытых площадок: оценки на Домклик
            привязаны к реальным сделкам, отзывы на Яндекс Картах публикуют
            проверенные пользователи.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-[7fr_5fr]">
          {/* карусель цитат */}
          <div
            className="flex flex-col overflow-hidden rounded-2xl bg-wine-tint"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <div
              ref={viewportRef}
              role="group"
              aria-roledescription="карусель"
              aria-label="Отзывы клиентов"
              className="flex-1 overflow-hidden"
            >
              <motion.div
                className="flex h-full cursor-grab items-stretch active:cursor-grabbing"
                style={{ x }}
                drag="x"
                dragConstraints={{ left: -(count - 1) * step, right: 0 }}
                dragElastic={0.12}
                dragMomentum={false}
                onDragStart={() => setPaused(true)}
                onDragEnd={(_, info) => {
                  const projected = -x.get() - info.velocity.x * 0.2;
                  goTo(
                    Math.max(
                      0,
                      Math.min(count - 1, Math.round(projected / step)),
                    ),
                    info.velocity.x,
                  );
                  setPaused(false);
                }}
              >
                {quotes.map((q) => (
                  <QuoteSlide key={q.id} quote={q} />
                ))}
              </motion.div>
            </div>

            <div className="flex items-center justify-between px-7 pb-6 sm:px-9">
              <div className="flex gap-1.5" role="group" aria-label="Отзывы">
                {quotes.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    aria-current={index === i || undefined}
                    aria-label={`Отзыв: ${q.author}`}
                    onClick={() => goTo(i)}
                    className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                      index === i
                        ? "w-8 bg-wine/20"
                        : "w-1.5 bg-wine/25 hover:bg-wine/45"
                    }`}
                  >
                    {index === i && (
                      <motion.span
                        aria-hidden
                        style={{ scaleX: reduce ? 1 : progress }}
                        className="absolute inset-0 origin-left rounded-full bg-wine"
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  aria-label="Предыдущий отзыв"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-wine/25 text-wine transition-colors hover:border-wine/50"
                >
                  <CaretLeft size={15} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  aria-label="Следующий отзыв"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-wine/25 text-wine transition-colors hover:border-wine/50"
                >
                  <CaretRight size={15} weight="bold" />
                </button>
              </div>
            </div>
          </div>

          {/* сводка рейтинга и ссылки на источники */}
          <div className="flex flex-col gap-4">
            {rating != null && votes > 0 && (
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
                  Общая оценка агентства на Домклик: {votes}{" "}
                  {plural(votes, "оценка", "оценки", "оценок")} после
                  проведённых сделок, и все они максимальные.
                </p>
              </div>
            )}
            <a
              href={site.profiles.domclick}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-between rounded-2xl border border-line bg-surface px-5 text-[15px] font-semibold transition-colors hover:border-ink/30"
            >
              Отзывы на Домклик
              <ArrowUpRight size={15} weight="bold" className="text-wine" />
            </a>
            <a
              href="https://yandex.ru/maps/org/pozitiv_vt/200829446440/reviews/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-between rounded-2xl border border-line bg-surface px-5 text-[15px] font-semibold transition-colors hover:border-ink/30"
            >
              Отзывы на Яндекс Картах
              <ArrowUpRight size={15} weight="bold" className="text-wine" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
