'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Eye, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const price = parseFloat(product.price);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const isDiscounted = discountPrice !== null && discountPrice > 0 && discountPrice < price;
  const discountPercent = isDiscounted ? Math.round(((price - discountPrice) / price) * 100) : null;

  const imageSrc = product.primary_image || (product.images && product.images[0]?.image_url) || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80';

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-[#F5DCE5] card-shadow card-hover flex flex-col h-full">
      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FFF9F7]">
        <Link href={`/product/${product.slug || product.id}`}>
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isDiscounted && (
            <span className="bg-[#E9A5BE] text-[#54243F] font-bold text-[11px] px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured === 1 && (
            <span className="bg-[#54243F] text-[#FFF9F7] font-semibold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
              Coup de Cœur
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="bg-[#54243F] text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-md">
              Épuisé
            </span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <Link
          href={`/product/${product.slug || product.id}`}
          className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-[#54243F] rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#54243F] hover:text-white"
          aria-label="Voir le produit"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Category */}
          {product.category_name && (
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[#E9A5BE] mb-1">
              {product.category_name}
            </p>
          )}

          {/* Title */}
          <Link href={`/product/${product.slug || product.id}`}>
            <h3 className="font-serif text-base font-bold text-[#54243F] hover:text-[#431a32] line-clamp-2 transition-colors mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating stars static decoration */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#E9A5BE] text-[#E9A5BE]" />
            ))}
            <span className="text-[11px] text-[#6f6877] ml-1">(4.9)</span>
          </div>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-bold text-[#54243F]">
              {(isDiscounted ? discountPrice : price).toLocaleString()} DA
            </span>
            {isDiscounted && (
              <span className="text-xs text-[#6f6877] line-through">
                {price.toLocaleString()} DA
              </span>
            )}
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#54243F] text-white hover:bg-[#431a32] active:scale-[0.98] shadow-sm'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Rupture de stock' : 'Ajouter au Panier'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
