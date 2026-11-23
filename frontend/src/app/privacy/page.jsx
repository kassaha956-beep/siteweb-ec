import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="py-14 bg-[#FFF9F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-[2rem] border border-[#F5DCE5] card-shadow space-y-6 text-xs sm:text-sm text-[#343039] leading-relaxed">
        <h1 className="text-3xl font-serif font-bold text-[#54243F]">
          Politique de Confidentialité
        </h1>
        <p className="text-xs text-[#6f6877]">Dernière mise à jour : 2026</p>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-[#54243F]">1. Données collectées</h2>
          <p>
            Dans le cadre de l'utilisation du site BIYODO, les seules informations personnelles recueillies sont votre nom, votre numéro de téléphone et votre adresse de livraison afin d'acheminer vos colis à bon port.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-[#54243F]">2. Absence de mot de passe client</h2>
          <p>
            Notre plateforme ne requiert aucune création de compte client. Ainsi, nous ne stockons aucun mot de passe ni identifiant sensible vous concernant.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-[#54243F]">3. Confidentialité et transmission</h2>
          <p>
            Vos coordonnées ne sont partagées qu'avec nos livreurs partenaires pour le strict besoin de la livraison. Elles ne font l'objet d'aucune revente commerciale.
          </p>
        </section>
      </div>
    </div>
  );
}
