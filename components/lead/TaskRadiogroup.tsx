"use client";

import { useRef } from "react";
import { leadTasks, type LeadTask } from "@/lib/site";

/**
 * Радиогруппа «Что требуется?» по WAI-ARIA APG. Общая для инлайн-формы и
 * модалки, чтобы a11y-поведение не разъехалось между двумя формами:
 * - roving tabindex: в таб-порядке только выбранный чип, Tab — один стоп
 *   на всю группу (unchecked чипы с tabIndex=-1 трэппер модалки не считает);
 * - стрелки двигают фокус и сразу выбирают (selection follows focus),
 *   по кругу с последнего на первый; Home/End — крайние чипы.
 */
export function TaskRadiogroup({
  ariaLabel,
  value,
  onChange,
  className,
}: {
  ariaLabel: string;
  value: LeadTask;
  onChange: (task: LeadTask) => void;
  className?: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  // фокус и выбор вместе: DOM-порядок чипов совпадает с leadTasks
  const selectAt = (index: number) => {
    onChange(leadTasks[index]);
    groupRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [index]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const from = leadTasks.indexOf(value);
    const last = leadTasks.length - 1;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault(); // иначе стрелки скроллят страницу
        selectAt(from === last ? 0 : from + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        selectAt(from === 0 ? last : from - 1);
        break;
      case "Home":
        e.preventDefault();
        selectAt(0);
        break;
      case "End":
        e.preventDefault();
        selectAt(last);
        break;
    }
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={`flex flex-wrap gap-2 ${className ?? ""}`}
    >
      {leadTasks.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={t === value}
          // roving tabindex: чипы выбираются стрелками, Tab проходит группу
          // одним стопом на выбранном чипе
          tabIndex={t === value ? 0 : -1}
          onClick={() => onChange(t)}
          className={`h-9 rounded-full border px-3.5 text-sm font-medium transition-colors ${
            t === value
              ? "border-wine bg-wine text-white"
              : "border-line bg-surface text-ink hover:border-ink/30"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
