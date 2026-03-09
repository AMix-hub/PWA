'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@/lib/clients';
import { TimeLog, ActiveTimer, getClients, saveClients, getLogs, saveLogs, getActiveTimer, saveActiveTimer, getLanguage, saveLanguage } from '@/lib/storage';
import { findNearestClient } from '@/lib/haversine';
import { Language, translations } from '@/lib/translations';

interface AppContextType {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations[Language];
  
  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  
  // Timer
  activeTimer: ActiveTimer | null;
  startTimer: (clientId: string | null, clientName: string | null, hourlyRate: number) => void;
  stopTimer: () => void;
  elapsed: number; // ms
  
  // Logs
  logs: TimeLog[];
  
  // GPS
  userLocation: { lat: number; lon: number } | null;
  nearbyClient: Client | null;
  locationError: string | null;
  
  // Navigation
  activeTab: 'timer' | 'clients' | 'logs' | 'map';
  setActiveTab: (tab: 'timer' | 'clients' | 'logs' | 'map') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('sv');
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [activeTimer, setActiveTimerState] = useState<ActiveTimer | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [nearbyClient, setNearbyClient] = useState<Client | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timer' | 'clients' | 'logs' | 'map'>('timer');

  // Load from localStorage on mount
  useEffect(() => {
    setLanguageState((getLanguage() as Language) || 'sv');
    setClients(getClients());
    setLogs(getLogs());
    const timer = getActiveTimer();
    if (timer) {
      setActiveTimerState(timer);
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (!activeTimer) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(Date.now() - activeTimer.startTime);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeTimer]);

  // Keep a ref to clients so the GPS watch callback always sees the latest list
  // without needing to restart the watch when clients change.
  const clientsRef = useRef(clients);
  useEffect(() => { clientsRef.current = clients; }, [clients]);

  // Update nearby client whenever clients list or user location changes.
  useEffect(() => {
    if (userLocation) {
      setNearbyClient(findNearestClient(userLocation.lat, userLocation.lon, clientsRef.current));
    }
  }, [clients, userLocation]);

  // GPS tracking – started once, never restarted.
  // maximumAge: 0 forces the device to return a fresh position every time.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserLocation(loc);
        setLocationError(null);
        setNearbyClient(findNearestClient(loc.lat, loc.lon, clientsRef.current));
      },
      (err) => {
        setLocationError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []); // GPS watch is intentionally started once on mount; clientsRef keeps the callback up-to-date without restarting the watch. eslint-disable-line react-hooks/exhaustive-deps

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = { ...client, id: Date.now().toString() };
    const updated = [...clients, newClient];
    setClients(updated);
    saveClients(updated);
  };

  const updateClient = (client: Client) => {
    const updated = clients.map((c) => (c.id === client.id ? client : c));
    setClients(updated);
    saveClients(updated);
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    saveClients(updated);
  };

  const startTimer = useCallback((clientId: string | null, clientName: string | null, hourlyRate: number) => {
    const timer: ActiveTimer = {
      clientId,
      clientName,
      startTime: Date.now(),
      hourlyRate,
    };
    setActiveTimerState(timer);
    saveActiveTimer(timer);
  }, []);

  const stopTimer = useCallback(() => {
    if (!activeTimer) return;
    const log: TimeLog = {
      id: Date.now().toString(),
      clientId: activeTimer.clientId || 'unknown',
      clientName: activeTimer.clientName || 'Unknown',
      startTime: activeTimer.startTime,
      endTime: Date.now(),
      hourlyRate: activeTimer.hourlyRate,
    };
    const updated = [...logs, log];
    setLogs(updated);
    saveLogs(updated);
    setActiveTimerState(null);
    saveActiveTimer(null);
  }, [activeTimer, logs]);

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        clients,
        addClient,
        updateClient,
        deleteClient,
        activeTimer,
        startTimer,
        stopTimer,
        elapsed,
        logs,
        userLocation,
        nearbyClient,
        locationError,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
