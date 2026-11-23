'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Printer,
  CheckCircle2,
  AlertCircle,
  Truck,
  Phone,
  MapPin,
  Calendar,
  X,
  Clock,
  Package,
} from 'lucide-react';
import { adminService } from '../../../services/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Order for Detail / Status modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('Livraison à Domicile');
  const [orderNotes, setOrderNotes] = useState('');

  const loadOrders = () => {
    setLoading(true);
    adminService.getOrders({
      page: currentPage,
      limit: 15,
      search,
      status: statusFilter,
    })
      .then((res) => {
        if (res.data && res.data.data) {
          setOrders(res.data.data);
          if (res.data.pagination) setPagination(res.data.pagination);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter, currentPage]);

  const handleOpenDetail = async (orderId) => {
    try {
      const res = await adminService.getOrder(orderId);
      if (res.data && res.data.success) {
        setSelectedOrder(res.data.order);
        setTrackingNumber(res.data.order.tracking_number || '');
        setCourierName(res.data.order.courier_name || 'Livraison à Domicile');
        setDetailModalOpen(true);
      }
    } catch (err) {
      alert('Erreur lors du chargement des détails de la commande.');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;

    if (newStatus === 'confirmed') {
      const ok = confirm(
        'Confirmer cette commande déduira définitivement le stock des produits associés. Continuer ?'
      );
      if (!ok) return;
    }

    if (newStatus === 'cancelled') {
      const ok = confirm(
        'Annuler cette commande restituera automatiquement le stock si celui-ci avait été déduit. Confirmer l\'annulation ?'
      );
      if (!ok) return;
    }

    setStatusUpdateLoading(true);
    try {
      await adminService.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        tracking_number: trackingNumber,
        courier_name: courierName,
        notes: orderNotes,
      });

      // Reload order details & table
      const res = await adminService.getOrder(selectedOrder.id);
      setSelectedOrder(res.data.order);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du changement de statut.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#54243F]">
            Gestion des Commandes Clients
          </h2>
          <p className="text-xs text-[#6f6877]">
            Validez les commandes, déclenchez la déduction des stocks et gérez l'expédition dans les 58 wilayas.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#F5DCE5] card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Rechercher par référence, nom, tél..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
          />
          <Search className="w-4 h-4 text-[#54243F] absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] text-[#54243F] focus:outline-none focus:border-[#54243F] w-full sm:w-auto"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente (Non confirmées)</option>
            <option value="confirmed">Confirmées</option>
            <option value="processing">En préparation</option>
            <option value="shipped">Expédiées</option>
            <option value="delivered">Livrées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#F5DCE5] card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#54243F]">
            Chargement des commandes...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6f6877]">
            Aucune commande trouvée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F7] text-[#54243F] uppercase tracking-wider text-[10px] font-bold border-b border-[#F5DCE5]">
                <tr>
                  <th className="p-4">Réf. Commande</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Articles</th>
                  <th className="p-4">Montant Total</th>
                  <th className="p-4">Stock Déduit ?</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5DCE5]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FFF9F7]/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#54243F]">
                      {ord.order_reference}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[#343039]">{ord.full_name}</p>
                      <a href={`tel:${ord.phone}`} className="text-[11px] text-[#6f6877] hover:text-[#54243F]">
                        {ord.phone}
                      </a>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-[#343039]">{ord.wilaya_name}</p>
                      <p className="text-[10px] text-[#6f6877]">{ord.commune}</p>
                    </td>
                    <td className="p-4 font-bold text-[#54243F]">
                      {ord.items_count} article(s)
                    </td>
                    <td className="p-4 font-bold text-sm text-[#54243F]">
                      {parseFloat(ord.total_amount).toLocaleString()} DA
                    </td>
                    <td className="p-4">
                      {ord.stock_deducted === 1 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Oui</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          En réserve
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          statusColors[ord.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[ord.status] || ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-[#6f6877]">
                      {new Date(ord.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(ord.id)}
                        className="bg-[#54243F] text-white hover:bg-[#431a32] px-3 py-1.5 rounded-xl font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Gérer</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#F5DCE5] flex justify-between items-center text-xs text-[#6f6877]">
            <span>Total : {pagination.total} commandes</span>
            <div className="flex gap-1.5">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs ${
                    currentPage === i + 1
                      ? 'bg-[#54243F] text-white'
                      : 'border border-[#F5DCE5] bg-white hover:bg-[#F5DCE5]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Detail & Status Management Modal */}
      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#343039]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-[#FFF9F7] rounded-[2.5rem] border border-[#F5DCE5] card-shadow max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 print:border-none print:shadow-none print:max-w-full print:max-h-full print:p-8 print:bg-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F5DCE5]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#E9A5BE]">
                  Détail de la Commande
                </span>
                <h3 className="font-serif font-bold text-xl text-[#54243F] font-mono">
                  #{selectedOrder.order_reference}
                </h3>
                <p className="text-xs text-[#6f6877]">
                  Enregistrée le {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handlePrintReceipt}
                  className="bg-white border border-[#E9A5BE] text-[#54243F] hover:bg-[#F5DCE5] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer Bon de Commande</span>
                </button>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="p-1.5 text-[#343039] hover:bg-[#F5DCE5] rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Status Changer Bar (Hidden during print) */}
            <div className="bg-white p-4 rounded-2xl border border-[#F5DCE5] space-y-3 print:hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-xs font-semibold text-[#6f6877]">Statut actuel :</span>
                  <span
                    className={`ml-2 inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      statusColors[selectedOrder.status]
                    }`}
                  >
                    {statusLabels[selectedOrder.status]}
                  </span>
                  {selectedOrder.stock_deducted === 1 && (
                    <span className="ml-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Stock déduit
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    disabled={statusUpdateLoading || selectedOrder.status === 'confirmed'}
                    onClick={() => handleUpdateStatus('confirmed')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
                  >
                    Confirmer (Déduire Stock)
                  </button>
                  <button
                    disabled={statusUpdateLoading || selectedOrder.status === 'processing'}
                    onClick={() => handleUpdateStatus('processing')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
                  >
                    En préparation
                  </button>
                  <button
                    disabled={statusUpdateLoading || selectedOrder.status === 'shipped'}
                    onClick={() => handleUpdateStatus('shipped')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
                  >
                    Expédier
                  </button>
                  <button
                    disabled={statusUpdateLoading || selectedOrder.status === 'delivered'}
                    onClick={() => handleUpdateStatus('delivered')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
                  >
                    Marquer Livrée & Payée
                  </button>
                  <button
                    disabled={statusUpdateLoading || selectedOrder.status === 'cancelled'}
                    onClick={() => handleUpdateStatus('cancelled')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
                  >
                    Annuler (Restituer Stock)
                  </button>
                </div>
              </div>

              {/* Delivery tracking inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F5DCE5] text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#54243F] mb-1">
                    Société de Livraison / Coursier :
                  </label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Ex: Yalidine, ZR Express, Propre livreur..."
                    className="w-full px-3 py-1.5 text-xs border border-[#E9A5BE] rounded-lg bg-[#FFF9F7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#54243F] mb-1">
                    Numéro de Suivi Colis :
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ex: YAL-9482948"
                    className="w-full px-3 py-1.5 text-xs border border-[#E9A5BE] rounded-lg bg-[#FFF9F7]"
                  />
                </div>
              </div>
            </div>

            {/* Customer & Delivery Information Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-[#F5DCE5] text-xs">
              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-sm text-[#54243F] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#E9A5BE]" />
                  <span>Destinataire</span>
                </h4>
                <p className="font-bold text-base text-[#343039]">{selectedOrder.full_name}</p>
                <p className="text-[#54243F] font-semibold">Tél : {selectedOrder.phone}</p>
                {selectedOrder.order_notes && (
                  <p className="text-[11px] bg-[#FFF9F7] p-2 rounded-lg border border-[#F5DCE5] text-[#6f6877]">
                    Note : "{selectedOrder.order_notes}"
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-sm text-[#54243F] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E9A5BE]" />
                  <span>Adresse de Livraison</span>
                </h4>
                <p className="font-bold text-[#343039]">
                  Wilaya : {selectedOrder.wilaya_code} - {selectedOrder.wilaya_name}
                </p>
                <p className="text-[#6f6877]">Commune : {selectedOrder.commune}</p>
                <p className="text-[#343039]">{selectedOrder.address}</p>
                <p className="text-emerald-700 font-semibold mt-1">
                  Paiement : Espèces à la livraison (COD)
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-[#F5DCE5] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF9F7] text-[#54243F] font-bold text-[10px] uppercase border-b border-[#F5DCE5]">
                  <tr>
                    <th className="p-3">Soin</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-right">Prix Unitaire</th>
                    <th className="p-3 text-center">Quantité</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5DCE5]">
                  {selectedOrder.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-semibold text-[#54243F]">
                        {item.product_name}
                      </td>
                      <td className="p-3 text-[#6f6877] font-mono">
                        {item.sku || 'N/A'}
                      </td>
                      <td className="p-3 text-right text-[#343039]">
                        {parseFloat(item.unit_price).toLocaleString()} DA
                      </td>
                      <td className="p-3 text-center font-bold text-[#54243F]">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right font-bold text-[#54243F]">
                        {parseFloat(item.total_price).toLocaleString()} DA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Financial Summary */}
            <div className="bg-[#FFF9F7] p-5 rounded-2xl border border-[#F5DCE5] space-y-2 text-xs max-w-xs ml-auto">
              <div className="flex justify-between text-[#6f6877]">
                <span>Sous-total :</span>
                <span className="font-semibold text-[#343039]">
                  {parseFloat(selectedOrder.subtotal).toLocaleString()} DA
                </span>
              </div>
              {parseFloat(selectedOrder.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Réduction ({selectedOrder.coupon_code || 'Promo'}) :</span>
                  <span>-{parseFloat(selectedOrder.discount_amount).toLocaleString()} DA</span>
                </div>
              )}
              <div className="flex justify-between text-[#6f6877]">
                <span>Livraison ({selectedOrder.wilaya_name}) :</span>
                <span className="font-semibold text-[#343039]">
                  {parseFloat(selectedOrder.delivery_fee).toLocaleString()} DA
                </span>
              </div>
              <div className="pt-2 border-t border-[#F5DCE5] flex justify-between items-baseline">
                <span className="font-serif font-bold text-sm text-[#54243F]">Total Commande :</span>
                <span className="font-bold text-xl text-[#54243F]">
                  {parseFloat(selectedOrder.total_amount).toLocaleString()} DA
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
