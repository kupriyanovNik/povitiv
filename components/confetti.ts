/**
 * Небольшой салют конфетти из точки: веер вверх и мягкое падение.
 * Web Animations API (только transform и opacity, вне главного потока),
 * без зависимостей; частицы удаляются из DOM по окончании.
 */

// фирменная палитра: бордовый, глубокий бордовый, золото, светлое
// золото, бледно-розовый
const COLORS = ["#7d1b24", "#5e1119", "#d98e3b", "#e9b77c", "#e7c3be"];

// резкий старт и плавное торможение для разлёта, разгон для падения
const BURST = "cubic-bezier(0.23, 1, 0.32, 1)";
const GRAVITY = "cubic-bezier(0.55, 0, 1, 0.45)";

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function burstConfetti(host: HTMLElement, count = 22) {
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    // ленточки и кружочки: ленточки вращаются заметнее
    const ribbon = i % 5 < 3;
    const w = ribbon ? rand(3, 4.5) : rand(4.5, 6);
    const h = ribbon ? rand(7, 10) : w;
    Object.assign(piece.style, {
      position: "absolute",
      left: `${-w / 2}px`,
      top: `${-h / 2}px`,
      width: `${w}px`,
      height: `${h}px`,
      borderRadius: ribbon ? "1px" : "50%",
      background: COLORS[i % COLORS.length],
      opacity: "0",
      willChange: "transform, opacity",
    });
    host.appendChild(piece);

    // веер вверх от −165° до −15°, без полёта строго вниз в текст
    const angle = (rand(-165, -15) * Math.PI) / 180;
    const dist = rand(60, 130);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const fall = rand(50, 110);
    const spin = (Math.random() < 0.5 ? -1 : 1) * rand(ribbon ? 240 : 90, ribbon ? 600 : 240);

    const animation = piece.animate(
      [
        { transform: "translate(0, 0) rotate(0deg) scale(0.6)", opacity: 0, easing: BURST },
        { opacity: 1, offset: 0.06, easing: BURST },
        {
          transform: `translate(${dx * 0.85}px, ${dy}px) rotate(${spin * 0.45}deg) scale(1)`,
          opacity: 1,
          offset: 0.42,
          easing: GRAVITY,
        },
        {
          transform: `translate(${dx}px, ${dy + fall}px) rotate(${spin}deg) scale(0.85)`,
          opacity: 0,
        },
      ],
      { duration: rand(1000, 1400), delay: rand(0, 70), fill: "forwards" },
    );
    animation.onfinish = () => piece.remove();
  }
}
