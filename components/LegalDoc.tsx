import Link from "next/link";
import type { LegalBlock } from "@/lib/legal";

// адреса почты в тексте клиента делаем ссылками
const EMAIL = /([\w.-]+@[\w-]+\.[a-z]{2,})/gi;

function Text({ text }: { text: string }) {
  return text.split(EMAIL).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={`mailto:${part}`} className="text-wine underline">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

/** Юридическая страница: заголовки разделов, абзацы и перечни из lib/legal.ts. */
export function LegalDoc({
  title,
  blocks,
}: {
  title: string;
  blocks: LegalBlock[];
}) {
  // подряд идущие пункты «— …» собираем в один список
  const groups: (LegalBlock | LegalBlock[])[] = [];
  for (const b of blocks) {
    const last = groups.at(-1);
    if (b.t === "li" && Array.isArray(last)) last.push(b);
    else groups.push(b.t === "li" ? [b] : b);
  }

  return (
    <main className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-wine hover:underline">
        На главную
      </Link>
      <h1 className="font-display mt-6 text-3xl font-bold">{title}</h1>
      <div className="mt-8 space-y-4 leading-relaxed text-ink-soft">
        {groups.map((g, i) =>
          Array.isArray(g) ? (
            <ul key={i} className="list-disc space-y-2 pl-5 marker:text-wine">
              {g.map((li, j) => (
                <li key={j}>
                  <Text text={li.text} />
                </li>
              ))}
            </ul>
          ) : g.t === "h" ? (
            <h2 key={i} className="pt-6 text-xl font-bold text-ink">
              {g.text}
            </h2>
          ) : (
            <p key={i}>
              <Text text={g.text} />
            </p>
          ),
        )}
      </div>
    </main>
  );
}
