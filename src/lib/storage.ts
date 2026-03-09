import { Client, defaultClients } from './clients';

export interface TimeLog {
  id: string;
  clientId: string;
  clientName: string;
  startTime: number; // timestamp ms
  endTime: number;   // timestamp ms
  hourlyRate: number;
}

export interface ActiveTimer {
  clientId: string | null;
  clientName: string | null;
  startTime: number; // timestamp ms
  hourlyRate: number;
}

const KEYS = {
  CLIENTS: 'pwa_clients',
  LOGS: 'pwa_logs',
  ACTIVE_TIMER: 'pwa_active_timer',
  LANGUAGE: 'pwa_language',
};

export function getClients(): Client[] {
  if (typeof window === 'undefined') return defaultClients;
  const stored = localStorage.getItem(KEYS.CLIENTS);
  if (!stored) {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(defaultClients));
    return defaultClients;
  }
  return JSON.parse(stored);
}

export function saveClients(clients: Client[]): void {
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
}

export function getLogs(): TimeLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(KEYS.LOGS);
  return stored ? JSON.parse(stored) : [];
}

export function saveLogs(logs: TimeLog[]): void {
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
}

export function getActiveTimer(): ActiveTimer | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(KEYS.ACTIVE_TIMER);
  return stored ? JSON.parse(stored) : null;
}

export function saveActiveTimer(timer: ActiveTimer | null): void {
  if (timer === null) {
    localStorage.removeItem(KEYS.ACTIVE_TIMER);
  } else {
    localStorage.setItem(KEYS.ACTIVE_TIMER, JSON.stringify(timer));
  }
}

export function getLanguage(): string {
  if (typeof window === 'undefined') return 'sv';
  return localStorage.getItem(KEYS.LANGUAGE) || 'sv';
}

export function saveLanguage(lang: string): void {
  localStorage.setItem(KEYS.LANGUAGE, lang);
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kr`;
}
