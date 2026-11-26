'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, ArrowLeft, Truck, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { wilayaService, couponService } from '../../services/api';
import SuggestedProductsSection from '../../components/SuggestedProductsSection';

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [wilayas, setWilayas] = useState([]);
  const [selectedWilayaId, setSelectedWilayaId] = useState('');
  const [estimatedDeliveryFee, setEstimatedDeliveryFee] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [recentPurchasedIds, setRecentPurchasedIds] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyodo_recent_purchases');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentPurchasedIds(parsed);
        }
      }
    } catch (e) {
      console.error('Error reading recent purchases', e);
    }
  }, []);

  // Load wilayas for shipping estimate
  useEffect(() => {
    wilayaService.getWilayas()
      .then((res) => {
        if (res.data && res.data.data) {
          setWilayas(res.data.data);
          // default to Alger if available
          const alger = res.data.data.find((w) => w.code === '16');
          if (alger) {
            setSelectedWilayaId(alger.id);
            setEstimatedDeliveryFee(parseFloat(alger.delivery_fee));
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleWilayaChange = (e) => {
    const wId = parseInt(e.target.value, 10);
    setSelectedWilayaId(wId);
    const found = wilayas.find((w) => w.id === wId);
    if (found) {
      setEstimatedDeliveryFee(parseFloat(found.delivery_fee));
    } else {
      setEstimatedDeliveryFee(null);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await couponService.validateCoupon(couponCodeInput.trim(), cartSubtotal);
      if (res.data && res.data.success) {
        applyCoupon(res.data.coupon);
        setCouponSuccess(`Code "${res.data.coupon.code}" appliqué avec succès !`);
        setCouponCodeInput('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Code promo invalide ou expiré.';
      setCouponError(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const finalTotal = Math.max(
    0,
    cartSubtotal - couponDiscount + (estimatedDeliveryFee !== null ? estimatedDeliveryFee : 0)
  );

  if (cartItems.length === 0) {
    return (
      <div className="py-20 bg-[#FFF9F7]">
        <div className="max-w-xl mx-auto px-4 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#F5DCE5] flex items-center justify-center text-[#54243F]">
            <ShoppingBag className="w-10 h-10 opacity-70" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#54243F]">
            Votre panier est actuellement vide
          </h1>
          <p className="text-xs sm:text-sm text-[#6f6877] leading-relaxed">
            Prenez le temps d'explorer notre sélection de cosmétiques et soins botaniques haut de gamme.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block bg-[#54243F] text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#431a32] shadow-md transition-all"
            >
              Découvrir la boutique
            </Link>
          </div>
        </div>

        {recentPurchasedIds.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-[#F5DCE5]">
            <SuggestedProductsSection
              productIds={recentPurchasedIds}
              title="Recommandé suite à vos achats"
              subtitle="Des soins sélectionnés pour compléter vos dernières commandes."
              limit={4}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#FFF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#54243F] mb-8">
          Mon Panier
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Cart items table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow overflow-hidden">
              <div className="p-6 border-b border-[#F5DCE5] flex justify-between items-center bg-[#FFF9F7]">
                <span className="font-serif font-bold text-sm text-[#54243F]">
                  Articles sélectionnés ({cartItems.length})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vider le panier</span>
                </button>
              </div>

              <div className="divide-y divide-[#F5DCE5]">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80'}
                        alt={item.name}
                        className="w-20 h-20 rounded-2xl object-cover bg-[#FFF9F7] border border-[#F5DCE5]"
                      />
                      <div>
                        {item.category_name && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E9A5BE]">
                            {item.category_name}
                          </span>
                        )}
                        <h3 className="font-serif text-sm font-bold text-[#54243F]">
                          {item.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#54243F] mt-1">
                          {item.price.toLocaleString()} DA
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                      {/* Quantity control */}
                      <div className="flex items-center border border-[#E9A5BE] rounded-xl overflow-hidden bg-[#FFF9F7]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1.5 text-[#54243F] hover:bg-[#F5DCE5] transition-colors"
                          aria-label="Diminuer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#54243F]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1.5 text-[#54243F] hover:bg-[#F5DCE5] transition-colors"
                          aria-label="Augmenter"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right min-w-[90px]">
                        <p className="font-bold text-sm text-[#54243F]">
                          {(item.price * item.quantity).toLocaleString()} DA
                        </p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/shop"
                className="text-xs font-bold text-[#54243F] hover:text-[#E9A5BE] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continuer mes achats</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Summary, Coupon & Delivery Estimation */}
          <div className="lg:col-span-4 space-y-6">
            {/* Order Summary Box */}
            <div className="bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6 space-y-5">
              <h2 className="font-serif font-bold text-base text-[#54243F] pb-3 border-b border-[#F5DCE5]">
                Récapitulatif de la commande
              </h2>

              <div className="space-y-3 text-xs text-[#343039]">
                <div className="flex justify-between">
                  <span className="text-[#6f6877]">Sous-total produits :</span>
                  <span className="font-bold text-sm text-[#54243F]">
                    {cartSubtotal.toLocaleString()} DA
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code {appliedCoupon.code} :</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">-{couponDiscount.toLocaleString()} DA</span>
                      <button
                        onClick={removeCoupon}
                        className="text-gray-400 hover:text-red-600"
                        title="Retirer le code"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* Delivery estimator */}
                <div className="pt-2 border-t border-[#F5DCE5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6f6877] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#54243F]" />
                      <span>Livraison estimée :</span>
                    </span>
                    <span className="font-bold text-[#54243F]">
                      {estimatedDeliveryFee !== null
                        ? `${estimatedDeliveryFee.toLocaleString()} DA`
                        : 'Sélectionnez wilaya'}
                    </span>
                  </div>

                  <div>
                    <select
                      value={selectedWilayaId}
                      onChange={handleWilayaChange}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#E9A5BE] bg-[#FFF9F7] text-[#54243F] focus:outline-none focus:border-[#54243F]"
                    >
                      <option value="">Sélectionnez votre wilaya</option>
                      {wilayas.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.code} - {w.name} ({parseFloat(w.delivery_fee).toLocaleString()} DA)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-[#F5DCE5] flex justify-between items-baseline">
                  <span className="font-serif font-bold text-base text-[#54243F]">Total TTC :</span>
                  <span className="font-bold text-2xl text-[#54243F]">
                    {finalTotal.toLocaleString()} DA
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full bg-[#54243F] hover:bg-[#431a32] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <span>Passer la commande</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#6f6877] text-center pt-1">
                <ShieldCheck className="w-4 h-4 text-[#54243F]" />
                <span>Paiement en espèces à la livraison (COD)</span>
              </div>
            </div>

            {/* Coupon Promo Box */}
            <div className="bg-white rounded-[2rem] border border-[#F5DCE5] card-shadow p-6">
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#54243F] mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#E9A5BE]" />
                <span>Code promotionnel</span>
              </h3>

              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: BIYODO10"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-1 uppercase px-3 py-2 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="bg-[#54243F] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#431a32] disabled:opacity-50 transition-colors"
                  >
                    {couponLoading ? '...' : 'Appliquer'}
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{couponError}</span>
                  </p>
                )}

                {couponSuccess && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    {couponSuccess}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Cart-based suggestions */}
        <SuggestedProductsSection
          productIds={cartItems.map((item) => item.id)}
          title="Souvent achetés avec votre panier"
          subtitle="Des soins complémentaires recommandés selon les achats associés à votre sélection."
          limit={4}
          className="mt-16 pt-12 border-t border-[#F5DCE5]"
        />
      </div>
    </div>
  );
}
