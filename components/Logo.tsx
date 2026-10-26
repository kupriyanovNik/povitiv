/**
 * Логотип агентства со старого сайта positiv-vt.ru: эмблема «ВТ» в круге
 * с листьями (векторная трассировка оригинала, public/brand/emblem.svg)
 * и надпись «ПОЗИТИВ» (public/brand/wordmark.svg: контуры PT Serif Bold,
 * близкого к антикве оригинала). Правки клиента 26.10.2026: слово
 * «Позитив» — часть логотипа, без него эмблема читается как просто «ВТ».
 *
 * Обе части рисуются маской в currentColor: цвет логотипа задаёт родитель
 * (text-wine на светлом фоне, text-white на фото и бордовом).
 *
 * - inline: эмблема и надпись в строку, для шапки (высота 64–72px)
 * - stacked: надпись под эмблемой, как в оригинале, для подвала
 */

// пропорции исходников: эмблема 335×169, надпись 532.5×70
const EMBLEM_RATIO = 335 / 169;
const WORD_RATIO = 532.5 / 70;

function Mask({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) {
  return (
    <span
      aria-hidden
      className="block shrink-0 bg-current"
      style={{
        width,
        height,
        maskImage: `url(${src})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export function Logo({
  variant = "inline",
  className = "",
}: {
  variant?: "inline" | "stacked";
  className?: string;
}) {
  if (variant === "stacked") {
    const emblemH = 64;
    const emblemW = Math.round(emblemH * EMBLEM_RATIO);
    // надпись по ширине эмблемы, чуть уже: как в оригинале
    const wordW = Math.round(emblemW * 0.92);
    return (
      <span className={`inline-flex flex-col items-center ${className}`}>
        <Mask src="/brand/emblem.svg" width={emblemW} height={emblemH} />
        <span aria-hidden className="mt-1.5 block h-px w-full bg-current opacity-40" />
        <span className="mt-2">
          <Mask
            src="/brand/wordmark.svg"
            width={wordW}
            height={Math.round(wordW / WORD_RATIO)}
          />
        </span>
        <span className="sr-only">Позитив ВТ</span>
      </span>
    );
  }

  const emblemH = 36;
  const wordH = 15;
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <Mask
        src="/brand/emblem.svg"
        width={Math.round(emblemH * EMBLEM_RATIO)}
        height={emblemH}
      />
      <span aria-hidden className="block h-7 w-px bg-current opacity-30" />
      <Mask
        src="/brand/wordmark.svg"
        width={Math.round(wordH * WORD_RATIO)}
        height={wordH}
      />
      <span className="sr-only">Позитив ВТ</span>
    </span>
  );
}
