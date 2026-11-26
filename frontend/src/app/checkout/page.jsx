'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, AlertCircle, ShoppingBag, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { wilayaService, orderService } from '../../services/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, isLoaded, cartSubtotal, appliedCoupon, couponDiscount, clearCart } = useCart();
  const orderCompletedRef = useRef(false);

  const [wilayas, setWilayas] = useState([]);
  const [loadingWilayas, setLoadingWilayas] = useState(true);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    wilayaId: '',
    commune: '',
    address: '',
    orderNotes: '',
  });

  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load active wilayas
  useEffect(() => {
    wilayaService.getWilayas()
      .then((res) => {
        if (res.data && res.data.data) {
          setWilayas(res.data.data);
          // Auto-select Alger by default
          const defaultW = res.data.data.find((w) => w.code === '16') || res.data.data[0];
          if (defaultW) {
            setFormData((prev) => ({ ...prev, wilayaId: defaultW.id.toString() }));
            setSelectedWilaya(defaultW);
          }
        }
      })
      .catch((err) => console.error('Error loading wilayas', err))
      .finally(() => setLoadingWilayas(false));
  }, []);

  // Redirect if cart is empty (only after cart loads and not after completing an order)
  useEffect(() => {
    if (isLoaded && cartItems.length === 0 && !orderCompletedRef.current) {
      router.push('/cart');
    }
  }, [isLoaded, cartItems, router]);

  const handleWilayaChange = (e) => {
    const wId = parseInt(e.target.value, 10);
    setFormData((prev) => ({ ...prev, wilayaId: e.target.value }));
    const found = wilayas.find((w) => w.id === wId);
    setSelectedWilaya(found || null);
  };

  const deliveryFee = selectedWilaya ? parseFloat(selectedWilaya.delivery_fee) : 0;
  const finalTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryFee);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMessage('Veuillez entrer votre nom et prénom.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 9) {
      setErrorMessage('Veuillez entrer un numéro de téléphone valide (ex: 0555 12 34 56).');
      return;
    }
    if (!formData.wilayaId) {
      setErrorMessage('Veuillez sélectionner votre wilaya de résidence.');
      return;
    }
    if (!formData.commune.trim()) {
      setErrorMessage('Veuillez renseigner votre commune ou quartier.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Veuillez renseigner votre adresse de livraison exacte.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        wilaya_id: parseInt(formData.wilayaId, 10),
        commune: formData.commune.trim(),
        address: formData.address.trim(),
        order_notes: formData.orderNotes.trim() || null,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await orderService.createOrder(payload);

      if (res.data && res.data.success) {
        orderCompletedRef.current = true;
        const orderRef = res.data.order.order_reference;
        const purchasedIds = cartItems.map((item) => item.id);
        try {
          const existingRaw = localStorage.getItem('biyodo_recent_purchases');
          const existingIds = existingRaw ? JSON.parse(existingRaw) : [];
          const merged = Array.from(new Set([...purchasedIds, ...(Array.isArray(existingIds) ? existingIds : [])])).slice(0, 10);
          localStorage.setItem('biyodo_recent_purchases', JSON.stringify(merged));
          sessionStorage.setItem(
            'biyodo_last_order_suggestions',
            JSON.stringify(res.data.suggestions || [])
          );
        } catch (storageErr) {
          console.error('Could not persist purchase suggestion state:', storageErr);
        }
        clearCart();
        router.push(`/order-success?ref=${encodeURIComponent(orderRef)}&items=${purchasedIds.join(',')}`);
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      const msg = err.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement de votre commande. Veuillez réessayer.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="py-10 bg-[#FFF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#54243F] hover:text-[#E9A5BE] mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au panier</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#54243F]">
            Finaliser votre Commande
          </h1>
          <p className="text-xs sm:text-sm text-[#6f6877] mt-1">
            Commande express sans inscription • Paiement en espèces à la livraison (COD)
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Customer & Address Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Coordonnées Client */}
              <div className="bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F5DCE5]">
                  <span className="w-7 h-7 rounded-full bg-[#54243F] text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h2 className="font-serif font-bold text-base text-[#54243F]">
                    Vos Coordonnées de Contact
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#54243F] mb-1.5">
                      Nom et Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sarah Benali"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#54243F] mb-1.5">
                      Numéro de Téléphone (Mobile) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 0555 12 34 56 ou 0770..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                    />
                    <p className="text-[10px] text-[#6f6877] mt-1">
                      Le livreur vous appellera sur ce numéro avant d'effectuer la livraison.
                    </p>
                  </div>
                </div>
              </div>

              {/* Adresse de Livraison */}
              <div className="bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F5DCE5]">
                  <span className="w-7 h-7 rounded-full bg-[#54243F] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h2 className="font-serif font-bold text-base text-[#54243F]">
                    Adresse de Livraison en Algérie
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Wilaya selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#54243F] mb-1.5">
                      Wilaya <span className="text-red-500">*</span>
                    </label>
                    {loadingWilayas ? (
                      <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                    ) : (
                      <select
                        required
                        value={formData.wilayaId}
                        onChange={handleWilayaChange}
                        className="w-full px-3.5 py-3 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] text-[#54243F] focus:outline-none focus:border-[#54243F]"
                      >
                        <option value="">Sélectionnez votre Wilaya</option>
                        {wilayas.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.code} - {w.name} ({parseFloat(w.delivery_fee).toLocaleString()} DA)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="block text-xs font-semibold text-[#54243F] mb-1.5">
                      Commune / Daïra <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Bab Ezzouar, Kouba, Es-Senia..."
                      value={formData.commune}
                      onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                      className="w-full px-4 py-3 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                    />
                  </div>

                  {/* Detailed Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#54243F] mb-1.5">
                      Adresse Complète (Rue, Bâtiment, Étage) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Ex: Cité 500 logements, Bâtiment B2, Étage 3..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                    />
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#54243F] mb-1.5">
                      Remarques ou instructions de livraison (Optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Préférer une livraison en matinée, sonner à l'interphone..."
                      value={formData.orderNotes}
                      onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                      className="w-full px-4 py-3 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                    />
                  </div>
                </div>
              </div>

              {/* Mode de Paiement */}
              <div className="bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F5DCE5]">
                  <span className="w-7 h-7 rounded-full bg-[#54243F] text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h2 className="font-serif font-bold text-base text-[#54243F]">
                    Mode de Règlement
                  </h2>
                </div>

                <div className="p-4 bg-[#FFF9F7] rounded-2xl border-2 border-[#54243F] flex items-start gap-4">
                  <div className="mt-1">
                    <div className="w-4 h-4 rounded-full border-4 border-[#54243F] bg-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#54243F] flex items-center gap-2">
                      <span>Paiement à la Livraison (Cash on Delivery)</span>
                      <span className="bg-[#E9A5BE] text-[#54243F] text-[10px] px-2 py-0.5 rounded-full font-bold">
                        100% Sécurisé
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#6f6877] mt-1 leading-relaxed">
                      Vous payez directement en espèces au livreur après réception et vérification de votre colis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sticky Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6 sm:p-8 sticky top-28 space-y-6">
                <h2 className="font-serif font-bold text-base text-[#54243F] pb-3 border-b border-[#F5DCE5]">
                  Détail de votre Commande ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})
                </h2>

                {/* Items scroll list */}
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1 divide-y divide-[#F5DCE5]/60">
                  {cartItems.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=150&q=80'}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#F5DCE5] bg-[#FFF9F7]"
                        />
                        <div>
                          <p className="font-serif font-bold text-[#54243F] line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[#6f6877] text-[11px]">
                            Quantité : <strong>{item.quantity}</strong> × {item.price.toLocaleString()} DA
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#54243F] whitespace-nowrap">
                        {(item.price * item.quantity).toLocaleString()} DA
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Calculations */}
                <div className="pt-4 border-t border-[#F5DCE5] space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#6f6877]">
                    <span>Sous-total articles :</span>
                    <span className="font-semibold text-[#54243F]">
                      {cartSubtotal.toLocaleString()} DA
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Code promo ({appliedCoupon.code}) :</span>
                      <span>-{couponDiscount.toLocaleString()} DA</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#6f6877]">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#54243F]" />
                      <span>Livraison ({selectedWilaya ? selectedWilaya.name : 'Wilaya'}) :</span>
                    </span>
                    <span className="font-semibold text-[#54243F]">
                      {selectedWilaya ? `${deliveryFee.toLocaleString()} DA` : '0 DA'}
                    </span>
                  </div>

                  {selectedWilaya && selectedWilaya.estimated_delivery_days && (
                    <p className="text-[10px] text-[#6f6877] italic text-right">
                      Délai estimé : {selectedWilaya.estimated_delivery_days}
                    </p>
                  )}

                  <div className="pt-3 border-t border-[#F5DCE5] flex justify-between items-baseline">
                    <span className="font-serif font-bold text-base text-[#54243F]">
                      Total Final à Payer :
                    </span>
                    <span className="font-bold text-2xl text-[#54243F]">
                      {finalTotal.toLocaleString()} DA
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#54243F] hover:bg-[#431a32] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{submitting ? 'Validation en cours...' : 'Confirmer ma Commande'}</span>
                </button>

                <p className="text-[11px] text-[#6f6877] text-center leading-relaxed">
                  En confirmant, vous acceptez de régler le montant à la livraison. Notre équipe vous contactera pour valider l'expédition.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
