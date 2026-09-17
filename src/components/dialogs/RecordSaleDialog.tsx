import React, { useState } from 'react';
import { ShoppingBag, Minus, Plus, CreditCard, X } from 'lucide-react';
import { ItemEntity } from '../../types';
import { formatMoney } from '../../utils/currency';

interface RecordSaleDialogProps {
  item: ItemEntity;
  currencyCode?: string;
  onDismiss: () => void;
  onConfirm: (
    quantity: number,
    unitPrice: number,
    note: string,
    isDebt: boolean,
    customerName: string,
    customerPhone: string
  ) => void;
}

export const RecordSaleDialog: React.FC<RecordSaleDialogProps> = ({
  item,
  currencyCode = 'SYP',
  onDismiss,
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(item.unitPrice.toString());
  const [note, setNote] = useState('');
  const [isDebt, setIsDebt] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parsedPrice = parseFloat(unitPrice) || 0;
  const total = quantity * parsedPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('يرجى تحديد كمية صحيحة (قطعة واحدة على الأقل)');
      return;
    }
    if (parsedPrice <= 0) {
      setError('يرجى إدخال سعر بيع صحيح');
      return;
    }
    if (isDebt && !customerName.trim()) {
      setError('يرجى كتابة اسم العميل عند تسجيل عملية بيع بالدَّين');
      return;
    }

    onConfirm(quantity, parsedPrice, note, isDebt, customerName, customerPhone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                style={{ backgroundColor: item.colorHex || '#10B981' }}
              >
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  تسجيل عملية بيع
                </h3>
                <p className="text-xs text-slate-400">
                  {item.name} • {item.category}
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

            {/* Quantity Stepper */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الكمية المباعة
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 flex items-center justify-center font-bold text-lg transition"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl text-center py-2.5 text-base font-bold text-slate-100 focus:outline-none focus:border-emerald-500 min-h-[44px]"
                />

                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 flex items-center justify-center font-bold text-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                سعر القطعة ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={e => setUnitPrice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 min-h-[44px]"
              />
            </div>

            {/* Payment Method Toggle: Cash vs Debt */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDebt ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-400'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      تسجيل كدَين آجل على العميل
                    </span>
                    <span className="text-[10px] text-slate-400">
                      لن يُضاف لصافي الربح حتى يتم تحصيله
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isDebt}
                  onChange={e => setIsDebt(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 text-rose-600 focus:ring-0 focus:ring-offset-0 bg-slate-900 cursor-pointer"
                />
              </label>

              {/* Debt Customer Fields */}
              {isDebt && (
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-col gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-rose-300 mb-1">
                      اسم العميل المدين *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: محمد الأحمد، شركة النور..."
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      رقم هاتف العميل (اختياري للتواصل)
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      placeholder="05xxxxxxxx"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 text-left min-h-[44px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ملاحظات إضافية (اختياري)
              </label>
              <input
                type="text"
                placeholder="ملاحظات على الطلب..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[40px]"
              />
            </div>

            {/* Total Summary */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                المجموع الإجمالي:
              </span>
              <span className={`text-xl font-black ${isDebt ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatMoney(total, currencyCode)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={onDismiss}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition min-h-[44px]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className={`flex-[2] py-3 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md transition min-h-[44px] ${
                  isDebt
                    ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
                }`}
              >
                {isDebt ? 'تسجيل كدَين معلق' : 'تأكيد وقبض نقدي'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
