"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionSafe } from "./useReducedMotionSafe";
import { ArrowUpRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import { formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { site } from "@/lib/site";
import { PhotoCarousel } from "./PhotoCarousel";
import { Reveal } from "./Reveal";

type Filter = "all" | "sale" | "rent" | "suburban";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "sale", label: "Продажа" },
  { key: "rent", label: "Аренда" },
  { key: "suburban", label: "Загородная" },
];

function matches(l: Listing, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "suburban") return l.category === "house" || l.category === "land";
  return l.dealType === f;
}

function FeaturedCard({
  listing,
  onPhotosLoop,
}: {
  listing: Listing;
  onPhotosLoop?: () => boolean | void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative">
        <PhotoCarousel
          photos={listing.photos}
          alt={`${listing.title}, ${listing.address}`}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="aspect-[4/3] w-full"
          autoplaySeconds={5}
          onLoop={onPhotosLoop}
        />
        {listing.badge && (
          <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-bold text-wine backdrop-blur-sm">
            {listing.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h3 className="text-xl font-bold leading-snug tracking-[-0.01em]">
            {listing.title}
          </h3>
          <span className="tnum shrink-0 text-xl font-extrabold">
            {formatPrice(listing.price, listing.priceNote)}
          </span>
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-soft">
          <MapPin size={14} weight="bold" className="shrink-0 text-wine" />
          {listing.address}
        </p>
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-soft">
          {listing.highlight}
        </p>
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-wine hover:text-wine-deep"
        >
          Смотреть объект
          <ArrowUpRight
            size={14}
            weight="bold"
            className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
          />
        </a>
      </div>
    </article>
  );
}

function CompactCard({ listing }: { listing: Listing }) {
  const reduce = useReducedMotionSafe();
  const [photoIdx, setPhotoIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCycle = () => {
    if (reduce || listing.photos.length < 2 || timer.current) return;
    timer.current = setInterval(
      () => setPhotoIdx((v) => (v + 1) % listing.photos.length),
      1000,
    );
  };
  const stopCycle = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPhotoIdx(0);
  };
  useEffect(() => stopCycle, []);

  return (
    <a
      href={listing.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
      className="group grid grid-cols-[140px_1fr] overflow-hidden rounded-2xl border border-line bg-surface sm:grid-cols-[180px_1fr]"
    >
      <div className="relative h-full min-h-[120px] overflow-hidden bg-wine-tint">
        {/* при наведении фото перелистываются кроссфейдом; фото может не быть */}
        {listing.photos.length > 0 && (
          <AnimatePresence initial={false}>
            <motion.div
              key={photoIdx}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Image
                src={listing.photos[photoIdx]}
                alt={`${listing.title}, ${listing.address}`}
                fill
                sizes="180px"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        )}
        {listing.photos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {listing.photos.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full ${i === photoIdx ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-bold leading-snug tracking-[-0.01em]">
            {listing.title}
          </h3>
          {listing.badge && (
            <span className="hidden shrink-0 rounded-full bg-wine-tint px-2.5 py-1 text-[11px] font-bold text-wine sm:block">
              {listing.badge}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-1 text-[13px] text-ink-soft">
          {listing.address}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="tnum text-[15px] font-extrabold">
            {formatPrice(listing.price, listing.priceNote)}
          </span>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-wine">
            Смотреть
            <ArrowUpRight
              size={13}
              weight="bold"
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </div>
    </a>
  );
}

// витрина не пересменивается чаще, чем раз в 15 секунд, даже если у
// объекта одна фотография (круг фотографий тогда «проходится» мгновенно)
const FEATURED_MIN_MS = 15_000 - 200;

/**
 * Витрина + список. Живёт отдельным компонентом внутри motion.div с
 * key={filter}: смена фильтра размонтирует его и состояние ротации
 * сбрасывается само, без эффектов с setState.
 */
function Showcase({
  filtered,
  startIdx,
}: {
  filtered: Listing[];
  startIdx: number;
}) {
  // очередь витрины: первый — большая карточка, дальше — правая колонка.
  // При смене верхний из колонки «переезжает» в витрину (layoutId ведёт
  // карточку через экран), бывшая витрина отъезжает в конец очереди
  const [order, setOrder] = useState<Listing[]>(() =>
    filtered.map((_, i) => filtered[(startIdx + i) % filtered.length]),
  );
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  // круг фотографий пройден: если объект провисел минимум 15 с — следующий
  const nextFeatured = () => {
    if (order.length < 2) return false;
    if (Date.now() - shownAt.current < FEATURED_MIN_MS) return false;
    shownAt.current = Date.now();
    setOrder((o) => [...o.slice(1), o[0]]);
    return true;
  };

  const [featured, ...rest] = order;
  const morph = { type: "spring" as const, duration: 0.7, bounce: 0 };

  return (
    <>
      {featured && (
        <motion.div
          key={featured.id}
          layoutId={featured.id}
          layout
          transition={morph}
          className="h-full"
        >
          <FeaturedCard listing={featured} onPhotosLoop={nextFeatured} />
        </motion.div>
      )}
      {rest.length > 0 && (
        <div className="flex flex-col gap-4">
          {rest.map((l) => (
            <motion.div key={l.id} layoutId={l.id} layout transition={morph}>
              <CompactCard listing={l} />
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

export function Listings({ listings }: { listings: Listing[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = useMemo(
    () => listings.filter((l) => matches(l, filter)),
    [listings, filter],
  );

  // витрина открывается объектом со «средней» ценой: не самым дорогим и
  // не самым дешёвым — с ним посетителю проще себя соотнести. Берём
  // медиану, а не среднее: один пентхаус-выброс не должен перетягивать
  // витрину к дорогому краю. Логика привязана к цене, а не к названиям:
  // данные приходят из синка
  const startIdx = useMemo(() => {
    if (filtered.length === 0) return 0;
    const sorted = [...filtered].sort((a, b) => a.price - b.price);
    return filtered.indexOf(sorted[Math.floor(sorted.length / 2)]);
  }, [filtered]);


  const counts = useMemo(() => {
    const map = new Map<Filter, number>();
    for (const f of FILTERS) {
      map.set(f.key, listings.filter((l) => matches(l, f.key)).length);
    }
    return map;
  }, [listings]);

  return (
    <section id="obekty" className="scroll-mt-20 bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display max-w-[26ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Недвижимость, с которой мы работаем
          </h2>
          <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Живые объявления из наших профилей на ЦИАН и Домклик — цены и
            статусы обновляются каждый день.
          </p>
        </Reveal>

        <div
          className="mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Фильтр объектов"
        >
          {FILTERS.filter((f) => (counts.get(f.key) ?? 0) > 0).map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`tnum h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
                filter === f.key
                  ? "border-wine bg-wine text-white"
                  : "border-line bg-surface text-ink hover:border-ink/30"
              }`}
            >
              {f.label}
              <span
                className={`ml-1.5 ${filter === f.key ? "text-white/70" : "text-ink-soft"}`}
              >
                {counts.get(f.key)}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-line p-10 text-center">
            <p className="font-semibold">В этой категории сейчас нет объектов</p>
            <p className="mt-1 text-sm text-ink-soft">
              Посмотрите другие категории или спросите нас о новых поступлениях.
            </p>
          </div>
        ) : (
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 grid items-start gap-4 lg:grid-cols-[11fr_9fr]"
          >
            <Showcase filtered={filtered} startIdx={startIdx} />
          </motion.div>
        )}

        <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-[60ch] text-sm text-ink-soft">
            Цены и доступность объектов могут меняться. Уточняйте актуальную
            информацию у специалиста.
          </p>
          <a
            href={site.profiles.cian}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-ink/15 bg-surface px-5 text-sm font-semibold transition-colors hover:border-ink/35"
          >
            Все объявления на ЦИАН
            <ArrowUpRight size={15} weight="bold" />
          </a>
        </div>
      </div>
    </section>
  );
}
