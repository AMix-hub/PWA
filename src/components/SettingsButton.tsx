'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';

export default function SettingsButton() {
  const { t, language, setLanguage } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-40 p-3 rounded-full transition-all"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          color: '#94a3b8',
          touchAction: 'manipulation',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        ⚙️
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{
                background: 'rgba(12,18,40,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{t.settings}</h3>
              <div className="mb-4">
                <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>{t.language}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguage('sv')}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all"
                    style={
                      language === 'sv'
                        ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }
                        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }
                    }
                  >
                    🇸🇪 {t.swedish}
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all"
                    style={
                      language === 'en'
                        ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }
                        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }
                    }
                  >
                    🇬🇧 {t.english}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-xl py-3 font-semibold mt-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }}
              >
                {t.cancel}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
