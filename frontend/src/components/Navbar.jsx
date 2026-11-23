'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, ChevronDown, PackageCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { categoryService } from '../services/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const [categories, setCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);

  useEffect(() => {
    categoryService.getCategories()
      .then((res) => {
        if (res.data && res.data.data) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load nav categories', err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Boutique', href: '/shop', hasDropdown: true },
    { label: 'Suivre ma commande', href: '/track', icon: PackageCheck },
    { label: 'À propos', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFF9F7]/95 backdrop-blur-md border-b border-[#F5DCE5] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#54243F] hover:bg-[#F5DCE5]/50 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-widest text-[#54243F] group-hover:text-[#431a32] transition-colors">
              BIYODO
            </span>
            <span className="hidden sm:inline-block text-[10px] tracking-widest text-[#E9A5BE] font-semibold uppercase mt-1">
              Cosmetics
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div
                    key={link.label}
                    className="relative group"
                    onMouseEnter={() => setIsShopDropdownOpen(true)}
                    onMouseLeave={() => setIsShopDropdownOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1 py-2 text-[#343039] hover:text-[#54243F] transition-colors ${
                        pathname.startsWith('/shop') ? 'text-[#54243F] font-semibold' : ''
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                    </Link>

                    {/* Shop Dropdown Menu */}
                    {isShopDropdownOpen && (
                      <div className="absolute top-full left-0 w-64 bg-[#FFF9F7] border border-[#F5DCE5] rounded-2xl shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Link
                          href="/shop"
                          className="block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#54243F] hover:bg-[#F5DCE5]/60 transition-colors"
                        >
                          Tous les produits →
                        </Link>
                        <div className="border-t border-[#F5DCE5]/50 my-1" />
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="block px-4 py-2 text-sm text-[#343039] hover:text-[#54243F] hover:bg-[#F5DCE5]/40 transition-colors"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`py-2 text-[#343039] hover:text-[#54243F] transition-colors flex items-center gap-1.5 ${
                    pathname === link.href ? 'text-[#54243F] font-semibold border-b-2 border-[#54243F]' : ''
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4 text-[#E9A5BE]" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons (Search + Cart only, NO customer login) */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-[#54243F] hover:bg-[#F5DCE5] rounded-full transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-[#54243F] hover:bg-[#F5DCE5] rounded-full transition-colors group"
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#54243F] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#FFF9F7] animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#FFF9F7] border-b border-[#F5DCE5] px-4 pt-2 pb-6 space-y-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-[#54243F]"
            >
              Accueil
            </Link>
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-[#54243F]"
            >
              Tous les produits
            </Link>
            <div className="pl-4 space-y-2 border-l-2 border-[#F5DCE5]">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm text-[#343039]"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <Link
              href="/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-[#54243F]"
            >
              Suivre ma commande
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-[#54243F]"
            >
              À propos
            </Link>
            <Link
              href="/faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-[#54243F]"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-[#54243F]"
            >
              Contact
            </Link>
          </div>
        )}
      </header>

      {/* Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#343039]/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-[#FFF9F7] rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-[#F5DCE5] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-[#54243F]">
                Rechercher un produit
              </h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-[#343039] hover:bg-[#F5DCE5] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Tapez un mot-clé (ex: sérum, rose, crème, huile)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#E9A5BE] focus:outline-none focus:border-[#54243F] bg-white text-[#343039] text-base"
              />
              <Search className="w-5 h-5 text-[#54243F] absolute left-4 top-4" />
            </form>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="text-[#6f6877] py-1">Tendances:</span>
              {['Sérum Vitamine C', 'Rose Musquée', 'Crème Hydratante', 'Eau de Rose'].map((kw) => (
                <button
                  key={kw}
                  onClick={() => {
                    router.push(`/shop?search=${encodeURIComponent(kw)}`);
                    setIsSearchOpen(false);
                  }}
                  className="bg-[#F5DCE5] text-[#54243F] px-3 py-1 rounded-full hover:bg-[#E9A5BE] transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
