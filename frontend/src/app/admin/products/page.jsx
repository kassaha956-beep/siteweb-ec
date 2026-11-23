'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Eye,
  Star,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { productService, categoryService, adminService } from '../../../services/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    discount_price: '',
    cost_price: '',
    stock_quantity: '',
    sku: '',
    short_description: '',
    description: '',
    is_active: true,
    is_featured: false,
    images: [''],
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      productService.getProducts({ admin: 'true', limit: 50, search, category: selectedCategory }),
      categoryService.getCategories({ admin: 'true' }),
    ])
      .then(([prodRes, catRes]) => {
        if (prodRes.data && prodRes.data.data) {
          setProducts(prodRes.data.data);
        }
        if (catRes.data && catRes.data.data) {
          setCategories(catRes.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      category_id: categories.length > 0 ? categories[0].id.toString() : '',
      price: '',
      discount_price: '',
      cost_price: '',
      stock_quantity: '20',
      sku: '',
      short_description: '',
      description: '',
      is_active: true,
      is_featured: false,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'],
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (prod) => {
    setIsEditing(true);
    setCurrentId(prod.id);
    setFormError('');
    setFormSuccess('');

    // Fetch full product details including images
    try {
      const res = await productService.getProduct(prod.id);
      const p = res.data.data;
      setFormData({
        name: p.name,
        category_id: p.category_id.toString(),
        price: p.price,
        discount_price: p.discount_price || '',
        cost_price: p.cost_price || '',
        stock_quantity: p.stock_quantity.toString(),
        sku: p.sku || '',
        short_description: p.short_description || '',
        description: p.description || '',
        is_active: p.is_active === 1,
        is_featured: p.is_featured === 1,
        images: p.images && p.images.length > 0
          ? p.images.map((img) => img.image_url)
          : [p.primary_image || ''],
      });
      setIsModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ou désactiver ce produit ?')) return;
    try {
      const res = await adminService.deleteProduct(id);
      alert(res.data.message || 'Opération réussie.');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        category_id: parseInt(formData.category_id, 10),
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
        stock_quantity: parseInt(formData.stock_quantity || 0, 10),
        sku: formData.sku || null,
        short_description: formData.short_description,
        description: formData.description,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        images: formData.images.filter((img) => img && img.trim() !== ''),
      };

      if (isEditing) {
        await adminService.updateProduct(currentId, payload);
      } else {
        await adminService.createProduct(payload);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du produit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleImageChange = (index, val) => {
    const updated = [...formData.images];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  const handleRemoveImageField = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: updated.length ? updated : [''] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#54243F]">
            Gestion du Catalogue Produits
          </h2>
          <p className="text-xs text-[#6f6877]">
            Ajoutez, modifiez les prix, contrôlez les stocks et mettez en avant vos cosmétiques.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#54243F] hover:bg-[#431a32] text-white px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Produit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#F5DCE5] card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Rechercher par nom, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] focus:outline-none focus:border-[#54243F]"
          />
          <Search className="w-4 h-4 text-[#54243F] absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2.5 border border-[#E9A5BE] rounded-xl bg-[#FFF9F7] text-[#54243F] focus:outline-none focus:border-[#54243F] w-full sm:w-auto"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#F5DCE5] card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#54243F]">
            Chargement des produits...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6f6877]">
            Aucun produit trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F7] text-[#54243F] uppercase tracking-wider text-[10px] font-bold border-b border-[#F5DCE5]">
                <tr>
                  <th className="p-4">Aperçu</th>
                  <th className="p-4">Désignation</th>
                  <th className="p-4">Catégorie</th>
                  <th className="p-4">Prix Vente</th>
                  <th className="p-4">Coût Achat</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5DCE5]">
                {products.map((prod) => {
                  const isDiscounted = prod.discount_price && parseFloat(prod.discount_price) > 0;
                  return (
                    <tr key={prod.id} className="hover:bg-[#FFF9F7]/40 transition-colors">
                      <td className="p-4">
                        <img
                          src={prod.primary_image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=150&q=80'}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#F5DCE5] bg-[#FFF9F7]"
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-serif font-bold text-sm text-[#54243F]">
                          {prod.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[#6f6877] mt-0.5">
                          <span>SKU: {prod.sku || 'N/A'}</span>
                          {prod.is_featured === 1 && (
                            <span className="bg-[#E9A5BE] text-[#54243F] px-1.5 py-0.2 rounded font-bold">
                              Vedette
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-[#343039]">
                        {prod.category_name}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[#54243F]">
                          {(isDiscounted ? parseFloat(prod.discount_price) : parseFloat(prod.price)).toLocaleString()} DA
                        </span>
                        {isDiscounted && (
                          <span className="block text-[10px] text-[#6f6877] line-through">
                            {parseFloat(prod.price).toLocaleString()} DA
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-[#6f6877]">
                        {parseFloat(prod.cost_price || 0).toLocaleString()} DA
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                            prod.stock_quantity <= 0
                              ? 'bg-red-100 text-red-700'
                              : prod.stock_quantity <= 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {prod.stock_quantity} en stock
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            prod.is_active === 1
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {prod.is_active === 1 ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 text-[#54243F] hover:bg-[#F5DCE5] rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#343039]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFF9F7] rounded-[2.5rem] border border-[#F5DCE5] card-shadow max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5DCE5]">
              <h3 className="font-serif font-bold text-lg text-[#54243F]">
                {isEditing ? 'Modifier le Produit' : 'Créer un Nouveau Produit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#343039] hover:bg-[#F5DCE5] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Nom du Produit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sérum Botanique Éclat à la Rose"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#54243F] mb-1">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white text-[#54243F] focus:outline-none focus:border-[#54243F]"
                  >
                    <option value="">Sélectionnez</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#54243F] mb-1">
                    Code SKU / Référence
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: BYD-SRM-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#54243F] mb-1">
                    Prix de Vente (DA) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="3900"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#54243F] mb-1">
                    Prix Remisé (DA)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optionnel (ex: 3400)"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#54243F] mb-1">
                    Coût d'Achat (DA)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1800"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Quantité en Stock *
                </label>
                <input
                  type="number"
                  required
                  placeholder="25"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                />
              </div>

              {/* Images list */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-[#54243F]">
                    Images du Produit (URLs ou Upload)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="text-[11px] font-bold text-[#54243F] hover:text-[#E9A5BE]"
                  >
                    + Ajouter une image
                  </button>
                </div>
                {formData.images.map((imgUrl, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imgUrl}
                      onChange={(e) => handleImageChange(i, e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                    />
                    {imgUrl && (
                      <img src={imgUrl} alt="" className="w-8 h-8 rounded-lg object-cover border" />
                    )}
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageField(i)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Brève Description (Accroche)
                </label>
                <input
                  type="text"
                  placeholder="Sérum illuminateur et régénérant anti-âge..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Description Complète
                </label>
                <textarea
                  rows={3}
                  placeholder="Détails de formulation, bienfaits, conseils..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#54243F] rounded"
                  />
                  <span className="font-semibold text-[#54243F]">Actif en boutique</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-[#54243F] rounded"
                  />
                  <span className="font-semibold text-[#54243F]">Produit Vedette (Accueil)</span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex justify-end gap-3 border-t border-[#F5DCE5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#54243F] hover:bg-[#431a32] text-white font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
