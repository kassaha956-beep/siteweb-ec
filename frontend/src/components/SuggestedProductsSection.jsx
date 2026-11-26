'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import { productService } from '../services/api';

/**
 * Displays purchase-based and complementary product recommendations.
 */
export default function SuggestedProductsSection({
  productIds = [],
  initialProducts = null,
  allowEmptyAnchor = false,
  title = 'Vous Aimerez Aussi',
  subtitle = 'Des soins sélectionnés selon les achats associés et votre rituel.',
  limit = 4,
  className = '',
}) {
  const [suggestions, setSuggestions] = useState(Array.isArray(initialProducts) ? initialProducts : []);
  const [loading, setLoading] = useState(
    !Array.isArray(initialProducts) && (productIds.length > 0 || allowEmptyAnchor)
  );

  const serializedIds = productIds.filter(Boolean).join(',');

  useEffect(() => {
    if (Array.isArray(initialProducts) && initialProducts.length > 0) {
      setSuggestions(initialProducts);
      setLoading(false);
      return;
    }

    if (!serializedIds && !allowEmptyAnchor) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params = serializedIds ? { productIds: serializedIds, limit } : { limit };

    productService
      .getSuggestions(params)
      .then((res) => {
        if (!cancelled && res.data && Array.isArray(res.data.data)) {
          setSuggestions(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error loading product suggestions:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serializedIds, limit, initialProducts, allowEmptyAnchor]);

  if (!loading && suggestions.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#E9A5BE]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommandations personnalisées</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#54243F]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#6f6877]">{subtitle}</p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(Math.min(limit, 4))].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl h-80 animate-pulse border border-[#F5DCE5]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {suggestions.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
