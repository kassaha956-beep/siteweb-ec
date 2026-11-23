'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Dois-je créer un compte pour commander chez BIYODO ?',
    a: 'Non ! Sur BIYODO, aucune création de compte ni mot de passe n\'est requis. Vous ajoutez vos soins favoris au panier, renseignez simplement votre nom, téléphone et adresse, et validez votre commande en quelques clics.',
  },
  {
    q: 'Comment s\'effectue le règlement de ma commande ?',
    a: 'Nous fonctionnons exclusivement en Paiement à la Livraison (Cash on Delivery). Vous réglez directement en espèces au livreur après réception de votre colis.',
  },
  {
    q: 'Quels sont les délais et tarifs de livraison par wilaya ?',
    a: 'Nous livrons dans les 58 wilayas d\'Algérie. Pour Alger et les wilayas limitrophes (Blida, Tipaza, Boumerdès), la livraison s\'effectue en 24 à 48 heures. Pour le reste des wilayas du Nord et des Hauts-Plateaux, comptez 2 à 4 jours. Les tarifs sont calculés automatiquement lors de votre passage en caisse.',
  },
  {
    q: 'Comment puis-je suivre l\'état de mon colis ?',
    a: 'Dès que vous passez commande, un numéro de référence unique (ex: BYD-2026-XXXX) vous est attribué. Rendez-vous sur notre page "Suivre ma commande", saisissez cette référence ainsi que votre numéro de téléphone pour voir l\'état de votre livraison en temps réel.',
  },
  {
    q: 'Vos formules sont-elles adaptées aux peaux sensibles ?',
    a: 'Absolument. Nos formules sont rigoureusement élaborées avec des ingrédients botaniques d\'origine naturelle, sans sulfates agressifs ni parabènes, et sont testées sous contrôle dermatologique.',
  },
];

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="py-14 bg-[#FFF9F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-[#E9A5BE] mx-auto" />
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#54243F]">
            Foire Aux Questions (FAQ)
          </h1>
          <p className="text-xs sm:text-sm text-[#6f6877]">
            Tout ce que vous devez savoir sur la commande, la livraison dans les 58 wilayas et nos cosmétiques.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#F5DCE5] card-shadow overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-[#FFF9F7] transition-colors"
                >
                  <span className="font-serif font-bold text-sm text-[#54243F]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#54243F] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#343039] leading-relaxed border-t border-[#F5DCE5]/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
