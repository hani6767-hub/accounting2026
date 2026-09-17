import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  Phone,
  Receipt,
  UserCheck
} from 'lucide-react';
import { CustomerDebtSummary } from '../types';
import { formatMoney } from '../utils/currency';

interface CustomerDebtsViewProps {
  customerSummaries: CustomerDebtSummary[];
  totalUnpaidDebts: number;
  currencyCode?: string;
  onSelectCustomer: (customer: CustomerDebtSummary) => void;
  onSettleAllDebtsForCustomer: (customerName: string) => void;
  onRequestAddDebt: () => void;
}

export const CustomerDebtsView: React.FC<CustomerDebtsViewProps> = ({
  customerSummaries,
  totalUnpaidDebts,
  currencyCode = 'SYP',
  onSelectCustomer,
  onSettleAllDebtsForCustomer,
  onRequestAddDebt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlyUnpaid, setFilterOnlyUnpaid] = useState(true);

  const filteredList = customerSummaries.filter(summary => {
    const matchesSearch =
      summary.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.customerPhone.includes(searchQuery);
    const matchesFilter = filterOnlyUnpaid ? summary.totalUnpaidDebt > 0 : true;
    return matchesSearch && matchesFilter;
  });

  const activeDebtorsCount = customerSummaries.filter(s => s.totalUnpaidDebt > 0).length;
  const totalSettledAll = customerSummaries.reduce((sum, s) => sum + s.totalSettledDebt, 0);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* KPI Header Card */}
      <div className="w-full rounded-2xl bg-rose-950/30 border border-rose-500/30 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-rose-300">
              إجمالي ديون الزبائن المعلقة
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-0.5">
              {formatMoney(totalUnpaidDebts, currencyCode)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              مبالغ آجلة معلقة لدى الزبائن لم يتم تحصيلها بعد
            </div>
          </div>

          <button
            id="add_debt_button"
            type="button"
            onClick={onRequestAddDebt}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow transition min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل دَين جديد</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-rose-500/20">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-2.5 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              الزبائن المدينون
            </span>
            <span className="text-xs font-bold text-rose-400">
              {activeDebtorsCount} عميل
            </span>
          </div>

          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-2.5 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              الديون المسددة سابقاً
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {formatMoney(totalSettledAll, currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
          <input
            type="text"
            placeholder="بحث بالاسم أو برقم هاتف العميل..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-2.5 ps-10 pe-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 min-h-[44px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
          <button
            type="button"
            onClick={() => setFilterOnlyUnpaid(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition min-h-[40px] text-center ${
              filterOnlyUnpaid
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:bg-slate-700/60'
            }`}
          >
            المعلقة فقط
          </button>
          <button
            type="button"
            onClick={() => setFilterOnlyUnpaid(false)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition min-h-[40px] text-center ${
              !filterOnlyUnpaid
                ? 'bg-slate-700 text-slate-100 border border-slate-600'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:bg-slate-700/60'
            }`}
          >
            جميع الزبائن ({customerSummaries.length})
          </button>
        </div>
      </div>

      {/* List of Customers */}
      {filteredList.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-800/40 rounded-2xl border border-slate-800 p-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-700/40 text-slate-500 flex items-center justify-center mb-3">
            <CreditCard className="w-7 h-7" />
          </div>
          <div className="text-base font-bold text-slate-200">
            لا توجد ديون مسجلة مطابقة
          </div>
          <div className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            يمكنك تسجيل ديون للزبائن بالضغط على "تسجيل دَين جديد" أو تفعيل خيار "دَين آجل" عند إتمام أي عملية بيع
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredList.map(summary => {
            const hasUnpaid = summary.totalUnpaidDebt > 0;
            return (
              <div
                key={summary.customerName}
                onClick={() => onSelectCustomer(summary)}
                className="w-full rounded-2xl bg-slate-800/80 border border-slate-700/60 p-4 hover:bg-slate-700/60 cursor-pointer transition shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-slate-100">
                        {summary.customerName}
                      </span>
                      {hasUnpaid ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {summary.unpaidCount} فواتير معلقة
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          تم إبراء الذمة بالكامل
                        </span>
                      )}
                    </div>

                    {summary.customerPhone && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span dir="ltr">{summary.customerPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-left shrink-0">
                    <div
                      className={`text-base sm:text-lg font-black ${
                        hasUnpaid ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatMoney(summary.totalUnpaidDebt, currencyCode)}
                    </div>
                    {summary.totalSettledDebt > 0 && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        سدد سابقاً: {formatMoney(summary.totalSettledDebt, currencyCode)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    إجمالي الفواتير: {summary.transactions.length}
                  </span>

                  <div className="flex items-center gap-2">
                    {hasUnpaid && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSettleAllDebtsForCustomer(summary.customerName);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition min-h-[36px]"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>تسديد الكل</span>
                      </button>
                    )}

                    <span className="text-xs font-semibold text-rose-400 hover:text-rose-300">
                      عرض الفواتير ←
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
