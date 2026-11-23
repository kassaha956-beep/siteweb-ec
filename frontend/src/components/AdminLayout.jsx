'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  ClipboardList,
  Boxes,
  Truck,
  Tag,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Sparkles,
  User,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on login page, render children without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Vue d\'ensemble', href: '/admin', icon: LayoutDashboard },
    { label: 'Commandes', href: '/admin/orders', icon: ClipboardList },
    { label: 'Produits', href: '/admin/products', icon: ShoppingBag },
    { label: 'Catégories', href: '/admin/categories', icon: FolderTree },
    { label: 'Inventaire & Stock', href: '/admin/inventory', icon: Boxes },
    { label: 'Wilayas & Livraison', href: '/admin/wilayas', icon: Truck },
    { label: 'Coupons & Promos', href: '/admin/coupons', icon: Tag },
    { label: 'Statistiques & Rapports', href: '/admin/statistics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#FDF7F5] flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#343039]/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#54243F] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-widest text-[#FFF9F7]">
                BIYODO
              </span>
              <span className="bg-[#E9A5BE] text-[#54243F] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Admin
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E9A5BE] text-[#54243F] shadow-md font-bold'
                      : 'text-[#F5DCE5] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#54243F]' : 'text-[#E9A5BE]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & actions footer */}
        <div className="p-4 border-t border-white/10 bg-black/10 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#E9A5BE] text-[#54243F] flex items-center justify-center font-bold text-xs">
              {admin ? admin.full_name?.charAt(0) : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {admin ? admin.full_name : 'Administrateur'}
              </p>
              <p className="text-[10px] text-[#E9A5BE] truncate">
                {admin ? admin.email : 'admin@biyodo.com'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
              title="Voir la boutique cliente"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#E9A5BE]" />
              <span>Boutique</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[11px] font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Quitter</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#F5DCE5] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-[#54243F] hover:bg-[#F5DCE5] rounded-xl lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-serif font-bold text-lg text-[#54243F] hidden sm:block">
              Portail d'Administration BIYODO
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-[#F5DCE5] text-[#54243F] font-bold px-3 py-1.5 rounded-full border border-[#E9A5BE]">
              Algérie (58 Wilayas) • DA
            </span>
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#54243F] hover:text-[#E9A5BE] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ouvrir le site client</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-10 flex-1">{children}</main>
      </div>
    </div>
  );
}
