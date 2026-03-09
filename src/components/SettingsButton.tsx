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
        className="fixed top-4 right-4 z-40 bg-gray-800 text-gray-300 p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        style={{ touchAction: 'manipulation' }}
      >
        ⚙️
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-xl font-bold mb-5">{t.settings}</h3>
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-3">{t.language}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguage('sv')}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                      language === 'sv'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    🇸🇪 {t.swedish}
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                      language === 'en'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    🇬🇧 {t.english}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-full bg-gray-700 text-gray-300 rounded-xl py-3 font-semibold mt-2"
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
