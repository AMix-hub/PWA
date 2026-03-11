'use client';

import { useApp } from '@/context/AppContext';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CLIENT_ICON_COLORS, ClientIconType } from '@/lib/clients';

// Required workaround for Leaflet's default icon URLs breaking in Next.js bundling
// See: https://github.com/Leaflet/Leaflet/issues/4968
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const userIcon = new L.DivIcon({
  html: `<div style="background:#f97316;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(249,115,22,0.8)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: '',
});

function createClientIcon(iconType?: ClientIconType): L.DivIcon {
  const color = CLIENT_ICON_COLORS[iconType ?? 'default'];
  return new L.DivIcon({
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2.5px solid white;box-shadow:0 0 8px ${color}99,0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: '',
  });
}

function RecenterMap({ lat, lon, skip }: { lat: number; lon: number; skip: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (skip) return;
    map.setView([lat, lon], 13);
  }, [lat, lon, map, skip]);
  return null;
}

function MapController({ markerRefs }: { markerRefs: React.MutableRefObject<Record<string, L.Marker>> }) {
  const map = useMap();
  const { lastAddedClientId, clients, clearLastAddedClient } = useApp();

  const FLY_TO_DURATION_MS = 1200;
  const POPUP_OPEN_DELAY_MS = FLY_TO_DURATION_MS + 200;
  const HIGHLIGHT_DURATION_MS = 5000;

  useEffect(() => {
    if (!lastAddedClientId) return;
    const client = clients.find((c) => c.id === lastAddedClientId);
    if (!client) return;

    map.flyTo([client.latitude, client.longitude], 15, { animate: true, duration: FLY_TO_DURATION_MS / 1000 });

    // Open popup after flyTo animation completes
    const openTimer = setTimeout(() => {
      const marker = markerRefs.current[lastAddedClientId];
      if (marker) marker.openPopup();
    }, POPUP_OPEN_DELAY_MS);

    // Clear the "just added" highlight after the popup has been visible long enough
    const clearTimer = setTimeout(() => {
      clearLastAddedClient();
    }, HIGHLIGHT_DURATION_MS);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(clearTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAddedClientId, clients, map, markerRefs, clearLastAddedClient]);

  return null;
}

export default function MapView() {
  const { clients, userLocation, nearbyClient, lastAddedClientId, t } = useApp();
  const markerRefs = useRef<Record<string, L.Marker>>({});

  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lon]
    : [59.3293, 18.0686]; // Stockholm

  return (
    <div style={{ height: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        {userLocation && (
          <>
            <RecenterMap lat={userLocation.lat} lon={userLocation.lon} skip={!!lastAddedClientId} />
            <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
              <Popup>{t.yourPosition}</Popup>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lon]}
              radius={200}
              pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.1, weight: 2 }}
            />
          </>
        )}
        {clients.map((client) => {
          const isJustAdded = lastAddedClientId === client.id;
          const setRef = (m: L.Marker | null) => {
            if (m) markerRefs.current[client.id] = m;
            else delete markerRefs.current[client.id];
          };
          return (
            <Marker
              key={client.id}
              position={[client.latitude, client.longitude]}
              icon={createClientIcon(client.iconType)}
              ref={setRef}
            >
              <Popup>
                <div>
                  <strong>{client.name}</strong>
                  <br />
                  {client.address}
                  <br />
                  {client.hourly_rate} kr/h
                  {nearbyClient?.id === client.id && (
                    <><br /><span style={{ color: '#f97316' }}>✓ {t.within200m}</span></>
                  )}
                  {isJustAdded && (
                    <><br /><span style={{ color: '#34d399', fontWeight: 700 }}>✓ {t.addedToMap}</span></>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        <MapController markerRefs={markerRefs} />
      </MapContainer>
    </div>
  );
}
