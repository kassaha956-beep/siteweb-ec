'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Award, CheckCircle2 } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import { productService, categoryService } from '../services/api';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getFeatured(8),
      categoryService.getCategories(),
    ])
      .then(([prodRes, catRes]) => {
        if (prodRes.data && prodRes.data.data) {
          setFeaturedProducts(prodRes.data.data);
        }
        if (catRes.data && catRes.data.data) {
          setCategories(catRes.data.data);
        }
      })
      .catch((err) => console.error('Error fetching homepage data', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* 1. Hero Banner Slider */}
      <HeroBanner />

      {/* 2. Shop by Category */}
      <CategoryList categories={categories} />

      {/* 3. Popular / Featured Products Section */}
      <section className="py-14 bg-white border-y border-[#F5DCE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E9A5BE]">
              Sélection Précieuse
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#54243F]">
              Nos Soins les Plus Plébiscités
            </h2>
            <p className="text-xs sm:text-sm text-[#6f6877]">
              Découvrez les formules favorites de nos clientes pour un teint éclatant et une peau revitalisée.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#FFF9F7] rounded-3xl h-80 animate-pulse border border-[#F5DCE5]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#54243F] text-white hover:bg-[#431a32] px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all group"
            >
              <span>Découvrir tous les produits</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Brand Story & Commitment Banner */}
      <section className="py-16 bg-[#FFF9F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F5DCE5]/50 border border-[#E9A5BE]/40 rounded-[2.5rem] p-8 md:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#54243F] bg-[#E9A5BE]/40 px-3 py-1 rounded-full">
                L'Engagement BIYODO
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#54243F] leading-tight">
                La quintessence des plantes au service de votre beauté
              </h2>
              <p className="text-sm text-[#343039] leading-relaxed">
                Chaque création BIYODO est une invitation à ralentir et célébrer votre éclat naturel. Nous sélectionnons méticuleusement les huiles végétales de première pression, les distillats floraux biologiques et les principes actifs les plus purs pour concevoir des rituels bienveillants adaptés à tous les types de peau.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Formules d\'origine naturelle sans sulfates agressifs',
                  'Testé dermatologiquement et non comédogène',
                  'Emballages éco-conçus et flacons en verre recyclable',
                  'Service de livraison rapide et suivi personnalisé en Algérie',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5 text-xs text-[#343039] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#54243F] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#54243F] hover:text-[#E9A5BE] transition-colors"
                >
                  <span>En savoir plus sur notre histoire</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
                  alt="Rituel Beauté BIYODO"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer VIP Announcement */}
      <section className="py-14 bg-[#54243F] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-[#E9A5BE] mx-auto animate-bounce" />
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#FFF9F7]">
            Commandez en toute sérénité sans créer de compte
          </h2>
          <p className="text-xs sm:text-sm text-[#F5DCE5] max-w-xl mx-auto leading-relaxed">
            Profitez d'une expérience d'achat fluide et sans contrainte. Ajoutez vos soins au panier, entrez simplement votre adresse et payez à la réception de votre colis.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block bg-[#E9A5BE] text-[#54243F] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl hover:bg-white shadow-lg transition-all"
            >
              Commander maintenant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
