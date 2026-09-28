'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Product, Category } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  Plus,
  Minus,
  Search,
  Check,
  AlertCircle,
  Edit,
  Trash2,
  X,
  PlusCircle,
  Upload,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

export default function StaffInventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // File upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modal state for Add/Edit product
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'whisky-spirits',
    price: 0,
    stockQuantity: 10,
    volume: '750ml',
    alcoholPercentage: 40,
    originCountry: 'Ghana',
    imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80',
    description: '',
    isActive: true,
  });

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?all=true'),
        fetch('/api/categories'),
      ]);
      if (prodRes.ok) {
        const p = await prodRes.json();
        setProducts(p.products || []);
      }
      if (catRes.ok) {
        const c = await catRes.json();
        setCategories(c.categories || []);
      }
    } catch (e) {
      console.error('Error fetching inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: Math.max(0, newStock) }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
      }
    } catch (e) {
      console.error('Error updating stock:', e);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === product.id ? data.product : p)));
      }
    } catch (e) {
      console.error('Error toggling active state:', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to upload image file');
      }

      setFormData((prev) => ({ ...prev, imageUrl: json.url }));
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setUploadError(null);
    setFormData({
      name: '',
      category: categories[0]?.slug || 'whisky-spirits',
      price: 50,
      stockQuantity: 24,
      volume: '750ml',
      alcoholPercentage: 40,
      originCountry: 'Ghana',
      imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80',
      description: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setUploadError(null);
    setFormData({
      name: p.name,
      category: p.category,
      price: p.price,
      stockQuantity: p.stockQuantity,
      volume: p.volume,
      alcoholPercentage: p.alcoholPercentage || 0,
      originCountry: p.originCountry || '',
      imageUrl: p.imageUrl,
      description: p.description,
      isActive: p.isActive,
    });
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save product');
        return;
      }

      setModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCat !== 'all' && p.category !== selectedCat) return false;
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      if (!p.name.toLowerCase().includes(t) && !p.volume.toLowerCase().includes(t)) {
        return false;
      }
    }
    return true;
  });

  const isOwner = user?.role === 'owner';

  return (
    <div className="space-y-6">
      {/* Top action & filter bar */}
      <div className="bg-[#0d1527] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search stock by drink name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111a2e] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-slate-900 text-white border border-slate-700 px-3 py-2 rounded-xl font-semibold focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={openAddModal}
            className="bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Drink
          </button>
        </div>
      </div>

      {/* Products Inventory List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading inventory records...</div>
      ) : (
        <div className="bg-[#0d1527] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#111a2e] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Drink Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (GHS)</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Visibility</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity < 10;
                  const isOut = p.stockQuantity <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/60 transition">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white block text-sm">{p.name}</span>
                          <span className="text-slate-400 text-[11px]">{p.volume}</span>
                        </div>
                      </td>
                      <td className="p-4 capitalize">{p.category.replace('-', ' ')}</td>
                      <td className="p-4 font-black text-white text-sm">GHS {p.price.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStock(p.id, p.stockQuantity - 1)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                            title="Decrease 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span
                            className={`font-black px-2 py-0.5 rounded text-xs min-w-8 text-center ${
                              isOut
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : isLow
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-white'
                            }`}
                          >
                            {p.stockQuantity}
                          </span>
                          <button
                            onClick={() => handleUpdateStock(p.id, p.stockQuantity + 1)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                            title="Increase 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className="flex items-center gap-1.5 cursor-pointer"
                          title="Toggle active in online store"
                        >
                          {p.isActive ? (
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              Hidden
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Edit Drink Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Owner-only Delete Action */}
                          {isOwner && (
                            <button
                              onClick={() => {
                                setProductToDelete(p);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-900/80 transition"
                              title="Delete Product (Owner Only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal with Image Upload */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0d1527] border border-slate-700 rounded-3xl p-6 space-y-4 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingProduct ? 'Edit Drink Information' : 'Add New Drink to Catalog'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hennessy VSOP Privilege"
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Price (GHS) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Volume/Size</label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    placeholder="750ml, 1L"
                    className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Alcohol %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.alcoholPercentage}
                    onChange={(e) => setFormData({ ...formData, alcoholPercentage: Number(e.target.value) })}
                    placeholder="40"
                    className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Product Photo Upload Section (Files Supported!) */}
              <div className="space-y-2 bg-[#111a2e] p-3.5 rounded-xl border border-slate-700">
                <label className="text-slate-200 font-bold block flex items-center justify-between">
                  <span>Product Image Photo</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG, JPG, WEBP (Max 5MB)</span>
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
                          <span>Uploading image...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>Upload Image File from Device</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">or paste web URL:</span>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-[11px] text-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tasting Notes / Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe aroma, taste notes, food pairings..."
                  className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                {editingProduct && isOwner ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProductToDelete(editingProduct);
                      setModalOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Drink
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-black shadow"
                  >
                    Save Drink
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Owner Only) */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0d1527] border border-red-800 rounded-3xl p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm text-white">Permanently Delete Product?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">{productToDelete.name}</strong> from the store? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteProduct}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
