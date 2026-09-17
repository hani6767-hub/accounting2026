import React from 'react';
import {
  CreditCard,
  Phone,
  CheckCircle,
  X,
  Receipt,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react';
import { CustomerDebtSummary, SaleTransactionEntity } from '../../types';
import { formatMoney } from '../../utils/currency';

interface CustomerDebtDetailsDialogProps {
  summary: CustomerDebtSummary;
  currencyCode?: string;
  onSettleDebt: (id: number) => void;
  onSettleAll: (customerName: string) => void;
  onDismiss: () => void;
}

export const CustomerDebtDetailsDialog: React.FC<CustomerDebtDetailsDialogProps> = ({
  summary,
  currencyCode = 'SYP',
  onSettleDebt,
  onSettleAll,
  onDismiss
}) => {
  const hasUnpaid = summary.totalUnpaidDebt > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  {summary.customerName}
                </h3>
                {summary.customerPhone ? (
                  <a
                    href={`tel:${summary.customerPhone}`}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:underline mt-0.5"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{summary.customerPhone}</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">
                    لا يوجد رقم هاتف مسجل
                  </span>
                )}
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

          {/* Debt Totals Banner */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
              <div className="text-xs font-semibold text-rose-300">
                الديون المعلقة غير المسددة
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
                {formatMoney(summary.totalUnpaidDebt, currencyCode)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {summary.unpaidCount} فواتير آجلة
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <div className="text-xs font-semibold text-emerald-300">
                الديون المسددة سابقاً
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {formatMoney(summary.totalSettledDebt, currencyCode)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                محصلة بالكامل
              </div>
            </div>
          </div>

          {/* Settle All Action */}
          {hasUnpaid && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onSettleAll(summary.customerName)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow transition min-h-[44px]"
              >
                <UserCheck className="w-4 h-4" />
                <span>إبراء وتسديد كامل ديون العميل ({formatMoney(summary.totalUnpaidDebt, currencyCode)})</span>
              </button>
            </div>
          )}

          {/* Individual Transactions List */}
          <div className="mt-4">
            <div className="text-xs font-bold text-slate-300 mb-2">
              سجل فواتير وحركات العميل ({summary.transactions.length}):
            </div>

            <div className="flex flex-col gap-2">
              {summary.transactions.map((tx: SaleTransactionEntity) => {
                const dateStr = new Date(tx.timestamp).toLocaleDateString('ar-EG', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          {tx.itemName}
                        </span>
                        {tx.isSettled ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            مسدد
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            معلق
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1">
                        {tx.quantity}x @ {formatMoney(tx.unitPrice, currencyCode)} • {dateStr}
                      </div>

                      {tx.note && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {tx.note}
                        </div>
                      )}
                    </div>

                    <div className="text-left flex items-center gap-2">
                      <div className="text-sm font-black text-rose-400">
                        {formatMoney(tx.totalAmount, currencyCode)}
                      </div>

                      {!tx.isSettled && (
                        <button
                          type="button"
                          onClick={() => onSettleDebt(tx.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition min-h-[36px]"
                          title="تسديد الفاتورة"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تسديد</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition min-h-[44px]"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
