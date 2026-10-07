/**
 * Загрузчик JS API Яндекс Карт 3.0 и минимальные типы для того, что
 * использует подвал. Полные типы живут в @yandex/ymaps3-types, но ради
 * пяти классов тянуть пакет и перенастраивать tsconfig незачем.
 * Документация: https://yandex.ru/maps-api/docs/js-api/
 */

export type LngLat = [number, number];

type Entity = object;

export type YMapInstance = {
  addChild(child: Entity): YMapInstance;
  destroy(): void;
};

type ControlsInstance = Entity & { addChild(child: Entity): ControlsInstance };

export type Ymaps3 = {
  ready: Promise<void>;
  import(pkg: "@yandex/ymaps3-controls@0.0.1"): Promise<{
    YMapZoomControl: new (props: { duration?: number }) => Entity;
  }>;
  import(pkg: "@yandex/ymaps3-controls-extra"): Promise<{
    YMapOpenMapsButton: new (props: { title?: string }) => Entity;
  }>;
  YMap: new (
    container: HTMLElement,
    props: {
      location: { center: LngLat; zoom: number };
      mode?: "raster" | "vector" | "auto";
      theme?: "light" | "dark";
      /** отступы [сверху, справа, снизу, слева]: центр карты считается без них */
      margin?: [number, number, number, number];
      behaviors?: string[];
      zoomRange?: { min: number; max: number };
    },
  ) => YMapInstance;
  YMapDefaultSchemeLayer: new (props: { customization?: object[] }) => Entity;
  YMapDefaultFeaturesLayer: new (props: object) => Entity;
  YMapMarker: new (
    props: { coordinates: LngLat; blockBehaviors?: boolean; zIndex?: number },
    element: HTMLElement,
  ) => Entity;
  YMapControls: new (props: {
    position: string;
    orientation?: "horizontal" | "vertical";
  }) => ControlsInstance;
};

declare global {
  interface Window {
    ymaps3?: Ymaps3;
  }
}

// неверный ключ или ключ без нужного домена: Яндекс отвечает ошибкой на
// сам скрипт почти мгновенно; таймаут страхует от зависшей сети
const LOAD_TIMEOUT_MS = 12_000;

let pending: Promise<Ymaps3> | null = null;

/** Один скрипт на страницу; при неудаче следующий вызов пробует заново. */
export function loadYmaps3(apiKey: string): Promise<Ymaps3> {
  if (pending) return pending;

  const load = new Promise<Ymaps3>((resolve, reject) => {
    const whenReady = () => {
      const api = window.ymaps3;
      if (!api) return reject(new Error("ymaps3 не появился после загрузки"));
      api.ready.then(() => resolve(api), reject);
    };
    if (window.ymaps3) return whenReady();

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
    script.async = true;
    script.onload = whenReady;
    script.onerror = () => {
      script.remove();
      reject(new Error("JS API Яндекс Карт не загрузился"));
    };
    document.head.appendChild(script);
  });

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("JS API Яндекс Карт: таймаут")), LOAD_TIMEOUT_MS),
  );

  pending = Promise.race([load, timeout]);
  pending.catch(() => {
    pending = null;
  });
  return pending;
}
