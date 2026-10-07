import { site } from "@/lib/site";

const { lat, lon } = site.geo;
// карточка агентства на Яндекс Картах: метка с названием, адрес, метро,
// «Как добраться»
const WIDGET_SRC = `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=16&oid=${site.yandexOrgId}&ol=biz`;

/**
 * Бесплатный виджет Яндекс Карт: запасной вариант, пока нет ключа JS API
 * или если JS API не загрузился. Показывается как есть: условия Яндекс
 * Карт (п. 4.1.3.1) запрещают видоизменять и перекрывать кнопку «Открыть
 * в Картах», логотип, копирайты и ссылку на условия.
 */
export function MapWidget() {
  return (
    <iframe
      src={WIDGET_SRC}
      title="Офис «Позитив ВТ» на Яндекс Картах"
      loading="lazy"
      className="absolute inset-0 h-full w-full border-0"
    />
  );
}
