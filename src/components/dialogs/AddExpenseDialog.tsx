import React, { useState } from 'react';
import { Receipt, X } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../ExpensesView';

interface AddExpenseDialogProps {
  currencyCode?: string;
  onDismiss: () => void;
  onConfirm: (title: string, category: string, amount: number, note: string) => void;
}

export const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  currencyCode = 'SYP',
  onDismiss,
  onConfirm
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!title.trim()) {
      setError('يرجى كتابة عنوان أو بيان المصروف');
      return;
    }
    if (!parsed || parsed <= 0) {
      setError('يرجى إدخال مبلغ صحيح للمصروف');
      return;
    }

    onConfirm(title.trim(), category, parsed, note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  تسجيل قيد مصروف جديد
                </h3>
                <p className="text-xs text-slate-400">
                  خصم تلقائي من صافي أرباح الصندوق
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
                بيان المصروف *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: فاتورة كهرباء، راتب موظف، قهوة وضيافة..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المبلغ المستقطع ({currencyCode === 'SYP' ? 'ل.س' : currencyCode}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-amber-400 focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  نوع المصروف
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500 min-h-[44px]"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ملاحظات إضافية (اختياري)
              </label>
              <input
                type="text"
                placeholder="رقم الفاتورة، اسم المستفيد..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 min-h-[40px]"
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
                className="flex-[2] py-3 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md transition min-h-[44px]"
              >
                تسجيل المصروف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
