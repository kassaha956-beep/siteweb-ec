'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Edit, Check, X, Search, AlertCircle } from 'lucide-react';
import { wilayaService, adminService } from '../../../services/api';

export default function AdminWilayasPage() {
  const [wilayas, setWilayas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentWilaya, setCurrentWilaya] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadWilayas = () => {
    setLoading(true);
    wilayaService.getWilayas({ admin: 'true' })
      .then((res) => {
        if (res.data && res.data.data) {
          setWilayas(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWilayas();
  }, []);

  const handleOpenEdit = (w) => {
    setCurrentWilaya(w);
    setDeliveryFee(w.delivery_fee);
    setEstimatedDays(w.estimated_delivery_days || '2-4 jours');
    setIsActive(w.is_active === 1);
    setMessage('');
    setIsEditOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentWilaya) return;

    setSubmitting(true);
    try {
      await adminService.updateWilaya(currentWilaya.id, {
        delivery_fee: parseFloat(deliveryFee),
        estimated_delivery_days: estimatedDays,
        is_active: isActive,
      });
      setIsEditOpen(false);
      loadWilayas();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification des tarifs de livraison.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWilayas = wilayas.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.code.includes(search) ||
    (w.name_ar && w.name_ar.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#54243F]">
            Tarifs de Livraison par Wilaya (58 Wilayas)
          </h2>
          <p className="text-xs text-[#6f6877]">
            Personnalisez les frais d'expédition et les délais de livraison pour chaque wilaya d'Algérie.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-[#F5DCE5] card-shadow flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Rechercher wilaya (ex: Alger, 16, Oran)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
          />
          <Search className="w-4 h-4 text-[#54243F] absolute left-3.5 top-3" />
        </div>
        <span className="text-xs font-semibold text-[#54243F]">
          {filteredWilayas.length} wilayas affichées
        </span>
      </div>

      {/* Wilayas Table */}
      <div className="bg-white rounded-3xl border border-[#F5DCE5] card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#54243F]">
            Chargement des 58 wilayas...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F7] text-[#54243F] uppercase tracking-wider text-[10px] font-bold border-b border-[#F5DCE5]">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Nom de la Wilaya</th>
                  <th className="p-4">Nom en Arabe</th>
                  <th className="p-4">Frais de Livraison (DA)</th>
                  <th className="p-4">Délai Estimé</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5DCE5]">
                {filteredWilayas.map((w) => (
                  <tr key={w.id} className="hover:bg-[#FFF9F7]/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#54243F]">
                      {w.code}
                    </td>
                    <td className="p-4 font-semibold text-[#343039]">
                      {w.name}
                    </td>
                    <td className="p-4 text-[#6f6877] font-arabic">
                      {w.name_ar || '-'}
                    </td>
                    <td className="p-4 font-bold text-sm text-[#54243F]">
                      {parseFloat(w.delivery_fee).toLocaleString()} DA
                    </td>
                    <td className="p-4 text-[#6f6877]">
                      {w.estimated_delivery_days || '2-4 jours'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          w.is_active === 1
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {w.is_active === 1 ? 'Livraison Active' : 'Suspendue'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(w)}
                        className="bg-[#54243F] text-white hover:bg-[#431a32] px-3 py-1.5 rounded-xl font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Modifier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && currentWilaya && (
        <div className="fixed inset-0 z-50 bg-[#343039]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF9F7] rounded-[2.5rem] border border-[#F5DCE5] card-shadow max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5DCE5]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#54243F]">
                  Modifier Tarif de Livraison
                </h3>
                <p className="text-xs text-[#6f6877]">
                  Wilaya {currentWilaya.code} - {currentWilaya.name} ({currentWilaya.name_ar})
                </p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 text-[#343039] hover:bg-[#F5DCE5] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Tarif de Livraison (Dinars Algériens - DA) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white text-base font-bold text-[#54243F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Délai Moyen Estimé *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 24-48 heures, 2-3 jours..."
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white text-[#343039]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#54243F] rounded"
                  />
                  <span className="font-semibold text-[#54243F]">
                    Livraison active pour cette wilaya
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#F5DCE5]">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#54243F] hover:bg-[#431a32] text-white font-bold uppercase tracking-wider"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
