import {
  ItemEntity,
  SaleTransactionEntity,
  ExpenseEntity,
  GmailBackupSettings,
  BackupPackageData,
  UserEntity,
  UserRole,
  UserPermissions,
  AuditLogEntity,
  AuditLogAction,
  AppCurrencySettings
} from '../types';
import {
  defaultCurrencySettings,
  formatMoney,
  DEFAULT_CURRENCY_CODE
} from './currency';

const STORAGE_KEYS = {
  ITEMS: 'ah_items',
  TRANSACTIONS: 'ah_transactions',
  EXPENSES: 'ah_expenses',
  GMAIL_SETTINGS: 'ah_gmail_settings',
  CURRENCY_SETTINGS: 'ah_currency_settings',
  USERS: 'ah_users',
  ACTIVE_USER_ID: 'ah_active_user_id',
  AUDIT_LOGS: 'ah_audit_logs'
};

export const defaultGmailSettings: GmailBackupSettings = {
  email: '',
  isAutoBackupEnabled: true,
  frequency: 'after_sale',
  lastBackupTimestamp: null,
  lastBackupSummary: 'جاهز للإرسال المباشر إلى أي بريد Gmail',
  lastBackupStatus: 'IDLE'
};

export const MASTER_OWNER_ID = 'owner_master';

export function createMasterOwner(): UserEntity {
  return {
    id: MASTER_OWNER_ID,
    name: 'مالك الحساب (المدير العام)',
    email: '',
    role: 'OWNER',
    connectionCode: 'OWNER-7788',
    status: 'ACTIVE',
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    permissions: {
      canViewProfits: true,
      canRecordSales: true,
      canManageItems: true,
      canManageDebts: true,
      canManageExpenses: true,
      canDeleteRecords: true,
      canManageUsers: true,
      canManageBackups: true
    }
  };
}

export function generateConnectionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `AH-${digits}-${rand}`;
}

export function getDefaultPermissionsForRole(role: UserRole): UserPermissions {
  switch (role) {
    case 'OWNER':
      return {
        canViewProfits: true,
        canRecordSales: true,
        canManageItems: true,
        canManageDebts: true,
        canManageExpenses: true,
        canDeleteRecords: true,
        canManageUsers: true,
        canManageBackups: true
      };
    case 'CASHIER':
      return {
        canViewProfits: false, // Hidden for cashiers
        canRecordSales: true,
        canManageItems: false,
        canManageDebts: true,
        canManageExpenses: false,
        canDeleteRecords: false, // Cannot delete transactions
        canManageUsers: false,
        canManageBackups: false
      };
    case 'ACCOUNTANT':
      return {
        canViewProfits: true,
        canRecordSales: true,
        canManageItems: true,
        canManageDebts: true,
        canManageExpenses: true,
        canDeleteRecords: false,
        canManageUsers: false,
        canManageBackups: true
      };
    case 'VIEWER':
      return {
        canViewProfits: false,
        canRecordSales: false,
        canManageItems: false,
        canManageDebts: false,
        canManageExpenses: false,
        canDeleteRecords: false,
        canManageUsers: false,
        canManageBackups: false
      };
    case 'CUSTOM':
    default:
      return {
        canViewProfits: false,
        canRecordSales: true,
        canManageItems: false,
        canManageDebts: false,
        canManageExpenses: false,
        canDeleteRecords: false,
        canManageUsers: false,
        canManageBackups: false
      };
  }
}

// Clean out testing demo data if present in localStorage
function cleanTestingItems(items: ItemEntity[]): ItemEntity[] {
  return items.filter(item => {
    const isDemo =
      item.sku === 'CB-101' ||
      item.sku === 'AV-202' ||
      item.sku === 'MC-303' ||
      item.name.includes('قهوة مثلجة') ||
      item.name.includes('Cold Brew') ||
      item.name.includes('توست أفوكادو') ||
      item.name.includes('كرواسون ماتشا');
    return !isDemo;
  });
}

function cleanTestingTransactions(txs: SaleTransactionEntity[]): SaleTransactionEntity[] {
  return txs.filter(tx => {
    const isDemo =
      (tx.id === 101 || tx.id === 102 || tx.id === 103) &&
      (tx.itemName.includes('قهوة مثلجة') ||
        tx.itemName.includes('Cold Brew') ||
        tx.itemName.includes('توست أفوكادو') ||
        tx.itemName.includes('كرواسون ماتشا'));
    return !isDemo;
  });
}

function cleanTestingExpenses(expenses: ExpenseEntity[]): ExpenseEntity[] {
  return expenses.filter(exp => {
    const isDemo = exp.id === 201 && exp.title.includes('حليب ومستلزمات تحضير');
    return !isDemo;
  });
}

export function loadItems(): ItemEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (raw) {
      const parsed: ItemEntity[] = JSON.parse(raw);
      const cleaned = cleanTestingItems(parsed);
      if (cleaned.length !== parsed.length) {
        saveItems(cleaned);
      }
      return cleaned;
    }
  } catch (e) {
    console.error('Error loading items:', e);
  }
  return [];
}

export function saveItems(items: ItemEntity[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving items:', e);
  }
}

export function loadTransactions(): SaleTransactionEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) {
      const parsed: SaleTransactionEntity[] = JSON.parse(raw);
      const cleaned = cleanTestingTransactions(parsed);
      if (cleaned.length !== parsed.length) {
        saveTransactions(cleaned);
      }
      return cleaned;
    }
  } catch (e) {
    console.error('Error loading transactions:', e);
  }
  return [];
}

export function saveTransactions(transactions: SaleTransactionEntity[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions:', e);
  }
}

export function loadExpenses(): ExpenseEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (raw) {
      const parsed: ExpenseEntity[] = JSON.parse(raw);
      const cleaned = cleanTestingExpenses(parsed);
      if (cleaned.length !== parsed.length) {
        saveExpenses(cleaned);
      }
      return cleaned;
    }
  } catch (e) {
    console.error('Error loading expenses:', e);
  }
  return [];
}

export function saveExpenses(expenses: ExpenseEntity[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses:', e);
  }
}

// User Accounts - STRICTLY NO FAKE USERS
export function loadUsers(): UserEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed: UserEntity[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure master owner always exists
        const hasOwner = parsed.some(u => u.role === 'OWNER' || u.id === MASTER_OWNER_ID);
        if (!hasOwner) {
          const owner = createMasterOwner();
          const list = [owner, ...parsed];
          saveUsers(list);
          return list;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading users:', e);
  }
  // No fake users - only the Master Owner initial account
  const defaultOwnerList = [createMasterOwner()];
  saveUsers(defaultOwnerList);
  return defaultOwnerList;
}

export function saveUsers(users: UserEntity[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

export function loadActiveUserId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (id) return id;
  } catch (e) {
    console.error('Error loading active user ID:', e);
  }
  return MASTER_OWNER_ID;
}

export function saveActiveUserId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
  } catch (e) {
    console.error('Error saving active user ID:', e);
  }
}

// Audit Logs
export function loadAuditLogs(): AuditLogEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) {
      const parsed: AuditLogEntity[] = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading audit logs:', e);
  }
  return [];
}

export function saveAuditLogs(logs: AuditLogEntity[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 300)));
  } catch (e) {
    console.error('Error saving audit logs:', e);
  }
}

export function createAuditLogEntry(
  user: UserEntity,
  action: AuditLogAction,
  title: string,
  details: string
): AuditLogEntity {
  return {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    title,
    details
  };
}

export function loadCurrencySettings(): AppCurrencySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENCY_SETTINGS);
    if (raw) return { ...defaultCurrencySettings, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading currency settings:', e);
  }
  return defaultCurrencySettings;
}

export function saveCurrencySettings(settings: AppCurrencySettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY_SETTINGS, JSON.stringify(settings));
    // Asynchronously sync with server
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency: settings })
    }).catch(err => console.warn('Server settings sync notice:', err));
  } catch (e) {
    console.error('Error saving currency settings:', e);
  }
}

export async function fetchServerSettings(): Promise<{
  currency?: AppCurrencySettings;
  gmailSettings?: Partial<GmailBackupSettings>;
} | null> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        return {
          currency: data.settings.currency,
          gmailSettings: data.settings.gmailSettings
        };
      }
    }
  } catch (err) {
    console.warn('Could not fetch server settings:', err);
  }
  return null;
}

export function loadGmailSettings(): GmailBackupSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GMAIL_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading gmail settings:', e);
  }
  return defaultGmailSettings;
}

export function saveGmailSettings(settings: GmailBackupSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.GMAIL_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving gmail settings:', e);
  }
}

export function exportToJson(
  items: ItemEntity[],
  transactions: SaleTransactionEntity[],
  expenses: ExpenseEntity[] = [],
  users?: UserEntity[],
  auditLogs?: AuditLogEntity[]
): string {
  const root: BackupPackageData = {
    version: 4,
    app: 'Accounting House',
    exportedAt: Date.now(),
    items,
    transactions,
    expenses,
    users,
    auditLogs
  };
  return JSON.stringify(root, null, 2);
}

export function parseBackup(jsonStr: string): {
  items: ItemEntity[];
  transactions: SaleTransactionEntity[];
  expenses: ExpenseEntity[];
  users?: UserEntity[];
  auditLogs?: AuditLogEntity[];
} {
  const root = JSON.parse(jsonStr);
  const items: ItemEntity[] = Array.isArray(root.items) ? root.items : [];
  const transactions: SaleTransactionEntity[] = Array.isArray(root.transactions) ? root.transactions : [];
  const expenses: ExpenseEntity[] = Array.isArray(root.expenses) ? root.expenses : [];
  const users: UserEntity[] | undefined = Array.isArray(root.users) ? root.users : undefined;
  const auditLogs: AuditLogEntity[] | undefined = Array.isArray(root.auditLogs) ? root.auditLogs : undefined;
  return { items, transactions, expenses, users, auditLogs };
}

export function buildGmailBackupEmailBody(
  items: ItemEntity[],
  transactions: SaleTransactionEntity[],
  expenses: ExpenseEntity[],
  totalCashRevenue: number,
  totalDebtsUnpaid: number,
  totalExpenses: number,
  netProfit: number,
  triggeredByUserName?: string,
  currencyCode: string = DEFAULT_CURRENCY_CODE
): string {
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const jsonPayload = exportToJson(items, transactions, expenses);

  return `نسخة احتياطية - بيت المحاسبة (Accounting House)
==================================================
تاريخ ووقت النسخ: ${dateStr}
منفذ الإجراء: ${triggeredByUserName || 'النظام'}
العملة الأساسية: ${currencyCode}

[الملخص المالي]:
• المقبوضات النقدية المحصلة: ${formatMoney(totalCashRevenue, currencyCode)}
• الديون المعلقة غير المسددة: ${formatMoney(totalDebtsUnpaid, currencyCode)}
• إجمالي المصاريف المسجلة: ${formatMoney(totalExpenses, currencyCode)}
• صافي الربح الفعلي المحصل: ${formatMoney(netProfit, currencyCode)}

[بيانات السجلات]:
• عدد الأصناف والمنتجات: ${items.length}
• إجمالي حركات المبيعات والديون: ${transactions.length}
• إجمالي قيود المصاريف: ${expenses.length}

حالة الأمان: تم إنشاء هذه النسخة الاحتياطية لحفظ بيانات متجرك وحساباتك بأمان.
يمكنك استعادة السجلات في أي وقت بلصق كود JSON المرفق أدناه في نافذة استعادة البيانات بالبرنامج.

---------------- بيانات النسخة (JSON Backup) ----------------
${jsonPayload}
---------------- نهاية النسخة الاحتياطية ----------------`;
}

// FULLY AUTOMATIC GMAIL DISPATCH SERVICE
export async function sendAutomaticBackupEmail(
  settings: GmailBackupSettings,
  items: ItemEntity[],
  transactions: SaleTransactionEntity[],
  expenses: ExpenseEntity[],
  totalCashRevenue: number,
  totalDebtsUnpaid: number,
  totalExpenses: number,
  netProfit: number,
  triggeredByUserName?: string,
  currencyCode: string = DEFAULT_CURRENCY_CODE
): Promise<{ success: boolean; message: string; timestamp: number }> {
  const emailBody = buildGmailBackupEmailBody(
    items,
    transactions,
    expenses,
    totalCashRevenue,
    totalDebtsUnpaid,
    totalExpenses,
    netProfit,
    triggeredByUserName,
    currencyCode
  );
  const jsonPayload = exportToJson(items, transactions, expenses);

  try {
    const response = await fetch('/api/backup/email-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: settings.email,
        subject: `نسخة احتياطية آلية - بيت المحاسبة (${new Date().toLocaleDateString('ar-EG')})`,
        body: emailBody,
        jsonPayload,
        senderEmail: settings.senderEmail,
        senderPassword: settings.senderAppPassword
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || `تم إرسال النسخة الاحتياطية تلقائياً إلى ${settings.email}`,
      timestamp: Date.now()
    };
  } catch (err: any) {
    console.error('Automatic email backup error:', err);
    return {
      success: false,
      message: `فشل الإرسال الآلي: ${err.message || 'خطأ في الاتصال بالخادم'}`,
      timestamp: Date.now()
    };
  }
}
