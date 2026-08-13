import type { Metadata } from "next";
import { Geologica, Golos_Text } from "next/font/google";
import "./globals.css";

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://positiv-vt.ru"),
  title: "Позитив ВТ: агентство недвижимости в Москве и Подмосковье",
  description:
    "Продажа, покупка, обмен и аренда жилой, загородной и коммерческой недвижимости. Ипотека, оценка и юридическое сопровождение сделок. Работаем с 2010 года.",
  openGraph: {
    title: "Позитив ВТ: полный цикл работы с недвижимостью",
    description:
      "Продажа, покупка, обмен и аренда недвижимости в Москве и области. Работаем с 2010 года.",
    locale: "ru_RU",
    type: "website",
    images: ["/listings/cian-316539871/1.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${golos.variable} ${geologica.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
