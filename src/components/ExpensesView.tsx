import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Utensils,
  Zap,
  Briefcase,
  Home,
  Tag
} from 'lucide-react';
import { ExpenseEntity } from '../types';
import { formatMoney } from '../utils/currency';

interface ExpensesViewProps {
  expenses: ExpenseEntity[];
  totalExpenses: number;
  currencyCode?: string;
  onRequestAddExpense: () => void;
  onDeleteExpense: (id: number) => void;
}

export const EXPENSE_CATEGORIES = [
  'رواتب وأجور',
  'طعام وضيافة',
  'كهرباء ومياه',
  'مشتريات ولوازم',
  'إيجار ومصاريف مقر',
  'أخرى'
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  totalExpenses,
  currencyCode = 'SYP',
  onRequestAddExpense,
  onDeleteExpense
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseEntity | null>(null);

  const filteredExpenses = useMemo(() => {
    if (!selectedCategory) return expenses;
    return expenses.filter(
      e => e.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [expenses, selectedCategory]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }, [expenses]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(expenses.map(e => e.category)));
  }, [expenses]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header Summary Card */}
      <div className="w-full rounded-2xl bg-amber-950/30 border border-amber-500/30 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-amber-300">
              إجمالي المصاريف المسجلة
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5">
              {formatMoney(totalExpenses, currencyCode)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              تكاليف تشغيل ورواتب مستقطعة من المقبوضات النقدية
            </div>
          </div>

          <button
            id="add_expense_button"
            type="button"
            onClick={onRequestAddExpense}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow transition min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل قيد مصروف</span>
          </button>
        </div>

        {/* Category Breakdown Badges */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3.5 pt-3 border-t border-amber-500/20">
            {Object.entries(categoryTotals).map(([cat, amt]) => (
              <div
                key={cat}
                className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-xs flex items-center gap-1.5"
              >
                <span className="text-slate-400">{cat}:</span>
                <span className="font-bold text-amber-300">{formatMoney(amt as number, currencyCode)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      {uniqueCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition min-h-[36px] ${
              selectedCategory === null
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            جميع المصاريف ({expenses.length})
          </button>
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition min-h-[36px] ${
                selectedCategory === cat
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-800/40 rounded-2xl border border-slate-800 p-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-700/40 text-slate-500 flex items-center justify-center mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <div className="text-base font-bold text-slate-200">
            لا توجد مصاريف مسجلة
          </div>
          <div className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            اضغط على "تسجيل قيد مصروف" لإضافة تكاليف الرواتب، الإيجار، الكهرباء، أو المشتريات لخصمها من صافي الأرباح
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredExpenses.map(expense => {
            const dateStr = new Date(expense.timestamp).toLocaleDateString(
              'ar-EG',
              {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }
            );

            return (
              <div
                key={expense.id}
                className="w-full rounded-2xl bg-slate-800/80 border border-slate-700/60 p-4 flex items-center justify-between gap-3 shadow-sm hover:border-slate-600 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      {expense.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-700/80 text-amber-300 font-semibold">
                        {expense.category}
                      </span>
                      <span>•</span>
                      <span>{dateStr}</span>
                    </div>
                    {expense.note && (
                      <p className="text-xs text-slate-400 mt-1">
                        {expense.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-base sm:text-lg font-black text-rose-400">
                    -{formatMoney(expense.amount, currencyCode)}
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpenseToDelete(expense)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                    title="حذف المصروف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Expense Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">
              حذف قيد المصروف
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              هل أنت متأكد من حذف مصروف <strong className="text-amber-400">{expenseToDelete.title}</strong> بقيمة ${expenseToDelete.amount.toFixed(2)}؟
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition min-h-[44px]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteExpense(expenseToDelete.id);
                  setExpenseToDelete(null);
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
