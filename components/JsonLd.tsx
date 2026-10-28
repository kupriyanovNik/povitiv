import { getAgency } from "@/lib/data";
import { FAQ_ITEMS } from "@/lib/faq";
import { phone, site } from "@/lib/site";

/**
 * Микроразметка Schema.org для Яндекса и поисковиков:
 * агентство недвижимости и частые вопросы. Рейтинг из data/agency.json.
 */
/**
 * Экранируем «<», чтобы строка вида «</script>» в данных не вырвалась
 * из тега (XSS).
 */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function JsonLd() {
  const agency = await getAgency();
  const { domclickRating, domclickReviewVotes } = agency.agency;

  const org = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Агентство недвижимости «Позитив ВТ»",
    legalName: site.legal.name,
    url: "https://positiv-vt.ru",
    telephone: phone.e164,
    email: site.email,
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
        dangerouslySetInnerHTML={{ __html: safeJson(faq) }}
      />
    </>
  );
}
