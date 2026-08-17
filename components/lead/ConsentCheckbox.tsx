"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";

/**
 * Отдельный неотмеченный чекбокс согласия на обработку ПДн
 * (требование практики РКН: согласие не «сливается» с кнопкой отправки).
 */
export function ConsentCheckbox({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink-soft"
    >
      <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-line bg-surface transition-colors checked:border-wine checked:bg-wine"
        />
        <Check
          size={12}
          weight="bold"
          className="pointer-events-none absolute left-1 top-1 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      <span>
        Я даю{" "}
        <a
          href="/consent"
          target="_blank"
          className="underline hover:text-ink"
        >
          согласие на обработку персональных данных
        </a>{" "}
        в соответствии с{" "}
        <a
          href="/privacy"
          target="_blank"
          className="underline hover:text-ink"
        >
          политикой конфиденциальности
        </a>
      </span>
    </label>
  );
}
