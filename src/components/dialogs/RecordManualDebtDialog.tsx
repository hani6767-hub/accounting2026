import React, { useState } from 'react';
import { CreditCard, X, DollarSign } from 'lucide-react';

interface RecordManualDebtDialogProps {
  currencyCode?: string;
  onDismiss: () => void;
  onConfirm: (
    customerName: string,
    customerPhone: string,
    amount: number,
    note: string
  ) => void;
}

export const RecordManualDebtDialog: React.FC<RecordManualDebtDialogProps> = ({
  currencyCode = 'SYP',
  onDismiss,
  onConfirm
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!customerName.trim()) {
      setError('يرجى إدخال اسم العميل');
      return;
    }
    if (!parsed || parsed <= 0) {
      setError('يرجى إدخال مبلغ دَين صحيح أكبر من الصفر');
      return;
    }

    onConfirm(customerName.trim(), customerPhone.trim(), parsed, note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  تسجيل دَين عميل جديد
                </h3>
                <p className="text-xs text-slate-400">
                  قيد مالي مباشر خارج مبيعات المنتجات
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
                اسم العميل *
              </label>
              <input
                type="text"
                required
                placeholder="اسم العميل أو المؤسسة..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                مبلغ الدَّين ({currencyCode === 'SYP' ? 'ل.س' : currencyCode}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-rose-400 focus:outline-none focus:border-rose-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                رقم هاتف العميل (اختياري)
              </label>
              <input
                type="tel"
                dir="ltr"
                placeholder="05xxxxxxxx"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 text-left min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                السبب أو البيان (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: رصيد سابق، خدمات صيانة، دفعة مؤجلة..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 min-h-[40px]"
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
                className="flex-[2] py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md transition min-h-[44px]"
              >
                تسجيل الدَّين
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
