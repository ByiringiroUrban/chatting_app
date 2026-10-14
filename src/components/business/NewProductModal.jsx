import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useBusinessStore } from '../../stores/businessStore';
import { useUiStore } from '../../stores/uiStore';

export default function NewProductModal() {
  const { isProductModalOpen, setProductModalOpen, editingProduct, addProduct, updateProduct } = useBusinessStore();
  const { showToast } = useUiStore();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Food & Beverage');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('20');
  const [image, setImage] = useState('');

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
      setImage(editingProduct.image || '');
    } else {
      setName('');
      setPrice('');
      setCategory('Food & Beverage');
      setDescription('');
      setStock('20');
      setImage('');
    }
  }, [editingProduct, isProductModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      showToast("Please enter product name and price", "warning");
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: name.trim(),
        price: Number(price),
        category,
        description: description.trim(),
        stock: Number(stock),
        image: image || editingProduct.image
      });
      showToast("Product updated successfully!", "success");
    } else {
      addProduct({
        name: name.trim(),
        price: Number(price),
        category,
        description: description.trim(),
        stock: Number(stock),
        image: image || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80"
      });
      showToast("Product added to catalog!", "success");
    }
  };

  return (
    <Modal
      isOpen={isProductModalOpen}
      onClose={() => setProductModalOpen(false)}
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

        <Input
          label="Image URL"
          placeholder="https://images.unsplash.com/..."
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

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
          <Button variant="ghost" onClick={() => setProductModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editingProduct ? "Save Changes" : "Add to Catalog"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
