'use client';

import { useApp } from '@/context/AppContext';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function MapScreen() {
  const { t } = useApp();
  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="px-4 py-3 flex items-center">
        <h2 className="text-white text-2xl font-bold">{t.mapView}</h2>
      </div>
      <MapView />
    </div>
  );
}
