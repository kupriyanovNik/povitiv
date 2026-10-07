import Image from "next/image";
import type { Agent } from "@/lib/types";
import { team } from "@/lib/site";
import { Reveal } from "./Reveal";

type Member = { name: string; role: string; avatar: string | null };

function MemberCard({ member }: { member: Member }) {
  return (
    <figure className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-wine-ink">
      {member.avatar ? (
        <Image
          src={member.avatar}
          alt={member.name}
          fill
          sizes="(min-width: 768px) 33vw, 80vw"
          className="object-cover object-top"
        />
      ) : (
        // фото ещё не прислали: фирменная эмблема вместо пустого силуэта
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-wine to-wine-ink"
        >
          <span
            className="absolute inset-x-[14%] top-[18%] block aspect-[335/169] bg-white/12"
            style={{
              maskImage: "url(/brand/emblem.svg)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskImage: "url(/brand/emblem.svg)",
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
            }}
          />
        </div>
      )}

      {/* скрим и подпись поверх фото */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent"
      />
      <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white lg:p-6">
        <p className="text-lg font-bold tracking-[-0.01em] lg:text-xl">
          {member.name}
        </p>
        <p className="mt-0.5 text-sm text-white/80">{member.role}</p>
      </figcaption>
    </figure>
  );
}

export function Team({ agents }: { agents: Agent[] }) {
  // состав и должности фиксированы (lib/site.ts), из синка Домклик
  // берутся только фото: специалист без профиля остаётся на сайте
  const members: Member[] = team.map((m) => ({
    ...m,
    avatar: agents.find((a) => a.name === m.name)?.avatar ?? null,
  }));

  return (
    <section id="komanda" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display max-w-[24ch] text-3xl font-bold sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Специалисты, которые ведут сделку
          </h2>
          <p className="mt-4 max-w-[54ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            Профессиональная команда риелторов. На каждом этапе у клиента есть
            конкретный человек, который отвечает за процесс.
          </p>
        </Reveal>

        {/* мобильные: лента с прокруткой и выглядывающей соседней карточкой;
            от md три карточки в ряд */}
        <Reveal y={28} delay={0.08}>
          <ul
            aria-label="Команда агентства"
            className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:mt-12 [&::-webkit-scrollbar]:hidden"
          >
            {members.map((m) => (
              <li
                key={m.name}
                className="w-[78%] max-w-[340px] shrink-0 snap-start md:w-auto md:max-w-none"
              >
                <MemberCard member={m} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
