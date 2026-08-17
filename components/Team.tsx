"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import {
  CaretLeft,
  CaretRight,
  SealCheck,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import type { Agent } from "@/lib/types";
import { Reveal } from "./Reveal";
import { useAutoplayProgress } from "./useAutoplayProgress";

const ROLES: Record<string, string> = {
  "Ольга Инкулец": "Генеральный директор, риелтор",
  "Татьяна Чистякова": "Руководитель агентства, риелтор",
  "Наталья Гречишникова": "Риелтор, вторичное жильё",
  "Екатерина Клименко": "Риелтор, вторичное и загородное жильё",
  "Ирина Лисовская": "Риелтор",
  "Надежда Аккуратнова": "Риелтор",
  "Вера Тарасенкова": "Риелтор",
};

// самые активные — первыми
const ORDER = [
  "Ольга Инкулец",
  "Наталья Гречишникова",
  "Татьяна Чистякова",
  "Екатерина Клименко",
  "Ирина Лисовская",
  "Надежда Аккуратнова",
  "Вера Тарасенкова",
];

const GAP = 24;
const AUTOPLAY_S = 4;

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

function yearsOn(registeredAt: string): string {
  const years = Math.floor(
    (Date.now() - new Date(registeredAt).getTime()) / (365.25 * 24 * 3600e3),
  );
  return `${years} лет на Домклик`;
}

function dealsLabel(n: number): string {
  return `${n} ${n === 1 ? "сделка" : n < 5 ? "сделки" : "сделок"} за 12 месяцев`;
}

function AgentSlide({
  agent,
  active,
  onSelect,
}: {
  agent: Agent;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      animate={{ scale: active ? 1 : 0.88, opacity: active ? 1 : 0.45 }}
      transition={{ type: "spring", duration: 0.55, bounce: 0 }}
      className="relative aspect-[3/4] shrink-0 overflow-hidden rounded-2xl bg-wine-ink"
      style={{ width: "var(--team-card-w)" }}
    >
      {agent.avatar ? (
        <Image
          src={agent.avatar}
          alt={agent.name}
          fill
          sizes="420px"
          draggable={false}
          className="pointer-events-none select-none object-cover object-top"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-wine to-wine-ink"
        >
          <span className="font-display -mt-16 text-[120px] font-bold text-white/15">
            {initials(agent.name)}
          </span>
        </div>
      )}

      {/* скрим и информация поверх фото */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink/90 via-ink/45 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <p className="flex items-center gap-1.5 text-xl font-bold tracking-[-0.01em]">
          {agent.name}
          {agent.verified && (
            <SealCheck
              size={18}
              weight="fill"
              className="shrink-0 text-white/90"
              aria-label="Профиль подтверждён"
            />
          )}
        </p>
        <p className="mt-0.5 text-sm text-white/75">
          {ROLES[agent.name] ?? "Риелтор"}
        </p>
        <div className="mt-3 space-y-1 border-t border-white/20 pt-3 text-sm">
          <p className="tnum text-white/85">{yearsOn(agent.registeredAt)}</p>
          {agent.deals12m > 0 && (
            <p className="tnum font-semibold">{dealsLabel(agent.deals12m)}</p>
          )}
          {agent.ratingVotes > 0 && (
            <p className="tnum flex items-center gap-1.5 font-semibold">
              <Star size={13} weight="fill" className="text-gold" />
              {agent.ratingAvg?.toFixed(1).replace(".", ",")} по оценкам сделок
            </p>
          )}
        </div>
      </div>

      {/* боковые карточки кликабельны целиком */}
      {!active && (
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Показать: ${agent.name}`}
          className="absolute inset-0 z-10 cursor-pointer"
        />
      )}
    </motion.div>
  );
}

export function Team({ agents }: { agents: Agent[] }) {
  const reduce = useReducedMotion();
  const sorted = [...agents].sort(
    (a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name),
  );
  const count = sorted.length;

  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportW, setViewportW] = useState(0);
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);



  // ширина карточки: до 400px, на мобильных с «выглядыванием» соседей
  const cardW = Math.min(400, Math.max(240, viewportW - 88));
  const step = cardW + GAP;
  const centerOffset = (viewportW - cardW) / 2;
  const xFor = useCallback(
    (i: number) => centerOffset - i * step,
    [centerOffset, step],
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewportW(el.clientWidth));
    setViewportW(el.clientWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback(
    (next: number, velocity = 0) => {
      const clamped = Math.max(0, Math.min(count - 1, next));
      setIndex(clamped);
      animate(x, xFor(clamped), {
        type: "spring",
        duration: reduce ? 0 : 0.55,
        bounce: 0,
        velocity,
      });
    },
    [count, x, xFor, reduce],
  );

  // держим активный слайд по центру при ресайзе
  useEffect(() => {
    x.set(xFor(index));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportW]);

  // автопрокрутка: 4 секунды на специалиста, индикатор-прогресс
  const { progress, setPaused } = useAutoplayProgress({
    seconds: AUTOPLAY_S,
    targetRef: viewportRef,
    advance: () => goTo((index + 1) % count),
    resetKey: index,
  });

  return (
    <section id="komanda" className="scroll-mt-20 overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="font-display max-w-[24ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
                Специалисты, которые ведут сделку
              </h2>
              <p className="mt-4 max-w-[54ch] text-base leading-relaxed text-ink-soft sm:text-lg">
                Вся команда из семи риелторов. На каждом этапе у клиента есть
                конкретный человек, который отвечает за процесс. Показатели
                видны в открытых профилях на Домклик.
              </p>
            </div>
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                aria-label="Предыдущий специалист"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-surface text-ink transition-colors hover:border-ink/35 disabled:opacity-35"
              >
                <CaretLeft size={17} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                disabled={index === count - 1}
                aria-label="Следующий специалист"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-surface text-ink transition-colors hover:border-ink/35 disabled:opacity-35"
              >
                <CaretRight size={17} weight="bold" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <div
        ref={viewportRef}
        role="group"
        aria-roledescription="карусель"
        aria-label="Команда агентства"
        className="mt-10 overflow-hidden lg:mt-12"
        style={{ "--team-card-w": `${cardW}px` } as React.CSSProperties}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <motion.div
          className="flex cursor-grab items-center active:cursor-grabbing"
          style={{ x, gap: GAP }}
          drag="x"
          dragConstraints={{ left: xFor(count - 1), right: xFor(0) }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragStart={() => setPaused(true)}
          onDragEnd={(_, info) => {
            const projected = centerOffset - x.get() - info.velocity.x * 0.2;
            goTo(Math.round(projected / step), info.velocity.x);
            setPaused(false);
          }}
        >
          {sorted.map((agent, i) => (
            <AgentSlide
              key={agent.casId}
              agent={agent}
              active={i === index}
              onSelect={() => goTo(i)}
            />
          ))}
        </motion.div>

        <div
          className="mt-6 flex justify-center gap-1.5"
          role="tablist"
          aria-label="Специалисты"
        >
          {sorted.map((agent, i) => (
            <button
              key={agent.casId}
              type="button"
              role="tab"
              aria-selected={index === i}
              aria-label={agent.name}
              onClick={() => goTo(i)}
              className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                index === i
                  ? "w-8 bg-ink/15"
                  : "w-1.5 bg-ink/20 hover:bg-ink/40"
              }`}
            >
              {/* активный индикатор заполняется за время автопрокрутки */}
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
      </div>
    </section>
  );
}
