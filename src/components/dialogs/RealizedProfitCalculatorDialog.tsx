import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Info,
  DollarSign,
  Receipt,
  CreditCard,
  X
} from 'lucide-react';
import { formatMoney } from '../../utils/currency';

interface RealizedProfitCalculatorDialogProps {
  totalRevenue: number;
  totalCashRevenue: number;
  totalUnpaidDebts: number;
  totalExpenses: number;
  realizedNetProfit: number;
  currencyCode?: string;
  onDismiss: () => void;
}

export const RealizedProfitCalculatorDialog: React.FC<RealizedProfitCalculatorDialogProps> = ({
  totalRevenue,
  totalCashRevenue,
  totalUnpaidDebts,
  totalExpenses,
  realizedNetProfit,
  currencyCode = 'SYP',
  onDismiss
}) => {
  const isProfitable = realizedNetProfit >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  isProfitable
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isProfitable ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  حساب الأرباح الفعلية الحالية
                </h3>
                <p className="text-xs text-slate-400">
                  (دون احتساب الديون غير المسددة)
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

          {/* Hero Net Profit Display */}
          <div
            className={`mt-4 p-4 rounded-2xl border text-center ${
              isProfitable
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
            }`}
          >
            <div className="text-xs font-semibold text-slate-300">
              صافي الربح الفعلي المحصل حالياً في الصندوق
            </div>
            <div
              className={`text-3xl sm:text-4xl font-black mt-1 ${
                isProfitable ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatMoney(realizedNetProfit, currencyCode)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {isProfitable
                ? 'سيولة نقدية حقيقية متوفرة بعد استقطاع كافة المصاريف'
                : 'عجز مالي مؤقت - المصاريف تفوق المقبوضات النقدية المحصلة'}
            </div>
          </div>

          {/* Equation Breakdown */}
          <div className="mt-4 flex flex-col gap-2.5">
            <div className="text-xs font-bold text-slate-300">
              معادلة الحساب المحاسبي الدقيق:
            </div>

            <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    المقبوضات النقدية المحصلة
                  </div>
                  <div className="text-[11px] text-slate-400">
                    المبالغ المدفوعة فوراً من الزبائن
                  </div>
                </div>
              </div>
              <div className="text-sm font-black text-emerald-400">
                +{formatMoney(totalCashRevenue, currencyCode)}
              </div>
            </div>

            <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    المصاريف والنفقات
                  </div>
                  <div className="text-[11px] text-slate-400">
                    رواتب ومشتريات وفواتير
                  </div>
                </div>
              </div>
              <div className="text-sm font-black text-rose-400">
                -{formatMoney(totalExpenses, currencyCode)}
              </div>
            </div>

            <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-3 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    ديون الزبائن المعلقة
                  </div>
                  <div className="text-[11px] text-slate-400">
                    مستبعدة من الربح حتى تسديدها
                  </div>
                </div>
              </div>
              <div className="text-sm font-black text-amber-400">
                ({formatMoney(totalUnpaidDebts, currencyCode)})
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-200 leading-relaxed">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>مبدأ المحاسبة النقدية الواقعية:</strong> لا نعتبر الديون الآجلة كأرباح حالية حتى يقبضها الصندوق فعلياً، لضمان دقة السيولة المالية لنشاطك التجاري وتجنب الأرباح الوهمية.
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-bold text-sm transition min-h-[44px]"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
