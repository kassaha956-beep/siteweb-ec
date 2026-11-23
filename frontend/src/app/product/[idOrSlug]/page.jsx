'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, ChevronRight, Star, Truck, ShieldCheck, RefreshCw, Heart, Plus, Minus, Check, ArrowLeft } from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import { useCart } from '../../../context/CartContext';
import { productService } from '../../../services/api';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { idOrSlug } = params;
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (!idOrSlug) return;
    setLoading(true);
    productService.getProduct(idOrSlug)
      .then((res) => {
        if (res.data && res.data.data) {
          const prod = res.data.data;
          setProduct(prod);
          const defaultImg = (prod.images && prod.images.length > 0)
            ? prod.images[0].image_url
            : prod.primary_image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80';
          setSelectedImage(defaultImg);
        }
      })
      .catch((err) => console.error('Error loading product details', err))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#E9A5BE] border-t-[#54243F] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold text-[#54243F]">Chargement des détails du soin...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#54243F]">Soin introuvable</h2>
        <p className="text-xs text-[#6f6877]">Ce produit n'est plus disponible ou a été déplacé.</p>
        <Link
          href="/shop"
          className="inline-block bg-[#54243F] text-white px-6 py-2.5 rounded-2xl text-xs font-bold"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const price = parseFloat(product.price);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const isDiscounted = discountPrice !== null && discountPrice > 0 && discountPrice < price;
  const effectivePrice = isDiscounted ? discountPrice : price;
  const discountPercent = isDiscounted ? Math.round(((price - discountPrice) / price) * 100) : null;

  const isOutOfStock = product.stock_quantity <= 0;
  const maxStock = product.stock_quantity;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  return (
    <div className="py-10 bg-[#FFF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6f6877] mb-8">
          <Link href="/" className="hover:text-[#54243F]">Accueil</Link>
          <ChevronRight className="w-3 h-3 text-[#E9A5BE]" />
          <Link href="/shop" className="hover:text-[#54243F]">Boutique</Link>
          {product.category_name && (
            <>
              <ChevronRight className="w-3 h-3 text-[#E9A5BE]" />
              <Link href={`/shop?category=${product.category_slug}`} className="hover:text-[#54243F]">
                {product.category_name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-[#E9A5BE]" />
          <span className="text-[#54243F] font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Hero: Images Gallery + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-[2.5rem] border border-[#F5DCE5] card-shadow mb-16">
          {/* Images Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main preview */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#FFF9F7] border border-[#F5DCE5]">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              {isDiscounted && (
                <div className="absolute top-4 left-4 bg-[#E9A5BE] text-[#54243F] font-bold text-xs px-3 py-1 rounded-full shadow-md">
                  -{discountPercent}% Réduction
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === img.image_url
                        ? 'border-[#54243F] ring-2 ring-[#E9A5BE]'
                        : 'border-[#F5DCE5] hover:border-[#E9A5BE]'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Purchase Box */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#E9A5BE]">
                  {product.category_name}
                </span>
                {product.sku && (
                  <span className="text-[#6f6877]">Réf: {product.sku}</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#54243F] leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#E9A5BE] text-[#E9A5BE]" />
                ))}
                <span className="text-xs font-semibold text-[#54243F] ml-1">4.9 / 5</span>
                <span className="text-xs text-[#6f6877]">(Avis clientes certifiés)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 py-2 border-y border-[#F5DCE5]">
                <span className="text-3xl font-bold text-[#54243F]">
                  {effectivePrice.toLocaleString()} DA
                </span>
                {isDiscounted && (
                  <span className="text-base text-[#6f6877] line-through">
                    {price.toLocaleString()} DA
                  </span>
                )}
                <span className="text-xs text-[#E9A5BE] font-semibold bg-[#F5DCE5] px-2.5 py-1 rounded-full ml-auto">
                  TTC
                </span>
              </div>

              {/* Short description */}
              {product.short_description && (
                <p className="text-xs sm:text-sm text-[#343039] leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Stock Status Indicator */}
              <div className="pt-2">
                {isOutOfStock ? (
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Rupture de stock temporaire</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    <span>En stock — Disponible immédiatement ({product.stock_quantity} unités)</span>
                  </div>
                )}
              </div>

              {/* Quantity selector & Add to cart CTA */}
              {!isOutOfStock && (
                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-[#54243F]">Quantité :</span>
                    <div className="flex items-center border-2 border-[#E9A5BE] rounded-2xl overflow-hidden bg-[#FFF9F7]">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3.5 py-2 text-[#54243F] hover:bg-[#F5DCE5] transition-colors"
                        aria-label="Diminuer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-sm font-bold text-[#54243F]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                        className="px-3.5 py-2 text-[#54243F] hover:bg-[#F5DCE5] transition-colors"
                        aria-label="Augmenter"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#54243F] hover:bg-[#431a32] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Ajouter au Panier • {(effectivePrice * quantity).toLocaleString()} DA</span>
                  </button>

                  {addedNotice && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                      <Check className="w-4 h-4" />
                      <span>Produit ajouté au panier avec succès !</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[#F5DCE5] text-xs text-[#343039]">
              <div className="flex items-center gap-2 bg-[#FFF9F7] p-2.5 rounded-xl border border-[#F5DCE5]">
                <Truck className="w-4 h-4 text-[#54243F]" />
                <span>Livraison 58 Wilayas</span>
              </div>
              <div className="flex items-center gap-2 bg-[#FFF9F7] p-2.5 rounded-xl border border-[#F5DCE5]">
                <ShieldCheck className="w-4 h-4 text-[#54243F]" />
                <span>Paiement à la livraison</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Description, Conseils, Livraison */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-[#F5DCE5] card-shadow mb-16">
          <div className="flex border-b border-[#F5DCE5] gap-8 mb-6 overflow-x-auto text-sm font-semibold">
            {[
              { id: 'description', label: 'Description & Bienfaits' },
              { id: 'ingredients', label: 'Ingrédients & Pureté' },
              { id: 'usage', label: 'Conseils d\'Application' },
              { id: 'delivery', label: 'Livraison & Expédition' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 transition-all uppercase tracking-wider text-xs whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-[#54243F] text-[#54243F] font-bold'
                    : 'text-[#6f6877] hover:text-[#54243F]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs sm:text-sm text-[#343039] leading-relaxed max-w-3xl">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p>{product.description || 'Soin cosmétique exclusif formulé pour sublimer la peau au quotidien.'}</p>
                <div className="bg-[#FFF9F7] p-5 rounded-2xl border border-[#F5DCE5] space-y-2 mt-4">
                  <h4 className="font-serif font-bold text-[#54243F] text-sm">Les Points Forts :</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#6f6877]">
                    <li>Texture sensorielle ultra-confortable à absorption optimale</li>
                    <li>Restaure et préserve la barrière cutanée</li>
                    <li>Convient à tous types de peau, y compris les peaux sensibles</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <p>
                  Formulé dans le respect absolu de la charte de formulation propre BIYODO : sans parabènes, sans phtalates, sans silicones lourds et sans huiles minérales.
                </p>
                <p className="text-xs text-[#6f6877] italic">
                  Ingrédients principaux : Extraits botaniques nobles, hydrolats floraux distillés à la vapeur douce, complexe antioxydant végétal.
                </p>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-3">
                <p>
                  1. Prélevez 2 à 3 gouttes ou une noisette de produit dans le creux de vos mains propres.
                </p>
                <p>
                  2. Chauffez délicatement la texture puis appliquez sur le visage et le cou par effleurages ascendants.
                </p>
                <p>
                  3. Utilisez matin et soir avant votre crème de jour ou de nuit pour une efficacité maximale.
                </p>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-3">
                <p>
                  Nous expédions vos commandes sur l'ensemble des <strong>58 wilayas algériennes</strong> via nos partenaires de livraison rapide à domicile.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#6f6877]">
                  <li>Grand Alger & Wilayas limitrophes : 24 à 48 heures ouvrées</li>
                  <li>Nord et Hauts-Plateaux : 2 à 4 jours ouvrés</li>
                  <li>Sud & Grand Sud : 4 à 6 jours ouvrés</li>
                  <li>Le paiement s'effectue en espèces lors de la réception de votre colis.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {product.related_products && product.related_products.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-[#54243F]">
              Vous Aimerez Aussi
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {product.related_products.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
