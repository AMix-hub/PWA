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
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40">
      <div className="flex max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors relative
              ${activeTab === tab.id ? 'text-orange-400' : 'text-gray-500 hover:text-gray-300'}
            `}
            style={{ touchAction: 'manipulation' }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-400 rounded-full"
              />
            )}
            <span className="text-2xl">{tab.icon}</span>
            <span className="text-xs font-medium">{t[tab.labelKey]}</span>
            {tab.id === 'timer' && activeTimer && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
