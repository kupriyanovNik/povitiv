"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Настройка «уменьшить движение» без hydration mismatch. useReducedMotion
 * из motion отдаёт настоящее значение уже при гидрации, и стили, которые
 * от него зависят (прогресс каруселей, заливка маршрута), расходятся с
 * серверной разметкой. Здесь при гидрации React берёт серверный снимок
 * (false), а сразу после — настоящее значение.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
