'use client';

import { useApp } from '@/context/AppContext';
import TimerScreen from '@/components/TimerScreen';
import ClientsScreen from '@/components/ClientsScreen';
import TimeLogsScreen from '@/components/TimeLogsScreen';
import MapScreen from '@/components/MapScreen';
import BottomNav from '@/components/BottomNav';
import SettingsButton from '@/components/SettingsButton';

export default function Home() {
  const { activeTab } = useApp();

  return (
    <main className="relative">
      <SettingsButton />
      <div className="pb-24">
        {activeTab === 'timer' && <TimerScreen />}
        {activeTab === 'clients' && <ClientsScreen />}
        {activeTab === 'logs' && <TimeLogsScreen />}
        {activeTab === 'map' && <MapScreen />}
      </div>
      <BottomNav />
    </main>
  );
}
