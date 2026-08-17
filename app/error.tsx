"use client";

import { useEffect } from "react";

/**
 * Страховка на непредвиденный сбой рендера (битые данные, ошибка кода):
 * вместо голой страницы Next показываем свою с телефоном агентства.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page error]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-2xl font-bold">
        Что-то пошло не так
      </p>
      <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-ink-soft">
        Страница временно недоступна. Попробуйте обновить её или позвоните
        нам:{" "}
        <a href="tel:+74956092864" className="tnum font-semibold text-wine">
          +7 (495) 609-28-64
        </a>
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex h-12 items-center rounded-full bg-wine px-6 font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98]"
      >
        Обновить страницу
      </button>
    </main>
  );
}
