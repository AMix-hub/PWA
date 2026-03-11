'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Client, ClientIconType, CLIENT_ICON_COLORS } from '@/lib/clients';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ClientFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  hourly_rate: string;
  iconType: ClientIconType;
}

const emptyForm: ClientFormData = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  hourly_rate: '',
  iconType: 'default',
};

export default function ClientsScreen() {
  const { t, language, clients, addClient, updateClient, deleteClient } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormData>(emptyForm);
  const [mounted, setMounted] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formErrors, setFormErrors] = useState<{ name?: string; coords?: string; rate?: string }>({});

  const clearError = (key: keyof typeof formErrors) =>
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));

  const inputClass = (hasError: boolean) =>
    `client-input${hasError ? ' client-input-error' : ''}`;

  useEffect(() => { setMounted(true); }, []);

  const handleGeocode = async () => {
    const address = form.address.trim();
    if (!address) return;
    setGeocoding(true);
    setGeocodeStatus('idle');
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': language,
          'User-Agent': 'AMix-PWA-TimeTracker/1.0 (https://github.com/AMix-hub/PWA)',
        },
      });
      const data = await res.json();
      if (data && data.length > 0) {
        setForm((prev) => ({
          ...prev,
          latitude: parseFloat(data[0].lat).toFixed(6),
          longitude: parseFloat(data[0].lon).toFixed(6),
        }));
        setGeocodeStatus('success');
      } else {
        setGeocodeStatus('error');
      }
    } catch {
      setGeocodeStatus('error');
    } finally {
      setGeocoding(false);
    }
  };

  const openAdd = () => {
    setEditingClient(null);
    setForm(emptyForm);
    setGeocodeStatus('idle');
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      address: client.address,
      latitude: String(client.latitude),
      longitude: String(client.longitude),
      hourly_rate: String(client.hourly_rate),
      iconType: client.iconType ?? 'default',
    });
    setGeocodeStatus('idle');
    setFormErrors({});
    setShowForm(true);
  };

  const handleSave = async () => {
    let lat = parseFloat(form.latitude);
    let lon = parseFloat(form.longitude);

    // Auto-geocode if address is provided but coordinates are still missing.
    if (form.address.trim() && (isNaN(lat) || isNaN(lon))) {
      setGeocoding(true);
      setGeocodeStatus('idle');
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.address.trim())}&format=json&limit=1`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': language,
            'User-Agent': 'AMix-PWA-TimeTracker/1.0 (https://github.com/AMix-hub/PWA)',
          },
        });
        const data = await res.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lon = parseFloat(data[0].lon);
          setForm((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lon.toFixed(6),
          }));
          setGeocodeStatus('success');
        } else {
          setGeocodeStatus('error');
          setFormErrors({ coords: t.geocodeError });
          setGeocoding(false);
          return;
        }
      } catch {
        setGeocodeStatus('error');
        setFormErrors({ coords: t.geocodeError });
        setGeocoding(false);
        return;
      }
      setGeocoding(false);
    }

    const clientData = {
      name: form.name.trim(),
      address: form.address.trim(),
      latitude: lat,
      longitude: lon,
      hourly_rate: parseFloat(form.hourly_rate),
      iconType: form.iconType,
    };

    const errors: { name?: string; coords?: string; rate?: string } = {};
    if (!clientData.name) errors.name = t.fieldRequired;
    if (isNaN(clientData.latitude) || isNaN(clientData.longitude)) errors.coords = t.invalidCoords;
    if (isNaN(clientData.hourly_rate)) errors.rate = t.invalidRate;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    if (editingClient) {
      updateClient({ ...clientData, id: editingClient.id });
    } else {
      addClient(clientData);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t.confirmDelete)) {
      deleteClient(id);
    }
  };

  return (
    <div className="px-4 py-6" style={{ paddingBottom: '6rem' }}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 800 }}>{t.clients}</h2>
            {clients.length > 0 && (
              <p style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>
                {clients.length} {clients.length === 1 ? t.client.toLowerCase() : t.clients.toLowerCase()}
              </p>
            )}
          </div>
          <button
            onClick={openAdd}
            className="text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> {t.addClient}
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(99,102,241,0.12)' }}
            >
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{t.noClients}</p>
            <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
              {t.noClientsDescription}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 font-bold text-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${CLIENT_ICON_COLORS[client.iconType ?? 'default']}, ${CLIENT_ICON_COLORS[client.iconType ?? 'default']}bb)`,
                      color: '#ffffff',
                      minWidth: 44,
                      minHeight: 44,
                    }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }} className="truncate">{client.name}</p>
                    <p style={{ color: '#475569', fontSize: 12, marginTop: 2 }} className="truncate">{client.address}</p>
                    <p style={{ color: '#f97316', fontWeight: 600, fontSize: 13, marginTop: 4 }}>{client.hourly_rate} kr/h</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(client)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
                      aria-label="Redigera"
                    >
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)' }}
                      aria-label="Ta bort"
                    >
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal – rendered via portal so position:fixed always covers the full viewport */}
      {mounted && createPortal(
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                zIndex: 9999,
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                style={{
                  width: '100%',
                  maxWidth: 448,
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(10,15,35,0.98)',
                  borderRadius: '28px 28px 0 0',
                  boxShadow: '0 -16px 60px rgba(0,0,0,0.6)',
                  maxHeight: '90vh',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderBottom: 'none',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle */}
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16, paddingBottom: 4, flexShrink: 0 }}>
                  <div style={{ width: 40, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }} />
                </div>

                {/* Modal Header */}
                <div style={{ padding: '12px 24px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                    }}
                  >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
                      {editingClient ? t.editClient : t.addClient}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#475569', marginTop: 2 }}>
                      {editingClient ? t.editClientSubtitle : t.addClientSubtitle}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

                {/* Scrollable Fields */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Client Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#a5b4fc', marginBottom: 6 }}>
                        {t.clientName}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none', lineHeight: 0 }}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => { setForm({ ...form, name: e.target.value }); clearError('name'); }}
                          placeholder={`${t.eg} Bygg AB Stockholm`}
                          className={inputClass(!!formErrors.name)}
                          style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.06)', border: `1.5px solid ${formErrors.name ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, paddingLeft: 36, paddingRight: 16, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: '#f1f5f9' }}
                        />
                      </div>
                      {formErrors.name && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ margin: '5px 0 0 4px', fontSize: 11, color: '#f87171', fontWeight: 600 }}>
                          ⚠ {formErrors.name}
                        </motion.p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#a5b4fc', marginBottom: 6 }}>
                        {t.address}
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none', lineHeight: 0 }}>
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                          </span>
                          <input
                            type="text"
                            value={form.address}
                            onChange={(e) => { setForm({ ...form, address: e.target.value }); setGeocodeStatus('idle'); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGeocode(); } }}
                            placeholder={`${t.eg} Sveavägen 44, Stockholm`}
                            className="client-input"
                            style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 12, paddingLeft: 36, paddingRight: 16, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: '#f1f5f9' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleGeocode}
                          disabled={geocoding || !form.address.trim()}
                          title={t.searchCoordinates}
                          style={{
                            flexShrink: 0,
                            width: 46,
                            borderRadius: 12,
                            border: 'none',
                            background: geocoding
                              ? 'rgba(255,255,255,0.06)'
                              : geocodeStatus === 'error'
                                ? 'rgba(239,68,68,0.12)'
                                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: geocoding ? '#475569' : geocodeStatus === 'error' ? '#f87171' : '#ffffff',
                            cursor: geocoding || !form.address.trim() ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: geocoding ? 'none' : geocodeStatus === 'error' ? 'none' : '0 2px 8px rgba(99,102,241,0.35)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {geocoding ? (
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                                <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                              </path>
                            </svg>
                          ) : geocodeStatus === 'error' ? (
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                          ) : (
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {geocodeStatus === 'success' && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{ margin: '5px 0 0 4px', fontSize: 11, color: '#34d399', fontWeight: 600 }}
                        >
                          ✓ {t.coordinatesAutoFilled}
                        </motion.p>
                      )}
                      {geocodeStatus === 'error' && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{ margin: '5px 0 0 4px', fontSize: 11, color: '#f87171', fontWeight: 600 }}
                        >
                          {t.geocodeError}
                        </motion.p>
                      )}
                    </div>

                    {/* Coordinates – side by side */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#a5b4fc', marginBottom: 6 }}>
                        {t.coordinates}
                      </label>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>
                              N
                            </span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={form.latitude}
                              onChange={(e) => { setForm({ ...form, latitude: e.target.value }); clearError('coords'); }}
                              placeholder="57.70"
                              step="any"
                              className={inputClass(!!formErrors.coords)}
                              style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.06)', border: `1.5px solid ${formErrors.coords ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, paddingLeft: 22, paddingRight: 10, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: '#f1f5f9' }}
                            />
                          </div>
                          <p style={{ margin: '4px 0 0 4px', fontSize: 11, color: '#475569' }}>{t.latitude}</p>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>
                              E
                            </span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={form.longitude}
                              onChange={(e) => { setForm({ ...form, longitude: e.target.value }); clearError('coords'); }}
                              placeholder="11.96"
                              step="any"
                              className={inputClass(!!formErrors.coords)}
                              style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.06)', border: `1.5px solid ${formErrors.coords ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, paddingLeft: 22, paddingRight: 10, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: '#f1f5f9' }}
                            />
                          </div>
                          <p style={{ margin: '4px 0 0 4px', fontSize: 11, color: '#475569' }}>{t.longitude}</p>
                        </div>
                      </div>
                      {formErrors.coords && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ margin: '5px 0 0 4px', fontSize: 11, color: '#f87171', fontWeight: 600 }}>
                          ⚠ {formErrors.coords}
                        </motion.p>
                      )}
                    </div>

                    {/* Icon Type Picker */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#a5b4fc', marginBottom: 8 }}>
                        {t.iconTypeLabel}
                      </label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(Object.keys(CLIENT_ICON_COLORS) as ClientIconType[]).map((type) => {
                          const color = CLIENT_ICON_COLORS[type];
                          const iconTypeLabels: Record<ClientIconType, string> = {
                            default: t.iconTypeDefault,
                            work: t.iconTypeWork,
                            home: t.iconTypeHome,
                            warehouse: t.iconTypeWarehouse,
                            service: t.iconTypeService,
                          };
                          const label = iconTypeLabels[type];
                          const isSelected = form.iconType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setForm({ ...form, iconType: type })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '7px 13px',
                                borderRadius: 20,
                                border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.12)'}`,
                                background: isSelected ? `${color}22` : 'rgba(255,255,255,0.04)',
                                color: isSelected ? color : '#64748b',
                                fontSize: 13,
                                fontWeight: isSelected ? 700 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                              }}
                            >
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hourly Rate */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#a5b4fc', marginBottom: 6 }}>
                        {t.hourlyRate}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={form.hourly_rate}
                          onChange={(e) => { setForm({ ...form, hourly_rate: e.target.value }); clearError('rate'); }}
                          placeholder="850"
                          step="any"
                          className={inputClass(!!formErrors.rate)}
                          style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.06)', border: `1.5px solid ${formErrors.rate ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, paddingLeft: 16, paddingRight: 52, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: '#f1f5f9' }}
                        />
                        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 600, color: '#475569', pointerEvents: 'none' }}>
                          kr/h
                        </span>
                      </div>
                      {formErrors.rate && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ margin: '5px 0 0 4px', fontSize: 11, color: '#f87171', fontWeight: 600 }}>
                          ⚠ {formErrors.rate}
                        </motion.p>
                      )}
                    </div>

                  </div>
                </div>

                {/* Sticky Footer */}
                <div style={{ padding: '16px 24px 32px', flexShrink: 0, display: 'flex', gap: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{ flex: 1, borderRadius: 18, paddingTop: 16, paddingBottom: 16, fontWeight: 600, fontSize: 15, color: '#64748b', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.10)', cursor: 'pointer' }}
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSave}
                    style={{ flex: 2, borderRadius: 18, paddingTop: 16, paddingBottom: 16, fontWeight: 700, fontSize: 15, color: '#ffffff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', boxShadow: '0 4px 20px rgba(99,102,241,0.40)', cursor: 'pointer' }}
                  >
                    {t.save}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
