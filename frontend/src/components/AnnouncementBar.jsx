'use client';

import React from 'react';
import { Phone, Mail, Instagram, Facebook, Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-[#54243F] text-[#FFF9F7] text-xs py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#E9A5BE] animate-pulse" />
          <span className="font-medium tracking-wide">
            Livraison Express disponible dans les <strong className="text-[#E9A5BE]">58 Wilayas</strong> | Paiement à la livraison
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[#F5DCE5]">
          <a href="tel:+213555123456" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3 h-3 text-[#E9A5BE]" />
            <span>+213 555 12 34 56</span>
          </a>
          <span className="text-[#E9A5BE] opacity-40">|</span>
          <a href="mailto:contact@biyodo.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail className="w-3 h-3 text-[#E9A5BE]" />
            <span>contact@biyodo.com</span>
          </a>
          <span className="text-[#E9A5BE] opacity-40">|</span>
          <div className="flex items-center gap-2.5">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
