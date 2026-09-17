import React, { useState, useMemo } from 'react';
import {
  Search,
  Receipt,
  Trash2,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { SaleTransactionEntity } from '../types';
import { formatMoney } from '../utils/currency';

interface TransactionsLedgerProps {
  transactions: SaleTransactionEntity[];
  currencyCode?: string;
  onDeleteTransaction: (id: number) => void;
}

export const TransactionsLedger: React.FC<TransactionsLedgerProps> = ({
  transactions,
  currencyCode = 'SYP',
  onDeleteTransaction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CASH' | 'DEBT_UNPAID' | 'DEBT_SETTLED'>('ALL');
  const [txToDelete, setTxToDelete] = useState<SaleTransactionEntity | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        tx.itemName.toLowerCase().includes(q) ||
        tx.customerName.toLowerCase().includes(q) ||
        tx.customerPhone.includes(q) ||
        tx.note.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterType === 'CASH') return !tx.isDebt;
      if (filterType === 'DEBT_UNPAID') return tx.isDebt && !tx.isSettled;
      if (filterType === 'DEBT_SETTLED') return tx.isDebt && tx.isSettled;
      return true;
    });
  }, [transactions, searchQuery, filterType]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
          <input
            type="text"
            placeholder="بحث باسم المنتج، العميل، أو الملاحظات..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-2.5 ps-10 pe-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[44px]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition min-h-[36px] ${
              filterType === 'ALL'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            الكل ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('CASH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition min-h-[36px] ${
              filterType === 'CASH'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            نقدي فقط
          </button>
          <button
            type="button"
            onClick={() => setFilterType('DEBT_UNPAID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition min-h-[36px] ${
              filterType === 'DEBT_UNPAID'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            ديون معلقة
          </button>
          <button
            type="button"
            onClick={() => setFilterType('DEBT_SETTLED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition min-h-[36px] ${
              filterType === 'DEBT_SETTLED'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            ديون مسددة
          </button>
        </div>
      </div>

      {/* Ledger List */}
      {filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-800/40 rounded-2xl border border-slate-800 p-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-700/40 text-slate-500 flex items-center justify-center mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <div className="text-base font-bold text-slate-200">
            لا توجد حركات مبيعات مطابقة
          </div>
          <div className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            تظهر هنا جميع عمليات البيع النقدية والآجلة المسجلة في النظام مرتبة زمنياً
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(tx => {
            const dateStr = new Date(tx.timestamp).toLocaleDateString('ar-EG', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={tx.id}
                className="w-full rounded-2xl bg-slate-800/80 border border-slate-700/60 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-slate-600 transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.isDebt
                        ? tx.isSettled
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'bg-rose-500/15 text-rose-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {tx.isDebt ? (
                      tx.isSettled ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )
                    ) : (
                      <Receipt className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        {tx.itemName}
                      </span>

                      {tx.isDebt ? (
                        tx.isSettled ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            دَين مسدد
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            دَين معلق
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          نقدي
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      {tx.quantity} قطعة @ {formatMoney(tx.unitPrice, currencyCode)} • {dateStr}
                    </div>

                    {tx.customerName && (
                      <div className="text-xs text-slate-300 font-medium mt-1">
                        العميل: <span className="text-slate-100 font-bold">{tx.customerName}</span>
                        {tx.customerPhone && (
                          <span className="text-slate-400 ms-1" dir="ltr">
                            ({tx.customerPhone})
                          </span>
                        )}
                      </div>
                    )}

                    {tx.note && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {tx.note}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
                  <div className="text-right sm:text-left">
                    <div
                      className={`text-base sm:text-lg font-black ${
                        tx.isDebt && !tx.isSettled
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {formatMoney(tx.totalAmount, currencyCode)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTxToDelete(tx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                    title="حذف الحركة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">
              إلغاء وحذف حركة البيع
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              هل أنت متأكد من حذف حركة بيع <strong className="text-emerald-400">{txToDelete.itemName}</strong> بمبلغ ${txToDelete.totalAmount.toFixed(2)}؟ سيتم تعديل الحسابات تلقائياً.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition min-h-[44px]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(txToDelete.id);
                  setTxToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition min-h-[44px]"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
