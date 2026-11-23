'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, ChevronRight, X, RefreshCw } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { productService, categoryService } from '../../services/api';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Load categories once
  useEffect(() => {
    categoryService.getCategories()
      .then((res) => {
        if (res.data && res.data.data) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Sync state if URL query changes
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('search') || '';
    setSelectedCategory(cat);
    setSearch(q);
    setCurrentPage(1);
  }, [searchParams]);

  // Fetch products whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: 12,
      sort,
    };
    if (selectedCategory) params.category = selectedCategory;
    if (search.trim()) params.search = search.trim();
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (inStockOnly) params.in_stock = 'true';

    productService.getProducts(params)
      .then((res) => {
        if (res.data) {
          setProducts(res.data.data || []);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      })
      .catch((err) => console.error('Error fetching products', err))
      .finally(() => setLoading(false));
  }, [selectedCategory, search, minPrice, maxPrice, sort, inStockOnly, currentPage]);

  const handleCategoryClick = (slug) => {
    const newCat = selectedCategory === slug ? '' : slug;
    setSelectedCategory(newCat);
    setCurrentPage(1);
    const url = newCat ? `/shop?category=${newCat}` : '/shop';
    router.push(url);
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setInStockOnly(false);
    setCurrentPage(1);
    router.push('/shop');
  };

  return (
    <div className="py-10 bg-[#FFF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-[#6f6877] mb-2">
            <a href="/" className="hover:text-[#54243F]">Accueil</a>
            <ChevronRight className="w-3 h-3 text-[#E9A5BE]" />
            <span className="text-[#54243F] font-semibold">Boutique</span>
            {selectedCategory && (
              <>
                <ChevronRight className="w-3 h-3 text-[#E9A5BE]" />
                <span className="capitalize">{selectedCategory.replace(/-/g, ' ')}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#54243F]">
            Nos Collections de Soins
          </h1>
          <p className="text-xs sm:text-sm text-[#6f6877] mt-1">
            Explorez notre gamme complète de cosmétiques botaniques d'exception.
          </p>
        </div>

        {/* Top Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-[#F5DCE5] card-shadow mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher un soin..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E9A5BE] focus:outline-none focus:border-[#54243F] text-xs bg-[#FFF9F7]"
            />
            <Search className="w-4 h-4 text-[#54243F] absolute left-3.5 top-3" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#F5DCE5] text-[#54243F] rounded-2xl text-xs font-semibold"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtres</span>
            </button>

            {/* Sort selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6f6877] hidden sm:inline">Trier par:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#FFF9F7] border border-[#E9A5BE] text-[#54243F] text-xs font-medium rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-[#54243F]"
              >
                <option value="newest">Nouveautés</option>
                <option value="price_asc">Prix croissant (DA)</option>
                <option value="price_desc">Prix décroissant (DA)</option>
                <option value="popularity">Popularité</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block space-y-6">
            {/* Categories */}
            <div className="bg-white p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-3">
              <h3 className="font-serif text-sm font-bold text-[#54243F] uppercase tracking-wider">
                Catégories
              </h3>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => handleCategoryClick('')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                    selectedCategory === ''
                      ? 'bg-[#54243F] text-white font-semibold'
                      : 'text-[#343039] hover:bg-[#F5DCE5]/50'
                  }`}
                >
                  Toutes les catégories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-[#54243F] text-white font-semibold'
                        : 'text-[#343039] hover:bg-[#F5DCE5]/50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">
                      ({cat.products_count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white p-6 rounded-3xl border border-[#F5DCE5] card-shadow space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#54243F] uppercase tracking-wider">
                Fourchette de Prix (DA)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#6f6877] block mb-1">Min</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6f6877] block mb-1">Max</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
                  />
                </div>
              </div>
            </div>

            {/* In stock checkbox */}
            <div className="bg-white p-5 rounded-3xl border border-[#F5DCE5] card-shadow">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#54243F]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-[#E9A5BE] text-[#54243F] focus:ring-[#54243F] w-4 h-4"
                />
                <span>Uniquement les produits en stock</span>
              </label>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 px-4 rounded-2xl border border-[#E9A5BE] text-[#54243F] hover:bg-[#F5DCE5] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réinitialiser les filtres</span>
            </button>
          </aside>

          {/* Product Grid Area */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-[#F5DCE5]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-[#F5DCE5] p-8">
                <SlidersHorizontal className="w-12 h-12 text-[#E9A5BE] mx-auto mb-3" />
                <h3 className="text-lg font-serif font-bold text-[#54243F]">
                  Aucun produit ne correspond à vos critères
                </h3>
                <p className="text-xs text-[#6f6877] mt-1 max-w-sm mx-auto">
                  Essayez d'ajuster votre recherche, de changer de catégorie ou de réinitialiser vos filtres.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 bg-[#54243F] text-white px-6 py-2.5 rounded-2xl text-xs font-bold hover:bg-[#431a32]"
                >
                  Voir tous les soins
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {products.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-2xl text-xs font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-[#54243F] text-white shadow-md'
                              : 'bg-white text-[#54243F] border border-[#F5DCE5] hover:bg-[#F5DCE5]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#54243F]">Chargement de la boutique...</div>}>
      <ShopContent />
    </Suspense>
  );
}
