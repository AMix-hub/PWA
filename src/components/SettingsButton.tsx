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
        className="fixed top-4 right-4 z-40 p-3 rounded-full transition-all bg-white"
        style={{
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          color: '#78716c',
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
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 w-full max-w-sm bg-white"
              style={{
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-stone-900 text-xl font-bold mb-5">{t.settings}</h3>
              <div className="mb-4">
                <p className="text-stone-500 text-sm mb-3">{t.language}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguage('sv')}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all"
                    style={
                      language === 'sv'
                        ? { background: 'linear-gradient(135deg, #fb923c, #f97316)', color: '#fff', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }
                        : { background: '#f5f5f4', border: '1px solid rgba(0,0,0,0.06)', color: '#78716c' }
                    }
                  >
                    🇸🇪 {t.swedish}
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all"
                    style={
                      language === 'en'
                        ? { background: 'linear-gradient(135deg, #fb923c, #f97316)', color: '#fff', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }
                        : { background: '#f5f5f4', border: '1px solid rgba(0,0,0,0.06)', color: '#78716c' }
                    }
                  >
                    🇬🇧 {t.english}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-xl py-3 font-semibold mt-2 text-stone-500 transition-all"
                style={{ background: '#f5f5f4', border: '1px solid rgba(0,0,0,0.06)' }}
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
