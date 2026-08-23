import {
  getAgency,
  getExternalReviews,
  getListings,
  type Listing,
} from "@/lib/data";
import { fullYearsSince } from "@/lib/format";
import { site } from "@/lib/site";
import { LeadProvider } from "@/components/lead/LeadContext";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { Tasks } from "@/components/Tasks";
import { DealRoute } from "@/components/DealRoute";
import { Manifesto } from "@/components/Manifesto";
import { Listings } from "@/components/Listings";
import { Team } from "@/components/Team";
import { Reviews } from "@/components/Reviews";
import { Safety } from "@/components/Safety";
import { LeadForm } from "@/components/LeadForm";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { MobileBar } from "@/components/MobileBar";

// данные читаются с диска на каждый запрос: ночной синк на сервере
// обновляет JSON, страница сразу свежая, без пересборки и рестартов
export const dynamic = "force-dynamic";

const CATEGORY_ORDER: Record<Listing["category"], number> = {
  flat: 0,
  house: 1,
  land: 2,
  room: 3,
};

function displayOrder(listings: Listing[]): Listing[] {
  return [...listings].sort((a, b) => {
    if (a.dealType !== b.dealType) return a.dealType === "sale" ? -1 : 1;
    if (a.category !== b.category)
      return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    return b.price - a.price;
  });
}

export default async function Home() {
  const [{ listings }, agency, externalReviews] = await Promise.all([
    getListings(),
    getAgency(),
    getExternalReviews(),
  ]);

  const ordered = displayOrder(listings);
  // данные перезаписываются ночным синком: пустой или неполный список
  // не должен ронять страницу, секции переживают отсутствие фото
  const withPhotos = ordered.filter((l) => l.photos.length > 0);
  // карусель хиро: дом первым кадром (самый выигрышный визуал),
  // дальше остальные объекты в витринном порядке
  const heroListings = [
    ...withPhotos.filter((l) => l.category === "house"),
    ...withPhotos.filter((l) => l.category !== "house"),
  ].slice(0, 6);
  const tasksPhoto =
    ordered.find((l) => l.category === "flat" && l.dealType === "sale")
      ?.photos[1] ?? heroListings[0]?.photos[0];

  return (
    <LeadProvider>
      <JsonLd />
      <Header />
      <main className="flex-1">
        <Hero listings={heroListings} />
        <TrustBar
          dealsCount={agency.agency.dealsCount12m}
          rating={agency.agency.domclickRating}
          agentsCount={agency.agents.length}
          // страница рендерится на каждый запрос: стаж сам вырастет в апреле
          cianYears={fullYearsSince(site.cianSince)}
        />
        <Tasks photo={tasksPhoto} />
        <DealRoute />
        <Manifesto />
        <Listings listings={ordered} />
        <Team agents={agency.agents} />
        <Reviews
          reviews={agency.reviews}
          external={externalReviews}
          rating={agency.agency.domclickRating}
          votes={agency.agency.domclickReviewVotes}
        />
        <Safety />
        <LeadForm />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <MobileBar />
      {/* отступ под мобильную панель */}
      <div className="h-[72px] sm:hidden" aria-hidden />
    </LeadProvider>
  );
}
