'use client';

import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatDuration, formatCurrency } from '@/lib/storage';
import { exportToPDF, exportToExcel } from '@/lib/export';

export default function TimeLogsScreen() {
  const { t, logs } = useApp();

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <p className="text-6xl mb-4">📋</p>
        <p className="text-purple-300/40 text-lg">{t.noLogs}</p>
      </div>
    );
  }

  // Group logs by date
  const grouped = logs.reduce((acc, log) => {
    const date = new Date(log.startTime).toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  const totalEarned = logs.reduce((sum, log) => {
    const hours = (log.endTime - log.startTime) / 3600000;
    return sum + hours * log.hourlyRate;
  }, 0);

  const handleExportPDF = () => exportToPDF(logs, t.appName);
  const handleExportExcel = () => exportToExcel(logs, t.appName);

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white text-2xl font-bold">{t.timeLogs}</h2>
        </div>

        {/* Total */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: 'rgba(251,146,60,0.12)',
            border: '1px solid rgba(251,146,60,0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <p className="text-purple-300/60 text-sm">{t.totalEarned}</p>
          <p className="text-orange-400 text-3xl font-black">{formatCurrency(totalEarned)}</p>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleExportPDF}
            className="flex-1 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              background: 'rgba(239,68,68,0.25)',
              border: '1px solid rgba(239,68,68,0.35)',
            }}
          >
            📄 {t.exportPDF}
          </button>
          <button
            onClick={handleExportExcel}
            className="flex-1 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              background: 'rgba(16,185,129,0.2)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            📊 {t.exportExcel}
          </button>
        </div>

        {/* Grouped Logs */}
        {Object.entries(grouped)
          .reverse()
          .map(([date, dateLogs], i) => {
            const dayEarned = dateLogs.reduce((sum, log) => {
              const hours = (log.endTime - log.startTime) / 3600000;
              return sum + hours * log.hourlyRate;
            }, 0);
            const dayMs = dateLogs.reduce((sum, log) => sum + (log.endTime - log.startTime), 0);

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="mb-6"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-purple-200/80 font-semibold capitalize">{date}</h3>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold">{formatCurrency(dayEarned)}</p>
                    <p className="text-purple-300/40 text-xs">{formatDuration(dayMs)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {dateLogs.map((log) => {
                    const duration = log.endTime - log.startTime;
                    const hours = duration / 3600000;
                    const earned = hours * log.hourlyRate;
                    return (
                      <div
                        key={log.id}
                        className="rounded-xl p-3"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-semibold">{log.clientName}</p>
                            <p className="text-purple-300/50 text-sm">
                              {new Date(log.startTime).toLocaleTimeString('sv-SE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              –{' '}
                              {new Date(log.endTime).toLocaleTimeString('sv-SE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-orange-400 font-bold">{formatCurrency(earned)}</p>
                            <p className="text-purple-300/40 text-sm">{formatDuration(duration)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
