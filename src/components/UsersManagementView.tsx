import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  KeyRound,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Edit2,
  Trash2,
  Power,
  Lock,
  Unlock,
  AlertTriangle,
  Eye,
  ShoppingCart,
  Receipt,
  DollarSign,
  Package
} from 'lucide-react';
import { UserEntity, UserRole, UserPermissions } from '../types';
import { MASTER_OWNER_ID } from '../utils/storage';

interface UsersManagementViewProps {
  users: UserEntity[];
  currentUserId: string;
  onRequestAddUser: () => void;
  onEditUser: (user: UserEntity) => void;
  onToggleSuspendUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onOpenConnectDialog: () => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  users,
  currentUserId,
  onRequestAddUser,
  onEditUser,
  onToggleSuspendUser,
  onDeleteUser,
  onOpenConnectDialog
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const isOwner = currentUser?.role === 'OWNER' || currentUser?.id === MASTER_OWNER_ID;

  const handleCopyCode = (code: string, userId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(userId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>المالك (صلاحيات كاملة)</span>
          </span>
        );
      case 'CASHIER':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>كاشير (مبيعات فقط)</span>
          </span>
        );
      case 'ACCOUNTANT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5" />
            <span>محاسب مالي</span>
          </span>
        );
      case 'VIEWER':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>مشاهد فقط</span>
          </span>
        );
      case 'CUSTOM':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>صلاحيات مخصصة</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              إدارة المستخدمين والربط بالأكواد
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ربط أجهزة الموظفين عبر كود دخول آمن، مع إمكانية تقييد وتجميد الوصول في أي لحظة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenConnectDialog}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 shadow-sm transition min-h-[40px]"
          >
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>دخول برمز ربط</span>
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={onRequestAddUser}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition min-h-[40px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مستخدم جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning if current user is not owner */}
      {!isOwner && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            أنت متصل حالياً بحساب ({currentUser?.name}) بصلاحيات مقيدة. تعديل وحظر المستخدمين محصور بمالك الحساب الرئيسي.
          </span>
        </div>
      )}

      {/* Users List */}
      <div className="flex flex-col gap-3">
        {users.map(user => {
          const isMaster = user.id === MASTER_OWNER_ID;
          const isCurrent = user.id === currentUserId;
          const isSuspended = user.status === 'SUSPENDED';

          return (
            <div
              key={user.id}
              className={`p-4 sm:p-5 rounded-2xl border transition ${
                isSuspended
                  ? 'bg-slate-900/50 border-rose-900/40 opacity-80'
                  : isCurrent
                  ? 'bg-slate-900 border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* User Info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isMaster
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isSuspended
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-100">
                        {user.name}
                      </h3>
                      {getRoleBadge(user.role)}
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white font-black">
                          الجهاز الحالي
                        </span>
                      )}
                      {isSuspended && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold">
                          تم تجميد الوصول
                        </span>
                      )}
                    </div>

                    {user.phone && (
                      <p className="text-xs text-slate-400 flex items-center gap-3">
                        <span>{user.phone}</span>
                      </p>
                    )}

                    {/* Permissions Badges */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          user.permissions.canViewProfits
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-800 text-slate-500 line-through'
                        }`}
                      >
                        رؤية الأرباح
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          user.permissions.canRecordSales
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-800 text-slate-500 line-through'
                        }`}
                      >
                        المبيعات
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          user.permissions.canManageItems
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-800 text-slate-500 line-through'
                        }`}
                      >
                        المنتجات
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          user.permissions.canManageDebts
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-800 text-slate-500 line-through'
                        }`}
                      >
                        الديون
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          user.permissions.canManageExpenses
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-800 text-slate-500 line-through'
                        }`}
                      >
                        المصاريف
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          user.permissions.canDeleteRecords
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-slate-800 text-slate-500 line-through'
                        }`}
                      >
                        الحذف والإلغاء
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connection Code Box & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Connection Code Display */}
                  <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold">رمز الربط:</span>
                      <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                        {user.connectionCode}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(user.connectionCode, user.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="نسخ رمز الربط"
                    >
                      {copiedCodeId === user.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Actions for Owner */}
                  {isOwner && (
                    <div className="flex items-center gap-1.5 justify-end">
                      {/* Toggle Suspend (Limit Access) */}
                      {!isMaster && (
                        <button
                          type="button"
                          onClick={() => onToggleSuspendUser(user.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition min-h-[38px] ${
                            isSuspended
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                              : 'bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30'
                          }`}
                          title={isSuspended ? 'إلغاء التجميد وتفعيل الحساب' : 'تجميد وحظر وصول هذا الحساب'}
                        >
                          {isSuspended ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>إلغاء الحظر</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>تجميد الحساب</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Edit Permissions */}
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                        title="تعديل الصلاحيات وتقييد الوصول"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete User */}
                      {!isMaster && (
                        <button
                          type="button"
                          onClick={() => onDeleteUser(user.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-rose-400 border border-slate-700 hover:border-rose-500/40 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                          title="حذف هذا المستخدم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
