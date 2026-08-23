export const site = {
  name: "Позитив ВТ",
  tagline: "Недвижимость: спокойно и по делу",
  phone: "+7 (495) 609-28-64",
  phoneHref: "tel:+74956092864",
  address: "Москва, ул. Палиха, 14/33, стр. 2, офис 26",
  addressShort: "ул. Палиха, 14/33, стр. 2",
  workHours: "Пн-Пт, 10:00-18:00",
  routeUrl: "https://yandex.ru/maps/?pt=37.600359,55.784417&z=17&l=map",
  legal: {
    name: "ООО «Агентство «Позитив ВТ»",
    inn: "7707723617",
    ogrn: "1107746276769",
  },
  profiles: {
    cian: "https://www.cian.ru/company/211681",
    domclick: "https://agencies.domclick.ru/agency/269616",
  },
  // регистрация профиля на ЦИАН: «14 лет 4 мес» на августе 2026
  // (research/01-agency-dossier.md) -> апрель 2012. Стаж на площадке
  // вычисляется от этой даты и не сталеет.
  cianSince: "2012-04-01",
} as const;

export type LeadTask =
  | "Продать"
  | "Купить"
  | "Обменять"
  | "Сдать"
  | "Снять"
  | "Сопровождение"
  | "Другое";

export const leadTasks: LeadTask[] = [
  "Продать",
  "Купить",
  "Обменять",
  "Сдать",
  "Снять",
  "Сопровождение",
  "Другое",
];
