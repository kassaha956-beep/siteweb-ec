'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowRight,
  Boxes,
  Plus,
  Truck,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminService } from '../../services/api';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { admin, loading: authLoading } = useAdminAuth();

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login');
      return;
    }

    if (admin) {
      adminService.getOverview()
        .then((res) => {
          if (res.data && res.data.success) {
            setStats(res.data.stats);
            setRecentOrders(res.data.recent_orders || []);
          }
        })
        .catch((err) => console.error('Error fetching admin overview', err))
        .finally(() => setLoading(false));
    }
  }, [admin, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#E9A5BE] border-t-[#54243F] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold text-[#54243F]">Chargement du tableau de bord...</p>
      </div>
    );
  }

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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#54243F] via-[#431a32] to-[#54243F] rounded-[2rem] p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E9A5BE]">
            Bienvenue dans votre boutique
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFF9F7] mt-1">
            Bonjour, {admin?.full_name || 'Directeur'} !
          </h2>
          <p className="text-xs text-[#F5DCE5] mt-1">
            Voici l'activité commerciale en temps réel sur le réseau des 58 wilayas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/products"
            className="bg-[#E9A5BE] text-[#54243F] px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Produit</span>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white/10 text-white hover:bg-white/20 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E9A5BE]" />
            <span>Gérer Commandes</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-2">
          <div className="flex items-center justify-between text-[#54243F]">
            <span className="text-xs font-semibold text-[#6f6877]">Chiffre d'Affaires</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5DCE5] flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#54243F]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#54243F]">
            {parseFloat(stats?.total_revenue || 0).toLocaleString()} DA
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">
            Commandes actives
          </p>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-2">
          <div className="flex items-center justify-between text-[#54243F]">
            <span className="text-xs font-semibold text-[#6f6877]">Bénéfice Brut Estimé</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700">
            {parseFloat(stats?.total_gross_profit || 0).toLocaleString()} DA
          </p>
          <p className="text-[11px] text-[#6f6877]">
            Ventes - Coût d'achat
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-2">
          <div className="flex items-center justify-between text-[#54243F]">
            <span className="text-xs font-semibold text-[#6f6877]">Total Commandes</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5DCE5] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#54243F]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#54243F]">
            {stats?.total_orders || 0}
          </p>
          <p className="text-[11px] text-amber-700 font-medium">
            {stats?.pending_orders || 0} en attente de confirmation
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-2">
          <div className="flex items-center justify-between text-[#54243F]">
            <span className="text-xs font-semibold text-[#6f6877]">Clients Uniques</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5DCE5] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#54243F]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#54243F]">
            {stats?.total_customers || 0}
          </p>
          <p className="text-[11px] text-[#6f6877]">
            Fichier contacts acheteurs
          </p>
        </div>
      </div>

      {/* Secondary Metrics: Stock and Orders distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#F5DCE5] card-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#6f6877] font-semibold">Commandes à Traiter</p>
            <p className="text-lg font-bold text-[#54243F]">
              {stats?.pending_orders || 0} en attente
            </p>
            <Link href="/admin/orders?status=pending" className="text-[11px] text-[#E9A5BE] font-bold hover:underline">
              Traiter maintenant →
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F5DCE5] card-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#6f6877] font-semibold">Alerte Stock Faible</p>
            <p className="text-lg font-bold text-red-700">
              {stats?.low_stock_products || 0} produit(s) &lt; 10 unités
            </p>
            <Link href="/admin/inventory" className="text-[11px] text-[#54243F] font-bold hover:underline">
              Gérer l'inventaire →
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F5DCE5] card-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5DCE5] text-[#54243F] flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#6f6877] font-semibold">Valeur Stock en Magasin</p>
            <p className="text-lg font-bold text-[#54243F]">
              {parseFloat(stats?.inventory_cost_valuation || 0).toLocaleString()} DA
            </p>
            <p className="text-[11px] text-[#6f6877]">
              Prix de vente : {parseFloat(stats?.inventory_retail_valuation || 0).toLocaleString()} DA
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6 sm:p-8 space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-[#F5DCE5]">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#54243F]">
              Dernières Commandes Clients
            </h3>
            <p className="text-xs text-[#6f6877]">
              Commandes enregistrées récemment depuis la boutique.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#54243F] hover:text-[#E9A5BE] flex items-center gap-1 transition-colors"
          >
            <span>Voir toutes ({stats?.total_orders || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#6f6877]">
            Aucune commande récente enregistrée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F7] text-[#54243F] uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Réf. Commande</th>
                  <th className="p-3.5">Client</th>
                  <th className="p-3.5">Wilaya</th>
                  <th className="p-3.5">Montant</th>
                  <th className="p-3.5">Statut</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5DCE5]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FFF9F7]/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#54243F]">
                      {ord.order_reference}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-[#343039]">{ord.full_name}</p>
                      <p className="text-[10px] text-[#6f6877]">{ord.phone}</p>
                    </td>
                    <td className="p-3.5 text-[#343039] font-medium">
                      {ord.wilaya_name}
                    </td>
                    <td className="p-3.5 font-bold text-[#54243F]">
                      {parseFloat(ord.total_amount).toLocaleString()} DA
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          statusColors[ord.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[ord.status] || ord.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#6f6877]">
                      {new Date(ord.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/orders`}
                        className="text-xs font-bold text-[#54243F] hover:text-[#E9A5BE] underline"
                      >
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
