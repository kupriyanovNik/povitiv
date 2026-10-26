import { getAgency, getExternalReviews } from "@/lib/data";
import { fullYearsSince } from "@/lib/format";
import { site } from "@/lib/site";
import { LeadProvider } from "@/components/lead/LeadContext";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Tasks } from "@/components/Tasks";
import { DealRoute } from "@/components/DealRoute";
import { Manifesto } from "@/components/Manifesto";
import { PropertyTypes } from "@/components/PropertyTypes";
import { Team } from "@/components/Team";
import { Reviews } from "@/components/Reviews";
import { Safety } from "@/components/Safety";
import { LeadForm } from "@/components/LeadForm";
import { FAQ } from "@/components/FAQ";
import { BankPartners } from "@/components/BankPartners";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { MobileBar } from "@/components/MobileBar";

// данные агентства читаются с диска на каждый запрос: правка JSON на
// сервере видна сразу, без пересборки
export const dynamic = "force-dynamic";

export default async function Home() {
  const [agency, externalReviews] = await Promise.all([
    getAgency(),
    getExternalReviews(),
  ]);

  return (
    <LeadProvider>
      <JsonLd />
      <Header />
      <main className="flex-1">
        <Hero
          rating={agency.agency.domclickRating}
          // страница рендерится на каждый запрос: стаж сам вырастет в апреле
          cianYears={fullYearsSince(site.cianSince)}
        />
        <Tasks />
        <DealRoute />
        <Manifesto />
        <PropertyTypes />
        <Team />
        <Reviews
          reviews={agency.reviews}
          external={externalReviews}
          rating={agency.agency.domclickRating}
          votes={agency.agency.domclickReviewVotes}
        />
        <Safety />
        <LeadForm />
        <FAQ />
        {/* банки-партнёры перед финальным призывом: рядом с вопросами про ипотеку */}
        <BankPartners />
        <FinalCTA />
      </main>
      {/* ключ JS API Яндекс Карт читается при каждом запросе (страница
          динамическая): заказчик пришлёт ключ — кладём в .env, без пересборки */}
      <Footer mapApiKey={process.env.YANDEX_MAPS_API_KEY || undefined} />
      <MobileBar />
      {/* отступ под мобильную панель */}
      <div className="h-[72px] sm:hidden" aria-hidden />
    </LeadProvider>
  );
}
