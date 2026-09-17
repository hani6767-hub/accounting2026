import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Printer,
  Copy,
  Check,
  X,
  User,
  Phone,
  Calendar,
  CreditCard,
  Banknote,
  Receipt,
  Share2,
  Plus
} from 'lucide-react';
import { SaleTransactionEntity } from '../../types';
import { formatMoney, DEFAULT_CURRENCY_CODE } from '../../utils/currency';

interface SaleSuccessModalProps {
  transaction: SaleTransactionEntity;
  currencyCode?: string;
  onDismiss: () => void;
  onRecordAnotherSale?: () => void;
}

export const SaleSuccessModal: React.FC<SaleSuccessModalProps> = ({
  transaction,
  currencyCode = DEFAULT_CURRENCY_CODE,
  onDismiss,
  onRecordAnotherSale
}) => {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(transaction.timestamp).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(transaction.timestamp).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Generate clean text receipt for sharing or printing
  const generateReceiptText = () => {
    return `🧾 إيصال مبيعات - بيت المحاسبة
-------------------------------
الخدمة / الصنف: ${transaction.itemName}
الكمية: ${transaction.quantity}
سعر الوحدة: ${formatMoney(transaction.unitPrice, currencyCode)}
الإجمالي: ${formatMoney(transaction.totalAmount, currencyCode)}
طريقة الدفع: ${transaction.isDebt ? `دَين (العميل: ${transaction.customerName})` : 'نقداً'}
${transaction.customerPhone ? `هاتف العميل: ${transaction.customerPhone}\n` : ''}التاريخ: ${formattedDate} - ${formattedTime}
البائع: ${transaction.recordedByUserName || 'الكاشير'}
رقم الحركة: #${transaction.id}
-------------------------------
شكراً لتعاملكم معنا!`;
  };

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(generateReceiptText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareReceipt = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `إيصال مبيعات #${transaction.id}`,
          text: generateReceiptText()
        })
        .catch(() => {});
    } else {
      handleCopyReceipt();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="sale_success_modal"
        className="w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-5 sm:p-6 overflow-y-auto">
          {/* Success Banner */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-slate-800">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-100">
              تم تسجيل حركة البيع بنجاح!
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              تم تحديث السجلات المالية وصندوق النقدية فوراً
            </p>
          </div>

          {/* Amount Showcase Card */}
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 flex flex-col items-center justify-center text-center shadow-inner">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              المبلغ الإجمالي المحسوب
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {formatMoney(transaction.totalAmount, currencyCode)}
            </span>
            <div className="mt-2 flex items-center gap-1.5">
              {transaction.isDebt ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>دَين غير مسدد على ({transaction.customerName})</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5" />
                  <span>مقبوض نقداً (واصل في الصندوق)</span>
                </span>
              )}
            </div>
          </div>

          {/* Receipt Breakdown Details */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850 text-slate-300">
              <span className="text-slate-400">الخدمة / المنتج:</span>
              <span className="font-bold text-slate-100">{transaction.itemName}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">الكمية المباعة:</span>
              <span className="font-bold text-slate-200">{transaction.quantity} وحدة</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">سعر الوحدة:</span>
              <span className="font-semibold text-slate-200">
                {formatMoney(transaction.unitPrice, currencyCode)}
              </span>
            </div>

            {transaction.customerName && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">اسم الزبون:</span>
                <span className="font-bold text-cyan-300">{transaction.customerName}</span>
              </div>
            )}

            {transaction.customerPhone && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">هاتف الزبون:</span>
                <span className="font-mono text-slate-200">{transaction.customerPhone}</span>
              </div>
            )}

            {transaction.note && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">ملاحظات:</span>
                <span className="text-slate-300 text-[11px] truncate max-w-[200px]">
                  {transaction.note}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-slate-400 text-[11px]">
              <span>التاريخ والوقت:</span>
              <span className="font-mono text-slate-300">
                {formattedDate} | {formattedTime}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>المسؤول / البائع:</span>
              <span className="font-semibold text-slate-300">
                {transaction.recordedByUserName || 'الكاشير'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareReceipt}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition min-h-[42px]"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>مشاركة الإيصال</span>
              </button>

              <button
                type="button"
                onClick={handleCopyReceipt}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition min-h-[42px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-400" />
                    <span>نسخ الوصل</span>
                  </>
                )}
              </button>
            </div>

            {onRecordAnotherSale && (
              <button
                type="button"
                onClick={() => {
                  onDismiss();
                  onRecordAnotherSale();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل بيعة جديدة أخرى</span>
              </button>
            )}

            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition min-h-[40px]"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
