import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  CreditCard,
  Receipt,
  Coins,
  ShoppingBag,
  Star,
  Lock
} from 'lucide-react';
import { playPopSound } from '../utils/audio';
import { formatMoney, DEFAULT_CURRENCY_CODE } from '../utils/currency';

interface MetricCardsProps {
  totalRevenue: number;
  totalCashRevenue: number;
  totalDebtsUnpaid: number;
  totalExpenses: number;
  realizedNetProfit: number;
  totalUnitsSold: number;
  avgOrderValue: number;
  topItemName: string | null;
  topItemRevenue: number;
  canViewProfits?: boolean;
  currencyCode?: string;
  onClickCalculateProfit: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalRevenue,
  totalCashRevenue,
  totalDebtsUnpaid,
  totalExpenses,
  realizedNetProfit,
  totalUnitsSold,
  avgOrderValue,
  topItemName,
  topItemRevenue,
  canViewProfits = true,
  currencyCode = DEFAULT_CURRENCY_CODE,
  onClickCalculateProfit
}) => {
  const isProfitPositive = realizedNetProfit >= 0;

  const handleProfitClick = () => {
    playPopSound();
    onClickCalculateProfit();
  };

  return (
    <div className="w-full flex flex-col gap-2.5 sm:gap-3">
      {/* Row 1: Realized Net Profit (Hero Card) */}
      {canViewProfits ? (
        <motion.div
          id="metric_realized_profit_card"
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`w-full rounded-2xl border p-4 sm:p-5 shadow-md relative overflow-hidden transition-colors ${
            isProfitPositive
              ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/40'
              : 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-900 border-rose-500/40'
          }`}
        >
          {/* Background Ambient Glow */}
          <div
            className={`absolute -right-12 -top-12 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none ${
              isProfitPositive ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isProfitPositive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isProfitPositive ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </motion.div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300">
                  صافي الأرباح النقدية الحالية في الصندوق
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
                    isProfitPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatMoney(realizedNetProfit, currencyCode)}
                </div>
              </div>
            </div>

            <button
              id="calculate_profit_button"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleProfitClick();
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/45 active:scale-95 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-bold shadow-xs transition min-h-[44px]"
            >
              <Calculator className="w-4 h-4" />
              <span>تفاصيل الحساب</span>
            </button>
          </div>

          {/* Subtitle breakdown */}
          <div className="mt-3.5 pt-3 border-t border-slate-700/40 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center justify-between sm:justify-start gap-1 text-slate-300 bg-slate-900/40 sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg">
              <span className="text-slate-400">المقبوض نقداً:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {formatMoney(totalCashRevenue, currencyCode)}
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-1 text-slate-300 bg-slate-900/40 sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg">
              <span className="text-slate-400">المصاريف المخصومة:</span>
              <span className="font-bold text-rose-400 font-mono">
                -{formatMoney(totalExpenses, currencyCode)}
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-1 text-amber-300 bg-slate-900/40 sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg">
              <span className="text-slate-400">ديون معلقة:</span>
              <span className="font-bold text-amber-400 font-mono">
                {formatMoney(totalDebtsUnpaid, currencyCode)} (غير محصلة)
              </span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 flex items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">
                صافي الأرباح والإحصائيات الحساسة
              </div>
              <div className="text-xs text-slate-500">
                تم تقييد رؤية الأرباح لهذا الحساب بواسطة مالك المتجر
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Debts & Expenses */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <motion.div
          id="metric_debts_card"
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600/80 p-3 sm:p-4 shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-400 truncate">
              ديون الزبائن المعلقة
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-lg sm:text-2xl font-black text-rose-400 truncate font-mono">
              {formatMoney(totalDebtsUnpaid, currencyCode)}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              مستبعدة من صافي الربح
            </div>
          </div>
        </motion.div>

        <motion.div
          id="metric_expenses_card"
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600/80 p-3 sm:p-4 shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-400 truncate">
              إجمالي المصاريف
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-lg sm:text-2xl font-black text-slate-100 truncate font-mono">
              {canViewProfits ? formatMoney(totalExpenses, currencyCode) : '••••'}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              رواتب وتكاليف تشغيل
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 3: Total Sales & Units Sold */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <motion.div
          id="metric_total_sales"
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600/80 p-3 sm:p-4 shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-400 truncate">
              إجمالي المبيعات
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-lg sm:text-2xl font-black text-emerald-400 truncate font-mono">
              {formatMoney(totalRevenue, currencyCode)}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              نقدي + ديون مسجلة
            </div>
          </div>
        </motion.div>

        <motion.div
          id="metric_units_sold"
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600/80 p-3 sm:p-4 shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-400 truncate">
              القطع المباعة
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-lg sm:text-2xl font-black text-blue-400 truncate">
              {totalUnitsSold} <span className="text-xs font-normal text-slate-400">قطعة</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              معدل الطلب: {formatMoney(avgOrderValue, currencyCode)}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 4: Top Product Banner */}
      {topItemName && (
        <motion.div
          id="metric_top_product_banner"
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-800/80 to-slate-800/80 border border-amber-500/25 p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="truncate">
              <div className="text-[11px] font-semibold text-amber-300">
                المنتج الأكثر مبيعاً
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                {topItemName}
              </div>
            </div>
          </div>
          <div className="text-left shrink-0">
            <div className="text-xs sm:text-sm font-black text-amber-300 font-mono">
              {formatMoney(topItemRevenue, currencyCode)}
            </div>
            <div className="text-[10px] text-slate-400">
              إجمالي مبيعاته
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
