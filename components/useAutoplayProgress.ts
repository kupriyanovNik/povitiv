"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";

/**
 * Автопрокрутка карусели: прогресс 0..1 за `seconds`, затем advance().
 * Работает только когда элемент в вьюпорте, уважает reduced motion,
 * умеет паузу (наведение, перетаскивание). resetKey = активный индекс.
 * Замечание: пауза по наведению срабатывает и когда блок «подъезжает»
 * под неподвижный курсор при скролле — это ожидаемое поведение.
 */
export function useAutoplayProgress({
  seconds,
  targetRef,
  advance,
  resetKey,
}: {
  seconds: number;
  targetRef: RefObject<HTMLElement | null>;
  advance: () => void;
  resetKey: number;
}) {
  const reduce = useReducedMotion();
  const inView = useInView(targetRef, { amount: 0.35 });
  const [paused, setPaused] = useState(false);
  const progress = useMotionValue(0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  // всегда свежие advance и paused без перезапуска таймера
  const advanceRef = useRef(advance);
  const pausedRef = useRef(paused);
  useEffect(() => {
    advanceRef.current = advance;
    pausedRef.current = paused;
  });

  useEffect(() => {
    progress.set(0);
    controlsRef.current?.stop();
    controlsRef.current = null;
    if (!inView || reduce) return;
    const controls = animate(progress, 1, {
      duration: seconds,
      ease: "linear",
      onComplete: () => advanceRef.current(),
    });
    // если пауза активна (например, слайд сменили стрелкой во время
    // зажатия), новый таймер должен родиться на паузе
    if (pausedRef.current) controls.pause();
    controlsRef.current = controls;
    return () => {
      controls.stop();
      if (controlsRef.current === controls) controlsRef.current = null;
    };
  }, [resetKey, inView, reduce, seconds, progress]);

  useEffect(() => {
    if (paused) controlsRef.current?.pause();
    else controlsRef.current?.play();
  }, [paused]);

  return { progress, setPaused, reduce };
}
