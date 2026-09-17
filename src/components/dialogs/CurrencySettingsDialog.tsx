import React, { useState } from 'react';
import {
  Coins,
  Check,
  X,
  Globe,
  ArrowRightLeft,
  Sparkles,
  Server,
  TrendingUp,
  Save
} from 'lucide-react';
import {
  SUPPORTED_CURRENCIES,
  AppCurrencySettings,
  CurrencyInfo,
  formatMoney
} from '../../utils/currency';

interface CurrencySettingsDialogProps {
  settings: AppCurrencySettings;
  onSaveSettings: (settings: AppCurrencySettings) => void;
  onDismiss: () => void;
}

export const CurrencySettingsDialog: React.FC<CurrencySettingsDialogProps> = ({
  settings,
  onSaveSettings,
  onDismiss
}) => {
  const [selectedPrimary, setSelectedPrimary] = useState<string>(
    settings.primaryCurrency || 'SYP'
  );
  const [selectedSecondary, setSelectedSecondary] = useState<string>(
    settings.secondaryCurrency || 'USD'
  );
  const [exchangeRate, setExchangeRate] = useState<number>(
    settings.exchangeRate || 15000
  );
  const [showDualCurrency, setShowDualCurrency] = useState<boolean>(
    settings.showDualCurrency || false
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      primaryCurrency: selectedPrimary,
      secondaryCurrency: selectedSecondary,
      exchangeRate: Number(exchangeRate) || 1,
      showDualCurrency
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onDismiss();
    }, 1200);
  };

  const sampleAmount = 100000;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-5 sm:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>إعدادات العملات والحفظ على الخادم</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    حفظ سحابي
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  الليرة السورية هي العملة الأساسية مع إمكانية التبديل لأي عملة أخرى
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

          {/* Success Banner */}
          {isSaved && (
            <div className="mt-3.5 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>تم حفظ وضبط العملة بنجاح على الخادم والواجهة!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
            {/* Live Preview Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-400">معاينة عرض المبالغ:</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5 font-mono">
                  {formatMoney(sampleAmount, selectedPrimary)}
                </div>
              </div>

              {showDualCurrency && (
                <div className="text-left border-s border-slate-800 ps-3">
                  <div className="text-[11px] font-semibold text-slate-400">بالعملة الثانوية:</div>
                  <div className="text-sm font-bold text-cyan-300 mt-0.5 font-mono">
                    {formatMoney(sampleAmount / (exchangeRate || 1), selectedSecondary)}
                  </div>
                </div>
              )}
            </div>

            {/* Main Currency Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
                <span>العملة الرئيسية للتطبيق والمبيعات:</span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {selectedPrimary === 'SYP' ? '🇸🇾 الليرة السورية (الافتراضية)' : ''}
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[190px] overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                {SUPPORTED_CURRENCIES.map(curr => {
                  const isSelected = selectedPrimary === curr.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => setSelectedPrimary(curr.code)}
                      className={`p-2.5 rounded-xl text-start border transition flex items-center gap-2 min-h-[46px] ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold shadow-xs'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-lg shrink-0">{curr.flag}</span>
                      <div className="truncate">
                        <div className="text-xs truncate font-bold flex items-center gap-1">
                          <span>{curr.symbol}</span>
                          <span className="text-[10px] text-slate-400">({curr.code})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {curr.name.replace(' (العملة الأساسية)', '')}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-400 ms-auto shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Dual / Secondary Currency */}
            <div className="border-t border-slate-800 pt-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">
                    تفعيل عملة ثانوية مع سعر الصرف
                  </span>
                  <span className="text-[11px] text-slate-400">
                    عرض المبالغ المحولة تلقائياً بالدولار أو عملة إضافية
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDualCurrency(!showDualCurrency)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                    showDualCurrency ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {showDualCurrency && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      العملة الإضافية (Secondary):
                    </label>
                    <select
                      value={selectedSecondary}
                      onChange={e => setSelectedSecondary(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {SUPPORTED_CURRENCIES.filter(c => c.code !== selectedPrimary).map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      سعر الصرف (1 {selectedSecondary} = كم {selectedPrimary}؟):
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={exchangeRate}
                      onChange={e => setExchangeRate(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Server persistence notice */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                يتم حفظ اختيار العملة وسعر الصرف تلقائياً على خادم النظام والتطبيق.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onDismiss}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition min-h-[44px]"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>حفظ وضبط العملة الآن</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
