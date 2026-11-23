'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowUpDown,
  History,
  Plus,
  Minus,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { adminService } from '../../../services/api';

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'movements'
  const [filter, setFilter] = useState('all'); // 'all' | 'low' | 'out'
  const [search, setSearch] = useState('');
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('in'); // 'in' | 'out' | 'adjustment'
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('Réception nouvelle livraison fournisseur');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  const loadInventory = () => {
    setLoading(true);
    adminService.getInventory({ filter, search })
      .then((res) => {
        if (res.data && res.data.success) {
          setInventory(res.data.data);
          setSummary(res.data.summary);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const loadMovements = () => {
    setLoading(true);
    adminService.getMovements({ limit: 40 })
      .then((res) => {
        if (res.data && res.data.success) {
          setMovements(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'stock') {
      loadInventory();
    } else {
      loadMovements();
    }
  }, [activeTab, filter, search]);

  const handleOpenAdjust = (prod) => {
    setSelectedProduct(prod);
    setAdjustType('in');
    setAdjustQuantity('10');
    setAdjustReason('Réapprovisionnement fournisseur');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustQuantity) return;

    setAdjustSubmitting(true);
    try {
      await adminService.adjustStock({
        product_id: selectedProduct.id,
        movement_type: adjustType,
        quantity: parseInt(adjustQuantity, 10),
        reason: adjustReason,
      });
      setAdjustModalOpen(false);
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'ajustement de stock.');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const movementLabels = {
    in: 'Entrée (+) Réception',
    out: 'Sortie (-) Retrait',
    adjustment: 'Inventaire Réel (=)',
    order_deduction: 'Déduction Commande (-)',
    order_restoration: 'Restitution Commande (+)',
  };

  const movementColors = {
    in: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    out: 'text-red-700 bg-red-50 border-red-200',
    adjustment: 'text-purple-700 bg-purple-50 border-purple-200',
    order_deduction: 'text-blue-700 bg-blue-50 border-blue-200',
    order_restoration: 'text-amber-700 bg-amber-50 border-amber-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#54243F]">
          Gestion des Stocks & Inventaire
        </h2>
        <p className="text-xs text-[#6f6877]">
          Surveillance en direct des unités en rayon, valorisation du stock et journal d'audit des mouvements.
        </p>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#F5DCE5] card-shadow space-y-1">
            <span className="text-[11px] text-[#6f6877] font-semibold">Total Unités en Magasin</span>
            <p className="text-2xl font-bold text-[#54243F]">{summary.total_units_in_stock || 0}</p>
            <p className="text-[10px] text-[#6f6877]">{summary.total_products} références</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#F5DCE5] card-shadow space-y-1">
            <span className="text-[11px] text-[#6f6877] font-semibold">Stock Faible (&lt; 10)</span>
            <p className="text-2xl font-bold text-amber-600">{summary.low_stock_count || 0}</p>
            <p className="text-[10px] text-amber-700">À réapprovisionner</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#F5DCE5] card-shadow space-y-1">
            <span className="text-[11px] text-[#6f6877] font-semibold">Ruptures de Stock</span>
            <p className="text-2xl font-bold text-red-600">{summary.out_of_stock_count || 0}</p>
            <p className="text-[10px] text-red-700">Non commandables</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#F5DCE5] card-shadow space-y-1">
            <span className="text-[11px] text-[#6f6877] font-semibold">Valorisation au Coût d'Achat</span>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700">
              {parseFloat(summary.total_stock_cost_value || 0).toLocaleString()} DA
            </p>
            <p className="text-[10px] text-[#6f6877]">
              Valeur vente : {parseFloat(summary.total_stock_retail_value || 0).toLocaleString()} DA
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#F5DCE5] gap-4">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
            activeTab === 'stock'
              ? 'border-b-2 border-[#54243F] text-[#54243F]'
              : 'text-[#6f6877] hover:text-[#54243F]'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>État des Stocks</span>
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
            activeTab === 'movements'
              ? 'border-b-2 border-[#54243F] text-[#54243F]'
              : 'text-[#6f6877] hover:text-[#54243F]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historique des Mouvements</span>
        </button>
      </div>

      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Sub filter bar */}
          <div className="bg-white p-4 rounded-3xl border border-[#F5DCE5] card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filter === 'all' ? 'bg-[#54243F] text-white' : 'bg-[#FFF9F7] text-[#54243F] hover:bg-[#F5DCE5]'
                }`}
              >
                Tous ({summary?.total_products || 0})
              </button>
              <button
                onClick={() => setFilter('low')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filter === 'low' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Stock Faible ({summary?.low_stock_count || 0})
              </button>
              <button
                onClick={() => setFilter('out')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filter === 'out' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100'
                }`}
              >
                En Rupture ({summary?.out_of_stock_count || 0})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Rechercher soin, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7]"
              />
              <Search className="w-3.5 h-3.5 text-[#54243F] absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-3xl border border-[#F5DCE5] card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF9F7] text-[#54243F] uppercase tracking-wider text-[10px] font-bold border-b border-[#F5DCE5]">
                  <tr>
                    <th className="p-4">Produit</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Quantité Disponible</th>
                    <th className="p-4">Valeur d'Achat</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5DCE5]">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FFF9F7]/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={item.primary_image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=150&q=80'}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#F5DCE5]"
                        />
                        <span className="font-serif font-bold text-[#54243F]">{item.name}</span>
                      </td>
                      <td className="p-4 font-mono text-[#6f6877]">{item.sku || 'N/A'}</td>
                      <td className="p-4 font-medium text-[#343039]">{item.category_name}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            item.stock_quantity <= 0
                              ? 'bg-red-100 text-red-700'
                              : item.stock_quantity <= 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.stock_quantity} unités
                        </span>
                      </td>
                      <td className="p-4 text-[#6f6877]">
                        {(item.stock_quantity * parseFloat(item.cost_price || 0)).toLocaleString()} DA
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="bg-[#54243F] text-white hover:bg-[#431a32] px-3 py-1.5 rounded-xl font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <ArrowUpDown className="w-3 h-3" />
                          <span>Ajuster Stock</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-3xl border border-[#F5DCE5] card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F7] text-[#54243F] uppercase tracking-wider text-[10px] font-bold border-b border-[#F5DCE5]">
                <tr>
                  <th className="p-4">Date & Heure</th>
                  <th className="p-4">Produit</th>
                  <th className="p-4">Type de Mouvement</th>
                  <th className="p-4">Quantité</th>
                  <th className="p-4">Ancien Stock → Nouveau</th>
                  <th className="p-4">Motif / Justification</th>
                  <th className="p-4">Opérateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5DCE5]">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FFF9F7]/40 transition-colors">
                    <td className="p-4 text-[#6f6877] whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="p-4 font-serif font-bold text-[#54243F]">
                      {m.product_name}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          movementColors[m.movement_type] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {movementLabels[m.movement_type] || m.movement_type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-sm text-[#54243F]">
                      {m.quantity}
                    </td>
                    <td className="p-4 font-mono text-[#343039]">
                      {m.previous_stock} → <strong>{m.new_stock}</strong>
                    </td>
                    <td className="p-4 text-[#343039] max-w-xs">
                      {m.reason}
                    </td>
                    <td className="p-4 text-[#6f6877]">
                      {m.admin_name || 'Système'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {adjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-[#343039]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF9F7] rounded-[2.5rem] border border-[#F5DCE5] card-shadow max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5DCE5]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#54243F]">
                  Ajuster le Stock
                </h3>
                <p className="text-xs text-[#6f6877]">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-1.5 text-[#343039] hover:bg-[#F5DCE5] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#F5DCE5] text-xs">
              <span className="text-[#6f6877]">Stock Actuel en Base :</span>
              <span className="font-bold text-sm text-[#54243F] ml-2">
                {selectedProduct.stock_quantity} unités
              </span>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Type d'Opération
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white text-[#54243F] font-semibold"
                >
                  <option value="in">Entrée de Stock (+) Réception marchandise</option>
                  <option value="out">Sortie de Stock (-) Retrait / Perte / Casse</option>
                  <option value="adjustment">Définir Nouveau Stock Réel (=) Inventaire</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  {adjustType === 'adjustment' ? 'Nouveau Stock Total' : 'Quantité à Ajouter / Retirer'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white text-base font-bold text-[#54243F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Motif / Raison *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Réception livraison lot N° 824"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#F5DCE5]">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#54243F] hover:bg-[#431a32] text-white font-bold uppercase tracking-wider"
                >
                  {adjustSubmitting ? 'Validation...' : 'Valider le Mouvement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
