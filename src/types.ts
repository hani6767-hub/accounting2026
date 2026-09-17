export interface ItemEntity {
  id: number;
  name: string;
  category: string;
  unitPrice: number;
  colorHex: string;
  sku: string;
  description: string;
  createdAt: number;
}

export interface SaleTransactionEntity {
  id: number;
  itemId: number;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  timestamp: number;
  note: string;
  isDebt: boolean;
  customerName: string;
  customerPhone: string;
  isSettled: boolean;
  settledAt?: number | null;
  recordedByUserId?: string;
  recordedByUserName?: string;
}

export interface ExpenseEntity {
  id: number;
  title: string;
  category: string;
  amount: number;
  timestamp: number;
  note: string;
  recordedByUserId?: string;
  recordedByUserName?: string;
}

export type TimeRangeFilter = 'ALL_TIME' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

export type AccountingTab = 'OVERVIEW' | 'ITEMS' | 'DEBTS' | 'EXPENSES' | 'LEDGER' | 'USERS' | 'AUDIT_LOG';

export type UserRole = 'OWNER' | 'CASHIER' | 'ACCOUNTANT' | 'VIEWER' | 'CUSTOM';

export interface UserPermissions {
  canViewProfits: boolean;
  canRecordSales: boolean;
  canManageItems: boolean;
  canManageDebts: boolean;
  canManageExpenses: boolean;
  canDeleteRecords: boolean;
  canManageUsers: boolean;
  canManageBackups: boolean;
}

export interface UserEntity {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  connectionCode: string; // The unique alphanumeric code used to connect
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: number;
  lastActiveAt: number | null;
  permissions: UserPermissions;
}

export type AuditLogAction =
  | 'SALE_CREATED'
  | 'DEBT_RECORDED'
  | 'DEBT_SETTLED'
  | 'ITEM_CREATED'
  | 'ITEM_UPDATED'
  | 'ITEM_DELETED'
  | 'EXPENSE_CREATED'
  | 'EXPENSE_DELETED'
  | 'TRANSACTION_DELETED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_SUSPENDED'
  | 'USER_ACTIVATED'
  | 'USER_CONNECTED'
  | 'USER_DELETED'
  | 'BACKUP_AUTO_SENT'
  | 'BACKUP_RESTORED';

export interface AuditLogEntity {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditLogAction;
  title: string;
  details: string;
}

export interface AppCurrencySettings {
  primaryCurrency: string; // Default 'SYP'
  secondaryCurrency?: string; // e.g. 'USD'
  exchangeRate?: number; // 1 secondary = exchangeRate primary
  showDualCurrency?: boolean;
}

export interface GmailBackupSettings {
  email: string;
  isAutoBackupEnabled: boolean;
  frequency: 'after_sale' | 'daily';
  senderEmail?: string;
  senderAppPassword?: string;
  lastBackupTimestamp: number | null;
  lastBackupSummary: string | null;
  lastBackupStatus?: 'SUCCESS' | 'FAILED' | 'SENDING' | 'IDLE';
}

export interface ItemSalesSummary {
  item: ItemEntity;
  totalUnitsSold: number;
  totalRevenue: number;
  percentageOfTotal: number;
  color: string;
  rank: number;
}

export interface CustomerDebtSummary {
  customerName: string;
  customerPhone: string;
  totalUnpaidDebt: number;
  totalSettledDebt: number;
  unpaidCount: number;
  transactions: SaleTransactionEntity[];
}

export interface BackupPackageData {
  version: number;
  app: string;
  exportedAt: number;
  items: ItemEntity[];
  transactions: SaleTransactionEntity[];
  expenses: ExpenseEntity[];
  users?: UserEntity[];
  auditLogs?: AuditLogEntity[];
}
