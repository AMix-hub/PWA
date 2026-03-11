'use client';

import { useApp } from '@/context/AppContext';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function MapScreen() {
  const { t } = useApp();
  return (
    <div style={{ position: 'relative', height: 'calc(100dvh - 80px)' }}>
      {/* Glassmorphism floating header overlay */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 64, /* leave room for the SettingsButton (fixed, top-4 right-4, ~48px wide) */
          zIndex: 10,
          background: 'rgba(10, 15, 35, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06)',
          padding: '12px 16px',
        }}
      >
        <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
          {t.mapView}
        </h2>
      </div>
      <MapView />
    </div>
  );
}
