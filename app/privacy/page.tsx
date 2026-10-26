import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { POLICY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных: Позитив ВТ",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="Политика обработки персональных данных" blocks={POLICY} />
  );
}
