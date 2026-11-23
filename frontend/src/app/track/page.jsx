'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PackageCheck, Search, Truck, Clock, CheckCircle2, AlertCircle, Phone, MapPin, Calendar } from 'lucide-react';
import { orderService } from '../../services/api';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [reference, setReference] = useState(initialRef);
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!reference.trim() || !phone.trim()) {
      setError('Veuillez renseigner votre référence de commande et votre numéro de téléphone.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await orderService.trackOrder(reference.trim(), phone.trim());
      if (res.data && res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Aucune commande trouvée avec ces identifiants. Vérifiez votre référence et numéro de téléphone.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Status mapping
  const statusSteps = [
    { key: 'pending', label: 'En attente', desc: 'Commande enregistrée' },
    { key: 'confirmed', label: 'Confirmée', desc: 'Validée par notre équipe' },
    { key: 'processing', label: 'En préparation', desc: 'Mise en boîte soignée' },
    { key: 'shipped', label: 'Expédiée', desc: 'Remise au livreur' },
    { key: 'delivered', label: 'Livrée', desc: 'Colis remis au client' },
  ];

  const getStatusIndex = (currentStatus) => {
    if (currentStatus === 'cancelled') return -1;
    return statusSteps.findIndex((s) => s.key === currentStatus);
  };

  return (
    <div className="py-12 bg-[#FFF9F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#F5DCE5] text-[#54243F] flex items-center justify-center mx-auto mb-2 shadow-sm">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#54243F]">
            Suivre l'État de votre Commande
          </h1>
          <p className="text-xs sm:text-sm text-[#6f6877] max-w-md mx-auto">
            Consultez en temps réel l'avancement de votre livraison dans l'une des 58 wilayas.
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6 sm:p-8 max-w-xl mx-auto">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#54243F] mb-1.5">
                Référence de commande
              </label>
              <input
                type="text"
                required
                placeholder="Ex: BYD-20261123-ABCD"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-4 py-3 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F] uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#54243F] mb-1.5">
                Numéro de téléphone utilisé lors de l'achat
              </label>
              <input
                type="tel"
                required
                placeholder="Ex: 0555 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#54243F] hover:bg-[#431a32] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Recherche en cours...' : 'Rechercher ma commande'}</span>
            </button>
          </form>
        </div>

        {/* Order Result Card */}
        {order && (
          <div className="bg-white rounded-[2.5rem] border border-[#F5DCE5] card-shadow p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
            {/* Order Status Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#F5DCE5] gap-4">
              <div>
                <span className="text-xs text-[#6f6877]">Référence :</span>
                <h2 className="text-xl font-serif font-bold text-[#54243F]">
                  {order.order_reference}
                </h2>
                <p className="text-xs text-[#6f6877] mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#E9A5BE]" />
                  <span>Commandé le {new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-[#6f6877]">Total :</span>
                <p className="text-2xl font-bold text-[#54243F]">
                  {parseFloat(order.total_amount).toLocaleString()} DA
                </p>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Paiement à la livraison
                </span>
              </div>
            </div>

            {/* Cancelled Notice */}
            {order.status === 'cancelled' ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <strong>Commande Annulée :</strong> Cette commande a été annulée. Pour toute réclamation, contactez notre service client.
                </div>
              </div>
            ) : (
              /* Step-by-step progress timeline */
              <div className="py-4">
                <h3 className="font-serif font-bold text-sm text-[#54243F] mb-6">
                  Progression de la Livraison
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                  {statusSteps.map((step, idx) => {
                    const currentIdx = getStatusIndex(order.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div
                        key={step.key}
                        className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all ${
                          isCurrent
                            ? 'bg-[#F5DCE5]/80 border-2 border-[#54243F]'
                            : isDone
                            ? 'bg-[#FFF9F7]'
                            : 'opacity-40'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold text-xs ${
                            isDone
                              ? 'bg-[#54243F] text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5 text-[#E9A5BE]" /> : idx + 1}
                        </div>
                        <h4 className="font-bold text-xs text-[#54243F]">{step.label}</h4>
                        <p className="text-[10px] text-[#6f6877] mt-0.5">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery & Destination Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFF9F7] p-5 rounded-2xl border border-[#F5DCE5] text-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-[#54243F] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E9A5BE]" />
                  <span>Destination :</span>
                </span>
                <p className="text-[#343039]">{order.full_name}</p>
                <p className="text-[#6f6877]">
                  {order.address}, {order.commune}, Wilaya de {order.wilaya_name}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-[#54243F] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#E9A5BE]" />
                  <span>Expédition :</span>
                </span>
                <p className="text-[#343039]">{order.courier_name || 'Livraison à Domicile'}</p>
                {order.tracking_number && (
                  <p className="text-[#6f6877]">N° Suivi : {order.tracking_number}</p>
                )}
                {order.delivered_at && (
                  <p className="text-emerald-700 font-semibold">
                    Livrée le {new Date(order.delivered_at).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>

            {/* Items summary */}
            {order.items && order.items.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-serif font-bold text-sm text-[#54243F]">
                  Articles de la commande
                </h4>
                <div className="divide-y divide-[#F5DCE5] border border-[#F5DCE5] rounded-2xl overflow-hidden bg-white">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=150&q=80'}
                          alt={item.product_name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-[#54243F]">{item.product_name}</p>
                          <p className="text-[#6f6877]">Qté : {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#54243F]">
                        {parseFloat(item.total_price).toLocaleString()} DA
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-[#54243F]">Chargement du suivi...</div>}>
      <TrackContent />
    </Suspense>
  );
}
