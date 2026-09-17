import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Receipt,
  FileText,
  ShieldCheck,
  Plus,
  Zap,
  Sparkles,
  Users,
  History,
  KeyRound,
  Shield,
  LogOut,
  UserCheck,
  Lock,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  ItemEntity,
  SaleTransactionEntity,
  ExpenseEntity,
  TimeRangeFilter,
  AccountingTab,
  ItemSalesSummary,
  CustomerDebtSummary,
  GmailBackupSettings,
  UserEntity,
  UserRole,
  UserPermissions,
  AuditLogEntity,
  AppCurrencySettings
} from './types';
import {
  loadItems,
  saveItems,
  loadTransactions,
  saveTransactions,
  loadExpenses,
  saveExpenses,
  loadGmailSettings,
  saveGmailSettings,
  exportToJson,
  parseBackup,
  buildGmailBackupEmailBody,
  sendAutomaticBackupEmail,
  loadUsers,
  saveUsers,
  loadActiveUserId,
  saveActiveUserId,
  loadAuditLogs,
  saveAuditLogs,
  createAuditLogEntry,
  createMasterOwner,
  MASTER_OWNER_ID,
  loadCurrencySettings,
  saveCurrencySettings,
  fetchServerSettings
} from './utils/storage';
import { getItemColor } from './utils/colors';
import { formatMoney } from './utils/currency';
import {
  isSoundEnabled,
  setSoundEnabled,
  setupGlobalButtonSoundListener,
  playCashSound,
  playSuccessSound,
  playPopSound,
  playTapSound,
  playTabSound
} from './utils/audio';

// Views
import { MetricCards } from './components/MetricCards';
import { SalesDonutChart } from './components/SalesDonutChart';
import { OverviewServicesPanel } from './components/OverviewServicesPanel';
import { ItemsView } from './components/ItemsView';
import { CustomerDebtsView } from './components/CustomerDebtsView';
import { ExpensesView } from './components/ExpensesView';
import { TransactionsLedger } from './components/TransactionsLedger';
import { UsersManagementView } from './components/UsersManagementView';
import { AuditLogView } from './components/AuditLogView';

// Dialogs
import { RealizedProfitCalculatorDialog } from './components/dialogs/RealizedProfitCalculatorDialog';
import { RecordSaleDialog } from './components/dialogs/RecordSaleDialog';
import { RecordManualDebtDialog } from './components/dialogs/RecordManualDebtDialog';
import { AddItemDialog } from './components/dialogs/AddItemDialog';
import { AddExpenseDialog } from './components/dialogs/AddExpenseDialog';
import { CustomerDebtDetailsDialog } from './components/dialogs/CustomerDebtDetailsDialog';
import { BackupRestoreDialog } from './components/dialogs/BackupRestoreDialog';
import { AddUserDialog } from './components/dialogs/AddUserDialog';
import { ConnectWithCodeDialog } from './components/dialogs/ConnectWithCodeDialog';
import { SaleSuccessModal } from './components/dialogs/SaleSuccessModal';

export default function App() {
  // Persistence state
  const [items, setItems] = useState<ItemEntity[]>(() => loadItems());
  const [transactions, setTransactions] = useState<SaleTransactionEntity[]>(() => loadTransactions());
  const [expenses, setExpenses] = useState<ExpenseEntity[]>(() => loadExpenses());
  const [gmailSettings, setGmailSettings] = useState<GmailBackupSettings>(() => loadGmailSettings());
  const [currencySettings, setCurrencySettings] = useState<AppCurrencySettings>(() => loadCurrencySettings());

  // User auth & role-based access state (NO FAKE USERS)
  const [users, setUsers] = useState<UserEntity[]>(() => loadUsers());
  const [activeUserId, setActiveUserId] = useState<string>(() => loadActiveUserId());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntity[]>(() => loadAuditLogs());

  // UI state
  const [activeTab, setActiveTab] = useState<AccountingTab>('OVERVIEW');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('ALL_TIME');
  const [selectedSummary, setSelectedSummary] = useState<ItemSalesSummary | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

  // Dialog modals & pop-ups
  const [showProfitCalc, setShowProfitCalc] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ItemEntity | null>(null);
  const [itemToSell, setItemToSell] = useState<ItemEntity | null>(null);
  const [showManualDebt, setShowManualDebt] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [customerDebtDetails, setCustomerDebtDetails] = useState<CustomerDebtSummary | null>(null);
  const [showBackupRestore, setShowBackupRestore] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserEntity | null>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [lastSaleSuccess, setLastSaleSuccess] = useState<SaleTransactionEntity | null>(null);

  // Setup global audio click listener for all interactive buttons
  useEffect(() => {
    const cleanup = setupGlobalButtonSoundListener();
    return cleanup;
  }, []);

  // Ensure document direction is RTL and language is Arabic
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  // Fetch persistent settings from server on mount
  useEffect(() => {
    fetchServerSettings().then(res => {
      if (res?.currency) {
        setCurrencySettings(res.currency);
      }
      if (res?.gmailSettings?.email) {
        setGmailSettings(prev => ({
          ...prev,
          email: res.gmailSettings?.email || prev.email
        }));
      }
    });
  }, []);

  // Save to storage
  useEffect(() => {
    saveItems(items);
  }, [items]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveGmailSettings(gmailSettings);
  }, [gmailSettings]);

  useEffect(() => {
    saveCurrencySettings(currencySettings);
  }, [currencySettings]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveActiveUserId(activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    saveAuditLogs(auditLogs);
  }, [auditLogs]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Current active user computation
  const currentUser = useMemo<UserEntity>(() => {
    const found = users.find(u => u.id === activeUserId);
    if (found && found.status !== 'SUSPENDED') return found;
    return users.find(u => u.id === MASTER_OWNER_ID) || users[0] || createMasterOwner();
  }, [users, activeUserId]);

  const isOwner = currentUser.role === 'OWNER' || currentUser.id === MASTER_OWNER_ID;
  const permissions: UserPermissions = currentUser.permissions;

  // Append new audit log
  const pushAuditLog = useCallback((action: any, title: string, details: string) => {
    const entry = createAuditLogEntry(currentUser, action, title, details);
    setAuditLogs(prev => [entry, ...prev.slice(0, 299)]);
  }, [currentUser]);

  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    if (timeRange === 'ALL_TIME') return transactions;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (timeRange === 'TODAY') {
      return transactions.filter(t => t.timestamp >= startOfToday);
    }

    if (timeRange === 'THIS_WEEK') {
      const day = now.getDay();
      const diffToSaturday = (day + 1) % 7;
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToSaturday).getTime();
      return transactions.filter(t => t.timestamp >= startOfWeek);
    }

    if (timeRange === 'THIS_MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return transactions.filter(t => t.timestamp >= startOfMonth);
    }

    return transactions;
  }, [transactions, timeRange]);

  // Filter expenses by time range
  const filteredExpenses = useMemo(() => {
    if (timeRange === 'ALL_TIME') return expenses;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (timeRange === 'TODAY') {
      return expenses.filter(e => e.timestamp >= startOfToday);
    }

    if (timeRange === 'THIS_WEEK') {
      const day = now.getDay();
      const diffToSaturday = (day + 1) % 7;
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToSaturday).getTime();
      return expenses.filter(e => e.timestamp >= startOfWeek);
    }

    if (timeRange === 'THIS_MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return expenses.filter(e => e.timestamp >= startOfMonth);
    }

    return expenses;
  }, [expenses, timeRange]);

  // Financial calculations
  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  }, [filteredTransactions]);

  const totalCashRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => {
      if (!t.isDebt || t.isSettled) {
        return sum + t.totalAmount;
      }
      return sum;
    }, 0);
  }, [filteredTransactions]);

  const totalDebtsUnpaid = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => {
      if (t.isDebt && !t.isSettled) {
        return sum + t.totalAmount;
      }
      return sum;
    }, 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const realizedNetProfit = useMemo(() => {
    return totalCashRevenue - totalExpenses;
  }, [totalCashRevenue, totalExpenses]);

  const totalUnitsSold = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.quantity, 0);
  }, [filteredTransactions]);

  const avgOrderValue = useMemo(() => {
    if (filteredTransactions.length === 0) return 0;
    return totalRevenue / filteredTransactions.length;
  }, [filteredTransactions, totalRevenue]);

  // Per-item sales summary for Donut Chart
  const itemSummaries = useMemo<ItemSalesSummary[]>(() => {
    return items.map((item, index) => {
      const itemTx = filteredTransactions.filter(t => t.itemId === item.id);
      const rev = itemTx.reduce((sum, t) => sum + t.totalAmount, 0);
      const units = itemTx.reduce((sum, t) => sum + t.quantity, 0);
      const percentage = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
      const color = item.colorHex || getItemColor(index);

      return {
        item,
        totalRevenue: rev,
        totalUnitsSold: units,
        percentageOfTotal: percentage,
        transactions: itemTx,
        color
      };
    });
  }, [items, filteredTransactions, totalRevenue]);

  const topItem = useMemo(() => {
    if (itemSummaries.length === 0) return null;
    const sorted = [...itemSummaries].sort((a, b) => b.totalRevenue - a.totalRevenue);
    return sorted[0]?.totalRevenue > 0 ? sorted[0] : null;
  }, [itemSummaries]);

  // Customer debt summaries
  const customerDebtSummaries = useMemo<CustomerDebtSummary[]>(() => {
    const map = new Map<string, SaleTransactionEntity[]>();

    transactions
      .filter(t => t.isDebt && t.customerName.trim().length > 0)
      .forEach(t => {
        const key = t.customerName.trim();
        const list = map.get(key) || [];
        list.push(t);
        map.set(key, list);
      });

    const summaries: CustomerDebtSummary[] = [];

    map.forEach((txList, customerName) => {
      const unpaidList = txList.filter(t => !t.isSettled);
      const totalUnpaid = unpaidList.reduce((s, t) => s + t.totalAmount, 0);
      const settledList = txList.filter(t => t.isSettled);
      const totalSettled = settledList.reduce((s, t) => s + t.totalAmount, 0);
      const phone = txList.find(t => t.customerPhone)?.customerPhone || '';

      summaries.push({
        customerName,
        customerPhone: phone,
        totalUnpaidDebt: totalUnpaid,
        totalSettledDebt: totalSettled,
        unpaidCount: unpaidList.length,
        transactions: txList.sort((a, b) => b.timestamp - a.timestamp)
      });
    });

    return summaries.sort((a, b) => b.totalUnpaidDebt - a.totalUnpaidDebt);
  }, [transactions]);

  // FULLY AUTOMATIC GMAIL TRIGGER HELPER
  const triggerAutoGmailBackup = useCallback(
    async (
      customItems = items,
      customTxs = transactions,
      customExps = expenses,
      reason = 'تحديث سجلات'
    ) => {
      if (!gmailSettings.isAutoBackupEnabled || !gmailSettings.email) return;

      try {
        const res = await sendAutomaticBackupEmail(
          gmailSettings,
          customItems,
          customTxs,
          customExps,
          totalCashRevenue,
          totalDebtsUnpaid,
          totalExpenses,
          realizedNetProfit,
          currentUser.name
        );

        setGmailSettings(prev => ({
          ...prev,
          lastBackupTimestamp: res.timestamp,
          lastBackupSummary: res.message,
          lastBackupStatus: res.success ? 'SUCCESS' : 'FAILED'
        }));

        pushAuditLog(
          'BACKUP_AUTO_SENT',
          'إرسال نسخة احتياطية آلية إلى Gmail',
          `تم إرسال نسخة احتياطية تلقائياً إلى ${gmailSettings.email} (${reason})`
        );
      } catch (e) {
        console.error('Auto backup failed:', e);
      }
    },
    [
      gmailSettings,
      items,
      transactions,
      expenses,
      totalCashRevenue,
      totalDebtsUnpaid,
      totalExpenses,
      realizedNetProfit,
      currentUser,
      pushAuditLog
    ]
  );

  // Quick Sale
  const handleQuickSale = (item: ItemEntity) => {
    if (!permissions.canRecordSales) {
      showToast('ليس لديك صلاحية تسجيل المبيعات');
      return;
    }

    const newTx: SaleTransactionEntity = {
      id: Date.now(),
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      quantity: 1,
      unitPrice: item.unitPrice,
      totalAmount: item.unitPrice,
      timestamp: Date.now(),
      note: 'بيع فوري نقدي',
      isDebt: false,
      customerName: '',
      customerPhone: '',
      isSettled: false,
      recordedByUserId: currentUser.id,
      recordedByUserName: currentUser.name
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    playCashSound();
    playSuccessSound();
    setLastSaleSuccess(newTx);
    showToast(`تم بيع "${item.name}" نقداً (+$${item.unitPrice.toFixed(2)})`);

    pushAuditLog(
      'SALE_CREATED',
      `بيع نقدي فوري: ${item.name}`,
      `قام ${currentUser.name} ببيع 1 قطعة بقيمة $${item.unitPrice.toFixed(2)} نقداً`
    );

    triggerAutoGmailBackup(items, updatedTxs, expenses, `بيع فوري: ${item.name}`);
  };

  // Detailed Sale Dialog Confirmation
  const handleConfirmSale = (
    quantity: number,
    unitPrice: number,
    note: string,
    isDebt: boolean,
    customerName: string,
    customerPhone: string
  ) => {
    if (!itemToSell) return;
    if (!permissions.canRecordSales) {
      showToast('ليس لديك صلاحية تسجيل المبيعات');
      return;
    }

    const total = quantity * unitPrice;
    const newTx: SaleTransactionEntity = {
      id: Date.now(),
      itemId: itemToSell.id,
      itemName: itemToSell.name,
      category: itemToSell.category,
      quantity,
      unitPrice,
      totalAmount: total,
      timestamp: Date.now(),
      note,
      isDebt,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      isSettled: false,
      recordedByUserId: currentUser.id,
      recordedByUserName: currentUser.name
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    setItemToSell(null);

    if (isDebt) {
      playSuccessSound();
      showToast(`تم قيد دَين بقيمة $${total.toFixed(2)} على العميل ${customerName}`);
      pushAuditLog(
        'DEBT_RECORDED',
        `قيد دَين مبيعات على ${customerName}`,
        `قام ${currentUser.name} بتسجيل دَين لـ ${customerName} بقيمة $${total.toFixed(2)} لشراء (${itemToSell.name})`
      );
    } else {
      playCashSound();
      playSuccessSound();
      showToast(`تم تسجيل حركة بيع نقدي: $${total.toFixed(2)}`);
      pushAuditLog(
        'SALE_CREATED',
        `تسجيل بيع: ${itemToSell.name}`,
        `قام ${currentUser.name} بتسجيل بيع ${quantity} قطعة بقيمة إجمالية $${total.toFixed(2)}`
      );
    }

    setLastSaleSuccess(newTx);
    triggerAutoGmailBackup(items, updatedTxs, expenses, `حركة بيع: ${itemToSell.name}`);
  };

  // Manual Direct Debt
  const handleConfirmManualDebt = (
    customerName: string,
    customerPhone: string,
    amount: number,
    note: string
  ) => {
    if (!permissions.canManageDebts) {
      showToast('ليس لديك صلاحية تسجيل الديون');
      return;
    }

    const newTx: SaleTransactionEntity = {
      id: Date.now(),
      itemId: 0,
      itemName: note.trim() || 'دَين مالي مباشر',
      category: 'ديون مباشرة',
      quantity: 1,
      unitPrice: amount,
      totalAmount: amount,
      timestamp: Date.now(),
      note,
      isDebt: true,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      isSettled: false,
      recordedByUserId: currentUser.id,
      recordedByUserName: currentUser.name
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    setShowManualDebt(false);
    playSuccessSound();
    setLastSaleSuccess(newTx);
    showToast(`تم تسجيل دَين على ${customerName} بقيمة $${amount.toFixed(2)}`);

    pushAuditLog(
      'DEBT_RECORDED',
      `تسجيل دَين مباشر على ${customerName}`,
      `قام ${currentUser.name} بقيد مبلغ $${amount.toFixed(2)} في ذمة العميل ${customerName}`
    );

    triggerAutoGmailBackup(items, updatedTxs, expenses, `قيد دَين على ${customerName}`);
  };

  // Save Item (Create or Update)
  const handleSaveItem = (
    name: string,
    category: string,
    unitPrice: number,
    colorHex: string,
    sku: string,
    description: string
  ) => {
    if (!permissions.canManageItems) {
      showToast('ليس لديك صلاحية إدارة وتعديل المنتجات');
      return;
    }

    if (itemToEdit) {
      const updatedItems = items.map(i =>
        i.id === itemToEdit.id
          ? { ...i, name, category, unitPrice, colorHex, sku, description }
          : i
      );
      setItems(updatedItems);
      setItemToEdit(null);
      setShowAddItem(false);
      showToast(`تم تحديث بيانات "${name}"`);

      pushAuditLog(
        'ITEM_UPDATED',
        `تعديل منتج: ${name}`,
        `قام ${currentUser.name} بتعديل بيانات وسعر الصنف (${name}) إلى $${unitPrice.toFixed(2)}`
      );
    } else {
      const newItem: ItemEntity = {
        id: Date.now(),
        name,
        category,
        unitPrice,
        colorHex,
        sku,
        description,
        createdAt: Date.now()
      };
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      setShowAddItem(false);
      showToast(`تمت إضافة "${name}" بنجاح`);

      pushAuditLog(
        'ITEM_CREATED',
        `إضافة منتج جديد: ${name}`,
        `قام ${currentUser.name} بإضافة منتج جديد (${name}) بسعر $${unitPrice.toFixed(2)}`
      );
    }
  };

  // Delete Item
  const handleDeleteItem = (id: number) => {
    if (!permissions.canDeleteRecords || !permissions.canManageItems) {
      showToast('ليس لديك صلاحية حذف المنتجات');
      return;
    }
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(i => i.id !== id));
    showToast('تم حذف المنتج بنجاح');

    if (item) {
      pushAuditLog(
        'ITEM_DELETED',
        `حذف منتج: ${item.name}`,
        `قام ${currentUser.name} بحذف الصنف (${item.name}) نهائياً من المتجر`
      );
    }
  };

  // Save Expense
  const handleSaveExpense = (title: string, category: string, amount: number, note: string) => {
    if (!permissions.canManageExpenses) {
      showToast('ليس لديك صلاحية قيد المصاريف');
      return;
    }

    const newExpense: ExpenseEntity = {
      id: Date.now(),
      title,
      category,
      amount,
      timestamp: Date.now(),
      note,
      recordedByUserId: currentUser.id,
      recordedByUserName: currentUser.name
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    setShowAddExpense(false);
    showToast(`تم قيد المصروف: ${title} (-$${amount.toFixed(2)})`);

    pushAuditLog(
      'EXPENSE_CREATED',
      `قيد مصروف: ${title}`,
      `قام ${currentUser.name} بقيد مصروف تشغيلي بقيمة $${amount.toFixed(2)}`
    );

    triggerAutoGmailBackup(items, transactions, updatedExpenses, `قيد مصروف: ${title}`);
  };

  // Delete Expense
  const handleDeleteExpense = (id: number) => {
    if (!permissions.canDeleteRecords || !permissions.canManageExpenses) {
      showToast('ليس لديك صلاحية حذف قيود المصاريف');
      return;
    }

    const exp = expenses.find(e => e.id === id);
    const updatedExpenses = expenses.filter(e => e.id !== id);
    setExpenses(updatedExpenses);
    showToast('تم حذف قيد المصروف');

    if (exp) {
      pushAuditLog(
        'EXPENSE_DELETED',
        `حذف قيد مصروف: ${exp.title}`,
        `قام ${currentUser.name} بحذف مصروف بقيمة $${exp.amount.toFixed(2)}`
      );
    }

    triggerAutoGmailBackup(items, transactions, updatedExpenses, 'حذف مصروف');
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: number) => {
    if (!permissions.canDeleteRecords) {
      showToast('تم تقييد صلاحية حذف السجلات من قِبل المالك');
      return;
    }

    const tx = transactions.find(t => t.id === id);
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    showToast('تم إلغاء حركة البيع وتعديل الأرصدة');

    if (tx) {
      pushAuditLog(
        'TRANSACTION_DELETED',
        `إلغاء حركة: ${tx.itemName}`,
        `قام ${currentUser.name} بإلغاء حركة بقيمة $${tx.totalAmount.toFixed(2)}`
      );
    }

    triggerAutoGmailBackup(items, updatedTransactions, expenses, 'إلغاء حركة بيع');
  };

  // Debt Settlement
  const handleSettleSingleDebt = (id: number) => {
    if (!permissions.canManageDebts) {
      showToast('ليس لديك صلاحية تسديد الديون');
      return;
    }

    const tx = transactions.find(t => t.id === id);
    const updated = transactions.map(t =>
      t.id === id ? { ...t, isSettled: true, settledAt: Date.now() } : t
    );
    setTransactions(updated);
    showToast('تم تسديد الفاتورة بنجاح وإضافتها للسيولة المحصلة');

    if (tx) {
      pushAuditLog(
        'DEBT_SETTLED',
        `تسديد دَين: ${tx.customerName}`,
        `قام ${currentUser.name} بتسجيل تحصيل دَين بقيمة $${tx.totalAmount.toFixed(2)} من ${tx.customerName}`
      );
    }

    triggerAutoGmailBackup(items, updated, expenses, `تسديد دَين: ${tx?.customerName || ''}`);
  };

  const handleSettleAllDebtsForCustomer = (customerName: string) => {
    if (!permissions.canManageDebts) {
      showToast('ليس لديك صلاحية تسديد الديون');
      return;
    }

    const updated = transactions.map(t =>
      t.isDebt && t.customerName.trim().toLowerCase() === customerName.trim().toLowerCase()
        ? { ...t, isSettled: true, settledAt: Date.now() }
        : t
    );
    setTransactions(updated);
    showToast(`تم إبراء وتسديد كامل ديون العميل ${customerName}`);

    pushAuditLog(
      'DEBT_SETTLED',
      `تسديد كامل ديون العميل: ${customerName}`,
      `قام ${currentUser.name} بتسجيل سداد كامل المستحقات للعميل ${customerName}`
    );

    triggerAutoGmailBackup(items, updated, expenses, `سداد كامل ديون: ${customerName}`);
  };

  // Manual Trigger Send Gmail Now
  const handleSendGmailBackupNow = async () => {
    const res = await sendAutomaticBackupEmail(
      gmailSettings,
      items,
      transactions,
      expenses,
      totalCashRevenue,
      totalDebtsUnpaid,
      totalExpenses,
      realizedNetProfit,
      currentUser.name
    );

    setGmailSettings(prev => ({
      ...prev,
      lastBackupTimestamp: res.timestamp,
      lastBackupSummary: res.message,
      lastBackupStatus: res.success ? 'SUCCESS' : 'FAILED'
    }));

    pushAuditLog(
      'BACKUP_AUTO_SENT',
      'إرسال يدوي فوري للنسخة الاحتياطية',
      `قام ${currentUser.name} بطلب إرسال نسخة فورية لبريد ${gmailSettings.email}`
    );

    showToast(res.message);
  };

  // Backup & Restore handlers
  const handleRestoreJson = (json: string): { success: boolean; error?: string } => {
    try {
      const parsed = parseBackup(json);
      setItems(parsed.items);
      setTransactions(parsed.transactions);
      setExpenses(parsed.expenses);
      if (parsed.users && Array.isArray(parsed.users)) {
        setUsers(parsed.users);
      }
      if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) {
        setAuditLogs(parsed.auditLogs);
      }

      pushAuditLog(
        'BACKUP_RESTORED',
        'استعادة نسخة احتياطية من ملف',
        `قام ${currentUser.name} باستعادة السجلات من ملف JSON احتياطي`
      );

      showToast('تم استعادة كافة البيانات والقيود بنجاح');
      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: 'الملف غير صالح أو بيانات JSON غير مطابقة لنظام بيت المحاسبة' };
    }
  };

  const currentJsonExport = useMemo(() => {
    return exportToJson(items, transactions, expenses, users, auditLogs);
  }, [items, transactions, expenses, users, auditLogs]);

  const currentEmailBody = useMemo(() => {
    return buildGmailBackupEmailBody(
      items,
      transactions,
      expenses,
      totalCashRevenue,
      totalDebtsUnpaid,
      totalExpenses,
      realizedNetProfit,
      currentUser.name,
      currencySettings.primaryCurrency
    );
  }, [items, transactions, expenses, totalCashRevenue, totalDebtsUnpaid, totalExpenses, realizedNetProfit, currentUser, currencySettings.primaryCurrency]);

  // USER MANAGEMENT HANDLERS (Limit access if owner wants to)
  const handleCreateOrUpdateUser = (
    name: string,
    email: string,
    phone: string,
    role: UserRole,
    connectionCode: string,
    newPermissions: UserPermissions
  ) => {
    if (userToEdit) {
      // Editing existing user
      const updatedList = users.map(u =>
        u.id === userToEdit.id
          ? {
              ...u,
              name,
              email: email || undefined,
              phone: phone || undefined,
              role,
              connectionCode,
              permissions: newPermissions
            }
          : u
      );
      setUsers(updatedList);
      setUserToEdit(null);
      setShowAddUserModal(false);
      showToast(`تم تحديث صلاحيات المستخدم "${name}"`);

      pushAuditLog(
        'USER_UPDATED',
        `تعديل صلاحيات: ${name}`,
        `قام المالك بتعديل صلاحيات وتقييد وصول المستخدم (${name}) برمز ربط: ${connectionCode}`
      );
    } else {
      // Adding new real user - strictly NO fake users
      const newUser: UserEntity = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name,
        email: email || undefined,
        phone: phone || undefined,
        role,
        connectionCode,
        status: 'ACTIVE',
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        permissions: newPermissions
      };

      const updatedList = [...users, newUser];
      setUsers(updatedList);
      setShowAddUserModal(false);
      showToast(`تم إنشاء المستخدم "${name}" وتوليد رمز الربط`);

      pushAuditLog(
        'USER_CREATED',
        `إضافة مستخدم جديد: ${name}`,
        `قام المالك بإضافة حساب جديد (${name}) بدور (${role}) وبرمز ربط فريد: ${connectionCode}`
      );
    }
  };

  // Toggle user suspension (Limit Access)
  const handleToggleSuspendUser = (userId: string) => {
    if (!isOwner) return;
    if (userId === MASTER_OWNER_ID) {
      showToast('لا يمكن تجميد حساب المالك الرئيسي');
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const willBeSuspended = targetUser.status === 'ACTIVE';
    const updatedList = users.map(u =>
      u.id === userId ? { ...u, status: willBeSuspended ? 'SUSPENDED' : ('ACTIVE' as const) } : u
    );
    setUsers(updatedList);

    if (willBeSuspended) {
      showToast(`تم تجميد وحظر وصول (${targetUser.name})`);
      pushAuditLog(
        'USER_SUSPENDED',
        `تجميد وصول مستخدم: ${targetUser.name}`,
        `قام المالك بتجميد وحظر وصول (${targetUser.name}) نهائياً`
      );
      // If currently acting as this user, revert to master owner
      if (activeUserId === userId) {
        setActiveUserId(MASTER_OWNER_ID);
      }
    } else {
      showToast(`تم إلغاء التجميد وتفعيل (${targetUser.name})`);
      pushAuditLog(
        'USER_ACTIVATED',
        `إلغاء تجميد: ${targetUser.name}`,
        `قام المالك بإلغاء التجميد واستعادة صلاحيات (${targetUser.name})`
      );
    }
  };

  // Delete User
  const handleDeleteUser = (userId: string) => {
    if (!isOwner) return;
    if (userId === MASTER_OWNER_ID) {
      showToast('لا يمكن حذف حساب المالك الرئيسي');
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast('تم حذف المستخدم بنجاح');

    if (targetUser) {
      pushAuditLog(
        'USER_DELETED',
        `حذف مستخدم: ${targetUser.name}`,
        `قام المالك بحذف المستخدم (${targetUser.name}) ورمز الربط الخاص به`
      );
    }

    if (activeUserId === userId) {
      setActiveUserId(MASTER_OWNER_ID);
    }
  };

  // Connect with Code Success
  const handleConnectSuccess = (connectedUser: UserEntity) => {
    setActiveUserId(connectedUser.id);
    setShowConnectDialog(false);
    showToast(`مرحباً بك يا ${connectedUser.name}! تم الاتصال بحسابك`);

    pushAuditLog(
      'USER_CONNECTED',
      `تسجيل دخول برمز الربط: ${connectedUser.name}`,
      `تم الاتصال الناجح بالحساب باستخدام رمز الربط (${connectedUser.connectionCode})`
    );
  };

  // Currency Settings Handler
  const handleSaveCurrencySettings = (newSettings: AppCurrencySettings) => {
    setCurrencySettings(newSettings);
    saveCurrencySettings(newSettings);
    showToast(`تم حفظ وتعيين العملة الأساسية: ${newSettings.primaryCurrency}`);
    pushAuditLog(
      'SETTINGS_UPDATED',
      `تحديث عملة الحساب: ${newSettings.primaryCurrency}`,
      `قام ${currentUser.name} بتعيين العملة الأساسية إلى ${newSettings.primaryCurrency}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 border border-emerald-400/40 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2.5">
            <img
              src="/ic_accounting_house.jpg"
              alt="شعار بيت المحاسبة"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-700 shadow-sm shrink-0"
              onError={e => {
                (e.target as HTMLImageElement).src = '/ic_accounting_logo.jpg';
              }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-100 leading-tight">
                  بيت المحاسبة
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  إرسال تلقائي Gmail
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400">
                إدارة المبيعات والمصاريف والديون
              </p>
            </div>
          </div>

          {/* User Badge & Quick Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const nextState = !soundOn;
                setSoundOn(nextState);
                setSoundEnabled(nextState);
                if (nextState) {
                  playPopSound();
                }
                showToast(nextState ? 'تم تفعيل المؤثرات الصوتية للأزرار 🔊' : 'تم كتم المؤثرات الصوتية 🔇');
              }}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-sm min-h-[38px] ${
                soundOn
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-emerald-400 border-slate-700'
                  : 'bg-slate-800/50 hover:bg-slate-700 text-slate-500 border-slate-800'
              }`}
              title={soundOn ? 'المؤثرات الصوتية مفعلة (انقر للكتم)' : 'المؤثرات الصوتية مكتومة (انقر للتفعيل)'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden lg:inline">{soundOn ? 'الصوت فعال' : 'صامت'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConnectDialog(true)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm min-h-[38px]"
              title="تبديل أو اتصال برمز الدخول"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex flex-col text-start">
                <span className="text-[9px] text-slate-400 leading-none">الحساب النشط</span>
                <span className="text-xs font-bold text-slate-100 truncate max-w-[90px] sm:max-w-[130px]">
                  {currentUser.name}
                </span>
              </div>
            </button>

            {/* Backup & Restore Button */}
            {permissions.canManageBackups && (
              <button
                id="backup_restore_button"
                type="button"
                onClick={() => setShowBackupRestore(true)}
                className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm min-h-[38px]"
                title="النسخ الاحتياطي واستعادة السجلات (JSON)"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">النسخ الاحتياطي</span>
              </button>
            )}

            {/* Add Item Button (Owner or authorized) */}
            {permissions.canManageItems && (
              <button
                type="button"
                onClick={() => {
                  setItemToEdit(null);
                  setShowAddItem(true);
                }}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-md transition min-h-[38px]"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">إضافة خدمة / منتج</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop / Tablet Navigation Tabs */}
        <div className="hidden md:flex max-w-6xl mx-auto px-4 overflow-x-auto scrollbar-none items-center gap-1 border-t border-slate-800/60 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-2 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'OVERVIEW'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>نظرة عامة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ITEMS')}
            className={`py-2 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'ITEMS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>الخدمات والمنتجات</span>
            {items.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {items.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DEBTS')}
            className={`py-2 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'DEBTS'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>ديون الزبائن</span>
            {totalDebtsUnpaid > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                {formatMoney(totalDebtsUnpaid, currencySettings.primaryCurrency)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EXPENSES')}
            className={`py-2 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'EXPENSES'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>المصاريف</span>
            {totalExpenses > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-400 font-bold">
                {formatMoney(totalExpenses, currencySettings.primaryCurrency)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LEDGER')}
            className={`py-2 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'LEDGER'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>سجل الحركات</span>
            {transactions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {transactions.length}
              </span>
            )}
          </button>

          {/* USERS MANAGEMENT TAB */}
          <button
            type="button"
            onClick={() => setActiveTab('USERS')}
            className={`py-2 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'USERS'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمين والربط</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-bold">
              {users.length}
            </span>
          </button>

          {/* AUDIT LOG TAB */}
          <button
            type="button"
            onClick={() => setActiveTab('AUDIT_LOG')}
            className={`py-2 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'AUDIT_LOG'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل التغييرات</span>
            {auditLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                {auditLogs.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3.5 sm:p-6 pb-24 md:pb-8 flex flex-col gap-4">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="flex flex-col gap-4">
            {/* Time Range Filter Bar */}
            <div className="grid grid-cols-4 gap-1 sm:flex sm:items-center sm:gap-1.5 w-full bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTimeRange('ALL_TIME')}
                className={`py-2 rounded-xl text-xs font-bold transition text-center min-h-[38px] ${
                  timeRange === 'ALL_TIME'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('TODAY')}
                className={`py-2 rounded-xl text-xs font-bold transition text-center min-h-[38px] ${
                  timeRange === 'TODAY'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('THIS_WEEK')}
                className={`py-2 rounded-xl text-xs font-bold transition text-center min-h-[38px] ${
                  timeRange === 'THIS_WEEK'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                الأسبوع
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('THIS_MONTH')}
                className={`py-2 rounded-xl text-xs font-bold transition text-center min-h-[38px] ${
                  timeRange === 'THIS_MONTH'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                الشهر
              </button>
            </div>

            {/* Grid Layout: Metric Cards on top/left, Donut Chart on bottom/right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 flex flex-col gap-3">
                <MetricCards
                  totalRevenue={totalRevenue}
                  totalCashRevenue={totalCashRevenue}
                  totalDebtsUnpaid={totalDebtsUnpaid}
                  totalExpenses={totalExpenses}
                  realizedNetProfit={realizedNetProfit}
                  totalUnitsSold={totalUnitsSold}
                  avgOrderValue={avgOrderValue}
                  topItemName={topItem ? topItem.item.name : null}
                  topItemRevenue={topItem ? topItem.totalRevenue : 0}
                  canViewProfits={permissions.canViewProfits}
                  currencyCode={currencySettings.primaryCurrency}
                  onClickCalculateProfit={() => {
                    if (permissions.canViewProfits) {
                      setShowProfitCalc(true);
                    } else {
                      showToast('تم تقييد رؤية الأرباح لهذا الحساب بواسطة المالك');
                    }
                  }}
                />
              </div>

              <div className="lg:col-span-5">
                <SalesDonutChart
                  itemSummaries={itemSummaries}
                  totalRevenue={totalRevenue}
                  totalUnitsSold={totalUnitsSold}
                  selectedSummary={selectedSummary}
                  onSelectSummary={setSelectedSummary}
                />
              </div>
            </div>

            {/* Quick Interactive Services & Sales Performance Panel on Overview */}
            <OverviewServicesPanel
              items={items}
              itemSummaries={itemSummaries}
              currencyCode={currencySettings.primaryCurrency}
              canRecordSales={permissions.canRecordSales}
              onQuickSale={handleQuickSale}
              onOpenSaleDialog={item => {
                if (permissions.canRecordSales) {
                  setItemToSell(item);
                } else {
                  showToast('ليس لديك صلاحية تسجيل المبيعات');
                }
              }}
              onNavigateToItemsTab={() => setActiveTab('ITEMS')}
            />
          </div>
        )}

        {/* TAB 2: PRODUCTS / ITEMS */}
        {activeTab === 'ITEMS' && (
          <ItemsView
            items={items}
            currencyCode={currencySettings.primaryCurrency}
            onRequestAddItem={() => {
              if (permissions.canManageItems) {
                setItemToEdit(null);
                setShowAddItem(true);
              } else {
                showToast('ليس لديك صلاحية إضافة منتجات');
              }
            }}
            onEditItem={item => {
              if (permissions.canManageItems) {
                setItemToEdit(item);
                setShowAddItem(true);
              } else {
                showToast('ليس لديك صلاحية تعديل المنتجات');
              }
            }}
            onDeleteItem={handleDeleteItem}
            onQuickSale={handleQuickSale}
            onOpenSaleDialog={item => {
              if (permissions.canRecordSales) {
                setItemToSell(item);
              } else {
                showToast('ليس لديك صلاحية تسجيل المبيعات');
              }
            }}
          />
        )}

        {/* TAB 3: CUSTOMER DEBTS */}
        {activeTab === 'DEBTS' && (
          <CustomerDebtsView
            customerSummaries={customerDebtSummaries}
            totalUnpaidDebts={totalDebtsUnpaid}
            currencyCode={currencySettings.primaryCurrency}
            onSelectCustomer={customer => setCustomerDebtDetails(customer)}
            onSettleAllDebtsForCustomer={handleSettleAllDebtsForCustomer}
            onRequestAddDebt={() => {
              if (permissions.canManageDebts) {
                setShowManualDebt(true);
              } else {
                showToast('ليس لديك صلاحية قيد الديون');
              }
            }}
          />
        )}

        {/* TAB 4: EXPENSES */}
        {activeTab === 'EXPENSES' && (
          <ExpensesView
            expenses={filteredExpenses}
            totalExpenses={totalExpenses}
            currencyCode={currencySettings.primaryCurrency}
            onRequestAddExpense={() => {
              if (permissions.canManageExpenses) {
                setShowAddExpense(true);
              } else {
                showToast('ليس لديك صلاحية قيد المصاريف');
              }
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {/* TAB 5: SALES LEDGER */}
        {activeTab === 'LEDGER' && (
          <TransactionsLedger
            transactions={filteredTransactions}
            currencyCode={currencySettings.primaryCurrency}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {/* TAB 6: USERS & CODE CONNECTION */}
        {activeTab === 'USERS' && (
          <UsersManagementView
            users={users}
            currentUserId={currentUser.id}
            onRequestAddUser={() => {
              if (isOwner) {
                setUserToEdit(null);
                setShowAddUserModal(true);
              } else {
                showToast('إضافة المستخدمين محصورة بالمالك الرئيسي');
              }
            }}
            onEditUser={user => {
              if (isOwner) {
                setUserToEdit(user);
                setShowAddUserModal(true);
              } else {
                showToast('تعديل الصلاحيات محصور بمالك الحساب');
              }
            }}
            onToggleSuspendUser={handleToggleSuspendUser}
            onDeleteUser={handleDeleteUser}
            onOpenConnectDialog={() => setShowConnectDialog(true)}
          />
        )}

        {/* TAB 7: AUDIT LOGS */}
        {activeTab === 'AUDIT_LOG' && (
          <AuditLogView
            logs={auditLogs}
            isOwner={isOwner}
            onClearLogs={() => {
              if (isOwner) {
                if (window.confirm('هل أنت متأكد من مسح كامل سجل العمليات والرقابة؟')) {
                  setAuditLogs([]);
                  showToast('تم مسح السجل');
                }
              }
            }}
          />
        )}
      </main>

      {/* Ergonomic Bottom Navigation Bar for Portrait Mobile Screens */}
      <nav
        id="mobile_bottom_navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-1 py-1.5 flex justify-around items-center shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition min-w-[48px] ${
            activeTab === 'OVERVIEW'
              ? 'text-emerald-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">نظرة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ITEMS')}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition min-w-[48px] ${
            activeTab === 'ITEMS'
              ? 'text-emerald-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">الخدمات</span>
          {items.length > 0 && (
            <span className="absolute top-0 end-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[8px] flex items-center justify-center">
              {items.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DEBTS')}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition min-w-[48px] ${
            activeTab === 'DEBTS'
              ? 'text-rose-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">الديون</span>
          {totalDebtsUnpaid > 0 && (
            <span className="absolute top-0 end-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EXPENSES')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition min-w-[48px] ${
            activeTab === 'EXPENSES'
              ? 'text-amber-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">المصاريف</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition min-w-[48px] ${
            activeTab === 'USERS'
              ? 'text-purple-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">المستخدمين</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUDIT_LOG')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition min-w-[48px] ${
            activeTab === 'AUDIT_LOG'
              ? 'text-emerald-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">السجل</span>
        </button>
      </nav>

      {/* MODAL DIALOGS */}
      {showProfitCalc && (
        <RealizedProfitCalculatorDialog
          totalRevenue={totalRevenue}
          totalCashRevenue={totalCashRevenue}
          totalUnpaidDebts={totalDebtsUnpaid}
          totalExpenses={totalExpenses}
          realizedNetProfit={realizedNetProfit}
          currencyCode={currencySettings.primaryCurrency}
          onDismiss={() => setShowProfitCalc(false)}
        />
      )}

      {showAddItem && (
        <AddItemDialog
          initialItem={itemToEdit}
          currencyCode={currencySettings.primaryCurrency}
          onDismiss={() => {
            setShowAddItem(false);
            setItemToEdit(null);
          }}
          onConfirm={handleSaveItem}
        />
      )}

      {itemToSell && (
        <RecordSaleDialog
          item={itemToSell}
          currencyCode={currencySettings.primaryCurrency}
          onDismiss={() => setItemToSell(null)}
          onConfirm={handleConfirmSale}
        />
      )}

      {showManualDebt && (
        <RecordManualDebtDialog
          currencyCode={currencySettings.primaryCurrency}
          onDismiss={() => setShowManualDebt(false)}
          onConfirm={handleConfirmManualDebt}
        />
      )}

      {showAddExpense && (
        <AddExpenseDialog
          currencyCode={currencySettings.primaryCurrency}
          onDismiss={() => setShowAddExpense(false)}
          onConfirm={handleSaveExpense}
        />
      )}

      {customerDebtDetails && (
        <CustomerDebtDetailsDialog
          summary={customerDebtDetails}
          currencyCode={currencySettings.primaryCurrency}
          onDismiss={() => setCustomerDebtDetails(null)}
          onSettleDebt={handleSettleSingleDebt}
          onSettleAll={handleSettleAllDebtsForCustomer}
        />
      )}

      {showBackupRestore && (
        <BackupRestoreDialog
          jsonExport={currentJsonExport}
          onRestoreJson={handleRestoreJson}
          onDismiss={() => setShowBackupRestore(false)}
        />
      )}

      {/* ADD / EDIT USER DIALOG */}
      {showAddUserModal && (
        <AddUserDialog
          initialUser={userToEdit}
          onDismiss={() => {
            setShowAddUserModal(false);
            setUserToEdit(null);
          }}
          onConfirm={handleCreateOrUpdateUser}
        />
      )}

      {/* CONNECT WITH CODE DIALOG */}
      {showConnectDialog && (
        <ConnectWithCodeDialog
          users={users}
          currentUserId={currentUser.id}
          onConnectSuccess={handleConnectSuccess}
          onDismiss={() => setShowConnectDialog(false)}
        />
      )}

      {/* NEW SALE SUCCESS POPUP SCREEN */}
      {lastSaleSuccess && (
        <SaleSuccessModal
          transaction={lastSaleSuccess}
          currencyCode={currencySettings.primaryCurrency}
          onDismiss={() => setLastSaleSuccess(null)}
          onRecordAnotherSale={() => {
            setLastSaleSuccess(null);
            if (items.length > 0) {
              setItemToSell(items[0]);
            }
          }}
        />
      )}
    </div>
  );
}
