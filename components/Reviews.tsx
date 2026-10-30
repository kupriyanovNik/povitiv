"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import {
  ArrowUpRight,
  CaretLeft,
  CaretRight,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { formatMonthYear, plural } from "@/lib/format";
import type { ExternalReview, QuoteReview, Review } from "@/lib/types";
import { site } from "@/lib/site";
import { useAutoplayProgress } from "./useAutoplayProgress";

const GAP = 16;
const AUTOPLAY_S = 6;

// имена сотрудников с сайта убраны (правки клиента 26.10.2026), поэтому
// подписи «Сделку проводила …» у отзывов больше нет
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
      agentNote: null,
    }));
  const fromExternal: QuoteReview[] = external.map((r) => ({
    id: `${r.source}-${r.date}-${r.author}`,
    text: r.text,
    author: r.author,
    date: r.date,
    rating: r.rating,
    sourceLabel: r.sourceLabel,
    url: r.url,
    agentNote: null,
  }));
  return [...fromDomclick, ...fromExternal].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

function QuoteSlide({ quote }: { quote: QuoteReview }) {
  return (
    <figure
      className="flex w-full shrink-0 flex-col p-7 sm:p-10 lg:px-14 lg:pt-14"
      style={{ marginRight: GAP }}
    >
      <blockquote className="font-display max-w-[46ch] text-xl font-semibold leading-[1.4] text-balance sm:text-2xl sm:leading-[1.4] lg:text-[28px] lg:leading-[1.38]">
        «{quote.text}»
      </blockquote>
      <figcaption className="mt-auto pt-6 text-[15px] text-ink-soft">
        <span className="flex items-center gap-3">
          <span className="font-bold text-ink">{quote.author}</span>
          <span className="flex gap-0.5" role="img" aria-label={`Оценка ${quote.rating} из 5`}>
            {Array.from({ length: quote.rating }).map((_, i) => (
              <Star key={i} size={13} weight="fill" className="text-gold" />
            ))}
          </span>
        </span>
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
  const reduce = useReducedMotionSafe();
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

  // без цитат в data/*.json секция не рендерится
  if (count === 0) return null;

  return (
    <section id="otzyvy" className="scroll-mt-20 bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <h2 className="font-display max-w-[22ch] text-3xl font-bold text-balance sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
              Что говорят после проведённых сделок
            </h2>
            <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-ink-soft sm:text-lg">
              Только настоящие отзывы с открытых площадок: оценки на Домклик
              привязаны к реальным сделкам, отзывы на Яндекс Картах публикуют
              проверенные пользователи.
            </p>
          </div>

          {/* рейтинг — строкой сведений рядом с заголовком, а не отдельной
              карточкой с крупной цифрой */}
          <div className="shrink-0 lg:pb-1 lg:text-right">
            {rating != null && votes > 0 && (
              <p className="flex items-center gap-2 text-[15px] lg:justify-end">
                <span
                  className="flex gap-0.5 text-gold"
                  role="img"
                  aria-label={`${Math.round(rating)} из 5 звёзд`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      weight="fill"
                      className={i < Math.round(rating) ? "" : "opacity-25"}
                    />
                  ))}
                </span>
                <span>
                  <span className="tnum font-bold">
                    {rating.toFixed(1).replace(".", ",")}
                  </span>{" "}
                  <span className="text-ink-soft">
                    на Домклик, {votes}{" "}
                    {plural(votes, "оценка", "оценки", "оценок")} после сделок
                  </span>
                </span>
              </p>
            )}
            <div className="mt-3 flex gap-5 text-[15px] font-semibold lg:justify-end">
              <a
                href={site.profiles.domclick}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-wine underline-offset-4 hover:underline"
              >
                Отзывы на Домклик
                <ArrowUpRight size={14} weight="bold" />
              </a>
              <a
                href="https://yandex.ru/maps/org/pozitiv_vt/200829446440/reviews/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-wine underline-offset-4 hover:underline"
              >
                На Яндекс Картах
                <ArrowUpRight size={14} weight="bold" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 lg:mt-12">
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

            <div className="flex items-center justify-between px-7 pb-6 sm:px-10 lg:px-14 lg:pb-10">
              {/* точки маленькие, а кнопки вокруг них 24px: в них легко попасть
                  пальцем */}
              <div className="-mx-[9px] flex" role="group" aria-label="Отзывы">
                {quotes.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    aria-current={index === i || undefined}
                    aria-label={`Отзыв: ${q.author}`}
                    onClick={() => goTo(i)}
                    className="group/dot flex h-6 min-w-6 items-center justify-center px-[9px]"
                  >
                    <span
                      className={`relative block h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                        index === i
                          ? "w-8 bg-wine/20"
                          : "w-1.5 bg-wine/25 group-hover/dot:bg-wine/45"
                      }`}
                    >
                      {index === i && (
                        <motion.span
                          aria-hidden
                          style={{ scaleX: reduce ? 1 : progress }}
                          className="absolute inset-0 origin-left rounded-full bg-wine"
                        />
                      )}
                    </span>
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

        </div>
      </div>
    </section>
  );
}
