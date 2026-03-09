'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatDuration } from '@/lib/storage';
import { useState } from 'react';

export default function TimerScreen() {
  const { t, activeTimer, startTimer, stopTimer, elapsed, nearbyClient, clients, locationError, userLocation } = useApp();
  const [showClientPicker, setShowClientPicker] = useState(false);

  const isRunning = !!activeTimer;

  const handleToggle = () => {
    if (isRunning) {
      stopTimer();
    } else {
      if (nearbyClient) {
        startTimer(nearbyClient.id, nearbyClient.name, nearbyClient.hourly_rate);
      } else {
        setShowClientPicker(true);
      }
    }
  };

  const handleSelectClient = (clientId: string | null) => {
    setShowClientPicker(false);
    if (clientId === null) {
      startTimer(null, null, 0);
    } else {
      const client = clients.find((c) => c.id === clientId);
      if (client) startTimer(client.id, client.name, client.hourly_rate);
    }
  };

  const earnedSoFar = activeTimer
    ? ((elapsed / 3600000) * activeTimer.hourlyRate).toFixed(0)
    : '0';

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-gray-950">
      {/* GPS Status */}
      <div className="w-full max-w-sm mb-6">
        {locationError ? (
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-3 text-center">
            <p className="text-red-300 text-sm">⚠️ {t.locationPermission}</p>
          </div>
        ) : userLocation ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/30 border border-green-600/50 rounded-xl p-3 text-center"
          >
            <p className="text-green-400 text-sm font-medium">📍 {t.gpsTracking}</p>
            {nearbyClient && (
              <p className="text-orange-400 font-bold mt-1">
                🔔 {t.within200m}: {nearbyClient.name}
              </p>
            )}
          </motion.div>
        ) : (
          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-3 text-center">
            <p className="text-yellow-400 text-sm">🛰️ {t.fetchingGps}</p>
          </div>
        )}
      </div>

      {/* Client Display */}
      <div className="w-full max-w-sm mb-8 text-center">
        {isRunning ? (
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">{t.currentClient}</p>
            <p className="text-white text-2xl font-bold">
              {activeTimer?.clientName || t.noClient}
            </p>
            <p className="text-orange-400 text-lg mt-1">+{earnedSoFar} kr</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-lg">
              {nearbyClient ? `📍 ${nearbyClient.name}` : t.noClient}
            </p>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="mb-10">
        <AnimatePresence mode="wait">
          {isRunning ? (
            <motion.div
              key="timer"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <p className="text-7xl font-mono font-black text-white tracking-tighter">
                {formatDuration(elapsed)}
              </p>
              <p className="text-orange-400 text-sm mt-2 uppercase tracking-widest">{t.timerRunning}</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <p className="text-5xl font-mono font-black text-gray-600">00:00:00</p>
              <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest">{t.timerStopped}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        onClick={handleToggle}
        className={`
          w-48 h-48 rounded-full text-white text-3xl font-black shadow-2xl
          flex items-center justify-center select-none cursor-pointer
          transition-colors duration-300 border-4
          ${isRunning
            ? 'bg-red-600 hover:bg-red-500 border-red-400 shadow-red-900/50'
            : 'bg-orange-500 hover:bg-orange-400 border-orange-300 shadow-orange-900/50'
          }
        `}
        style={{ touchAction: 'manipulation' }}
      >
        <span className="flex flex-col items-center gap-1">
          <span className="text-5xl">{isRunning ? '⏹' : '▶'}</span>
          <span>{isRunning ? t.stop : t.start}</span>
        </span>
      </motion.button>

      {/* Pulsing ring when active */}
      {isRunning && (
        <motion.div
          className="absolute w-56 h-56 rounded-full border-4 border-red-500/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Client Picker Modal */}
      <AnimatePresence>
        {showClientPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-end justify-center z-50"
            onClick={() => setShowClientPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-gray-900 w-full max-w-md rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-xl font-bold mb-4">{t.clients}</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                  >
                    <p className="text-white font-semibold">{client.name}</p>
                    <p className="text-gray-400 text-sm">{client.address}</p>
                    <p className="text-orange-400 text-sm">{client.hourly_rate} kr/h</p>
                  </button>
                ))}
                <button
                  onClick={() => handleSelectClient(null)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <p className="text-gray-400 font-semibold">{t.noClient}</p>
                </button>
              </div>
              <button
                onClick={() => setShowClientPicker(false)}
                className="mt-4 w-full bg-gray-700 text-gray-300 rounded-xl py-3 font-semibold"
              >
                {t.cancel}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
