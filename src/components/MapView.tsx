'use client';

import { useApp } from '@/context/AppContext';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

const clientIcon = new L.DivIcon({
  html: `<div style="background:#1d4ed8;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(29,78,216,0.8)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: '',
});

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 13);
  }, [lat, lon, map]);
  return null;
}

export default function MapView() {
  const { clients, userLocation, nearbyClient, t } = useApp();

  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lon]
    : [59.3293, 18.0686]; // Stockholm

  return (
    <div style={{ height: 'calc(100vh - 136px)' }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <>
            <RecenterMap lat={userLocation.lat} lon={userLocation.lon} />
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
        {clients.map((client) => (
          <Marker
            key={client.id}
            position={[client.latitude, client.longitude]}
            icon={clientIcon}
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
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
