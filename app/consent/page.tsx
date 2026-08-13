import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных: Позитив ВТ",
  robots: { index: false },
};

export default function ConsentPage() {
  return (
    <main className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-pine hover:underline">
        На главную
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-[-0.02em]">
        Согласие на обработку персональных данных
      </h1>
      <div className="mt-8 space-y-5 leading-relaxed text-ink-soft">
        <p>
          Отправляя любую форму на этом сайте, я свободно, своей волей и в своём
          интересе даю согласие {site.legal.name} (ИНН {site.legal.inn}, ОГРН{" "}
          {site.legal.ogrn}, адрес: {site.address}) на обработку моих
          персональных данных: имени, номера телефона и содержания обращения.
        </p>
        <p>
          Цель обработки: связь со мной по моему обращению, консультация по
          вопросам недвижимости и подготовка предложения по моей задаче.
        </p>
        <p>
          Обработка включает сбор, запись, систематизацию, хранение, уточнение,
          использование и удаление данных. Данные не передаются третьим лицам,
          кроме случаев, предусмотренных законом.
        </p>
        <p>
          Согласие действует до момента его отзыва. Отозвать согласие можно по
          телефону {site.phone} или письменным обращением по адресу офиса.
        </p>
      </div>
    </main>
  );
}
