'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, AlertCircle, FolderTree } from 'lucide-react';
import { categoryService, adminService } from '../../../services/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_active: true,
  });

  const loadCategories = () => {
    setLoading(true);
    categoryService.getCategories({ admin: 'true' })
      .then((res) => {
        if (res.data && res.data.data) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      is_active: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setIsEditing(true);
    setCurrentId(cat.id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image_url: cat.image_url || '',
      is_active: cat.is_active === 1,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id, count) => {
    if (count > 0) {
      alert(`Impossible de supprimer cette catégorie car elle contient ${count} produit(s). Réassignez ou supprimez d'abord ces produits.`);
      return;
    }
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      await adminService.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression de la catégorie.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (isEditing) {
        await adminService.updateCategory(currentId, formData);
      } else {
        await adminService.createCategory(formData);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la catégorie.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#54243F]">
            Gestion des Catégories
          </h2>
          <p className="text-xs text-[#6f6877]">
            Organisez votre boutique par univers cosmétiques et rituels de beauté.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#54243F] hover:bg-[#431a32] text-white px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#F5DCE5] card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#54243F]">
            Chargement des catégories...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F7] text-[#54243F] uppercase tracking-wider text-[10px] font-bold border-b border-[#F5DCE5]">
                <tr>
                  <th className="p-4">Illustration</th>
                  <th className="p-4">Nom de la Catégorie</th>
                  <th className="p-4">Identifiant (Slug)</th>
                  <th className="p-4">Produits associés</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5DCE5]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#FFF9F7]/40 transition-colors">
                    <td className="p-4">
                      <img
                        src={cat.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=150&q=80'}
                        alt={cat.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#F5DCE5]"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-serif font-bold text-sm text-[#54243F]">{cat.name}</p>
                      {cat.description && (
                        <p className="text-[11px] text-[#6f6877] line-clamp-1 mt-0.5">{cat.description}</p>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#6f6877]">
                      {cat.slug}
                    </td>
                    <td className="p-4">
                      <span className="font-bold bg-[#F5DCE5] text-[#54243F] px-2.5 py-1 rounded-full text-[10px]">
                        {cat.products_count} soin(s)
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          cat.is_active === 1
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {cat.is_active === 1 ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-[#54243F] hover:bg-[#F5DCE5] rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.products_count)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#343039]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF9F7] rounded-[2.5rem] border border-[#F5DCE5] card-shadow max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5DCE5]">
              <h3 className="font-serif font-bold text-lg text-[#54243F]">
                {isEditing ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
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
                  Nom de la Catégorie *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Soins du Visage"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  URL de l'Image
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#54243F] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Description succincte..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E9A5BE] rounded-xl bg-white focus:outline-none focus:border-[#54243F]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#54243F] rounded"
                  />
                  <span className="font-semibold text-[#54243F]">Activer en boutique</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#F5DCE5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#54243F] hover:bg-[#431a32] text-white font-bold uppercase tracking-wider"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
