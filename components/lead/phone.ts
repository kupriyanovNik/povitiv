/**
 * Нормализация ввода телефона в формах заявки:
 * - первая цифра «8» или «7» превращается в «+7 » (привычный формат РФ);
 * - любая другая первая цифра автоматически получает префикс «+7 »;
 * - ввод, начатый с «+», не трогаем: иностранный номер остаётся как есть.
 * Работает и для вставки номера целиком: «89161234567» → «+7 9161234567».
 */
export function normalizePhoneInput(raw: string): string {
  const v = raw.trimStart();
  if (v === "" || v.startsWith("+")) return v;
  const first = v[0];
  if (first === "8" || first === "7") return "+7 " + v.slice(1).trimStart();
  if (/\d/.test(first)) return "+7 " + v;
  return v;
}
