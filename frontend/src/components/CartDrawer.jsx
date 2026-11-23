'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#343039]/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFF9F7] shadow-2xl border-l border-[#F5DCE5] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#F5DCE5] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#54243F]" />
              <h2 className="text-lg font-serif font-bold text-[#54243F]">
                Mon Panier ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#343039] hover:bg-[#F5DCE5] rounded-full transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#F5DCE5] flex items-center justify-center text-[#54243F]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#54243F]">Votre panier est vide</h3>
                <p className="text-xs text-[#6f6877] max-w-xs mx-auto">
                  Découvrez nos soins d'exception et composez votre rituel beauté.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block bg-[#54243F] text-white px-6 py-2.5 rounded-2xl text-xs font-bold hover:bg-[#431a32] transition-colors"
                >
                  Explorer la boutique
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white rounded-2xl border border-[#F5DCE5] shadow-sm items-center"
                >
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl bg-[#FFF9F7]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xs font-bold text-[#54243F] truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-bold text-[#54243F] mt-0.5">
                      {item.price.toLocaleString()} DA
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-[#E9A5BE] rounded-lg overflow-hidden bg-[#FFF9F7]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-[#54243F] hover:bg-[#F5DCE5]"
                          aria-label="Diminuer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#54243F]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-[#54243F] hover:bg-[#F5DCE5]"
                          aria-label="Augmenter"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#54243F]">
                      {(item.price * item.quantity).toLocaleString()} DA
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[#F5DCE5] bg-white space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6f6877]">Sous-total:</span>
                <span className="font-bold text-lg text-[#54243F]">
                  {cartSubtotal.toLocaleString()} DA
                </span>
              </div>
              <p className="text-[11px] text-[#6f6877]">
                * Frais de livraison calculés à l'étape suivante selon votre wilaya.
              </p>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-[#54243F] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#431a32] shadow-md transition-all"
                >
                  <span>Commander sans compte</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full block text-center py-2 text-xs font-semibold text-[#54243F] hover:text-[#E9A5BE] transition-colors"
                >
                  Voir le panier complet
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
