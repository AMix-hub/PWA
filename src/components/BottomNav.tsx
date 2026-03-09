'use client';

import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

const tabs = [
  { id: 'timer' as const, icon: '⏱️', labelKey: 'timerScreen' as const },
  { id: 'clients' as const, icon: '👷', labelKey: 'clients' as const },
  { id: 'logs' as const, icon: '📋', labelKey: 'timeLogs' as const },
  { id: 'map' as const, icon: '🗺️', labelKey: 'mapView' as const },
];

export default function BottomNav() {
  const { activeTab, setActiveTab, t, activeTimer } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-2 border-gray-800 z-40 safe-area-bottom">
      <div className="flex max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 pb-4 flex flex-col items-center gap-1 transition-colors relative
              ${activeTab === tab.id ? 'text-orange-400' : 'text-gray-500'}
            `}
            style={{ touchAction: 'manipulation', minHeight: 64 }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-orange-500 rounded-full"
              />
            )}
            <span style={{ fontSize: 26 }}>{tab.icon}</span>
            <span className={`text-xs font-semibold ${activeTab === tab.id ? 'text-orange-400' : 'text-gray-500'}`}>
              {t[tab.labelKey]}
            </span>
            {tab.id === 'timer' && activeTimer && (
              <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
