'use client';

import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

function TimerIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClipboardIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  );
}

function MapIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

const tabs = [
  { id: 'timer' as const, Icon: TimerIcon, labelKey: 'timerScreen' as const },
  { id: 'clients' as const, Icon: UsersIcon, labelKey: 'clients' as const },
  { id: 'logs' as const, Icon: ClipboardIcon, labelKey: 'timeLogs' as const },
  { id: 'map' as const, Icon: MapIcon, labelKey: 'mapView' as const },
];

export default function BottomNav() {
  const { activeTab, setActiveTab, t, activeTimer } = useApp();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto',
          width: '100%',
          maxWidth: 420,
          background: 'rgba(10, 15, 35, 0.80)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)',
          padding: '6px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: 56,
                borderRadius: 22,
                gap: 4,
                touchAction: 'manipulation',
                color: isActive ? '#a5b4fc' : '#475569',
                transition: 'color 0.2s ease',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="navPill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 22,
                    background: 'rgba(99,102,241,0.18)',
                  }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, lineHeight: 0 }}>
                <tab.Icon size={22} />
              </span>
              <span
                style={{ position: 'relative', zIndex: 1, fontWeight: 600, fontSize: 11, lineHeight: 1 }}
              >
                {t[tab.labelKey]}
              </span>
              {tab.id === 'timer' && activeTimer && (
                <span
                  className="nav-indicator-pulse"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 10,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#f43f5e',
                    boxShadow: '0 0 6px rgba(244,63,94,0.6)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
