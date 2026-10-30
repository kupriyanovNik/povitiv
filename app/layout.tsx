import type { Metadata } from "next";
// шрифты самохостом (fontsource): сборка не ходит в Google Fonts,
// woff2 с кириллицей попадают в бандл из node_modules
import "@fontsource-variable/golos-text";
import "@fontsource-variable/geologica";
import "./globals.css";

// адрес, с которого отдаётся страница: картинка превью ссылки (og:image)
// должна открываться там же. На демо — домен Vercel (на positiv-vt.ru до
// переезда старый сайт без https), на VPS — боевой домен
const SITE_URL = process.env.VERCEL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL}`
  : "https://positiv-vt.ru";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  // демо на Vercel не индексируется (см. app/robots.ts), прод — да
  robots: process.env.VERCEL ? { index: false, follow: false } : undefined,
  // запрос в начале title: Яндекс сильнее учитывает его начало
  title: "Агентство недвижимости в Москве и Подмосковье — «Позитив ВТ»",
  description:
    "Продажа, покупка и обмен жилой, загородной и коммерческой недвижимости, новостройки в Москве и Подмосковье. Ипотека, оценка и юридическое сопровождение сделок. Работаем с 2010 года.",
  openGraph: {
    title: "Позитив ВТ: полный цикл работы с недвижимостью",
    description:
      "Продажа, покупка и обмен недвижимости, новостройки в Москве и области. Работаем с 2010 года.",
    locale: "ru_RU",
    type: "website",
    url: "/",
    siteName: "Позитив ВТ",
    // фирменная карточка (npm run og): не устаревает, как фото объекта,
    // и читается в квадратной обрезке превью Telegram
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Позитив ВТ — агентство недвижимости в Москве и Подмосковье",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
