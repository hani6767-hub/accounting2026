import React, { useState } from 'react';
import { KeyRound, Check, AlertCircle, X, Shield, ArrowRight } from 'lucide-react';
import { UserEntity } from '../../types';

interface ConnectWithCodeDialogProps {
  users: UserEntity[];
  currentUserId: string;
  onConnectSuccess: (user: UserEntity) => void;
  onDismiss: () => void;
}

export const ConnectWithCodeDialog: React.FC<ConnectWithCodeDialogProps> = ({
  users,
  currentUserId,
  onConnectSuccess,
  onDismiss
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentUser = users.find(u => u.id === currentUserId);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('يرجى كتابة أو لصق رمز الربط الممنوح لك من المالك');
      return;
    }

    const matchedUser = users.find(
      u => u.connectionCode.trim().toUpperCase() === cleanCode
    );

    if (!matchedUser) {
      setError('رمز الربط غير صالح أو غير مسجل في النظام. تأكد من صحة الرمز من المالك.');
      return;
    }

    if (matchedUser.status === 'SUSPENDED') {
      setError(`عذراً، تم تجميد وتقييد وصول حساب (${matchedUser.name}) من قبل المالك.`);
      return;
    }

    onConnectSuccess(matchedUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  ربط الحساب برمز الدخول
                </h3>
                <p className="text-xs text-slate-400">
                  اتصال موظف أو كاشير بصلاحيات مخصصة
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Connected User indicator */}
          {currentUser && (
            <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300">المتصل حالياً:</span>
                <span className="text-xs font-bold text-slate-100">{currentUser.name}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold">
                {currentUser.role === 'OWNER' ? 'المدير العام' : currentUser.role === 'CASHIER' ? 'كاشير' : 'محاسب'}
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleConnect} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رمز الربط الفريد (Connection Code)
              </label>
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: AH-8492-XP أو OWNER-7788"
                  value={code}
                  onChange={e => {
                    setCode(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-center text-base sm:text-lg font-mono font-bold tracking-widest text-emerald-400 uppercase placeholder:text-slate-600 focus:outline-none min-h-[48px]"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                اطلب رمز الربط المخصص لك من مالك المتجر، حيث يحدد هذا الرمز صلاحياتك في تسجيل المبيعات أو رؤية الأرباح.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onDismiss}
                className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold transition min-h-[44px]"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg transition min-h-[44px]"
              >
                <Check className="w-4 h-4" />
                <span>اتصال بالحساب الآن</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
