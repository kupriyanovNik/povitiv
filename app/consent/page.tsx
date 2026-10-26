import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { CONSENT } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных: Позитив ВТ",
  robots: { index: false },
};

export default function ConsentPage() {
  return (
    <LegalDoc
      title="Согласие на обработку персональных данных клиентов — физических лиц"
      blocks={CONSENT}
    />
  );
}
