import React from 'react';

export default function TermsPage() {
  return (
    <div className="py-14 bg-[#FFF9F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-[2rem] border border-[#F5DCE5] card-shadow space-y-6 text-xs sm:text-sm text-[#343039] leading-relaxed">
        <h1 className="text-3xl font-serif font-bold text-[#54243F]">
          Conditions Générales de Vente (CGV)
        </h1>
        <p className="text-xs text-[#6f6877]">En vigueur en Algérie</p>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-[#54243F]">1. Champ d'application</h2>
          <p>
            Les présentes conditions régissent les ventes de produits cosmétiques proposés sur le site marchand BIYODO en République Algérienne Démocratique et Populaire.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-[#54243F]">2. Prix et Monnaie</h2>
          <p>
            Tous les prix affichés sur notre boutique sont exprimés en Dinars Algériens (DA), toutes taxes comprises (TTC). Les frais de livraison sont calculés selon la wilaya de destination.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-[#54243F]">3. Modalités de Paiement</h2>
          <p>
            Le règlement s'effectue exclusivement en espèces à la livraison (Cash on Delivery). Le client s'engage à être présent ou représenté lors de la remise de son colis.
          </p>
        </section>
      </div>
    </div>
  );
}
