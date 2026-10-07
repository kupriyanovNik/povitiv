import { MapWidget } from "./map/MapWidget";
import { YandexOfficeMap } from "./map/YandexOfficeMap";

/**
 * Карта в подвале вместо ссылки «Построить маршрут» (замечания клиента,
 * п. 11). С ключом JS API — своя карта в палитре сайта с плашкой
 * агентства; без ключа (или если JS API не загрузился) — бесплатный
 * виджет Яндекса как есть.
 */
export function OfficeMap({ apiKey }: { apiKey?: string }) {
  return (
    <div className="relative min-h-[380px] overflow-hidden rounded-2xl border border-line bg-paper lg:min-h-full">
      {apiKey ? <YandexOfficeMap apiKey={apiKey} /> : <MapWidget />}
    </div>
  );
}
