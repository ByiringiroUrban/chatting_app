import React, { useState } from 'react';
import BusinessSidebar from '../../components/business/BusinessSidebar';
import NewProductModal from '../../components/business/NewProductModal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useBusinessStore } from '../../stores/businessStore';
import { useUiStore } from '../../stores/uiStore';
import { Plus, Edit2, Trash2, ShoppingBag, Send } from 'lucide-react';

export default function BusinessCatalogPage() {
  const { products, setProductModalOpen, deleteProduct, fetchBusinessData, isLoading } = useBusinessStore();
  const { showToast } = useUiStore();
  const [categoryFilter, setCategoryFilter] = useState('All');

  React.useEffect(() => {
    fetchBusinessData();
  }, []);

  const categories = ["All", "Food & Beverage", "Handicrafts & Art", "Digital Services", "Events & Tickets", "Accessories"];

  const filtered = products.filter(p => categoryFilter === 'All' || p.category === categoryFilter);

  const handleDelete = (id, name) => {
    deleteProduct(id);
    showToast(`Removed "${name}" from catalog`, "info");
  };

  const handleShareToChat = (product) => {
    showToast(`Shared "${product.name}" directly to customer chat!`, "success");
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
      <BusinessSidebar />
      <NewProductModal />

      <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-bg-dark p-3.5 sm:p-6 lg:p-8 select-none pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-brand-700 dark:text-teal-400" />
                Product & Service Catalog
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Prices displayed in Rwandan Francs (RWF). Easily share products in conversations.
              </p>
            </div>

            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setProductModalOpen(true)}
              className="self-start sm:self-auto"
            >
              Add New Product
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors active:scale-95 ${
                  categoryFilter === c
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Product Grid: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((prod) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 sm:h-44 w-full overflow-hidden relative">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      {prod.category}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {prod.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg font-black text-brand-700 dark:text-teal-400">
                        {prod.price?.toLocaleString()} RWF
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                        Stock: {prod.stock} units
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleShareToChat(prod)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 active:scale-95"
                    title="Send Product Card to Chat"
                  >
                    <Send className="w-3.5 h-3.5" /> Send to Chat
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setProductModalOpen(true, prod)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id, prod.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
