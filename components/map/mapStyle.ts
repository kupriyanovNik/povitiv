/**
 * Кастомизация векторной схемы Яндекс Карт под палитру сайта: тёплая
 * «бумага» вместо серого, дома в тон, белые улицы, приглушённые парки и
 * вода. Точки интереса и остановки скрыты, чтобы карта не спорила с
 * плашкой агентства; метро и подписи улиц остаются.
 * Формат: https://yandex.ru/maps-api/docs/js-api/map/customization.html
 */
export const MAP_CUSTOMIZATION = [
  { tags: { any: ["landscape"] }, elements: "geometry", stylers: [{ color: "#f3eee8" }] },
  {
    tags: { any: ["urban_area", "residential", "industrial"] },
    elements: "geometry",
    stylers: [{ color: "#efe8e1" }],
  },
  {
    tags: { any: ["vegetation", "park", "national_park"] },
    elements: "geometry",
    stylers: [{ color: "#e3e5d3" }],
  },
  { tags: { any: ["water"] }, elements: "geometry", stylers: [{ color: "#d6dee1" }] },
  { tags: { any: ["building"] }, elements: "geometry.fill", stylers: [{ color: "#e7ded6" }] },
  { tags: { any: ["building"] }, elements: "geometry.outline", stylers: [{ color: "#dccfc4" }] },
  { tags: { any: ["road"] }, elements: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { tags: { any: ["road"] }, elements: "geometry.outline", stylers: [{ color: "#e4d9cf" }] },
  {
    tags: { any: ["transit_line"] },
    elements: "geometry",
    stylers: [{ saturation: -0.7 }, { opacity: 0.6 }],
  },
  { tags: { any: ["poi"] }, stylers: [{ visibility: "off" }] },
  { tags: { any: ["transit_stop"] }, stylers: [{ visibility: "off" }] },
  { elements: "label.text.fill", stylers: [{ color: "#7a706b" }] },
  { elements: "label.text.outline", stylers: [{ color: "#ffffff" }] },
];

/** Цвет «земли» схемы: им же залита подложка, пока карта грузится */
export const MAP_LAND = "#f3eee8";
