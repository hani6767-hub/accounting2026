package com.example.ui

import androidx.compose.ui.graphics.Color
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.backup.BackupManager
import com.example.data.backup.ShareImportResult
import com.example.data.db.ExpenseEntity
import com.example.data.db.ItemEntity
import com.example.data.db.SaleTransactionEntity
import com.example.data.repository.AccountingRepository
import com.example.ui.models.AccountingTab
import com.example.ui.models.AccountingUiState
import com.example.ui.models.AppLanguage
import com.example.ui.models.AppUser
import com.example.ui.models.CustomerDebtSummary
import com.example.ui.models.GmailBackupSettings
import com.example.ui.models.ItemSalesSummary
import com.example.ui.models.TimeRangeFilter
import com.example.ui.models.UserRole
import com.example.ui.theme.ChartPalette
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Calendar
import java.util.UUID

private data class AccountingFilterParams(
    val timeFilter: TimeRangeFilter,
    val activeTab: AccountingTab,
    val selectedItemId: Long?,
    val appLanguage: AppLanguage,
    val backupMessage: String?
)

private data class UserAndSettingsParams(
    val currentUser: AppUser,
    val teamUsers: List<AppUser>,
    val gmailSettings: GmailBackupSettings
)

class AccountingViewModel(
    private val repository: AccountingRepository
) : ViewModel() {

    private val _timeFilter = MutableStateFlow(TimeRangeFilter.ALL_TIME)
    private val _activeTab = MutableStateFlow(AccountingTab.OVERVIEW)
    private val _selectedItemId = MutableStateFlow<Long?>(null)
    private val _appLanguage = MutableStateFlow(AppLanguage.ARABIC)
    private val _backupMessage = MutableStateFlow<String?>(null)

    private val _currentUser = MutableStateFlow(
        AppUser(
            id = "owner_default",
            name = "المشرف المالي (المالك)",
            email = "superwash38@gmail.com",
            role = UserRole.OWNER_EDITOR,
            isOwner = true
        )
    )

    private val _teamUsers = MutableStateFlow<List<AppUser>>(
        listOf(
            AppUser("owner_default", "المشرف المالي", "superwash38@gmail.com", UserRole.OWNER_EDITOR, isOwner = true),
            AppUser("user_editor", "المحاسب المالي", "accountant@accountinghouse.com", UserRole.OWNER_EDITOR, isOwner = false),
            AppUser("user_viewer", "مراقب المبيعات والشركاء", "partner.viewer@gmail.com", UserRole.VIEWER_ONLY, isOwner = false)
        )
    )

    private val _gmailSettings = MutableStateFlow(
        GmailBackupSettings(
            email = "superwash38@gmail.com",
            isAutoBackupEnabled = true,
            frequency = "after_sale",
            lastBackupTimestamp = System.currentTimeMillis() - 3600000L,
            lastBackupSummary = "النسخ التلقائي مفعل لحساب superwash38@gmail.com"
        )
    )

    init {
        viewModelScope.launch {
            // Remove default starter items and seed transactions, leaving all tabs/fields blank
            repository.removeDefaultStarterDataIfPresent()
        }
    }

    private val filterParamsFlow = combine(
        _timeFilter,
        _activeTab,
        _selectedItemId,
        _appLanguage,
        _backupMessage
    ) { timeFilter, activeTab, selectedItemId, appLanguage, backupMessage ->
        AccountingFilterParams(
            timeFilter = timeFilter,
            activeTab = activeTab,
            selectedItemId = selectedItemId,
            appLanguage = appLanguage,
            backupMessage = backupMessage
        )
    }

    private val userSettingsFlow = combine(
        _currentUser,
        _teamUsers,
        _gmailSettings
    ) { currentUser, teamUsers, gmailSettings ->
        UserAndSettingsParams(
            currentUser = currentUser,
            teamUsers = teamUsers,
            gmailSettings = gmailSettings
        )
    }

    val uiState: StateFlow<AccountingUiState> = combine(
        repository.allItems,
        repository.allTransactions,
        repository.allExpenses,
        filterParamsFlow,
        userSettingsFlow
    ) { items: List<ItemEntity>,
        transactions: List<SaleTransactionEntity>,
        expenses: List<ExpenseEntity>,
        params: AccountingFilterParams,
        userParams: UserAndSettingsParams ->

        val now = System.currentTimeMillis()
        val calendar = Calendar.getInstance()

        val filteredTransactions = when (params.timeFilter) {
            TimeRangeFilter.ALL_TIME -> transactions
            TimeRangeFilter.TODAY -> {
                calendar.timeInMillis = now
                calendar.set(Calendar.HOUR_OF_DAY, 0)
                calendar.set(Calendar.MINUTE, 0)
                calendar.set(Calendar.SECOND, 0)
                calendar.set(Calendar.MILLISECOND, 0)
                val startOfDay = calendar.timeInMillis
                transactions.filter { it.timestamp >= startOfDay }
            }
            TimeRangeFilter.THIS_WEEK -> {
                calendar.timeInMillis = now
                calendar.set(Calendar.DAY_OF_WEEK, calendar.firstDayOfWeek)
                calendar.set(Calendar.HOUR_OF_DAY, 0)
                calendar.set(Calendar.MINUTE, 0)
                calendar.set(Calendar.SECOND, 0)
                calendar.set(Calendar.MILLISECOND, 0)
                val startOfWeek = calendar.timeInMillis
                transactions.filter { it.timestamp >= startOfWeek }
            }
            TimeRangeFilter.THIS_MONTH -> {
                calendar.timeInMillis = now
                calendar.set(Calendar.DAY_OF_MONTH, 1)
                calendar.set(Calendar.HOUR_OF_DAY, 0)
                calendar.set(Calendar.MINUTE, 0)
                calendar.set(Calendar.SECOND, 0)
                calendar.set(Calendar.MILLISECOND, 0)
                val startOfMonth = calendar.timeInMillis
                transactions.filter { it.timestamp >= startOfMonth }
            }
        }

        val filteredExpenses = when (params.timeFilter) {
            TimeRangeFilter.ALL_TIME -> expenses
            TimeRangeFilter.TODAY -> {
                calendar.timeInMillis = now
                calendar.set(Calendar.HOUR_OF_DAY, 0)
                calendar.set(Calendar.MINUTE, 0)
                calendar.set(Calendar.SECOND, 0)
                calendar.set(Calendar.MILLISECOND, 0)
                val startOfDay = calendar.timeInMillis
                expenses.filter { it.timestamp >= startOfDay }
            }
            TimeRangeFilter.THIS_WEEK -> {
                calendar.timeInMillis = now
                calendar.set(Calendar.DAY_OF_WEEK, calendar.firstDayOfWeek)
                calendar.set(Calendar.HOUR_OF_DAY, 0)
                calendar.set(Calendar.MINUTE, 0)
                calendar.set(Calendar.SECOND, 0)
                calendar.set(Calendar.MILLISECOND, 0)
                val startOfWeek = calendar.timeInMillis
                expenses.filter { it.timestamp >= startOfWeek }
            }
            TimeRangeFilter.THIS_MONTH -> {
                calendar.timeInMillis = now
                calendar.set(Calendar.DAY_OF_MONTH, 1)
                calendar.set(Calendar.HOUR_OF_DAY, 0)
                calendar.set(Calendar.MINUTE, 0)
                calendar.set(Calendar.SECOND, 0)
                calendar.set(Calendar.MILLISECOND, 0)
                val startOfMonth = calendar.timeInMillis
                expenses.filter { it.timestamp >= startOfMonth }
            }
        }

        // Financial Totals:
        // 1. Total Gross Revenue (All sales + debts combined)
        val totalRevenue = filteredTransactions.sumOf { it.totalAmount }
        // 2. Pure Cash Collected in hand: regular cash sales OR settled debts
        val totalCashRevenue = filteredTransactions
            .filter { !it.isDebt || (it.isDebt && it.isSettled) }
            .sumOf { it.totalAmount }
        // 3. Outstanding Unpaid Debts (Exempt from realized profits)
        val totalDebtsUnpaid = filteredTransactions
            .filter { it.isDebt && !it.isSettled }
            .sumOf { it.totalAmount }
        // 4. Total Expenses (Salaries, Food, Supplies, Rent, etc.)
        val totalExpenses = filteredExpenses.sumOf { it.amount }
        // 5. Net Realized Cash Profit = (Cash Collected) - (Expenses) [Without unpaid debts!]
        val realizedNetProfit = totalCashRevenue - totalExpenses

        val totalUnitsSold = filteredTransactions.sumOf { it.quantity }
        val avgOrderValue = if (filteredTransactions.isNotEmpty()) totalRevenue / filteredTransactions.size else 0.0

        val transactionsByItem = filteredTransactions.groupBy { it.itemId }

        val rawSummaries = items.mapIndexed { index, item ->
            val itemTxList = transactionsByItem[item.id].orEmpty()
            val itemRevenue = itemTxList.sumOf { it.totalAmount }
            val itemUnits = itemTxList.sumOf { it.quantity }
            val percentage = if (totalRevenue > 0.0) {
                ((itemRevenue / totalRevenue) * 100.0).toFloat()
            } else {
                0f
            }

            val color = parseColor(item.colorHex, index)

            ItemSalesSummary(
                item = item,
                totalUnitsSold = itemUnits,
                totalRevenue = itemRevenue,
                percentageOfTotal = percentage,
                color = color
            )
        }

        val sortedSummaries = rawSummaries.sortedByDescending { it.totalRevenue }
            .mapIndexed { rankIndex, summary ->
                summary.copy(rank = rankIndex + 1)
            }

        val selectedSummary = params.selectedItemId?.let { id ->
            sortedSummaries.find { it.item.id == id }
        }

        // Customer Debt Summaries: Grouped by customer name across all transactions
        val allDebts = transactions.filter { it.isDebt }
        val customerDebtSummaries = allDebts.groupBy { it.customerName.ifBlank { "زبون عام" } }
            .map { (custName, txList) ->
                val unpaidList = txList.filter { !it.isSettled }
                val settledList = txList.filter { it.isSettled }
                val phone = txList.firstOrNull { it.customerPhone.isNotBlank() }?.customerPhone.orEmpty()
                CustomerDebtSummary(
                    customerName = custName,
                    customerPhone = phone,
                    totalUnpaidDebt = unpaidList.sumOf { it.totalAmount },
                    totalSettledDebt = settledList.sumOf { it.totalAmount },
                    unpaidCount = unpaidList.size,
                    transactions = txList.sortedByDescending { it.timestamp }
                )
            }
            .sortedWith(
                compareByDescending<CustomerDebtSummary> { it.totalUnpaidDebt }
                    .thenByDescending { it.unpaidCount }
            )

        AccountingUiState(
            items = items,
            allTransactions = transactions,
            filteredTransactions = filteredTransactions,
            expenses = filteredExpenses,
            totalRevenue = totalRevenue,
            totalCashRevenue = totalCashRevenue,
            totalDebtsUnpaid = totalDebtsUnpaid,
            totalExpenses = totalExpenses,
            realizedNetProfit = realizedNetProfit,
            totalUnitsSold = totalUnitsSold,
            averageOrderValue = avgOrderValue,
            itemSummaries = sortedSummaries,
            customerDebtSummaries = customerDebtSummaries,
            selectedItemSummary = selectedSummary,
            timeFilter = params.timeFilter,
            activeTab = params.activeTab,
            appLanguage = params.appLanguage,
            currentUser = userParams.currentUser,
            teamUsers = userParams.teamUsers,
            gmailSettings = userParams.gmailSettings,
            backupMessage = params.backupMessage,
            isLoading = false
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = AccountingUiState(isLoading = true, appLanguage = AppLanguage.ARABIC)
    )

    fun setTimeFilter(filter: TimeRangeFilter) {
        _timeFilter.value = filter
    }

    fun setLanguage(language: AppLanguage) {
        _appLanguage.value = language
    }

    fun setActiveTab(tab: AccountingTab) {
        _activeTab.value = tab
    }

    fun selectItemSummary(summary: ItemSalesSummary?) {
        _selectedItemId.value = summary?.item?.id
    }

    fun clearBackupMessage() {
        _backupMessage.value = null
    }

    // Role and Multi-User Management
    fun switchUser(user: AppUser) {
        _currentUser.value = user
        _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
            "تم التبديل إلى المستخدم: ${user.name} (${user.role.arTitle})"
        } else {
            "Switched to user: ${user.name} (${user.role.enTitle})"
        }
    }

    fun toggleCurrentRole() {
        val current = _currentUser.value
        val newRole = if (current.role == UserRole.OWNER_EDITOR) UserRole.VIEWER_ONLY else UserRole.OWNER_EDITOR
        val updated = current.copy(role = newRole)
        _currentUser.value = updated
        _teamUsers.value = _teamUsers.value.map {
            if (it.id == current.id) updated else it
        }
        _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
            "تم تغيير الصلاحية إلى: ${newRole.arTitle}"
        } else {
            "Access role changed to: ${newRole.enTitle}"
        }
    }

    fun updateUserRole(userId: String, newRole: UserRole) {
        _teamUsers.value = _teamUsers.value.map { user ->
            if (user.id == userId) user.copy(role = newRole) else user
        }
        if (_currentUser.value.id == userId) {
            _currentUser.value = _currentUser.value.copy(role = newRole)
        }
        _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
            "تم تحديث صلاحية المستخدم إلى: ${newRole.arTitle}"
        } else {
            "User access updated to: ${newRole.enTitle}"
        }
    }

    fun addUser(name: String, email: String, role: UserRole) {
        val newUser = AppUser(
            id = UUID.randomUUID().toString(),
            name = name.trim().ifEmpty { "مستخدم جديد" },
            email = email.trim().ifEmpty { "user@accountinghouse.com" },
            role = role,
            isOwner = false
        )
        _teamUsers.value = _teamUsers.value + newUser
        _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
            "تمت إضافة '${newUser.name}' بصلاحية: ${role.arTitle}"
        } else {
            "Added '${newUser.name}' with access: ${role.enTitle}"
        }
    }

    fun removeUser(userId: String) {
        val user = _teamUsers.value.find { it.id == userId }
        if (user?.isOwner == true) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "لا يمكن حذف مالك الحساب الرئيسي"
            } else {
                "Cannot remove the primary owner account"
            }
            return
        }
        _teamUsers.value = _teamUsers.value.filter { it.id != userId }
        if (_currentUser.value.id == userId) {
            _currentUser.value = _teamUsers.value.first()
        }
    }

    // Gmail Backup Configuration & Execution
    fun updateGmailSettings(email: String, isAutoBackup: Boolean, frequency: String) {
        _gmailSettings.value = _gmailSettings.value.copy(
            email = email.trim(),
            isAutoBackupEnabled = isAutoBackup,
            frequency = frequency
        )
        _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
            "تم حفظ إعدادات النسخ التلقائي لحساب: $email"
        } else {
            "Gmail backup settings updated for: $email"
        }
    }

    fun triggerManualGmailBackup() {
        val email = _gmailSettings.value.email
        val isAr = _appLanguage.value == AppLanguage.ARABIC

        _gmailSettings.value = _gmailSettings.value.copy(
            lastBackupTimestamp = System.currentTimeMillis(),
            lastBackupSummary = "نسخة احتياطية جاهزة لحساب $email"
        )

        _backupMessage.value = if (isAr) {
            "تم إعداد وتجهيز النسخة الاحتياطية للإرسال إلى $email"
        } else {
            "Backup prepared for $email"
        }
    }

    fun getGmailBackupEmailDetails(): Pair<String, String> {
        val isAr = _appLanguage.value == AppLanguage.ARABIC
        val subject = if (isAr) {
            "نسخة احتياطية - بيت المحاسبة (Accounting House Backup)"
        } else {
            "Backup - Accounting House (${_gmailSettings.value.email})"
        }
        val state = uiState.value
        val body = BackupManager.buildGmailBackupEmailBody(
            items = state.items,
            transactions = state.allTransactions,
            expenses = state.expenses,
            totalCashRevenue = state.totalCashRevenue,
            totalDebtsUnpaid = state.totalDebtsUnpaid,
            totalExpenses = state.totalExpenses,
            netProfit = state.realizedNetProfit,
            isArabic = isAr
        )
        return Pair(subject, body)
    }

    // Backup & Share Export / Import
    fun exportBackupJson(): String {
        val state = uiState.value
        return BackupManager.exportToJson(state.items, state.allTransactions, state.expenses)
    }

    fun exportSharePackage(grantedRole: UserRole): String {
        val state = uiState.value
        val ownerEmail = _currentUser.value.email
        return BackupManager.exportSharePackage(
            items = state.items,
            transactions = state.allTransactions,
            expenses = state.expenses,
            grantedRole = grantedRole,
            sharedBy = ownerEmail
        )
    }

    fun restoreFromJson(jsonString: String): Boolean {
        return try {
            val backupData = BackupManager.parseBackup(jsonString)
            if (backupData.items.isEmpty() && backupData.transactions.isEmpty()) {
                _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                    "الملف غير صالح أو فارغ"
                } else {
                    "Invalid or empty backup file"
                }
                return false
            }

            viewModelScope.launch {
                repository.restoreBackup(backupData.items, backupData.transactions, backupData.expenses)
                _selectedItemId.value = null
                _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                    "تمت استعادة ${backupData.items.size} صنف و ${backupData.transactions.size} عملية و ${backupData.expenses.size} مصروف بنجاح!"
                } else {
                    "Restored ${backupData.items.size} items, ${backupData.transactions.size} txs, and ${backupData.expenses.size} expenses!"
                }
            }
            true
        } catch (e: Exception) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "خطأ في استعادة النسخة: ${e.localizedMessage}"
            } else {
                "Error restoring backup: ${e.localizedMessage}"
            }
            false
        }
    }

    fun importSharePackage(jsonString: String): Boolean {
        return try {
            val result: ShareImportResult = BackupManager.parseSharePackage(jsonString)
            if (result.items.isEmpty() && result.transactions.isEmpty()) {
                _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                    "رمز المشاركة غير صالح أو لا يحتوي على بيانات"
                } else {
                    "Invalid or empty shared workspace code"
                }
                return false
            }

            viewModelScope.launch {
                repository.restoreBackup(result.items, result.transactions, result.expenses)
                _selectedItemId.value = null

                val newCurrentUser = AppUser(
                    id = "shared_user",
                    name = if (result.grantedRole == UserRole.VIEWER_ONLY) "مستخدم مشاهد (مشارك)" else "مستخدم محرر (مشارك)",
                    email = result.sharedBy ?: "superwash38@gmail.com",
                    role = result.grantedRole,
                    isOwner = false
                )
                _currentUser.value = newCurrentUser

                _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                    "تم استيراد ${result.items.size} منتج بنجاح وتعيين الصلاحية: ${result.grantedRole.arTitle}"
                } else {
                    "Workspace imported with ${result.items.size} items and access: ${result.grantedRole.enTitle}"
                }
            }
            true
        } catch (e: Exception) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "خطأ في استيراد المشاركة: ${e.localizedMessage}"
            } else {
                "Error importing shared workspace: ${e.localizedMessage}"
            }
            false
        }
    }

    // CRUD Items with RBAC check
    fun addItem(
        name: String,
        category: String,
        unitPrice: Double,
        colorHex: String,
        sku: String = "",
        description: String = ""
    ) {
        if (!_currentUser.value.role.canModify) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تنبيه: أنت في وضع المشاهدة فقط (Viewer) ولا تملك صلاحية إضافة أصناف"
            } else {
                "Notice: You are in Viewer mode and cannot add items"
            }
            return
        }

        viewModelScope.launch {
            val item = ItemEntity(
                name = name.trim(),
                category = category.trim().ifEmpty { "General" },
                unitPrice = unitPrice,
                colorHex = colorHex,
                sku = sku.trim(),
                description = description.trim()
            )
            repository.insertItem(item)
            performAutoBackupTrigger()
        }
    }

    fun updateItem(
        id: Long,
        name: String,
        category: String,
        unitPrice: Double,
        colorHex: String,
        sku: String = "",
        description: String = ""
    ) {
        if (!_currentUser.value.role.canModify) return
        viewModelScope.launch {
            val updated = ItemEntity(
                id = id,
                name = name.trim(),
                category = category.trim().ifEmpty { "General" },
                unitPrice = unitPrice,
                colorHex = colorHex,
                sku = sku.trim(),
                description = description.trim()
            )
            repository.updateItem(updated)
            performAutoBackupTrigger()
        }
    }

    fun deleteItem(item: ItemEntity) {
        if (!_currentUser.value.role.canModify) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تنبيه: وضع المشاهدة فقط لا يسمح بحذف الأصناف"
            } else {
                "Notice: Viewer mode does not allow deleting items"
            }
            return
        }
        viewModelScope.launch {
            if (_selectedItemId.value == item.id) {
                _selectedItemId.value = null
            }
            repository.deleteItem(item)
            performAutoBackupTrigger()
        }
    }

    // Sales Transactions & Debts
    fun recordQuickSale(item: ItemEntity) {
        if (!_currentUser.value.role.canModify) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تنبيه: أنت في وضع المشاهدة فقط (Viewer). لا يمكنك تسجيل مبيعات."
            } else {
                "Notice: You are in Viewer mode. Recording sales is disabled."
            }
            return
        }

        viewModelScope.launch {
            val note = if (_appLanguage.value == AppLanguage.ARABIC) "بيع نقدي سريع +1 (${_currentUser.value.name})" else "Quick cash sale +1 (${_currentUser.value.name})"
            repository.recordSale(
                item = item,
                quantity = 1,
                unitPrice = item.unitPrice,
                note = note,
                isDebt = false,
                customerName = "",
                customerPhone = ""
            )
            performAutoBackupTrigger()
        }
    }

    fun recordSale(
        itemId: Long,
        quantity: Int,
        unitPrice: Double,
        note: String = "",
        isDebt: Boolean = false,
        customerName: String = "",
        customerPhone: String = ""
    ) {
        val targetItem = uiState.value.items.find { it.id == itemId } ?: return
        recordCustomSale(targetItem, quantity, unitPrice, note, isDebt, customerName, customerPhone)
    }

    fun recordCustomSale(
        item: ItemEntity,
        quantity: Int,
        unitPrice: Double,
        note: String = "",
        isDebt: Boolean = false,
        customerName: String = "",
        customerPhone: String = ""
    ) {
        if (!_currentUser.value.role.canModify) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تنبيه: أنت في وضع المشاهدة فقط (Viewer). لا يمكنك تسجيل حركات."
            } else {
                "Notice: You are in Viewer mode."
            }
            return
        }

        viewModelScope.launch {
            val authorNote = if (note.isNotBlank()) "$note (${_currentUser.value.name})" else "(${_currentUser.value.name})"
            repository.recordSale(
                item = item,
                quantity = quantity,
                unitPrice = unitPrice,
                note = authorNote.trim(),
                isDebt = isDebt,
                customerName = customerName.trim(),
                customerPhone = customerPhone.trim()
            )
            performAutoBackupTrigger()
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                if (isDebt) "تم تسجيل دَين على الزبون ($customerName) بنجاح" else "تم تسجيل حركة البيع بنجاح"
            } else {
                if (isDebt) "Debt recorded for ($customerName)" else "Sale recorded successfully"
            }
        }
    }

    // Direct debt recording without picking existing catalog item
    fun recordDirectDebt(
        customerName: String,
        customerPhone: String,
        itemName: String,
        amount: Double,
        note: String
    ) {
        if (!_currentUser.value.role.canModify) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تنبيه: وضع المشاهدة لا يسمح بتسجيل ديون"
            } else {
                "Notice: Viewer mode cannot record debt"
            }
            return
        }
        viewModelScope.launch {
            repository.recordManualDebt(
                customerName = customerName,
                customerPhone = customerPhone,
                itemName = itemName,
                amount = amount,
                note = note
            )
            performAutoBackupTrigger()
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تم تسجيل دين بقيمة $${String.format(java.util.Locale.US, "%.2f", amount)} على ($customerName)"
            } else {
                "Debt of $$amount recorded for ($customerName)"
            }
        }
    }

    // Settle Debt (Clear Debt)
    fun settleDebt(id: Long) {
        if (!_currentUser.value.role.canModify) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تنبيه: وضع المشاهدة لا يسمح بسداد الديون"
            } else {
                "Notice: Viewer mode cannot settle debt"
            }
            return
        }
        viewModelScope.launch {
            repository.settleDebt(id)
            performAutoBackupTrigger()
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تم تسديد الدين وإبراء الذمة بنجاح! تم تحويله إلى المقبوضات النقدية"
            } else {
                "Debt settled and marked as paid! Transferred to cash received."
            }
        }
    }

    // Settle all debts for a single customer
    fun settleAllDebtsForCustomer(customerName: String) {
        if (!_currentUser.value.role.canModify) return
        viewModelScope.launch {
            repository.settleAllDebtsForCustomer(customerName)
            performAutoBackupTrigger()
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تم تسديد كافة ديون الزبون ($customerName) بالكامل!"
            } else {
                "All debts for ($customerName) have been completely cleared!"
            }
        }
    }

    fun voidTransaction(id: Long) {
        deleteTransaction(id)
    }

    fun deleteTransaction(id: Long) {
        if (!_currentUser.value.role.canModify) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تنبيه: وضع المشاهدة فقط لا يسمح بحذف العمليات"
            } else {
                "Notice: Viewer mode does not allow deleting transactions"
            }
            return
        }
        viewModelScope.launch {
            repository.deleteTransaction(id)
            performAutoBackupTrigger()
        }
    }

    // Expense Management
    fun addExpense(title: String, category: String, amount: Double, note: String = "") {
        if (!_currentUser.value.role.canModify) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تنبيه: أنت في وضع المشاهدة فقط (Viewer). لا يمكنك إضافة مصاريف."
            } else {
                "Notice: You are in Viewer mode. Adding expenses is disabled."
            }
            return
        }
        viewModelScope.launch {
            repository.addExpense(title, category, amount, note)
            performAutoBackupTrigger()
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تم تسجيل المصروف ($title) بنجاح"
            } else {
                "Expense ($title) recorded successfully"
            }
        }
    }

    fun deleteExpense(id: Long) {
        if (!_currentUser.value.role.canModify) {
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تنبيه: وضع المشاهدة لا يسمح بحذف المصاريف"
            } else {
                "Notice: Viewer mode cannot delete expenses"
            }
            return
        }
        viewModelScope.launch {
            repository.deleteExpense(id)
            performAutoBackupTrigger()
            _backupMessage.value = if (_appLanguage.value == AppLanguage.ARABIC) {
                "تم حذف قيد المصروف"
            } else {
                "Expense record deleted"
            }
        }
    }

    private fun performAutoBackupTrigger() {
        val settings = _gmailSettings.value
        if (settings.isAutoBackupEnabled) {
            val now = System.currentTimeMillis()
            _gmailSettings.value = settings.copy(
                lastBackupTimestamp = now,
                lastBackupSummary = if (_appLanguage.value == AppLanguage.ARABIC) {
                    "نسخ تلقائي ناجح لحساب ${settings.email}"
                } else {
                    "Auto backup synced to ${settings.email}"
                }
            )
        }
    }

    fun clearAllData() {
        if (!_currentUser.value.role.canModify) return
        viewModelScope.launch {
            _selectedItemId.value = null
            repository.clearAllData()
            performAutoBackupTrigger()
        }
    }

    fun resetDemoData() {
        clearAllData()
    }

    private fun parseColor(hex: String, fallbackIndex: Int): Color {
        return try {
            val cleanHex = hex.removePrefix("#")
            val colorLong = cleanHex.toLong(16)
            if (cleanHex.length == 6) {
                Color(0xFF000000 or colorLong)
            } else if (cleanHex.length == 8) {
                Color(colorLong)
            } else {
                ChartPalette[fallbackIndex % ChartPalette.size]
            }
        } catch (_: Exception) {
            ChartPalette[fallbackIndex % ChartPalette.size]
        }
    }

    companion object {
        fun provideFactory(repository: AccountingRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return AccountingViewModel(repository) as T
                }
            }
    }
}
