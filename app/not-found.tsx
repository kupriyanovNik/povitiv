import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/Logo";
import { phone } from "@/lib/site";

export const metadata: Metadata = {
  title: "Страница не найдена: Позитив ВТ",
  robots: { index: false },
};

/**
 * 404 на русском вместо стандартной страницы Next. Сюда попадают по старым
 * ссылкам и опечаткам в адресе: даём главную и телефон агентства.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-16 text-center">
      <Link href="/" aria-label="На главную" className="text-wine">
        <Logo />
      </Link>
      <h1 className="font-display mt-10 text-3xl font-bold sm:text-4xl">
        Такой страницы нет
      </h1>
      <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-ink-soft sm:text-lg">
        Возможно, ссылка устарела или в адресе опечатка. Всё о нашей работе
        собрано на главной странице.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full bg-wine px-7 font-semibold text-white transition-colors hover:bg-wine-deep"
        >
          На главную
        </Link>
        <a
          href={phone.href}
          className="tnum inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line px-6 font-semibold transition-colors hover:border-ink/30"
        >
          <Phone size={16} weight="bold" className="text-wine" aria-hidden />
          {phone.display}
        </a>
      </div>
    </main>
  );
}
