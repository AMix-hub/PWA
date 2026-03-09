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
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          color: 'rgba(255,255,255,0.8)',
          touchAction: 'manipulation',
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
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{
                background: 'linear-gradient(135deg, #1e1b3a 0%, #160f2e 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-xl font-bold mb-5">{t.settings}</h3>
              <div className="mb-4">
                <p className="text-purple-300/60 text-sm mb-3">{t.language}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguage('sv')}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all text-white"
                    style={
                      language === 'sv'
                        ? { background: 'linear-gradient(135deg, #fb923c, #f97316)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }
                        : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
                    }
                  >
                    🇸🇪 {t.swedish}
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all text-white"
                    style={
                      language === 'en'
                        ? { background: 'linear-gradient(135deg, #fb923c, #f97316)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }
                        : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
                    }
                  >
                    🇬🇧 {t.english}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-xl py-3 font-semibold mt-2 text-white/60 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
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
