'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CategoryList({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-[#FFF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E9A5BE]">
              Nos Univers Botaniques
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#54243F] mt-1">
              Explorer par Catégorie
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-[#54243F] hover:text-[#E9A5BE] flex items-center gap-1 group transition-colors"
          >
            <span>Voir toute la boutique</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group bg-white rounded-3xl p-4 border border-[#F5DCE5] card-shadow card-hover flex flex-col items-center text-center transition-all"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden mb-3 bg-[#F5DCE5] relative">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-serif text-xs sm:text-sm font-bold text-[#54243F] group-hover:text-[#E9A5BE] transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[10px] text-[#6f6877] mt-0.5">
                {cat.products_count !== undefined ? `${cat.products_count} soins` : 'Découvrir'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
