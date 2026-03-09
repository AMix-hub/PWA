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
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <p style={{ color: '#f87171', fontSize: 14, fontWeight: 600 }}>⚠️ {t.locationPermission}</p>
          </div>
        ) : userLocation ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl px-4 py-3 text-center"
            style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.22)' }}
          >
            <p style={{ color: '#34d399', fontSize: 13, fontWeight: 600 }}>📍 {t.gpsTracking}</p>
            {nearbyClient && (
              <p style={{ color: '#f97316', fontWeight: 700, fontSize: 15, marginTop: 2 }}>
                🔔 {t.within200m}: {nearbyClient.name}
              </p>
            )}
          </motion.div>
        ) : (
          <div
            className="rounded-2xl px-4 py-3 text-center"
            style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)' }}
          >
            <p style={{ color: '#fbbf24', fontSize: 13, fontWeight: 600 }}>🛰️ {t.fetchingGps}</p>
          </div>
        )}
      </div>

      {/* Client / Status Info */}
      <div className="w-full max-w-sm text-center mb-6">
        {isRunning ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4, fontWeight: 600 }}>{t.currentClient}</p>
            <p style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
              {activeTimer?.clientName || t.noClient}
            </p>
            <p style={{ color: '#f97316', fontSize: 20, fontWeight: 700, marginTop: 4 }}>+ {earnedSoFar} kr</p>
          </motion.div>
        ) : (
          <div>
            <p style={{ color: '#475569', fontSize: 15 }}>
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
                style={{ fontSize: 'clamp(3rem, 14vw, 5rem)', color: '#f1f5f9' }}
              >
                {formatDuration(elapsed)}
              </p>
              <p style={{ color: '#ef4444', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 4, fontWeight: 700 }}>
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
              <p style={{ color: '#334155', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 4, fontWeight: 600 }}>
                {t.timerStopped}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MAIN TOGGLE BUTTON */}
      <div className="relative flex items-center justify-center">
        {isRunning && (
          <>
            <motion.span
              className="absolute rounded-full"
              style={{ width: 300, height: 300, border: '3px solid rgba(239,68,68,0.3)' }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute rounded-full"
              style={{ width: 300, height: 300, border: '3px solid rgba(239,68,68,0.15)' }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
          </>
        )}

        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handleToggle}
          style={{
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: isRunning
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: `2px solid ${isRunning ? 'rgba(239,68,68,0.4)' : 'rgba(139,92,246,0.4)'}`,
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
              ? '0 0 60px rgba(239,68,68,0.35), 0 16px 48px rgba(0,0,0,0.4)'
              : '0 0 60px rgba(99,102,241,0.30), 0 16px 48px rgba(0,0,0,0.4)',
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
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowClientPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="w-full max-w-md rounded-t-3xl p-6 pb-8"
              style={{
                background: 'rgba(10,15,35,0.98)',
                borderTop: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 -16px 60px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <h3 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{t.clients}</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className="w-full rounded-2xl p-4 text-left transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>{client.name}</p>
                    <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{client.address}</p>
                    <p style={{ color: '#f97316', fontSize: 13, fontWeight: 600, marginTop: 4 }}>{client.hourly_rate} kr/h</p>
                  </button>
                ))}
                <button
                  onClick={() => handleSelectClient(null)}
                  className="w-full rounded-2xl p-4 text-left transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <p style={{ color: '#475569', fontWeight: 600, fontSize: 15 }}>{t.noClient}</p>
                </button>
              </div>
              <button
                onClick={() => setShowClientPicker(false)}
                className="mt-5 w-full rounded-2xl py-4 font-semibold text-base transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
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
