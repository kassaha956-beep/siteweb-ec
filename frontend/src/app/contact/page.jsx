'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-14 bg-[#FFF9F7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E9A5BE]">
            Service Clientèle Algérie
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#54243F]">
            Contactez la Maison BIYODO
          </h1>
          <p className="text-xs sm:text-sm text-[#6f6877]">
            Notre équipe de conseillères beauté est à votre entière disposition pour toute question sur nos soins ou vos commandes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Info cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F5DCE5] card-shadow space-y-6">
              <h2 className="font-serif font-bold text-lg text-[#54243F] pb-3 border-b border-[#F5DCE5]">
                Nos Points de Contact
              </h2>

              <div className="space-y-5 text-xs text-[#343039]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5DCE5] text-[#54243F] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#54243F]">Assistance Téléphonique</h3>
                    <p className="text-[#6f6877] mt-0.5">+213 555 12 34 56</p>
                    <p className="text-[10px] text-[#6f6877]">Du Samedi au Jeudi : 9h00 - 18h00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5DCE5] text-[#54243F] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#54243F]">Courriel Officiel</h3>
                    <p className="text-[#6f6877] mt-0.5">contact@biyodo.com</p>
                    <p className="text-[10px] text-[#6f6877]">Réponse sous 24 heures</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5DCE5] text-[#54243F] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#54243F]">Bureaux & Showrooms</h3>
                    <p className="text-[#6f6877] mt-0.5">Alger Centre & Oran, Algérie</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F5DCE5] card-shadow">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-serif font-bold text-xl text-[#54243F]">
                    Message Envoyé avec Succès !
                  </h3>
                  <p className="text-xs text-[#6f6877] max-w-sm mx-auto">
                    Merci de nous avoir contactés. Notre équipe vous répondra par téléphone ou par email dans les meilleurs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-serif font-bold text-lg text-[#54243F] mb-4">
                    Envoyez-nous un message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#54243F] mb-1">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#54243F] mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0555 12 34 56"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#54243F] mb-1">
                      Email (Optionnel)
                    </label>
                    <input
                      type="email"
                      placeholder="nom@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#54243F] mb-1">
                      Votre Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Posez-nous vos questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#54243F] hover:bg-[#431a32] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer le Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
