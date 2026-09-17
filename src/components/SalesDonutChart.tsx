import React, { useMemo } from 'react';
import { PieChart as PieIcon, X } from 'lucide-react';
import { ItemSalesSummary } from '../types';
import { formatMoney, DEFAULT_CURRENCY_CODE } from '../utils/currency';

interface SalesDonutChartProps {
  itemSummaries: ItemSalesSummary[];
  totalRevenue: number;
  totalUnitsSold: number;
  selectedSummary: ItemSalesSummary | null;
  currencyCode?: string;
  onSelectSummary: (summary: ItemSalesSummary | null) => void;
}

export const SalesDonutChart: React.FC<SalesDonutChartProps> = ({
  itemSummaries,
  totalRevenue,
  totalUnitsSold,
  selectedSummary,
  currencyCode = DEFAULT_CURRENCY_CODE,
  onSelectSummary
}) => {
  const activeSlices = useMemo(
    () => itemSummaries.filter(s => s.totalRevenue > 0),
    [itemSummaries]
  );

  // Calculate SVG arc paths for donut
  const slicesWithAngles = useMemo(() => {
    let currentAngle = 0;
    return activeSlices.map(slice => {
      const angle = (slice.percentageOfTotal / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;
      return {
        ...slice,
        startAngle,
        endAngle
      };
    });
  }, [activeSlices]);

  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div
      id="sales_donut_chart_card"
      className="w-full rounded-2xl bg-slate-800/80 border border-slate-700/60 p-4 sm:p-5 shadow-xs flex flex-col"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100">
              توزيع المبيعات بحسب المنتجات
            </h3>
            <p className="text-[11px] text-slate-400">
              نسبة ومساهمة كل صنف في إجمالي الإيرادات
            </p>
          </div>
        </div>

        {selectedSummary && (
          <button
            type="button"
            onClick={() => onSelectSummary(null)}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-700/60 px-2.5 py-1 rounded-lg transition min-h-[30px]"
          >
            <span>إلغاء التحديد</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {activeSlices.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          لا توجد مبيعات مسجلة حتى الآن لعرض المخطط البياني
        </div>
      ) : (
        <div className="flex flex-col items-center mt-4">
          {/* Visual SVG Donut */}
          <div className="relative w-[180px] h-[180px] flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#334155"
                strokeWidth={strokeWidth - 6}
              />

              {/* Segment Slices */}
              {slicesWithAngles.map(slice => {
                const strokeDasharray = `${(slice.percentageOfTotal / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((slice.startAngle / 360) * circumference);
                const isSelected = selectedSummary?.item.id === slice.item.id;

                return (
                  <circle
                    key={slice.item.id}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    onClick={() => {
                      if (isSelected) {
                        onSelectSummary(null);
                      } else {
                        onSelectSummary(slice);
                      }
                    }}
                  />
                );
              })}
            </svg>

            {/* Inner Center Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400">
                {selectedSummary ? selectedSummary.item.name : 'إجمالي المبيعات'}
              </span>
              <span className="text-sm sm:text-base font-black text-slate-100 tracking-tight font-mono">
                {formatMoney(
                  selectedSummary ? selectedSummary.totalRevenue : totalRevenue,
                  currencyCode
                )}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {selectedSummary
                  ? `${selectedSummary.percentageOfTotal.toFixed(1)}% من الإجمالي`
                  : `${totalUnitsSold} قطعة مباعة`}
              </span>
            </div>
          </div>

          {/* Interactive Legend Items List */}
          <div className="w-full mt-4 flex flex-col gap-2">
            <div className="text-xs font-bold text-slate-400 px-1">
              تفاصيل مساهمة المنتجات:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {slicesWithAngles.map(slice => {
                const isSelected = selectedSummary?.item.id === slice.item.id;
                return (
                  <div
                    key={slice.item.id}
                    onClick={() => {
                      if (isSelected) onSelectSummary(null);
                      else onSelectSummary(slice);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-700/80 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40'
                        : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: slice.color }}
                      />
                      <div className="truncate text-right">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {slice.item.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {slice.totalUnitsSold} مبيعات • {slice.item.category}
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="text-xs font-black text-emerald-400 font-mono">
                        {formatMoney(slice.totalRevenue, currencyCode)}
                      </div>
                      <div className="text-[10px] font-bold text-slate-300">
                        {slice.percentageOfTotal.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
