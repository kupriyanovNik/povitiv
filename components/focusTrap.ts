/**
 * Удерживает Tab/Shift+Tab внутри контейнера (модалка, мобильное меню):
 * фокус не должен уходить на страницу под оверлеем.
 */
export function trapTabKey(e: KeyboardEvent, container: HTMLElement): void {
  const focusables = Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  const inside = container.contains(active);
  if (e.shiftKey && (active === first || !inside)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (active === last || !inside)) {
    e.preventDefault();
    first.focus();
  }
}
