'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Client } from '@/lib/clients';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ClientFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  hourly_rate: string;
}

const emptyForm: ClientFormData = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  hourly_rate: '',
};

export default function ClientsScreen() {
  const { t, clients, addClient, updateClient, deleteClient } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormData>(emptyForm);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const openAdd = () => {
    setEditingClient(null);
    setForm(emptyForm);
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
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const data = {
      name: form.name.trim(),
      address: form.address.trim(),
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      hourly_rate: parseFloat(form.hourly_rate),
    };
    if (!data.name || isNaN(data.latitude) || isNaN(data.longitude) || isNaN(data.hourly_rate)) return;

    if (editingClient) {
      updateClient({ ...data, id: editingClient.id });
    } else {
      addClient(data);
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
            <h2 className="text-stone-900 text-2xl font-bold">{t.clients}</h2>
            {clients.length > 0 && (
              <p className="text-stone-400 text-sm mt-0.5">
                {clients.length} {clients.length === 1 ? t.client.toLowerCase() : t.clients.toLowerCase()}
              </p>
            )}
          </div>
          <button
            onClick={openAdd}
            className="text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1"
            style={{
              background: 'linear-gradient(135deg, #fb923c, #f97316)',
              boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> {t.addClient}
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(249,115,22,0.1)' }}
            >
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-stone-700 font-semibold text-base mb-1">{t.noClients}</p>
            <p className="text-stone-400 text-sm text-center max-w-xs">
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
                className="rounded-2xl bg-white overflow-hidden"
                style={{
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 font-bold text-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #fb923c, #f97316)',
                      color: '#ffffff',
                      minWidth: 44,
                      minHeight: 44,
                    }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-stone-900 font-bold text-base leading-tight truncate">{client.name}</p>
                    <p className="text-stone-400 text-xs truncate mt-0.5">{client.address}</p>
                    <p className="text-orange-500 font-semibold text-sm mt-1">{client.hourly_rate} kr/h</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(client)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
                      aria-label="Redigera"
                    >
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}
                      aria-label="Ta bort"
                    >
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                background: 'rgba(0,0,0,0.55)',
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
                  backgroundColor: '#ffffff',
                  borderRadius: '28px 28px 0 0',
                  boxShadow: '0 -16px 60px rgba(0,0,0,0.2)',
                  maxHeight: '90vh',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle */}
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16, paddingBottom: 4, flexShrink: 0 }}>
                  <div style={{ width: 40, height: 6, borderRadius: 99, background: '#d6d3d1' }} />
                </div>

                {/* Modal Header */}
                <div style={{ padding: '12px 24px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #fb923c, #f97316)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
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
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1c1917', lineHeight: 1.2 }}>
                      {editingClient ? t.editClient : t.addClient}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#a8a29e', marginTop: 2 }}>
                      {editingClient ? t.editClientSubtitle : t.addClientSubtitle}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f5f5f4', flexShrink: 0 }} />

                {/* Scrollable Fields */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Client Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#f97316', marginBottom: 6 }}>
                        {t.clientName}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#c7c3c0', pointerEvents: 'none', lineHeight: 0 }}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder={`${t.eg} Bygg AB Stockholm`}
                          className="client-input"
                          style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', border: '1.5px solid #e5e7eb', borderRadius: 12, paddingLeft: 36, paddingRight: 16, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: '#1c1917' }}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#f97316', marginBottom: 6 }}>
                        {t.address}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#c7c3c0', pointerEvents: 'none', lineHeight: 0 }}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder={`${t.eg} Sveavägen 44, Stockholm`}
                          className="client-input"
                          style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', border: '1.5px solid #e5e7eb', borderRadius: 12, paddingLeft: 36, paddingRight: 16, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: '#1c1917' }}
                        />
                      </div>
                    </div>

                    {/* Coordinates – side by side */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#f97316', marginBottom: 6 }}>
                        {t.coordinates}
                      </label>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#c7c3c0', pointerEvents: 'none', lineHeight: 0 }}>
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                            </span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={form.latitude}
                              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                              placeholder="57.70"
                              step="any"
                              className="client-input"
                              style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', border: '1.5px solid #e5e7eb', borderRadius: 12, paddingLeft: 28, paddingRight: 10, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: '#1c1917' }}
                            />
                          </div>
                          <p style={{ margin: '4px 0 0 4px', fontSize: 11, color: '#a8a29e' }}>{t.latitude}</p>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#c7c3c0', pointerEvents: 'none', lineHeight: 0 }}>
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="2" y1="12" x2="22" y2="12" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                            </span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={form.longitude}
                              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                              placeholder="11.96"
                              step="any"
                              className="client-input"
                              style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', border: '1.5px solid #e5e7eb', borderRadius: 12, paddingLeft: 28, paddingRight: 10, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: '#1c1917' }}
                            />
                          </div>
                          <p style={{ margin: '4px 0 0 4px', fontSize: 11, color: '#a8a29e' }}>{t.longitude}</p>
                        </div>
                      </div>
                    </div>

                    {/* Hourly Rate */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#f97316', marginBottom: 6 }}>
                        {t.hourlyRate}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#c7c3c0', pointerEvents: 'none', lineHeight: 0 }}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={form.hourly_rate}
                          onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                          placeholder="850"
                          step="any"
                          className="client-input"
                          style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', border: '1.5px solid #e5e7eb', borderRadius: 12, paddingLeft: 36, paddingRight: 48, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: '#1c1917' }}
                        />
                        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 600, color: '#a8a29e', pointerEvents: 'none' }}>
                          kr/h
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Sticky Footer */}
                <div style={{ padding: '16px 24px 32px', flexShrink: 0, display: 'flex', gap: 12, borderTop: '1px solid #f5f5f4' }}>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{ flex: 1, borderRadius: 18, paddingTop: 16, paddingBottom: 16, fontWeight: 600, fontSize: 15, color: '#78716c', background: '#f5f5f4', border: '1.5px solid #e7e5e4', cursor: 'pointer' }}
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSave}
                    style={{ flex: 2, borderRadius: 18, paddingTop: 16, paddingBottom: 16, fontWeight: 700, fontSize: 15, color: '#ffffff', background: 'linear-gradient(135deg, #fb923c, #f97316)', border: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.35)', cursor: 'pointer' }}
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
