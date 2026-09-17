import React, { useState } from 'react';
import { Package, X, Check, Tag, Sparkles } from 'lucide-react';
import { ItemEntity } from '../../types';
import { COLOR_PALETTE } from '../../utils/colors';

interface AddItemDialogProps {
  initialItem?: ItemEntity | null;
  currencyCode?: string;
  onDismiss: () => void;
  onConfirm: (
    name: string,
    category: string,
    unitPrice: number,
    colorHex: string,
    sku: string,
    description: string
  ) => void;
}

export const COMMON_CATEGORIES = [
  'خدمات',
  'خدمات واستشارات',
  'صيانة ودعم فني',
  'اشتراكات وباقات',
  'بضائع ومنتجات',
  'مشروبات',
  'مأكولات',
  'أخرى'
];

export const AddItemDialog: React.FC<AddItemDialogProps> = ({
  initialItem,
  currencyCode = 'SYP',
  onDismiss,
  onConfirm
}) => {
  const isEditing = !!initialItem;

  const [name, setName] = useState(initialItem?.name || '');
  const [category, setCategory] = useState(initialItem?.category || 'خدمات');
  const [unitPrice, setUnitPrice] = useState(initialItem ? initialItem.unitPrice.toString() : '');
  const [colorHex, setColorHex] = useState(initialItem?.colorHex || COLOR_PALETTE[0]);
  const [sku, setSku] = useState(initialItem?.sku || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [error, setError] = useState<string | null>(null);

  const handleSelectCategory = (cat: string) => {
    setCategory(cat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الخدمة أو المنتج');
      return;
    }
    const parsedPrice = parseFloat(unitPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('يرجى إدخال سعر صحيح');
      return;
    }

    onConfirm(
      name.trim(),
      category.trim() || 'خدمات',
      parsedPrice,
      colorHex,
      sku.trim(),
      description.trim()
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-from-bottom-6 duration-200">
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                style={{ backgroundColor: colorHex }}
              >
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {isEditing ? 'تعديل بيانات الخدمة أو المنتج' : 'إضافة خدمة أو منتج جديد'}
                </h3>
                <p className="text-xs text-slate-400">
                  تحديد اسم البند، التصنيف (خدمات)، وسعر البيع
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                اسم الخدمة / المنتج *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: خدمة برمجة، صيانة، استشارة، تصميم..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                سعر البيع / تقديم الخدمة ({currencyCode === 'SYP' ? 'ل.س' : currencyCode}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={unitPrice}
                onChange={e => setUnitPrice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 min-h-[44px]"
              />
            </div>

            {/* Category Selection with prominent Services (خدمات) options */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  نوع البند / التصنيف *
                </label>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  التصنيف الأساسي: خدمات
                </span>
              </div>

              {/* Quick select pills */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_CATEGORIES.map(cat => {
                  const isSelected = category === cat;
                  const isServices = cat === 'خدمات';
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 min-h-[34px] ${
                        isSelected
                          ? isServices
                            ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                            : 'bg-cyan-600 text-white shadow-sm'
                          : isServices
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {isServices && <Tag className="w-3 h-3 text-emerald-300" />}
                      <span>{cat}</span>
                      {isSelected && <Check className="w-3 h-3 ms-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Editable input / custom category field */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="أو اكتب تصنيفاً مخصصاً هنا..."
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[38px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                لون التمييز في المخطط الدائري
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {COLOR_PALETTE.map(hex => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColorHex(hex)}
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition-all ${
                      colorHex === hex ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {colorHex === hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                رمز البند / الكود SKU (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: SRV-01 أو ITEM-101"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الوصف (اختياري)
              </label>
              <textarea
                rows={2}
                placeholder="تفاصيل مختصرة عن الخدمة أو المنتج..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={onDismiss}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition min-h-[44px]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition min-h-[44px]"
              >
                {isEditing ? 'حفظ التعديلات' : 'إضافة الخدمة / المنتج'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
