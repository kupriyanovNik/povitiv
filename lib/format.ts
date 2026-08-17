export function formatPrice(price: number, note?: string | null): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(price);
  return note ? `${formatted} ₽ ${note}` : `${formatted} ₽`;
}

export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(d);
}
