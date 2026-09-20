import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './TrackingMap.module.css';

export interface MapPoint {
  label: string;
  lat: number;
  lon: number;
}

/**
 * An OpenStreetMap route view for a shipment's tracking scans: a dashed line
 * through the facility waypoints with a circle marker at each (the latest one
 * highlighted in gold). Uses OSM tiles via Leaflet, darkened with a CSS filter
 * to sit in the site's palette. Circle markers avoid Leaflet's image-based
 * default icons entirely, so there are no marker assets to host.
 *
 * Leaflet is dynamically imported so it only loads on the account page, and map
 * setup is wrapped defensively — in a layout-less environment (jsdom under test)
 * it simply leaves the container empty rather than throwing.
 */
export function TrackingMap({ points, label }: { points: MapPoint[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || points.length === 0) return;
    let cancelled = false;
    let map: LeafletMap | null = null;

    void (async () => {
      try {
        const L = (await import('leaflet')).default;
        if (cancelled || !ref.current) return;

        map = L.map(ref.current, {
          scrollWheelZoom: false,
          attributionControl: true,
          zoomControl: true,
        });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const latlngs = points.map((p) => [p.lat, p.lon] as [number, number]);
        if (latlngs.length > 1) {
          L.polyline(latlngs, {
            color: '#c9a24f',
            weight: 2,
            opacity: 0.85,
            dashArray: '5 6',
          }).addTo(map);
        }
        points.forEach((p, i) => {
          const current = i === points.length - 1;
          L.circleMarker([p.lat, p.lon], {
            radius: current ? 7 : 5,
            color: current ? '#c9a24f' : '#8a6d33',
            weight: 2,
            fillColor: current ? '#c9a24f' : '#0c0c0d',
            fillOpacity: 1,
          })
            .addTo(map!)
            .bindPopup(p.label);
        });

        if (latlngs.length === 1) map.setView(latlngs[0], 5);
        else map.fitBounds(L.latLngBounds(latlngs).pad(0.25));
      } catch {
        // No layout (jsdom) or tiles unreachable — leave the container empty.
      }
    })();

    return () => {
      cancelled = true;
      try {
        map?.remove();
      } catch {
        // ignore teardown races
      }
    };
  }, [points]);

  return <div ref={ref} className={styles.map} role="img" aria-label={label} />;
}
