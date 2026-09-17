import React, { useState, useMemo } from 'react';
import {
  Zap,
  ShoppingCart,
  Search,
  Sparkles,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { ItemEntity, ItemSalesSummary } from '../types';
import { formatMoney, DEFAULT_CURRENCY_CODE } from '../utils/currency';
import { getItemColor } from '../utils/colors';

interface OverviewServicesPanelProps {
  items: ItemEntity[];
  itemSummaries: ItemSalesSummary[];
  currencyCode?: string;
  canRecordSales: boolean;
  onQuickSale: (item: ItemEntity) => void;
  onOpenSaleDialog: (item: ItemEntity) => void;
  onNavigateToItemsTab: () => void;
}

export const OverviewServicesPanel: React.FC<OverviewServicesPanelProps> = ({
  items,
  itemSummaries,
  currencyCode = DEFAULT_CURRENCY_CODE,
  canRecordSales,
  onQuickSale,
  onOpenSaleDialog,
  onNavigateToItemsTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Map item summaries by itemId for rapid lookup of sold count & revenue
  const summaryMap = useMemo(() => {
    const map = new Map<number, { unitsSold: number; totalRevenue: number }>();
    itemSummaries.forEach(s => {
      map.set(s.item.id, {
        unitsSold: s.unitsSold,
        totalRevenue: s.totalRevenue
      });
    });
    return map;
  }, [itemSummaries]);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [items, searchQuery, selectedCategory]);

  return (
    <div
      id="overview_services_panel"
      className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-lg flex flex-col gap-4"
    >
      {/* Header with Title & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                لوحة بيع الخدمات والمنتجات السريعة
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {items.length} خدمة
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تسجيل المبيعات مباشرة بنقرة واحدة مع إحصائيات عدد المرات المباعة لكل خدمة
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToItemsTab}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
        >
          <span>إدارة كافة الخدمات</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن خدمة أو منتج للبيع الفوري..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[40px]"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition min-h-[38px] ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              الكل ({items.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition min-h-[38px] ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Services Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
          <Package className="w-10 h-10 text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">
            {items.length === 0
              ? 'لا توجد خدمات مضافة حتى الآن'
              : 'لم يتم العثور على نتائج مطابقة للبحث'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {items.length === 0
              ? 'يمكنك إضافة خدمات ومنتجات جديدة لبدء البيع ومتابعة الإحصائيات'
              : 'جرب البحث بكلمة أخرى أو تصفح كافة التصنيفات'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredItems.map(item => {
            const summary = summaryMap.get(item.id) || { unitsSold: 0, totalRevenue: 0 };
            const isPopular = summary.unitsSold > 0;

            return (
              <div
                key={item.id}
                id={`overview_service_card_${item.id}`}
                className="group relative rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 p-3.5 flex flex-col justify-between gap-3 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {/* Top Service Details */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-xs shadow-xs"
                      style={{ backgroundColor: getItemColor(item.colorHex) }}
                    >
                      {item.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span className="truncate">{item.category}</span>
                        {item.sku && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            #{item.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div className="text-end shrink-0">
                    <div className="text-sm font-extrabold text-emerald-400">
                      {formatMoney(item.unitPrice, currencyCode)}
                    </div>
                    <span className="text-[10px] text-slate-500">سعر الوحدة</span>
                  </div>
                </div>

                {/* Sales Performance Stats Bar */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-slate-400 text-[11px]">عدد المرات المباعة:</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                        summary.unitsSold > 0
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {summary.unitsSold} {summary.unitsSold === 1 ? 'مرة' : 'مرات'}
                    </span>
                    {summary.totalRevenue > 0 && (
                      <span className="text-[11px] text-slate-400 font-semibold">
                        ({formatMoney(summary.totalRevenue, currencyCode)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Quick Sale 1x + Custom Sale */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => {
                      if (canRecordSales) {
                        onQuickSale(item);
                      }
                    }}
                    disabled={!canRecordSales}
                    className="py-2.5 px-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition min-h-[40px]"
                    title="بيع فوري نقداً بنقرة واحدة"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>بيع فوري 1x</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (canRecordSales) {
                        onOpenSaleDialog(item);
                      }
                    }}
                    disabled={!canRecordSales}
                    className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-750 disabled:opacity-50 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition min-h-[40px]"
                    title="تسجيل بيع مخصص (كمية / عميل / دين)"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-cyan-400" />
                    <span>بيع مخصص...</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
