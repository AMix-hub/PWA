'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Client } from '@/lib/clients';
import { useState } from 'react';

interface ClientFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  hourly_rate: string;
}

type InputMode = 'decimal' | 'numeric' | 'text' | 'tel' | 'search' | 'email' | 'url' | 'none';

interface FormField {
  key: keyof ClientFormData;
  label: string;
  type: string;
  inputMode?: InputMode;
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

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-end justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md rounded-t-3xl bg-white flex flex-col"
              style={{
                borderTop: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.08)',
                maxHeight: '88vh',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 pt-5 pb-2 flex-shrink-0">
                <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: '#e7e5e4' }} />
                <h3 className="text-stone-900 text-xl font-bold">
                  {editingClient ? t.editClient : t.addClient}
                </h3>
              </div>

              {/* Scrollable Fields */}
              <div className="overflow-y-auto flex-1 px-6 py-2">
                <div className="space-y-4">
                  {(
                    [
                      { key: 'name', label: t.clientName, type: 'text' },
                      { key: 'address', label: t.address, type: 'text' },
                      { key: 'latitude', label: t.latitude, type: 'number', inputMode: 'decimal' },
                      { key: 'longitude', label: t.longitude, type: 'number', inputMode: 'decimal' },
                      { key: 'hourly_rate', label: t.hourlyRate, type: 'number', inputMode: 'decimal' },
                    ] as FormField[]
                  ).map(({ key, label, type, inputMode }) => (
                    <div key={key}>
                      <label className="text-stone-500 text-sm font-medium mb-1.5 block">{label}</label>
                      <input
                        type={type}
                        inputMode={inputMode}
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full text-stone-900 rounded-xl px-4 py-3 focus:outline-none transition-all"
                        style={{
                          background: '#fafaf9',
                          border: '1.5px solid #e7e5e4',
                          fontSize: 16,
                        }}
                        step={type === 'number' ? 'any' : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky Footer Buttons */}
              <div
                className="px-6 pt-4 pb-6 flex-shrink-0 flex gap-3"
                style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
              >
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl py-3.5 font-semibold text-stone-500 transition-all"
                  style={{ background: '#f5f5f4', border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 text-white rounded-xl py-3.5 font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #fb923c, #f97316)',
                    boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                  }}
                >
                  {t.save}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
