import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Shield, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-14 bg-[#FFF9F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E9A5BE]">
            Notre Histoire & Passion
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#54243F]">
            L'Élégance Botanique Révélée
          </h1>
          <p className="text-sm sm:text-base text-[#6f6877] leading-relaxed">
            BIYODO est née d'une vision simple et exigeante : réconcilier la haute efficacité cosmétique avec la pureté absolue des trésors botaniques.
          </p>
        </div>

        {/* Feature section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-[#F5DCE5] aspect-square">
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
              alt="Laboratoire BIYODO"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6 text-xs sm:text-sm text-[#343039] leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#54243F]">
              Un Savoir-Faire Exclusif
            </h2>
            <p>
              Inspirée des rituels ancestraux de beauté méditerranéenne et d'Afrique du Nord, la Maison BIYODO imagine des formules sensorielles combinant huiles d'exception (Argan, Figue de Barbarie, Rose Musquée) et principes actifs stabilisés de pointe.
            </p>
            <p>
              Chaque texture est méticuleusement élaborée pour procurer un bien-être immédiat tout en préservant la barrière cutanée durablement.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#54243F] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#431a32] shadow-md transition-all"
              >
                <span>Découvrir nos soins</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Values 3-cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F5DCE5] text-[#54243F] flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#54243F]">Ingrédients Purs</h3>
            <p className="text-xs text-[#6f6877]">
              Sélection rigoureuse d'extraits botaniques nobles sans sulfates abrasifs ni perturbateurs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F5DCE5] text-[#54243F] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#54243F]">Paiement Serein</h3>
            <p className="text-xs text-[#6f6877]">
              Livraison sécurisée avec encaissement uniquement lors de la remise en main propre.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F5DCE5] text-[#54243F] flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#54243F]">Qualité Certifiée</h3>
            <p className="text-xs text-[#6f6877]">
              Formulations testées sous contrôle dermatologique pour un respect optimal de la peau.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
