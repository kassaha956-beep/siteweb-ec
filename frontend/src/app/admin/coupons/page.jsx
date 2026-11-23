'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import { adminService } from '../../../services/api';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0',
    max_uses: '',
    is_active: true,
    expires_at: '',
  });

  const loadCoupons = () => {
    setLoading(true);
    adminService.getCoupons()
      .then((res) => {
        if (res.data && res.data.data) {
          setCoupons(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '10',
      min_order_amount: '3000',
      max_uses: '100',
      is_active: true,
      expires_at: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setIsEditing(true);
    setCurrentId(c.id);
    setFormData({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount,
      max_uses: c.max_uses ? c.max_uses.toString() : '',
      is_active: c.is_active === 1,
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce code promotionnel ?')) return;
    try {
      await adminService.deleteCoupon(id);
      loadCoupons();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount || 0),
        max_uses: formData.max_uses ? parseInt(formData.max_uses, 10) : null,
        is_active: formData.is_active,
        expires_at: formData.expires_at ? `${formData.expires_at} 23:59:59` : null,
      };

      if (isEditing) {
        await adminService.updateCoupon(currentId, payload);
      } else {
        await adminService.createCoupon(payload);
      }

      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#54243F]">
            Codes Promotionnels & Réductions
          </h2>
          <p className="text-xs text-[#6f6877]">
            Créez des remises en pourcentage ou montants fixes pour vos campagnes marketing.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#54243F] hover:bg-[#431a32] text-white px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#F5DCE5] card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#54243F]">
            Chargement des coupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6f6877]">
            Aucun code promo créé pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F7] text-[#54243F] uppercase tracking-wider text-[10px] font-bold border-b border-[#F5DCE5]">
                <tr>
                  <th className="p-4">Code Promo</th>
                  <th className="p-4">Valeur de Remise</th>
                  <th className="p-4">Panier Minimum</th>
                  <th className="p-4">Utilisations</th>
                  <th className="p-4">Date d'Expiration</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5DCE5]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFF9F7]/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-sm text-[#54243F]">
                      {c.code}
                    </td>
                    <td className="p-4 font-bold text-[#54243F]">
                      {c.discount_type === 'percentage'
                        ? `${parseFloat(c.discount_value)}% de remise`
                        : `${parseFloat(c.discount_value).toLocaleString()} DA fixes`}
                    </td>
                    <td className="p-4 text-[#6f6877]">
                      {parseFloat(c.min_order_amount) > 0
                        ? `${parseFloat(c.min_order_amount).toLocaleString()} DA`
                        : 'Sans minimum'}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-[#343039]">
                        {c.current_uses} / {c.max_uses ? c.max_uses : '∞'}
                      </span>
                    </td>
                    <td className="p-4 text-[#6f6877]">
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleDateString('fr-FR')
                        : 'Illimité'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.is_active === 1
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {c.is_active === 1 ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-[#54243F] hover:bg-[#F5DCE5] rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#343039]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF9F7] rounded-[2.5rem] border border-[#F5DCE5] card-shadow max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5DCE5]">
              <h3 className="font-serif font-bold text-lg text-[#54243F]">
                {isEditing ? 'Modifier le Coupon' : 'Créer un Code Promo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#343039] hover:bg-[#F5DCE5] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Code Promotionnel (ex: BIYODO10) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="EX: BIYODO10"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white font-mono uppercase font-bold text-[#54243F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#54243F] mb-1">
                    Type de Remise
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E9A5BE] rounded-xl bg-white"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (DA)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#54243F] mb-1">
                    Valeur
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="10"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E9A5BE] rounded-xl bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#54243F] mb-1">
                    Panier Min. (DA)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E9A5BE] rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#54243F] mb-1">
                    Max Utilisations
                  </label>
                  <input
                    type="number"
                    placeholder="Illimité"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E9A5BE] rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Date d'Expiration (Optionnel)
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#E9A5BE] rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#54243F] rounded"
                  />
                  <span className="font-semibold text-[#54243F]">Coupon Actif</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#F5DCE5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
