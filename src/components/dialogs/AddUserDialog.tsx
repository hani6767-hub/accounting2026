import React, { useState } from 'react';
import {
  UserPlus,
  KeyRound,
  Shield,
  Check,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Sliders,
  DollarSign,
  ShoppingCart,
  Package,
  Receipt,
  Trash2,
  Users
} from 'lucide-react';
import { UserEntity, UserRole, UserPermissions } from '../../types';
import { generateConnectionCode, getDefaultPermissionsForRole } from '../../utils/storage';

interface AddUserDialogProps {
  initialUser?: UserEntity | null;
  onDismiss: () => void;
  onConfirm: (
    name: string,
    email: string,
    phone: string,
    role: UserRole,
    connectionCode: string,
    permissions: UserPermissions
  ) => void;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  initialUser,
  onDismiss,
  onConfirm
}) => {
  const [name, setName] = useState(initialUser?.name || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [phone, setPhone] = useState(initialUser?.phone || '');
  const [role, setRole] = useState<UserRole>(initialUser?.role || 'CASHIER');
  const [connectionCode, setConnectionCode] = useState(
    initialUser?.connectionCode || generateConnectionCode()
  );

  const [permissions, setPermissions] = useState<UserPermissions>(
    initialUser?.permissions || getDefaultPermissionsForRole('CASHIER')
  );

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole !== 'CUSTOM') {
      setPermissions(getDefaultPermissionsForRole(newRole));
    }
  };

  const togglePermission = (key: keyof UserPermissions) => {
    setRole('CUSTOM');
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleRegenerateCode = () => {
    setConnectionCode(generateConnectionCode());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm(
      name.trim(),
      email.trim(),
      phone.trim(),
      role,
      connectionCode.trim().toUpperCase(),
      permissions
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-5 sm:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {initialUser ? 'تعديل بيانات وصلاحيات المستخدم' : 'إضافة مستخدم وتوليد رمز ربط'}
                </h3>
                <p className="text-xs text-slate-400">
                  تحديد مستوى الصلاحيات وتقييد الوصول حسب رغبة المالك
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

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            {/* User Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اسم المستخدم / الموظف <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: صالح الكاشير، أحمد المحاسب"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none min-h-[44px]"
              />
            </div>

            {/* Email / Phone optional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="employee@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none min-h-[44px] text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رقم الهاتف (اختياري)
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none min-h-[44px] text-left"
                />
              </div>
            </div>

            {/* Connection Code Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  رمز الربط الخاص بالمستخدم (Connection Code)
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  title="توليد رمز جديد عشوائي"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>توليد كود جديد</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={connectionCode}
                  onChange={e => setConnectionCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono font-bold tracking-wider text-amber-400 focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                يقوم الموظف بإدخال هذا الرمز عند فتح التطبيق لربط جهازه بالمتجر وفق الصلاحيات المحددة له.
              </p>
            </div>

            {/* Role Preset Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                نوع الحساب والدور الافتراضي:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('CASHIER')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 min-h-[50px] justify-center ${
                    role === 'CASHIER'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>كاشير (مبيعات فقط)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('ACCOUNTANT')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 min-h-[50px] justify-center ${
                    role === 'ACCOUNTANT'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>محاسب مالي</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('VIEWER')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 min-h-[50px] justify-center ${
                    role === 'VIEWER'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>مشاهد فقط</span>
                </button>
              </div>
            </div>

            {/* Granular Permission Toggles (Limit Access) */}
            <div className="border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  تخصيص وتقييد الصلاحيات الفردية:
                </span>
                {role === 'CUSTOM' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    صلاحيات مخصصة
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* View Profit */}
                <button
                  type="button"
                  onClick={() => togglePermission('canViewProfits')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition min-h-[44px] ${
                    permissions.canViewProfits
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 shrink-0" />
                    <span>رؤية صافي الأرباح</span>
                  </div>
                  {permissions.canViewProfits ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {/* Record Sales */}
                <button
                  type="button"
                  onClick={() => togglePermission('canRecordSales')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition min-h-[44px] ${
                    permissions.canRecordSales
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    <span>تسجيل المبيعات</span>
                  </div>
                  {permissions.canRecordSales ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {/* Manage Items */}
                <button
                  type="button"
                  onClick={() => togglePermission('canManageItems')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition min-h-[44px] ${
                    permissions.canManageItems
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 shrink-0" />
                    <span>إضافة وتعديل المنتجات</span>
                  </div>
                  {permissions.canManageItems ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {/* Manage Debts */}
                <button
                  type="button"
                  onClick={() => togglePermission('canManageDebts')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition min-h-[44px] ${
                    permissions.canManageDebts
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>تسجيل وتسديد الديون</span>
                  </div>
                  {permissions.canManageDebts ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {/* Manage Expenses */}
                <button
                  type="button"
                  onClick={() => togglePermission('canManageExpenses')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition min-h-[44px] ${
                    permissions.canManageExpenses
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 shrink-0" />
                    <span>قيد وإدارة المصاريف</span>
                  </div>
                  {permissions.canManageExpenses ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {/* Delete Records */}
                <button
                  type="button"
                  onClick={() => togglePermission('canDeleteRecords')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition min-h-[44px] ${
                    permissions.canDeleteRecords
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span>حذف أو إلغاء الحركات</span>
                  </div>
                  {permissions.canDeleteRecords ? (
                    <Check className="w-4 h-4 text-rose-400" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onDismiss}
                className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold transition min-h-[44px]"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg transition min-h-[44px]"
              >
                <Check className="w-4 h-4" />
                <span>{initialUser ? 'حفظ التعديلات' : 'إنشاء وتفعيل المستخدم'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
