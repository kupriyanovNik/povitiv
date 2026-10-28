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
 * Надпись стоит под эмблемой, как в оригинале, и в шапке, и в подвале
 * (правки 28.10.2026: в шапке логотип в столбик, а не в строку).
 * size — высота эмблемы; отступы и надпись масштабируются от неё.
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
  size = 64,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const emblemW = Math.round(size * EMBLEM_RATIO);
  // надпись по ширине эмблемы, чуть уже: как в оригинале
  const wordW = Math.round(emblemW * 0.92);
  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <Mask src="/brand/emblem.svg" width={emblemW} height={size} />
      <span
        aria-hidden
        className="block h-px w-full bg-current opacity-40"
        style={{ marginTop: Math.round(size * 0.09) }}
      />
      <span style={{ marginTop: Math.round(size * 0.125) }}>
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
