import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Facebook, ShieldCheck, Truck, RefreshCw, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#54243F] text-[#FFF9F7] pt-16 pb-12 border-t-4 border-[#E9A5BE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Service badges banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#E9A5BE]/20 flex items-center justify-center text-[#E9A5BE]">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm text-[#FFF9F7]">58 Wilayas</h4>
            <p className="text-xs text-[#F5DCE5]">Livraison rapide à domicile</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#E9A5BE]/20 flex items-center justify-center text-[#E9A5BE]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm text-[#FFF9F7]">Paiement à la livraison</h4>
            <p className="text-xs text-[#F5DCE5]">Réglez en toute confiance</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#E9A5BE]/20 flex items-center justify-center text-[#E9A5BE]">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm text-[#FFF9F7]">100% Ingrédients Nobles</h4>
            <p className="text-xs text-[#F5DCE5]">Formules pures & respectueuses</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#E9A5BE]/20 flex items-center justify-center text-[#E9A5BE]">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm text-[#FFF9F7]">Service Client Dévoué</h4>
            <p className="text-xs text-[#F5DCE5]">À votre écoute 7j/7</p>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl font-bold tracking-widest text-[#FFF9F7]">
                BIYODO
              </span>
              <p className="text-[11px] tracking-widest text-[#E9A5BE] font-semibold uppercase mt-0.5">
                Maison de Beauté & Soins Botaniques
              </p>
            </Link>
            <p className="text-xs text-[#F5DCE5] leading-relaxed">
              Créations cosmétiques d'exception alliant la pureté des trésors botaniques à l'efficacité des soins contemporains.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E9A5BE] hover:text-[#54243F] flex items-center justify-center transition-all" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E9A5BE] hover:text-[#54243F] flex items-center justify-center transition-all" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#E9A5BE]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#F5DCE5]">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Tous les produits</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Suivre ma commande</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Notre histoire</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Questions fréquentes (FAQ)</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Nous contacter</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#E9A5BE]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#F5DCE5]">
              <li><Link href="/shop?category=soins-du-visage" className="hover:text-white transition-colors">Soins du Visage</Link></li>
              <li><Link href="/shop?category=serums-et-huiles" className="hover:text-white transition-colors">Sérums & Huiles Précieuses</Link></li>
              <li><Link href="/shop?category=cremes-et-hydratation" className="hover:text-white transition-colors">Crèmes Hydratantes</Link></li>
              <li><Link href="/shop?category=soins-du-corps" className="hover:text-white transition-colors">Soins du Corps</Link></li>
              <li><Link href="/shop?category=parfums-et-brumes" className="hover:text-white transition-colors">Brumes & Fragrances</Link></li>
              <li><Link href="/shop?category=coffrets-cadeaux" className="hover:text-white transition-colors">Coffrets Cadeaux</Link></li>
            </ul>
          </div>

          {/* Contact & Wilayas */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#E9A5BE]">
              Service Client Algérie
            </h4>
            <div className="space-y-2.5 text-xs text-[#F5DCE5]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E9A5BE] shrink-0 mt-0.5" />
                <span>Showroom Alger Centre & Oran, Algérie</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E9A5BE] shrink-0" />
                <span>+213 555 12 34 56 (Samedi au Jeudi)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E9A5BE] shrink-0" />
                <span>contact@biyodo.com</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/track"
                className="inline-block bg-[#E9A5BE] text-[#54243F] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-white transition-colors"
              >
                Suivre mon colis en ligne →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#F5DCE5]/70 gap-3">
          <p>© {new Date().getFullYear()} BIYODO Cosmetics. Tous droits réservés.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Conditions générales de vente</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
