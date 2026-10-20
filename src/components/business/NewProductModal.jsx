import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useBusinessStore } from '../../stores/businessStore';
import { useUiStore } from '../../stores/uiStore';
import { Upload, Loader2 } from 'lucide-react';
import { uploadApi } from '../../services/api';

export default function NewProductModal() {
  const { isProductModalOpen, setProductModalOpen, editingProduct, addProduct, updateProduct } = useBusinessStore();
  const { showToast } = useUiStore();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Food & Beverage');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('20');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    "Food & Beverage",
    "Handicrafts & Art",
    "Digital Services",
    "Events & Tickets",
    "Accessories",
    "Fashion"
  ];

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setPrice(editingProduct.price?.toString() || '');
      setCategory(editingProduct.category || 'Food & Beverage');
      setDescription(editingProduct.description || '');
      setStock(editingProduct.stock?.toString() || '20');
      setImagePreview(editingProduct.image || null);
    } else {
      setName('');
      setPrice('');
      setCategory('Food & Beverage');
      setDescription('');
      setStock('20');
      setImagePreview(null);
    }
    setImageFile(null);
  }, [editingProduct, isProductModalOpen]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      showToast("Image exceeds 25 MB limit", "warning");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsUploading(false);
    setProductModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      showToast("Please enter product name and price", "warning");
      return;
    }

    let finalImageUrl = editingProduct?.image || '';
    if (imageFile) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadApi.uploadFile(imageFile);
        const rawUrl = uploadResult.url || '';
        finalImageUrl = rawUrl.startsWith('http') ? rawUrl : `http://localhost:8000${rawUrl}`;
      } catch (err) {
        console.error("Product image upload failed:", err);
        showToast("Failed to upload product image", "error");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: name.trim(),
        price: Number(price),
        category,
        description: description.trim(),
        stock: Number(stock),
        image: finalImageUrl || editingProduct.image
      });
      showToast("Product updated successfully!", "success");
    } else {
      addProduct({
        name: name.trim(),
        price: Number(price),
        category,
        description: description.trim(),
        stock: Number(stock),
        image: finalImageUrl || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80"
      });
      showToast("Product added to catalog!", "success");
    }
    handleClose();
  };

  return (
    <Modal
      isOpen={isProductModalOpen}
      onClose={handleClose}
      title={editingProduct ? "Edit Product" : "Add Product to Catalog"}
      description="Manage items visible to your customers in chat and business profile."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Product / Service Name"
          placeholder="e.g. Rwandan Specialty Coffee (500g)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price (RWF)"
            type="number"
            placeholder="12500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <Input
            label="Stock Quantity"
            type="number"
            placeholder="50"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Product Photo
          </label>
          <div 
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 dark:hover:border-teal-600 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="flex items-center gap-3 w-full">
                <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {imageFile ? imageFile.name : 'Current photo'}
                  </p>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">Click to choose another photo</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click to choose local photo</p>
                <p className="text-[11px] text-slate-400">JPEG, PNG, WebP (up to 25 MB)</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key features, origins, or delivery specifications..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isUploading}>
            {isUploading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
              </span>
            ) : (
              editingProduct ? "Save Changes" : "Add to Catalog"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
