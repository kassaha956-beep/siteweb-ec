'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Award, PieChart } from 'lucide-react';
import { adminService } from '../../../services/api';

export default function AdminStatisticsPage() {
  const [salesData, setSalesData] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminService.getSalesReports({ period, limit: 30 }),
      adminService.getProductReports(),
    ])
      .then(([salesRes, prodRes]) => {
        if (salesRes.data && salesRes.data.success) {
          setSalesData(salesRes.data.data);
        }
        if (prodRes.data && prodRes.data.success) {
          setProductStats(prodRes.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [period]);

  const totalPeriodRevenue = salesData.reduce((acc, row) => acc + parseFloat(row.revenue || 0), 0);
  const totalPeriodProfit = salesData.reduce((acc, row) => acc + parseFloat(row.profit || 0), 0);
  const totalPeriodOrders = salesData.reduce((acc, row) => acc + parseInt(row.orders_count || 0, 10), 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#54243F]">
          Analytique & Rapports Financiers
        </h2>
        <p className="text-xs text-[#6f6877]">
          Historique des ventes, marges bénéficiaires et palmarès des cosmétiques les plus vendus.
        </p>
      </div>

      {/* Aggregate period KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-1">
          <span className="text-xs text-[#6f6877] font-semibold">Chiffre d'Affaires Période</span>
          <p className="text-2xl sm:text-3xl font-bold text-[#54243F]">
            {totalPeriodRevenue.toLocaleString()} DA
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Sur les 30 derniers points</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-1">
          <span className="text-xs text-[#6f6877] font-semibold">Marge Bénéficiaire Brute</span>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-700">
            {totalPeriodProfit.toLocaleString()} DA
          </p>
          <p className="text-[11px] text-[#6f6877]">
            {totalPeriodRevenue > 0
              ? `${Math.round((totalPeriodProfit / totalPeriodRevenue) * 100)}% de marge`
              : '0%'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-1">
          <span className="text-xs text-[#6f6877] font-semibold">Volume des Commandes</span>
          <p className="text-2xl sm:text-3xl font-bold text-[#54243F]">
            {totalPeriodOrders}
          </p>
          <p className="text-[11px] text-[#6f6877]">
            Panier moyen : {totalPeriodOrders > 0 ? Math.round(totalPeriodRevenue / totalPeriodOrders).toLocaleString() : 0} DA
          </p>
        </div>
      </div>

      {/* Sales Table / Chart Representation */}
      <div className="bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#F5DCE5]">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#54243F]">
              Évolution des Ventes & Bénéfices
            </h3>
            <p className="text-xs text-[#6f6877]">Données consolidées hors commandes annulées</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                period === 'daily' ? 'bg-[#54243F] text-white' : 'bg-[#FFF9F7] text-[#54243F] border border-[#E9A5BE]'
              }`}
            >
              Par Jour
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                period === 'monthly' ? 'bg-[#54243F] text-white' : 'bg-[#FFF9F7] text-[#54243F] border border-[#E9A5BE]'
              }`}
            >
              Par Mois
            </button>
          </div>
        </div>

        {/* Visual Bar Graph */}
        {salesData.length > 0 ? (
          <div className="space-y-4">
            <div className="h-48 flex items-end gap-2 pt-6 pb-2 overflow-x-auto border-b border-[#F5DCE5]">
              {salesData.map((item, idx) => {
                const maxVal = Math.max(...salesData.map((s) => parseFloat(s.revenue || 0)), 1);
                const heightPercent = Math.min(100, Math.max(10, Math.round((parseFloat(item.revenue || 0) / maxVal) * 100)));
                return (
                  <div key={idx} className="flex-1 min-w-[36px] flex flex-col items-center gap-1 group relative">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-[#54243F] group-hover:bg-[#E9A5BE] rounded-t-lg transition-all"
                    />
                    <span className="text-[9px] text-[#6f6877] font-mono rotate-[-45deg] origin-top-left mt-2 whitespace-nowrap">
                      {item.date_label.slice(5)}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#343039] text-white text-[10px] p-2 rounded-xl whitespace-nowrap shadow-xl z-20">
                      <p className="font-bold">{item.date_label}</p>
                      <p>Ventes : {parseFloat(item.revenue).toLocaleString()} DA</p>
                      <p className="text-emerald-300">Bénéfice : {parseFloat(item.profit).toLocaleString()} DA</p>
                      <p>{item.orders_count} commande(s)</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-[#6f6877] text-right italic">
              Survolez une barre pour voir les montants détaillés.
            </p>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-[#6f6877]">
            Aucune vente enregistrée pour la période sélectionnée.
          </div>
        )}
      </div>

      {/* Best Sellers and Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Best sellers */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6 sm:p-8 space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#54243F] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#E9A5BE]" />
            <span>Top Produits les Plus Vendus</span>
          </h3>

          {!productStats?.best_sellers || productStats.best_sellers.length === 0 ? (
            <p className="text-xs text-[#6f6877] py-8 text-center">
              Le palmarès des ventes sera généré au fil des commandes clients.
            </p>
          ) : (
            <div className="divide-y divide-[#F5DCE5]">
              {productStats.best_sellers.map((p, idx) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F5DCE5] text-[#54243F] flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <img
                      src={p.image_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-bold text-[#54243F]">{p.name}</p>
                      <p className="text-[10px] text-[#6f6877]">{p.category_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#54243F]">
                      {parseFloat(p.total_revenue).toLocaleString()} DA
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      {p.total_sold} vendus
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="lg:col-span-5 bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6 sm:p-8 space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#54243F] flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#E9A5BE]" />
            <span>Répartition par Univers</span>
          </h3>

          {!productStats?.category_sales || productStats.category_sales.length === 0 ? (
            <p className="text-xs text-[#6f6877] py-8 text-center">
              Aucune donnée de catégorie disponible.
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {productStats.category_sales.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#54243F]">{cat.name}</span>
                    <span className="text-[#343039] font-semibold">
                      {parseFloat(cat.total_revenue).toLocaleString()} DA
                    </span>
                  </div>
                  <div className="w-full bg-[#F5DCE5] h-2 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((parseFloat(cat.total_revenue) / (totalPeriodRevenue || 1)) * 100)
                        )}%`,
                      }}
                      className="bg-[#54243F] h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
