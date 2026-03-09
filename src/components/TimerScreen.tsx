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
    <div
      className="flex flex-col items-center px-4 bg-gray-950"
      style={{ minHeight: 'calc(100dvh - 80px)', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
    >
      {/* GPS / Location Status Bar */}
      <div className="w-full max-w-sm mb-5">
        {locationError ? (
          <div className="bg-red-950 border border-red-600 rounded-2xl px-4 py-3 text-center">
            <p className="text-red-300 text-base font-semibold">⚠️ {t.locationPermission}</p>
          </div>
        ) : userLocation ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-950 border border-green-700 rounded-2xl px-4 py-3 text-center"
          >
            <p className="text-green-400 text-sm font-semibold">📍 {t.gpsTracking}</p>
            {nearbyClient && (
              <p className="text-orange-400 font-bold text-base mt-0.5">
                🔔 {t.within200m}: {nearbyClient.name}
              </p>
            )}
          </motion.div>
        ) : (
          <div className="bg-yellow-950 border border-yellow-700 rounded-2xl px-4 py-3 text-center">
            <p className="text-yellow-400 text-sm font-semibold">🛰️ {t.fetchingGps}</p>
          </div>
        )}
      </div>

      {/* Client / Status Info */}
      <div className="w-full max-w-sm text-center mb-6">
        {isRunning ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-1">{t.currentClient}</p>
            <p className="text-white text-2xl font-extrabold leading-tight">
              {activeTimer?.clientName || t.noClient}
            </p>
            <p className="text-orange-400 text-xl font-bold mt-1">+ {earnedSoFar} kr</p>
          </motion.div>
        ) : (
          <div>
            <p className="text-gray-500 text-base">
              {nearbyClient ? `📍 ${nearbyClient.name}` : t.noClient}
            </p>
          </div>
        )}
      </div>

      {/* Live Clock */}
      <div className="mb-8 text-center w-full">
        <AnimatePresence mode="wait">
          {isRunning ? (
            <motion.div
              key="running"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
            >
              <p
                className="font-mono font-black text-white tracking-tight"
                style={{ fontSize: 'clamp(3rem, 14vw, 5rem)' }}
              >
                {formatDuration(elapsed)}
              </p>
              <p className="text-orange-500 text-xs uppercase tracking-[0.2em] mt-1 font-semibold">
                ● {t.timerRunning}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
            >
              <p
                className="font-mono font-black text-gray-700 tracking-tight"
                style={{ fontSize: 'clamp(3rem, 14vw, 5rem)' }}
              >
                00:00:00
              </p>
              <p className="text-gray-600 text-xs uppercase tracking-[0.2em] mt-1 font-semibold">
                {t.timerStopped}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MAIN TOGGLE BUTTON — massive, fat-finger friendly */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring (only when running) */}
        {isRunning && (
          <>
            <motion.span
              className="absolute rounded-full border-4 border-red-500/40"
              style={{ width: 300, height: 300 }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute rounded-full border-4 border-red-500/20"
              style={{ width: 300, height: 300 }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
          </>
        )}

        <motion.button
          whileTap={{ scale: 0.91 }}
          onClick={handleToggle}
          style={{
            width: 260,
            height: 260,
            borderRadius: '50%',
            backgroundColor: isRunning ? '#dc2626' : '#f97316',
            border: `6px solid ${isRunning ? '#fca5a5' : '#fed7aa'}`,
            color: '#ffffff',
            fontWeight: 900,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            userSelect: 'none',
            touchAction: 'manipulation',
            cursor: 'pointer',
            boxShadow: isRunning
              ? '0 0 80px rgba(220,38,38,0.6), 0 20px 60px rgba(0,0,0,0.7)'
              : '0 0 80px rgba(249,115,22,0.55), 0 20px 60px rgba(0,0,0,0.7)',
            transition: 'background-color 0.2s ease',
          }}
        >
          <span style={{ fontSize: 72, lineHeight: 1 }}>{isRunning ? '⏹' : '▶'}</span>
          <span style={{ fontSize: 28, letterSpacing: '0.05em' }}>
            {isRunning ? t.stop : t.start}
          </span>
        </motion.button>
      </div>

      {/* Client Picker Bottom Sheet */}
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
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="bg-gray-900 w-full max-w-md rounded-t-3xl p-6 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />
              <h3 className="text-white text-xl font-bold mb-4">{t.clients}</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className="w-full bg-gray-800 active:bg-gray-700 rounded-2xl p-4 text-left"
                  >
                    <p className="text-white font-bold text-base">{client.name}</p>
                    <p className="text-gray-400 text-sm mt-0.5">{client.address}</p>
                    <p className="text-orange-400 text-sm font-semibold mt-1">{client.hourly_rate} kr/h</p>
                  </button>
                ))}
                <button
                  onClick={() => handleSelectClient(null)}
                  className="w-full bg-gray-800 active:bg-gray-700 rounded-2xl p-4 text-left"
                >
                  <p className="text-gray-400 font-semibold text-base">{t.noClient}</p>
                </button>
              </div>
              <button
                onClick={() => setShowClientPicker(false)}
                className="mt-5 w-full bg-gray-700 text-gray-300 rounded-2xl py-4 font-semibold text-base"
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
