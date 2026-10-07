"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "@/lib/site";
import { MapWidget } from "./MapWidget";
import { OfficePlaque } from "./OfficePlaque";
import { MAP_CUSTOMIZATION, MAP_LAND } from "./mapStyle";
import { loadYmaps3, type LngLat, type YMapInstance } from "./ymaps3";

const OFFICE: LngLat = [site.geo.lon, site.geo.lat];

type Status = "idle" | "ready" | "failed";

/**
 * Карта офиса на JS API Яндекс Карт 3.0: схема в палитре сайта и плашка
 * агентства с телефонами вместо стандартной метки. Скрипт Яндекса
 * грузится, только когда подвал подъезжает к экрану. Любая ошибка
 * (неверный ключ, домен не в списке ключа, сеть) — показываем
 * бесплатный виджет, как без ключа.
 */
export function YandexOfficeMap({ apiKey }: { apiKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [markerEl, setMarkerEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let map: YMapInstance | null = null;

    const init = async () => {
      try {
        const ymaps3 = await loadYmaps3(apiKey);
        const [{ YMapZoomControl }, { YMapOpenMapsButton }] = await Promise.all([
          ymaps3.import("@yandex/ymaps3-controls@0.0.1"),
          ymaps3.import("@yandex/ymaps3-controls-extra"),
        ]);
        if (cancelled) return;

        // на тач-экранах карта не тянется одним пальцем: иначе прокрутка
        // страницы застревает в подвале; масштаб — щипком
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const wide = window.matchMedia("(min-width: 640px)").matches;

        const instance = new ymaps3.YMap(container, {
          location: { center: OFFICE, zoom: 16 },
          mode: "vector",
          theme: "light",
          // отступ сверху опускает офис ниже центра: над ним плашка
          margin: [wide ? 170 : 150, 0, 0, 0],
          behaviors: coarse ? ["pinchZoom", "dblClick"] : ["drag", "pinchZoom", "dblClick"],
          zoomRange: { min: 11, max: 19 },
        });
        map = instance;
        instance.addChild(
          new ymaps3.YMapDefaultSchemeLayer({ customization: MAP_CUSTOMIZATION }),
        );
        instance.addChild(new ymaps3.YMapDefaultFeaturesLayer({}));

        const el = document.createElement("div");
        instance.addChild(
          // взаимодействие с плашкой не двигает карту
          new ymaps3.YMapMarker({ coordinates: OFFICE, blockBehaviors: true }, el),
        );

        // кнопка «Открыть в Картах» обязательна по условиям Яндекса
        // (п. 4.1.3.3); сверху слева она не спорит с копирайтами внизу
        instance.addChild(
          new ymaps3.YMapControls({ position: "top left" }).addChild(
            new YMapOpenMapsButton({}),
          ),
        );
        // на узких экранах кнопки масштаба упирались бы в плашку
        if (wide) {
          instance.addChild(
            new ymaps3.YMapControls({ position: "right" }).addChild(new YMapZoomControl({})),
          );
        }

        setMarkerEl(el);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("failed");
      }
    };

    // грузим заранее, за пару экранов до подвала
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        void init();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(container);

    return () => {
      cancelled = true;
      io.disconnect();
      map?.destroy();
      setMarkerEl(null);
    };
  }, [apiKey]);

  if (status === "failed") return <MapWidget />;

  return (
    <div
      role="region"
      aria-label="Офис «Позитив ВТ» на карте"
      className="absolute inset-0"
      style={{ backgroundColor: MAP_LAND }}
    >
      <div
        ref={containerRef}
        className={`absolute inset-0 transition-opacity duration-500 ${
          status === "ready" ? "opacity-100" : "opacity-0"
        }`}
      />
      {markerEl && createPortal(<OfficePlaque />, markerEl)}
    </div>
  );
}
