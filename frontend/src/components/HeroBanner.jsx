'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    tag: 'Nouvelle Collection Botanique',
    title: 'L\'Art des Soins Purs & Éléments Naturels',
    subtitle: 'Révélez l\'éclat naturel de votre peau avec nos élixirs formulés à partir d\'extraits floraux précieux et d\'actifs régénérants.',
    cta: 'Découvrir la Collection',
    href: '/shop',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85',
    highlight: 'Jusqu\'à -20% sur les soins du visage',
  },
  {
    id: 2,
    tag: 'Sérums & Huiles Précieuses',
    title: 'Le Rituel Nocturne Haute Régénération',
    subtitle: 'Nourrissez intensément votre peau pendant la nuit avec nos complexes à la rose musquée et vitamine C stabilisée.',
    cta: 'Voir les Sérums',
    href: '/shop?category=serums-et-huiles',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85',
    highlight: 'Paiement à la livraison dans 58 wilayas',
  },
  {
    id: 3,
    tag: 'Écrin Cadeau d\'Exception',
    title: 'Coffrets Rituels & Beauté Exclusive',
    subtitle: 'Offrez un moment d\'évasion sensorielle avec nos coffrets prestige emballés délicatement dans notre boîte signature.',
    cta: 'Explorer les Coffrets',
    href: '/shop?category=coffrets-cadeaux',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85',
    highlight: 'Livraison offerte à partir de 8 000 DA',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-[#FFF9F7] py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#F5DCE5] via-[#FFF9F7] to-[#F5DCE5]/60 border border-[#E9A5BE]/40 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[480px]">
            {/* Left Content Column */}
            <div className="lg:col-span-7 p-8 md:p-14 z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#E9A5BE] text-[#54243F] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm animate-in fade-in duration-500">
                <Sparkles className="w-3.5 h-3.5 text-[#E9A5BE]" />
                <span>{slide.tag}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#54243F] leading-[1.15] tracking-tight">
                {slide.title}
              </h1>

              <p className="text-[#343039] text-base md:text-lg max-w-xl font-normal leading-relaxed">
                {slide.subtitle}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href={slide.href}
                  className="bg-[#54243F] text-white hover:bg-[#431a32] px-8 py-4 rounded-2xl font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                >
                  <span>{slide.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="text-xs font-medium text-[#54243F] bg-[#E9A5BE]/30 px-3.5 py-2.5 rounded-xl border border-[#E9A5BE]">
                  ✨ {slide.highlight}
                </div>
              </div>
            </div>

            {/* Right Image Column */}
            <div className="lg:col-span-5 h-[340px] lg:h-full relative overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center transition-all duration-1000 ease-out transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#FFF9F7]/70 lg:from-[#FFF9F7] via-transparent to-transparent" />
            </div>
          </div>

          {/* Slider controls */}
          <div className="absolute bottom-5 right-6 flex items-center gap-2 z-20">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white/90 text-[#54243F] hover:bg-[#54243F] hover:text-white shadow-md transition-colors"
              aria-label="Diapositive précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5 px-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-2 rounded-full transition-all ${
                    current === idx ? 'w-6 bg-[#54243F]' : 'w-2 bg-[#E9A5BE]'
                  }`}
                  aria-label={`Aller à la diapositive ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white/90 text-[#54243F] hover:bg-[#54243F] hover:text-white shadow-md transition-colors"
              aria-label="Diapositive suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
