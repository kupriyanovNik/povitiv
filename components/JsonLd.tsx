import { getAgency, getListings } from "@/lib/data";
import { FAQ_ITEMS } from "@/lib/faq";
import { phones, site } from "@/lib/site";

/**
 * Микроразметка Schema.org для Яндекса и поисковиков:
 * агентство недвижимости + актуальные объекты. Все цифры из реальных
 * данных (data/agency.json, data/listings.json).
 */
/**
 * Тексты объектов приходят с внешних площадок: экранируем «<», чтобы
 * строка вида «</script>» в данных не вырвалась из тега (XSS).
 */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function JsonLd() {
  const [agency, { listings }] = await Promise.all([getAgency(), getListings()]);
  const { domclickRating, domclickReviewVotes } = agency.agency;

  const org = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Агентство недвижимости «Позитив ВТ»",
    legalName: site.legal.name,
    url: "https://positiv-vt.ru",
    telephone: phones.map((p) => p.e164),
    foundingDate: "2010-04-12",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Москва",
      streetAddress: "ул. Палиха, 14/33, стр. 2, офис 26",
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lon,
    },
    openingHours: "Mo-Th 10:00-18:00",
    areaServed: ["Москва", "Московская область"],
    // рейтинг только когда он есть в данных: null сделал бы разметку невалидной
    ...(domclickRating != null && domclickReviewVotes > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: domclickRating,
            reviewCount: domclickReviewVotes,
            bestRating: 5,
          },
        }
      : {}),
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

  // FAQPage: те же вопросы, что в секции FAQ — шанс на сниппет в поиске
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(offers) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(faq) }}
      />
    </>
  );
}
