import type { Metadata } from "next";
// шрифты самохостом (fontsource): сборка не ходит в Google Fonts,
// woff2 с кириллицей попадают в бандл из node_modules
import "@fontsource-variable/golos-text";
import "@fontsource-variable/geologica";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://positiv-vt.ru"),
  alternates: { canonical: "/" },
  // демо на Vercel не индексируется (см. app/robots.ts), прод — да
  robots: process.env.VERCEL ? { index: false, follow: false } : undefined,
  // запрос в начале title: Яндекс сильнее учитывает его начало
  title: "Агентство недвижимости в Москве и Подмосковье — «Позитив ВТ»",
  description:
    "Продажа, покупка, обмен и аренда жилой, загородной и коммерческой недвижимости в Москве и Подмосковье. Ипотека, оценка и юридическое сопровождение сделок. Работаем с 2010 года.",
  openGraph: {
    title: "Позитив ВТ: полный цикл работы с недвижимостью",
    description:
      "Продажа, покупка, обмен и аренда недвижимости в Москве и области. Работаем с 2010 года.",
    locale: "ru_RU",
    type: "website",
    // отдельный файл, а не фото объявления: те удаляются ночным синком
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
