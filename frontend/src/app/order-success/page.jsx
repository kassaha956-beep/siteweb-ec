'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Copy, Check, Package, PhoneCall, ArrowRight, Home } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get('ref') || 'BYD-2026-COMMANDE';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-16 bg-[#FFF9F7]">
      <div className="max-w-2xl mx-auto px-4 text-center space-y-8">
        {/* Success Icon */}
        <div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 shadow-lg">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E9A5BE]">
            Félicitations
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#54243F]">
            Votre Commande a été Enregistrée !
          </h1>
          <p className="text-xs sm:text-sm text-[#6f6877] max-w-lg mx-auto leading-relaxed">
            Merci pour votre confiance. Nos préparatrices de commande préparent déjà votre écrin beauté avec le plus grand soin.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F5DCE5] card-shadow max-w-md mx-auto space-y-3">
          <span className="text-xs text-[#6f6877] uppercase tracking-wider font-semibold">
            Votre Référence Unique de Commande
          </span>
          <div className="flex items-center justify-center gap-3 bg-[#FFF9F7] p-3.5 rounded-2xl border-2 border-[#E9A5BE]">
            <span className="font-mono text-base sm:text-lg font-bold text-[#54243F] tracking-wider">
              {orderRef}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 text-[#54243F] hover:bg-[#F5DCE5] rounded-xl transition-colors"
              title="Copier la référence"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-[#6f6877]">
            Conservez précieusement ce numéro pour suivre votre colis à tout moment.
          </p>
        </div>

        {/* Next Steps Guidance */}
        <div className="bg-[#F5DCE5]/40 rounded-3xl p-6 text-left border border-[#E9A5BE]/40 max-w-lg mx-auto space-y-4">
          <h3 className="font-serif font-bold text-sm text-[#54243F]">
            Que va-t-il se passer maintenant ?
          </h3>
          <div className="space-y-3 text-xs text-[#343039]">
            <div className="flex items-start gap-3">
              <PhoneCall className="w-4 h-4 text-[#54243F] shrink-0 mt-0.5" />
              <div>
                <strong>1. Confirmation téléphonique :</strong> Notre service client vous appellera sous peu pour confirmer votre adresse et valider l'expédition.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-4 h-4 text-[#54243F] shrink-0 mt-0.5" />
              <div>
                <strong>2. Expédition rapide :</strong> Votre colis est remis au livreur qui vous le remettra en main propre à votre domicile.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#54243F] shrink-0 mt-0.5" />
              <div>
                <strong>3. Paiement à la réception :</strong> Vous réglez le montant exact en espèces après avoir reçu votre colis.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href={`/track?ref=${encodeURIComponent(orderRef)}`}
            className="w-full sm:w-auto bg-[#54243F] hover:bg-[#431a32] text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>Suivre ma commande</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto bg-white border border-[#E9A5BE] text-[#54243F] hover:bg-[#F5DCE5] px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-[#54243F]">Chargement de la confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
