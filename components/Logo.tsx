/**
 * Логотип агентства со старого сайта positiv-vt.ru: эмблема «ВТ» в круге
 * с листьями (векторная трассировка оригинала, public/brand/emblem.svg).
 * Надпись «Позитив» под эмблемой убрана: эмблема работает сама.
 *
 * Эмблема рисуется маской в currentColor: цвет логотипа задаёт родитель
 * (text-wine на светлом фоне, text-white на бордовом).
 */

// пропорции трассировки: viewBox 335×169
const EMBLEM_RATIO = 335 / 169;

const HEIGHTS = {
  // шапка: укладывается в 64px мобильной и 72px десктопной шапки
  md: 40,
  // подвал
  lg: 64,
} as const;

export function Logo({
  size = "md",
  className = "",
}: {
  size?: keyof typeof HEIGHTS;
  className?: string;
}) {
  const height = HEIGHTS[size];
  return (
    <span className={`block ${className}`}>
      <span
        aria-hidden
        className="block bg-current"
        style={{
          height,
          width: Math.round(height * EMBLEM_RATIO),
          maskImage: "url(/brand/emblem.svg)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskImage: "url(/brand/emblem.svg)",
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
        }}
      />
      <span className="sr-only">Позитив ВТ</span>
    </span>
  );
}
