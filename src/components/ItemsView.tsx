import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Zap,
  ShoppingBag,
  Edit2,
  Trash2,
  Tag
} from 'lucide-react';
import { ItemEntity } from '../types';
import { formatMoney } from '../utils/currency';

interface ItemsViewProps {
  items: ItemEntity[];
  currencyCode?: string;
  onRequestAddItem: () => void;
  onEditItem: (item: ItemEntity) => void;
  onDeleteItem: (id: number) => void;
  onQuickSale: (item: ItemEntity) => void;
  onOpenSaleDialog: (item: ItemEntity) => void;
}

export const ItemsView: React.FC<ItemsViewProps> = ({
  items,
  currencyCode = 'SYP',
  onRequestAddItem,
  onEditItem,
  onDeleteItem,
  onQuickSale,
  onOpenSaleDialog
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ItemEntity | null>(null);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(items.map(i => i.category)));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q);
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-100">
            قائمة الخدمات والمنتجات
          </h2>
          <p className="text-xs text-slate-400">
            إجمالي الخدمات والمنتجات المسجلة: {items.length}
          </p>
        </div>

        <button
          id="add_item_button"
          type="button"
          onClick={onRequestAddItem}
          className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خدمة / منتج</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col gap-2.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
          <input
            type="text"
            placeholder="بحث باسم الخدمة أو المنتج، التصنيف، أو الكود..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/60 rounded-xl py-2.5 ps-10 pe-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[44px]"
          />
        </div>

        {uniqueCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition min-h-[36px] ${
                selectedCategory === null
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              الكل ({items.length})
            </button>
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition min-h-[36px] ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items Grid - mobile portrait single column with spacious full card layout */}
      {filteredItems.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-800/40 rounded-2xl border border-slate-800 p-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-700/40 text-slate-500 flex items-center justify-center mb-3">
            <Package className="w-7 h-7" />
          </div>
          <div className="text-base font-bold text-slate-200">
            لا توجد خدمات أو منتجات مسجلة حتى الآن
          </div>
          <div className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            اضغط على "إضافة خدمة / منتج" للبدء بإضافة الخدمات والاستشارات وتحديد أسعارها
          </div>
          <button
            type="button"
            onClick={onRequestAddItem}
            className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول خدمة</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="w-full rounded-2xl bg-slate-800/80 border border-slate-700/60 p-4 flex flex-col justify-between gap-3 shadow-sm hover:border-slate-600 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.colorHex || '#10B981' }}
                    />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-100 line-clamp-1">
                        {item.name}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <span className="text-base sm:text-lg font-black text-emerald-400 shrink-0">
                    {formatMoney(item.unitPrice, currencyCode)}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {item.sku && (
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    كود: {item.sku}
                  </div>
                )}
              </div>

              {/* Action Buttons - touch-friendly for portrait mobile */}
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onQuickSale(item)}
                    className="px-3 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/35 active:bg-emerald-600/50 text-emerald-300 border border-emerald-500/35 text-xs font-bold flex items-center gap-1.5 transition min-h-[40px]"
                    title="بيع فوري نقدي (1 قطعة)"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>بيع فوري</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenSaleDialog(item)}
                    className="px-3 py-2 rounded-xl bg-slate-700/70 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition min-h-[40px]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-300" />
                    <span>تخصيص البيع</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditItem(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                    title="تعديل المنتج"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                    title="حذف المنتج"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">
              حذف المنتج نهائياً
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              هل أنت متأكد من حذف <strong className="text-rose-400">{itemToDelete.name}</strong>؟ (لن يؤثر الحذف على سجل الحركات السابقة).
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition min-h-[44px]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition min-h-[44px]"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
