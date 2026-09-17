package com.example.ui

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MoneyOff
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material.icons.filled.PointOfSale
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.R
import com.example.data.db.ItemEntity
import com.example.data.db.SaleTransactionEntity
import com.example.ui.components.AccountingMetricCards
import com.example.ui.components.CustomerDebtsView
import com.example.ui.components.ExpensesView
import com.example.ui.components.ItemSalesCard
import com.example.ui.components.SalesDonutChart
import com.example.ui.components.TransactionRow
import com.example.ui.dialogs.AddExpenseDialog
import com.example.ui.dialogs.AddOrEditItemDialog
import com.example.ui.dialogs.BackupRestoreDialog
import com.example.ui.dialogs.CustomerDebtDetailsDialog
import com.example.ui.dialogs.RealizedProfitCalculatorDialog
import com.example.ui.dialogs.RecordManualDebtDialog
import com.example.ui.dialogs.RecordSaleDialog
import com.example.ui.dialogs.ShareAndAccessDialog
import com.example.ui.models.AccountingTab
import com.example.ui.models.AccountingUiState
import com.example.ui.models.AppLanguage
import com.example.ui.models.CustomerDebtSummary
import com.example.ui.models.ItemSalesSummary
import com.example.ui.models.TimeRangeFilter
import com.example.ui.models.UserRole
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen(
    viewModel: AccountingViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val isArabic = uiState.appLanguage == AppLanguage.ARABIC
    val layoutDirection = if (isArabic) LayoutDirection.Rtl else LayoutDirection.Ltr

    var showAddItemDialog by remember { mutableStateOf(false) }
    var itemToEdit by remember { mutableStateOf<ItemEntity?>(null) }
    var showRecordSaleDialog by remember { mutableStateOf(false) }
    var preSelectedItemForSale by remember { mutableStateOf<ItemEntity?>(null) }
    var showResetConfirmDialog by remember { mutableStateOf(false) }
    var itemToDelete by remember { mutableStateOf<ItemEntity?>(null) }
    var showBackupDialog by remember { mutableStateOf(false) }
    var showShareAndAccessDialog by remember { mutableStateOf(false) }

    // Debts & Expenses Dialog States
    var showAddExpenseDialog by remember { mutableStateOf(false) }
    var showManualDebtDialog by remember { mutableStateOf(false) }
    var showProfitCalculatorDialog by remember { mutableStateOf(false) }
    var selectedCustomerForStatement by remember { mutableStateOf<CustomerDebtSummary?>(null) }

    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Scaffold(
            modifier = modifier.fillMaxSize(),
            topBar = {
                TopAppBar(
                    title = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(end = 8.dp)
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_accounting_logo),
                                contentDescription = "Accounting House Logo",
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(10.dp))
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = if (isArabic) "بيت المحاسبة" else "Accounting House",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Surface(
                                        shape = RoundedCornerShape(4.dp),
                                        color = if (uiState.canUserEdit) MaterialTheme.colorScheme.primaryContainer
                                                else MaterialTheme.colorScheme.secondaryContainer,
                                        modifier = Modifier.clickable { showShareAndAccessDialog = true }
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Icon(
                                                imageVector = if (uiState.canUserEdit) Icons.Default.Edit else Icons.Default.Visibility,
                                                contentDescription = null,
                                                modifier = Modifier.size(10.dp),
                                                tint = if (uiState.canUserEdit) MaterialTheme.colorScheme.onPrimaryContainer
                                                       else MaterialTheme.colorScheme.onSecondaryContainer
                                            )
                                            Spacer(modifier = Modifier.width(3.dp))
                                            Text(
                                                text = if (isArabic) uiState.currentUser.role.arTitle else uiState.currentUser.role.enTitle,
                                                style = MaterialTheme.typography.labelSmall,
                                                fontWeight = FontWeight.Bold,
                                                color = if (uiState.canUserEdit) MaterialTheme.colorScheme.onPrimaryContainer
                                                       else MaterialTheme.colorScheme.onSecondaryContainer,
                                                fontSize = 10.sp
                                            )
                                        }
                                    }
                                }
                                Text(
                                    text = if (isArabic) "الحساب: ${uiState.gmailSettings.email}" else "Sync: ${uiState.gmailSettings.email}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 10.sp,
                                    maxLines = 1
                                )
                            }
                        }
                    },
                    actions = {
                        IconButton(
                            onClick = { showShareAndAccessDialog = true },
                            modifier = Modifier.testTag("top_share_access_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Group,
                                contentDescription = if (isArabic) "المشاركة والصلاحيات" else "Share & Access",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }

                        IconButton(
                            onClick = { showBackupDialog = true },
                            modifier = Modifier.testTag("top_backup_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.CloudSync,
                                contentDescription = if (isArabic) "النسخ الاحتياطي و Gmail" else "Backup & Gmail",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }

                        IconButton(
                            onClick = {
                                val nextLang = if (isArabic) AppLanguage.ENGLISH else AppLanguage.ARABIC
                                viewModel.setLanguage(nextLang)
                            },
                            modifier = Modifier.testTag("top_language_toggle")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Language,
                                contentDescription = if (isArabic) "English" else "العربية",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        if (uiState.canUserEdit) {
                            IconButton(
                                onClick = {
                                    itemToEdit = null
                                    showAddItemDialog = true
                                },
                                modifier = Modifier.testTag("top_add_item_button")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = if (isArabic) "إضافة منتج" else "Add Item",
                                    tint = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            },
            bottomBar = {
                NavigationBar(
                    modifier = Modifier
                        .windowInsetsPadding(WindowInsets.navigationBars)
                        .testTag("main_navigation_bar"),
                    containerColor = MaterialTheme.colorScheme.surface
                ) {
                    NavigationBarItem(
                        selected = uiState.activeTab == AccountingTab.OVERVIEW,
                        onClick = { viewModel.setActiveTab(AccountingTab.OVERVIEW) },
                        icon = { Icon(Icons.Default.PieChart, contentDescription = "Overview") },
                        label = { Text(if (isArabic) "نظرة عامة" else "Overview") },
                        modifier = Modifier.testTag("nav_tab_overview")
                    )
                    NavigationBarItem(
                        selected = uiState.activeTab == AccountingTab.ITEMS,
                        onClick = { viewModel.setActiveTab(AccountingTab.ITEMS) },
                        icon = { Icon(Icons.Default.Inventory2, contentDescription = "Items") },
                        label = {
                            Text(if (isArabic) "المنتجات" else "Items")
                        },
                        modifier = Modifier.testTag("nav_tab_items")
                    )
                    NavigationBarItem(
                        selected = uiState.activeTab == AccountingTab.DEBTS,
                        onClick = { viewModel.setActiveTab(AccountingTab.DEBTS) },
                        icon = { Icon(Icons.Default.CreditCard, contentDescription = "Debts") },
                        label = {
                            val activeDebtsCount = uiState.customerDebtSummaries.count { it.totalUnpaidDebt > 0 }
                            Text(
                                if (isArabic) {
                                    if (activeDebtsCount > 0) "الديون ($activeDebtsCount)" else "الديون"
                                } else {
                                    if (activeDebtsCount > 0) "Debts ($activeDebtsCount)" else "Debts"
                                }
                            )
                        },
                        modifier = Modifier.testTag("nav_tab_debts")
                    )
                    NavigationBarItem(
                        selected = uiState.activeTab == AccountingTab.EXPENSES,
                        onClick = { viewModel.setActiveTab(AccountingTab.EXPENSES) },
                        icon = { Icon(Icons.Default.MoneyOff, contentDescription = "Expenses") },
                        label = { Text(if (isArabic) "المصاريف" else "Expenses") },
                        modifier = Modifier.testTag("nav_tab_expenses")
                    )
                    NavigationBarItem(
                        selected = uiState.activeTab == AccountingTab.LEDGER,
                        onClick = { viewModel.setActiveTab(AccountingTab.LEDGER) },
                        icon = { Icon(Icons.Default.ReceiptLong, contentDescription = "Ledger") },
                        label = {
                            Text(if (isArabic) "المبيعات" else "Sales")
                        },
                        modifier = Modifier.testTag("nav_tab_ledger")
                    )
                }
            },
            floatingActionButton = {
                if (uiState.canUserEdit) {
                    when (uiState.activeTab) {
                        AccountingTab.DEBTS -> {
                            ExtendedFloatingActionButton(
                                onClick = { showManualDebtDialog = true },
                                icon = { Icon(Icons.Default.CreditCard, contentDescription = null) },
                                text = { Text(if (isArabic) "+ تسجيل دَين زبون" else "+ Record Debt") },
                                containerColor = MaterialTheme.colorScheme.error,
                                contentColor = MaterialTheme.colorScheme.onError,
                                modifier = Modifier.testTag("main_fab_record_debt")
                            )
                        }
                        AccountingTab.EXPENSES -> {
                            ExtendedFloatingActionButton(
                                onClick = { showAddExpenseDialog = true },
                                icon = { Icon(Icons.Default.MoneyOff, contentDescription = null) },
                                text = { Text(if (isArabic) "+ إضافة مصروف" else "+ Add Expense") },
                                containerColor = MaterialTheme.colorScheme.error,
                                contentColor = MaterialTheme.colorScheme.onError,
                                modifier = Modifier.testTag("main_fab_add_expense")
                            )
                        }
                        else -> {
                            ExtendedFloatingActionButton(
                                onClick = {
                                    if (uiState.items.isEmpty()) {
                                        itemToEdit = null
                                        showAddItemDialog = true
                                    } else {
                                        preSelectedItemForSale = null
                                        showRecordSaleDialog = true
                                    }
                                },
                                icon = {
                                    Icon(
                                        imageVector = if (uiState.items.isEmpty()) Icons.Default.Add else Icons.Default.PointOfSale,
                                        contentDescription = null
                                    )
                                },
                                text = {
                                    Text(
                                        if (uiState.items.isEmpty()) {
                                            if (isArabic) "إضافة أول منتج" else "Add First Item"
                                        } else {
                                            if (isArabic) "+ تسجيل بيع / دين" else "+ Record Sale / Debt"
                                        }
                                    )
                                },
                                modifier = Modifier.testTag("main_fab_record_sale")
                            )
                        }
                    }
                } else {
                    ExtendedFloatingActionButton(
                        onClick = {
                            Toast.makeText(
                                context,
                                if (isArabic) "أنت حالياً بدور 'مشاهد فقط'. قم بالتبديل إلى دور 'محرر' لتسجيل المبيعات."
                                else "You are currently a 'Viewer'. Switch to 'Editor' to record sales.",
                                Toast.LENGTH_LONG
                            ).show()
                            showShareAndAccessDialog = true
                        },
                        icon = {
                            Icon(Icons.Default.Lock, contentDescription = null)
                        },
                        text = {
                            Text(if (isArabic) "مشاهد فقط (مغلق)" else "Viewer Mode (Locked)")
                        },
                        containerColor = MaterialTheme.colorScheme.secondaryContainer,
                        contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
                        modifier = Modifier.testTag("main_fab_viewer_locked")
                    )
                }
            }
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                // Time range filter row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.FilterList,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(18.dp)
                    )

                    TimeRangeFilter.entries.forEach { filter ->
                        val isSelected = uiState.timeFilter == filter
                        val filterLabel = when (filter) {
                            TimeRangeFilter.ALL_TIME -> if (isArabic) "كل الوقت" else "All Time"
                            TimeRangeFilter.TODAY -> if (isArabic) "اليوم" else "Today"
                            TimeRangeFilter.THIS_WEEK -> if (isArabic) "هذا الأسبوع" else "This Week"
                            TimeRangeFilter.THIS_MONTH -> if (isArabic) "هذا الشهر" else "This Month"
                        }
                        FilterChip(
                            selected = isSelected,
                            onClick = { viewModel.setTimeFilter(filter) },
                            label = { Text(filterLabel) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                            ),
                            modifier = Modifier.testTag("time_filter_${filter.name}")
                        )
                    }
                }

                // Screen Content by Tab
                when (uiState.activeTab) {
                    AccountingTab.OVERVIEW -> {
                        OverviewTabContent(
                            uiState = uiState,
                            isArabic = isArabic,
                            canEdit = uiState.canUserEdit,
                            onSelectSummary = { viewModel.selectItemSummary(it) },
                            onQuickSale = { viewModel.recordQuickSale(it) },
                            onCustomSale = {
                                preSelectedItemForSale = it
                                showRecordSaleDialog = true
                            },
                            onEditItem = {
                                itemToEdit = it
                                showAddItemDialog = true
                            },
                            onDeleteItem = { itemToDelete = it },
                            onAddNewItem = {
                                itemToEdit = null
                                showAddItemDialog = true
                            },
                            onOpenProfitCalculator = { showProfitCalculatorDialog = true }
                        )
                    }
                    AccountingTab.ITEMS -> {
                        ItemsTabContent(
                            uiState = uiState,
                            isArabic = isArabic,
                            canEdit = uiState.canUserEdit,
                            onQuickSale = { viewModel.recordQuickSale(it) },
                            onCustomSale = {
                                preSelectedItemForSale = it
                                showRecordSaleDialog = true
                            },
                            onEditItem = {
                                itemToEdit = it
                                showAddItemDialog = true
                            },
                            onDeleteItem = { itemToDelete = it },
                            onAddNewItem = {
                                itemToEdit = null
                                showAddItemDialog = true
                            }
                        )
                    }
                    AccountingTab.DEBTS -> {
                        CustomerDebtsView(
                            customerSummaries = uiState.customerDebtSummaries,
                            totalUnpaidDebts = uiState.totalDebtsUnpaid,
                            canEdit = uiState.canUserEdit,
                            isArabic = isArabic,
                            onSelectCustomer = { selectedCustomerForStatement = it },
                            onSettleAllDebtsForCustomer = { viewModel.settleAllDebtsForCustomer(it) },
                            onRequestAddDebt = { showManualDebtDialog = true }
                        )
                    }
                    AccountingTab.EXPENSES -> {
                        ExpensesView(
                            expenses = uiState.expenses,
                            totalExpenses = uiState.totalExpenses,
                            canEdit = uiState.canUserEdit,
                            isArabic = isArabic,
                            onRequestAddExpense = { showAddExpenseDialog = true },
                            onDeleteExpense = { viewModel.deleteExpense(it) }
                        )
                    }
                    AccountingTab.LEDGER -> {
                        LedgerTabContent(
                            transactions = uiState.filteredTransactions,
                            isArabic = isArabic,
                            canEdit = uiState.canUserEdit,
                            onDeleteTransaction = { viewModel.voidTransaction(it) }
                        )
                    }
                }
            }
        }

        // Add / Edit Item Dialog
        if (showAddItemDialog) {
            AddOrEditItemDialog(
                itemToEdit = itemToEdit,
                isArabic = isArabic,
                onDismiss = {
                    showAddItemDialog = false
                    itemToEdit = null
                },
                onSave = { name, category, price, colorHex, sku, description ->
                    if (itemToEdit == null) {
                        viewModel.addItem(name, category, price, colorHex, sku, description)
                    } else {
                        viewModel.updateItem(
                            id = itemToEdit!!.id,
                            name = name,
                            category = category,
                            unitPrice = price,
                            colorHex = colorHex,
                            sku = sku,
                            description = description
                        )
                    }
                    showAddItemDialog = false
                    itemToEdit = null
                }
            )
        }

        // Record Sale Dialog (With Checkbox "دين" & Customer Name/Phone)
        if (showRecordSaleDialog) {
            RecordSaleDialog(
                items = uiState.items,
                preSelectedItem = preSelectedItemForSale,
                isArabic = isArabic,
                onDismiss = {
                    showRecordSaleDialog = false
                    preSelectedItemForSale = null
                },
                onConfirmSale = { item, quantity, unitPrice, note, isDebt, customerName, customerPhone ->
                    viewModel.recordSale(
                        itemId = item.id,
                        quantity = quantity,
                        unitPrice = unitPrice,
                        note = note,
                        isDebt = isDebt,
                        customerName = customerName,
                        customerPhone = customerPhone
                    )
                    showRecordSaleDialog = false
                    preSelectedItemForSale = null
                }
            )
        }

        // Add Expense Dialog (Salaries, Food, Rent, etc.)
        if (showAddExpenseDialog) {
            AddExpenseDialog(
                isArabic = isArabic,
                onDismiss = { showAddExpenseDialog = false },
                onConfirmExpense = { title, category, amount, note ->
                    viewModel.addExpense(title, category, amount, note)
                    showAddExpenseDialog = false
                }
            )
        }

        // Record Manual Debt Dialog
        if (showManualDebtDialog) {
            RecordManualDebtDialog(
                isArabic = isArabic,
                onDismiss = { showManualDebtDialog = false },
                onConfirm = { custName, phone, item, amount, note ->
                    viewModel.recordDirectDebt(custName, phone, item, amount, note)
                    showManualDebtDialog = false
                }
            )
        }

        // Customer Debt Statement Dialog (View full debt for 1 person & settle single/all)
        selectedCustomerForStatement?.let { summary ->
            val currentSummary = uiState.customerDebtSummaries.find { it.customerName == summary.customerName } ?: summary
            CustomerDebtDetailsDialog(
                summary = currentSummary,
                canEdit = uiState.canUserEdit,
                isArabic = isArabic,
                onSettleSingleDebt = { debtId -> viewModel.settleDebt(debtId) },
                onSettleAllDebts = { custName -> viewModel.settleAllDebtsForCustomer(custName) },
                onDismiss = { selectedCustomerForStatement = null }
            )
        }

        // Current Realized Profit Calculator Dialog (Excludes Unpaid Debts)
        if (showProfitCalculatorDialog) {
            RealizedProfitCalculatorDialog(
                totalRevenue = uiState.totalRevenue,
                totalCashRevenue = uiState.totalCashRevenue,
                totalUnpaidDebts = uiState.totalDebtsUnpaid,
                totalExpenses = uiState.totalExpenses,
                realizedNetProfit = uiState.realizedNetProfit,
                isArabic = isArabic,
                onDismiss = { showProfitCalculatorDialog = false }
            )
        }

        // Share and Access Control Dialog
        if (showShareAndAccessDialog) {
            ShareAndAccessDialog(
                currentUser = uiState.currentUser,
                teamUsers = uiState.teamUsers,
                isArabic = isArabic,
                onSwitchUser = { viewModel.switchUser(it) },
                onToggleRole = { viewModel.toggleCurrentRole() },
                onUpdateUserRole = { id, role -> viewModel.updateUserRole(id, role) },
                onAddUser = { name, email, role -> viewModel.addUser(name, email, role) },
                onRemoveUser = { viewModel.removeUser(it) },
                onGenerateShareCode = { role -> viewModel.exportSharePackage(role) },
                onImportShareCode = { code -> viewModel.importSharePackage(code) },
                onDismiss = { showShareAndAccessDialog = false }
            )
        }

        // Backup and Restore Dialog (with Gmail Auto Backup to superwash38@gmail.com)
        if (showBackupDialog) {
            BackupRestoreDialog(
                currentLanguage = uiState.appLanguage,
                gmailSettings = uiState.gmailSettings,
                onUpdateGmailSettings = { email, auto, freq ->
                    viewModel.updateGmailSettings(email, auto, freq)
                },
                onTriggerGmailBackup = { viewModel.triggerManualGmailBackup() },
                onGetGmailEmailDetails = { viewModel.getGmailBackupEmailDetails() },
                onExportJson = { viewModel.exportBackupJson() },
                onRestoreJson = { json -> viewModel.restoreFromJson(json) },
                onClearAllData = { showResetConfirmDialog = true },
                onDismiss = { showBackupDialog = false }
            )
        }

        // Delete Item Confirmation Dialog
        if (itemToDelete != null) {
            AlertDialog(
                onDismissRequest = { itemToDelete = null },
                title = { Text(if (isArabic) "حذف المنتج؟" else "Delete Item?") },
                text = {
                    Text(
                        if (isArabic) {
                            "هل أنت متأكد من حذف '${itemToDelete?.name}'؟ سيتم حذف جميع المبيعات المرتبطة به أيضاً."
                        } else {
                            "Are you sure you want to delete '${itemToDelete?.name}'? All related sales will be removed from records."
                        }
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            itemToDelete?.let { viewModel.deleteItem(it) }
                            itemToDelete = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                        modifier = Modifier.testTag("confirm_delete_item_button")
                    ) {
                        Text(if (isArabic) "حذف" else "Delete")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { itemToDelete = null }) {
                        Text(if (isArabic) "إلغاء" else "Cancel")
                    }
                }
            )
        }

        // Reset / Clear All Data Confirmation Dialog
        if (showResetConfirmDialog) {
            AlertDialog(
                onDismissRequest = { showResetConfirmDialog = false },
                title = { Text(if (isArabic) "تفريغ ومسح جميع البيانات؟" else "Clear All Data & Start Fresh?") },
                text = {
                    Text(
                        if (isArabic) {
                            "سيتم مسح جميع الأصناف والمبيعات والديون والمصاريف وترك جميع الخانات فارغة للبدء من الصفر."
                        } else {
                            "This will wipe all items, sales, debts, and expenses leaving all sections completely blank to start from scratch."
                        }
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.clearAllData()
                            showResetConfirmDialog = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                        modifier = Modifier.testTag("confirm_reset_demo_button")
                    ) {
                        Text(if (isArabic) "مسح وتفريغ الكل" else "Clear Everything")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showResetConfirmDialog = false }) {
                        Text(if (isArabic) "إلغاء" else "Cancel")
                    }
                }
            )
        }
    }
}

@Composable
private fun OverviewTabContent(
    uiState: AccountingUiState,
    isArabic: Boolean,
    canEdit: Boolean,
    onSelectSummary: (ItemSalesSummary?) -> Unit,
    onQuickSale: (ItemEntity) -> Unit,
    onCustomSale: (ItemEntity) -> Unit,
    onEditItem: (ItemEntity) -> Unit,
    onDeleteItem: (ItemEntity) -> Unit,
    onAddNewItem: () -> Unit,
    onOpenProfitCalculator: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. KPI Metric Cards with Net Profit & Interactive Calculator Button
        item {
            val topItem = uiState.itemSummaries.firstOrNull { it.totalRevenue > 0 }
            AccountingMetricCards(
                totalRevenue = uiState.totalRevenue,
                totalCashRevenue = uiState.totalCashRevenue,
                totalDebtsUnpaid = uiState.totalDebtsUnpaid,
                totalExpenses = uiState.totalExpenses,
                realizedNetProfit = uiState.realizedNetProfit,
                totalUnitsSold = uiState.totalUnitsSold,
                avgOrderValue = uiState.averageOrderValue,
                topItemName = topItem?.item?.name,
                topItemRevenue = topItem?.totalRevenue ?: 0.0,
                isArabic = isArabic,
                onClickCalculateProfit = onOpenProfitCalculator
            )
        }

        // 2. The Circular Donut Chart showing which sales most come from
        item {
            SalesDonutChart(
                itemSummaries = uiState.itemSummaries,
                totalRevenue = uiState.totalRevenue,
                totalUnitsSold = uiState.totalUnitsSold,
                selectedSummary = uiState.selectedItemSummary,
                onSelectSummary = onSelectSummary,
                isArabic = isArabic
            )
        }

        // 3. Section Header for Items
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isArabic) "الأصناف والمبيعات المباشرة" else "Items & Direct Sales",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                if (canEdit) {
                    TextButton(
                        onClick = onAddNewItem,
                        modifier = Modifier.testTag("section_add_item_button")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(if (isArabic) "إضافة صنف" else "Add Item")
                    }
                }
            }
        }

        // 4. Item cards with +1 Quick Sale buttons
        if (uiState.itemSummaries.isEmpty()) {
            item {
                EmptyItemsPlaceholder(isArabic = isArabic, canEdit = canEdit, onAddNewItem = onAddNewItem)
            }
        } else {
            items(uiState.itemSummaries, key = { it.item.id }) { summary ->
                ItemSalesCard(
                    summary = summary,
                    isArabic = isArabic,
                    canEdit = canEdit,
                    onQuickSalePlusOne = { onQuickSale(summary.item) },
                    onCustomSale = { onCustomSale(summary.item) },
                    onEditItem = { onEditItem(summary.item) },
                    onDeleteItem = { onDeleteItem(summary.item) }
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(72.dp))
        }
    }
}

@Composable
private fun ItemsTabContent(
    uiState: AccountingUiState,
    isArabic: Boolean,
    canEdit: Boolean,
    onQuickSale: (ItemEntity) -> Unit,
    onCustomSale: (ItemEntity) -> Unit,
    onEditItem: (ItemEntity) -> Unit,
    onDeleteItem: (ItemEntity) -> Unit,
    onAddNewItem: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (isArabic) "كتالوج المنتجات" else "Product Catalog",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (isArabic) {
                                if (canEdit) "إضافة وتعديل المنتجات وتسجيل المبيعات" else "عرض الأصناف والأسعار (وضع المشاهدة فقط)"
                            } else {
                                if (canEdit) "Add, customize, and record sales per item" else "View items & pricing (Viewer mode)"
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    if (canEdit) {
                        Button(
                            onClick = onAddNewItem,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.testTag("catalog_add_item_button")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(if (isArabic) "إضافة" else "Add Item")
                        }
                    }
                }
            }
        }

        if (uiState.itemSummaries.isEmpty()) {
            item {
                EmptyItemsPlaceholder(isArabic = isArabic, canEdit = canEdit, onAddNewItem = onAddNewItem)
            }
        } else {
            items(uiState.itemSummaries, key = { it.item.id }) { summary ->
                ItemSalesCard(
                    summary = summary,
                    isArabic = isArabic,
                    canEdit = canEdit,
                    onQuickSalePlusOne = { onQuickSale(summary.item) },
                    onCustomSale = { onCustomSale(summary.item) },
                    onEditItem = { onEditItem(summary.item) },
                    onDeleteItem = { onDeleteItem(summary.item) }
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(72.dp))
        }
    }
}

@Composable
private fun LedgerTabContent(
    transactions: List<SaleTransactionEntity>,
    isArabic: Boolean,
    canEdit: Boolean,
    onDeleteTransaction: (Long) -> Unit
) {
    if (transactions.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    imageVector = Icons.Default.ReceiptLong,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                    modifier = Modifier.size(64.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = if (isArabic) "لا توجد مبيعات مسجلة بعد" else "No sales recorded yet",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = if (isArabic) "اضغط على '+1 بيع' على أي صنف لتسجيل حركة بيع" else "Tap '+1 Sale' on any product to record sales",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                )
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                Text(
                    text = if (isArabic) "سجل حركات المبيعات (${transactions.size})" else "Sales Transactions Log (${transactions.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            items(transactions, key = { it.id }) { tx ->
                TransactionRow(
                    transaction = tx,
                    isArabic = isArabic,
                    canEdit = canEdit,
                    onDelete = { onDeleteTransaction(tx.id) }
                )
            }

            item {
                Spacer(modifier = Modifier.height(72.dp))
            }
        }
    }
}

@Composable
private fun EmptyItemsPlaceholder(
    isArabic: Boolean,
    canEdit: Boolean,
    onAddNewItem: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.Inventory2,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = if (isArabic) "لا توجد أصناف في الكتالوج بعد" else "No items in catalog yet",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = if (isArabic) {
                    "أضف أصنافك لتتبع المبيعات وتوزيع الدائرة التفاعلي."
                } else {
                    "Add your items to start tracking sales and circular analytics."
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 6.dp)
            )
            if (canEdit) {
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = onAddNewItem,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.testTag("empty_state_add_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(if (isArabic) "إضافة أول صنف" else "Add Your First Item")
                }
            }
        }
    }
}
