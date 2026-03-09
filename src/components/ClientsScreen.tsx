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
    <div className="min-h-[calc(100vh-80px)] bg-gray-950 px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-bold">{t.clients}</h2>
          <button
            onClick={openAdd}
            className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
          >
            + {t.addClient}
          </button>
        </div>

        {clients.length === 0 ? (
          <p className="text-gray-500 text-center py-12">{t.noClients}</p>
        ) : (
          <div className="space-y-3">
            {clients.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-900 rounded-2xl p-4 border border-gray-800"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg truncate">{client.name}</p>
                    <p className="text-gray-400 text-sm truncate">{client.address}</p>
                    <p className="text-orange-400 font-semibold mt-1">{client.hourly_rate} kr/h</p>
                    <p className="text-gray-600 text-xs mt-1">
                      {client.latitude.toFixed(4)}, {client.longitude.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => openEdit(client)}
                      className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="bg-red-800 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      🗑️
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
            className="fixed inset-0 bg-black/80 flex items-end justify-center z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-gray-900 w-full max-w-md rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-xl font-bold mb-5">
                {editingClient ? t.editClient : t.addClient}
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'name', label: t.clientName, type: 'text' },
                  { key: 'address', label: t.address, type: 'text' },
                  { key: 'latitude', label: t.latitude, type: 'number' },
                  { key: 'longitude', label: t.longitude, type: 'number' },
                  { key: 'hourly_rate', label: t.hourlyRate, type: 'number' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="text-gray-400 text-sm mb-1 block">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof ClientFormData]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-orange-500 focus:outline-none"
                      step={type === 'number' ? 'any' : undefined}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-700 text-gray-300 rounded-xl py-3 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 text-white rounded-xl py-3 font-semibold transition-colors"
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
