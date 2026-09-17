import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  User,
  Shield,
  Clock,
  Filter,
  ShoppingCart,
  Receipt,
  Package,
  KeyRound,
  Trash2,
  Mail,
  CreditCard,
  Sliders,
  Sparkles
} from 'lucide-react';
import { AuditLogEntity, AuditLogAction } from '../types';

interface AuditLogViewProps {
  logs: AuditLogEntity[];
  onClearLogs?: () => void;
  isOwner: boolean;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  logs,
  onClearLogs,
  isOwner
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const getActionBadge = (action: AuditLogAction) => {
    switch (action) {
      case 'SALE_CREATED':
        return {
          icon: <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />,
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          label: 'حركة بيع'
        };
      case 'DEBT_RECORDED':
      case 'DEBT_SETTLED':
        return {
          icon: <CreditCard className="w-3.5 h-3.5 text-rose-400" />,
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          label: 'حركة ديون'
        };
      case 'ITEM_CREATED':
      case 'ITEM_UPDATED':
      case 'ITEM_DELETED':
        return {
          icon: <Package className="w-3.5 h-3.5 text-blue-400" />,
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
          label: 'الأصناف'
        };
      case 'EXPENSE_CREATED':
      case 'EXPENSE_DELETED':
        return {
          icon: <Receipt className="w-3.5 h-3.5 text-amber-400" />,
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          label: 'المصاريف'
        };
      case 'USER_CREATED':
      case 'USER_UPDATED':
      case 'USER_SUSPENDED':
      case 'USER_ACTIVATED':
      case 'USER_CONNECTED':
      case 'USER_DELETED':
        return {
          icon: <KeyRound className="w-3.5 h-3.5 text-purple-400" />,
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
          label: 'المستخدمون والربط'
        };
      case 'BACKUP_AUTO_SENT':
      case 'BACKUP_RESTORED':
        return {
          icon: <Mail className="w-3.5 h-3.5 text-cyan-400" />,
          bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          label: 'النسخ الاحتياطي'
        };
      case 'TRANSACTION_DELETED':
      default:
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          label: 'حذف وتعديل'
        };
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Category filter
      if (filterCategory === 'SALES' && log.action !== 'SALE_CREATED' && log.action !== 'TRANSACTION_DELETED') {
        return false;
      }
      if (filterCategory === 'DEBTS' && log.action !== 'DEBT_RECORDED' && log.action !== 'DEBT_SETTLED') {
        return false;
      }
      if (filterCategory === 'EXPENSES' && log.action !== 'EXPENSE_CREATED' && log.action !== 'EXPENSE_DELETED') {
        return false;
      }
      if (filterCategory === 'ITEMS' && !log.action.startsWith('ITEM_')) {
        return false;
      }
      if (filterCategory === 'USERS' && !log.action.startsWith('USER_')) {
        return false;
      }
      if (filterCategory === 'BACKUP' && !log.action.startsWith('BACKUP_')) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesUser = log.userName.toLowerCase().includes(query);
        const matchesTitle = log.title.toLowerCase().includes(query);
        const matchesDetails = log.details.toLowerCase().includes(query);
        return matchesUser || matchesTitle || matchesDetails;
      }

      return true;
    });
  }, [logs, filterCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              سجل التغييرات والرقابة (Audit Log)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            متابعة دقيقة لكل عملية وحركة وتعديل أجراه أي مستخدم أو كاشير في النظام مع اسم المنفذ والتاريخ.
          </p>
        </div>

        {isOwner && onClearLogs && logs.length > 0 && (
          <button
            type="button"
            onClick={onClearLogs}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/30 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto min-h-[40px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح السجل</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="البحث باسم المستخدم أو العملية أو التفاصيل..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl ps-10 pe-4 py-2.5 text-xs text-slate-100 focus:outline-none min-h-[42px]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            type="button"
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 min-h-[38px] ${
              filterCategory === 'ALL'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            الكل ({logs.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('SALES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 min-h-[38px] ${
              filterCategory === 'SALES'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            المبيعات
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('DEBTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 min-h-[38px] ${
              filterCategory === 'DEBTS'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            الديون
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('EXPENSES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 min-h-[38px] ${
              filterCategory === 'EXPENSES'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            المصاريف
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('USERS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 min-h-[38px] ${
              filterCategory === 'USERS'
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            المستخدمين والربط
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('BACKUP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 min-h-[38px] ${
              filterCategory === 'BACKUP'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            النسخ التلقائي
          </button>
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center gap-2">
          <Clock className="w-8 h-8 text-slate-600" />
          <p className="text-sm font-bold text-slate-300">لا توجد حركات مسجلة مطابقة للبحث</p>
          <p className="text-xs text-slate-500">
            سيتم تسجيل أي عملية بيع أو تعديل أو إضافة منتج أو تغيير صلاحيات هنا تلقائياً.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredLogs.map(log => {
            const badge = getActionBadge(log.action);
            const dateObj = new Date(log.timestamp);
            const formattedTime = dateObj.toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit'
            });
            const formattedDate = dateObj.toLocaleDateString('ar-EG', {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={log.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* Category icon */}
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {badge.icon}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-100">
                        {log.title}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>

                {/* Actor & Time */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-bold text-slate-200">{log.userName}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formattedDate} {formattedTime}</span>
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
