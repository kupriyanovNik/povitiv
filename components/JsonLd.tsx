import { getAgency, getListings } from "@/lib/data";
import { site } from "@/lib/site";

/**
 * Микроразметка Schema.org для Яндекса и поисковиков:
 * агентство недвижимости + актуальные объекты. Все цифры из реальных
 * данных (data/agency.json, data/listings.json).
 */
export function JsonLd() {
  const agency = getAgency();
  const { listings } = getListings();

  const org = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Агентство недвижимости «Позитив ВТ»",
    legalName: site.legal.name,
    url: "https://positiv-vt.ru",
    telephone: "+74956092864",
    foundingDate: "2010-04-12",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Москва",
      streetAddress: "ул. Палиха, 14/33, стр. 2, офис 26",
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 55.784417,
      longitude: 37.600359,
    },
    openingHours: "Mo-Fr 10:00-18:00",
    areaServed: ["Москва", "Московская область"],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: agency.agency.domclickRating,
      reviewCount: agency.agency.domclickReviewVotes,
      bestRating: 5,
    },
  };

  const offers = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Актуальные объекты агентства «Позитив ВТ»",
    itemListElement: listings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Offer",
        name: l.title,
        url: l.url,
        price: l.price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@type": l.category === "land" ? "Residence" : "Apartment",
          name: l.title,
          address: { "@type": "PostalAddress", streetAddress: l.address },
          ...(l.area ? { floorSize: { "@type": "QuantitativeValue", value: l.area, unitCode: "MTK" } } : {}),
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offers) }}
      />
    </>
  );
}
