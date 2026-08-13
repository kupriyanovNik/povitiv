import Image from "next/image";
import { SealCheck, Star } from "@phosphor-icons/react/dist/ssr";
import type { Agent } from "@/lib/data";
import { Reveal } from "./Reveal";

const ROLES: Record<string, string> = {
  "Ольга Инкулец": "Генеральный директор, риелтор",
  "Татьяна Чистякова": "Руководитель агентства, риелтор",
  "Наталья Гречишникова": "Риелтор, вторичное жильё",
  "Екатерина Клименко": "Риелтор, вторичное и загородное жильё",
  "Ирина Лисовская": "Риелтор",
  "Надежда Аккуратнова": "Риелтор",
  "Вера Тарасенкова": "Риелтор",
};

const FEATURED = [
  "Ольга Инкулец",
  "Наталья Гречишникова",
  "Татьяна Чистякова",
  "Екатерина Клименко",
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

function yearsOn(registeredAt: string): string {
  const years = Math.floor(
    (Date.now() - new Date(registeredAt).getTime()) / (365.25 * 24 * 3600e3),
  );
  return `${years} лет на Домклик`;
}

export function Team({ agents }: { agents: Agent[] }) {
  const featured = FEATURED.map(
    (n) => agents.find((a) => a.name === n)!,
  ).filter(Boolean);
  const others = agents.filter((a) => !FEATURED.includes(a.name));

  return (
    <section id="komanda" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display max-w-[24ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Специалисты, которые ведут сделку
          </h2>
          <p className="mt-4 max-w-[54ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            На каждом этапе у клиента есть конкретный человек, который отвечает
            за процесс и коммуникацию. Показатели ниже видны в открытых профилях
            на Домклик.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {featured.map((agent) => (
            <div
              key={agent.casId}
              className="flex flex-col rounded-2xl border border-line bg-surface p-6"
            >
              {agent.avatar ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-full">
                  <Image
                    src={agent.avatar}
                    alt={agent.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wine-tint text-xl font-bold text-wine">
                  {initials(agent.name)}
                </div>
              )}
              <h3 className="mt-4 flex items-center gap-1.5 text-lg font-bold tracking-[-0.01em]">
                {agent.name}
                {agent.verified && (
                  <SealCheck
                    size={18}
                    weight="fill"
                    className="shrink-0 text-wine"
                    aria-label="Профиль подтверждён"
                  />
                )}
              </h3>
              <p className="mt-0.5 text-sm text-ink-soft">
                {ROLES[agent.name] ?? "Риелтор"}
              </p>
              <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                <p className="tnum text-ink-soft">{yearsOn(agent.registeredAt)}</p>
                {agent.deals12m > 0 && (
                  <p className="tnum font-semibold">
                    {agent.deals12m}{" "}
                    {agent.deals12m === 1
                      ? "сделка"
                      : agent.deals12m < 5
                        ? "сделки"
                        : "сделок"}{" "}
                    за 12 месяцев
                  </p>
                )}
                {agent.ratingVotes > 0 && (
                  <p className="tnum flex items-center gap-1 font-semibold">
                    <Star size={14} weight="fill" className="text-gold" />
                    {agent.ratingAvg?.toFixed(1).replace(".", ",")} по оценкам
                    сделок
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[15px] text-ink-soft">
          В агентстве также работают{" "}
          {others.map((a, i) => (
            <span key={a.casId} className="font-semibold text-ink">
              {a.name}
              {i < others.length - 1 ? ", " : ""}
            </span>
          ))}
          .
        </p>
      </div>
    </section>
  );
}
