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
      className="flex flex-col items-center px-4"
      style={{ minHeight: 'calc(100dvh - 80px)', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
    >
      {/* GPS / Location Status Bar */}
      <div className="w-full max-w-sm mb-5">
        {locationError ? (
          <div
            className="rounded-2xl px-4 py-3 text-center"
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.35)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p className="text-red-300 text-base font-semibold">⚠️ {t.locationPermission}</p>
          </div>
        ) : userLocation ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl px-4 py-3 text-center"
            style={{
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.35)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p className="text-emerald-300 text-sm font-semibold">📍 {t.gpsTracking}</p>
            {nearbyClient && (
              <p className="text-orange-300 font-bold text-base mt-0.5">
                🔔 {t.within200m}: {nearbyClient.name}
              </p>
            )}
          </motion.div>
        ) : (
          <div
            className="rounded-2xl px-4 py-3 text-center"
            style={{
              background: 'rgba(251,191,36,0.12)',
              border: '1px solid rgba(251,191,36,0.35)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p className="text-amber-300 text-sm font-semibold">🛰️ {t.fetchingGps}</p>
          </div>
        )}
      </div>

      {/* Client / Status Info */}
      <div className="w-full max-w-sm text-center mb-6">
        {isRunning ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-purple-300/70 text-xs uppercase tracking-[0.2em] mb-1">{t.currentClient}</p>
            <p className="text-white text-2xl font-extrabold leading-tight">
              {activeTimer?.clientName || t.noClient}
            </p>
            <p className="text-orange-300 text-xl font-bold mt-1">+ {earnedSoFar} kr</p>
          </motion.div>
        ) : (
          <div>
            <p className="text-purple-300/50 text-base">
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
                className="font-mono font-black tracking-tight"
                style={{
                  fontSize: 'clamp(3rem, 14vw, 5rem)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {formatDuration(elapsed)}
              </p>
              <p className="text-orange-400 text-xs uppercase tracking-[0.2em] mt-1 font-semibold">
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
                className="font-mono font-black tracking-tight"
                style={{ fontSize: 'clamp(3rem, 14vw, 5rem)', color: 'rgba(255,255,255,0.15)' }}
              >
                00:00:00
              </p>
              <p className="text-purple-400/40 text-xs uppercase tracking-[0.2em] mt-1 font-semibold">
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
              className="absolute rounded-full"
              style={{ width: 300, height: 300, border: '3px solid rgba(239,68,68,0.4)' }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute rounded-full"
              style={{ width: 300, height: 300, border: '3px solid rgba(239,68,68,0.2)' }}
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
            background: isRunning
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
            border: `2px solid ${isRunning ? 'rgba(252,165,165,0.4)' : 'rgba(254,215,170,0.4)'}`,
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
              ? '0 0 60px rgba(220,38,38,0.5), 0 0 120px rgba(220,38,38,0.15), 0 24px 64px rgba(0,0,0,0.5)'
              : '0 0 60px rgba(249,115,22,0.45), 0 0 120px rgba(249,115,22,0.12), 0 24px 64px rgba(0,0,0,0.5)',
            transition: 'background 0.3s ease, box-shadow 0.3s ease',
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
            className="fixed inset-0 flex items-end justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowClientPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="w-full max-w-md rounded-t-3xl p-6 pb-8"
              style={{
                background: 'linear-gradient(180deg, #1e1b3a 0%, #160f2e 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderBottom: 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-10 h-1 rounded-full mx-auto mb-5"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              />
              <h3 className="text-white text-xl font-bold mb-4">{t.clients}</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className="w-full rounded-2xl p-4 text-left transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <p className="text-white font-bold text-base">{client.name}</p>
                    <p className="text-purple-300/60 text-sm mt-0.5">{client.address}</p>
                    <p className="text-orange-400 text-sm font-semibold mt-1">{client.hourly_rate} kr/h</p>
                  </button>
                ))}
                <button
                  onClick={() => handleSelectClient(null)}
                  className="w-full rounded-2xl p-4 text-left transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <p className="text-purple-300/50 font-semibold text-base">{t.noClient}</p>
                </button>
              </div>
              <button
                onClick={() => setShowClientPicker(false)}
                className="mt-5 w-full rounded-2xl py-4 font-semibold text-base text-white/60 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
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
