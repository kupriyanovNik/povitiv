import { DeviceMobile, Phone as PhoneHandset } from "@phosphor-icons/react/dist/ssr";
import type { Phone } from "@/lib/site";

/** Трубка для офисного номера, смартфон для мобильного: номера различимы без подписей. */
export function PhoneIcon({
  kind,
  size = 16,
  className,
}: {
  kind: Phone["kind"];
  size?: number;
  className?: string;
}) {
  const Cmp = kind === "mobile" ? DeviceMobile : PhoneHandset;
  return <Cmp size={size} weight="bold" className={className} aria-hidden />;
}
