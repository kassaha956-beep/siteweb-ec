'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('admin@biyodo.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/admin');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Identifiants administrateur invalides. Veuillez vérifier vos accès.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#F5DCE5] text-[#54243F] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E9A5BE]" />
            <span>Espace Restreint</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-[#54243F]">
            BIYODO
          </h1>
          <p className="text-xs text-[#6f6877]">
            Connexion au Tableau de Bord Administrateur
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-[2.5rem] border border-[#F5DCE5] card-shadow p-8 sm:p-10 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#54243F] mb-1.5 uppercase tracking-wider">
                Adresse Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@biyodo.com"
                  className="w-full pl-10 pr-4 py-3 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                />
                <Mail className="w-4 h-4 text-[#54243F] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#54243F] mb-1.5 uppercase tracking-wider">
                Mot de Passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                />
                <Lock className="w-4 h-4 text-[#54243F] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#54243F] hover:bg-[#431a32] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Connexion en cours...' : 'Se Connecter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Development helper tip */}
          <div className="p-3 bg-[#FFF9F7] rounded-xl border border-[#F5DCE5] text-[11px] text-[#6f6877] text-center">
            Identifiant par défaut : <strong className="text-[#54243F]">admin@biyodo.com</strong> / <strong className="text-[#54243F]">admin123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
