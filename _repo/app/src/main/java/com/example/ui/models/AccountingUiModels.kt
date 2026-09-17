package com.example.ui.models

import androidx.compose.ui.graphics.Color
import com.example.data.db.ExpenseEntity
import com.example.data.db.ItemEntity
import com.example.data.db.SaleTransactionEntity

enum class AppLanguage(val code: String, val displayName: String) {
    SYSTEM("system", "Default / تلقائي"),
    ARABIC("ar", "العربية (Arabic)"),
    ENGLISH("en", "English")
}

enum class TimeRangeFilter(val enLabel: String, val arLabel: String) {
    ALL_TIME("All Time", "الكل"),
    TODAY("Today", "اليوم"),
    THIS_WEEK("This Week", "هذا الأسبوع"),
    THIS_MONTH("This Month", "هذا الشهر");

    fun getLabel(isArabic: Boolean): String = if (isArabic) arLabel else enLabel
}

enum class AccountingTab(val enTitle: String, val arTitle: String) {
    OVERVIEW("Overview & Circle", "نظرة عامة"),
    ITEMS("Products", "المنتجات"),
    DEBTS("Customer Debts", "الديون"),
    EXPENSES("Expenses", "المصاريف"),
    LEDGER("Sales Ledger", "المبيعات");

    fun getTitle(isArabic: Boolean): String = if (isArabic) arTitle else enTitle
}

enum class UserRole(val enTitle: String, val arTitle: String, val canModify: Boolean) {
    OWNER_EDITOR("Editor / Full Access", "محرر (تعديل كامل)", true),
    VIEWER_ONLY("Viewer Only", "مشاهد فقط (عرض فقط)", false)
}

data class AppUser(
    val id: String,
    val name: String,
    val email: String,
    val role: UserRole,
    val isOwner: Boolean = false
)

data class GmailBackupSettings(
    val email: String = "superwash38@gmail.com",
    val isAutoBackupEnabled: Boolean = true,
    val frequency: String = "after_sale", // "after_sale", "daily"
    val lastBackupTimestamp: Long? = null,
    val lastBackupSummary: String? = null
)

data class ItemSalesSummary(
    val item: ItemEntity,
    val totalUnitsSold: Int,
    val totalRevenue: Double,
    val percentageOfTotal: Float,
    val color: Color,
    val rank: Int = 0
)

data class CustomerDebtSummary(
    val customerName: String,
    val customerPhone: String,
    val totalUnpaidDebt: Double,
    val totalSettledDebt: Double,
    val unpaidCount: Int,
    val transactions: List<SaleTransactionEntity>
)

data class AccountingUiState(
    val items: List<ItemEntity> = emptyList(),
    val allTransactions: List<SaleTransactionEntity> = emptyList(),
    val filteredTransactions: List<SaleTransactionEntity> = emptyList(),
    val expenses: List<ExpenseEntity> = emptyList(),
    val totalRevenue: Double = 0.0, // All sales (cash + debts)
    val totalCashRevenue: Double = 0.0, // Pure cash in hand (cash sales + settled debts)
    val totalDebtsUnpaid: Double = 0.0, // Unsettled debts only
    val totalExpenses: Double = 0.0, // All expenses (salaries, food, etc.)
    val realizedNetProfit: Double = 0.0, // totalCashRevenue - totalExpenses (Excluding unpaid debts!)
    val totalUnitsSold: Int = 0,
    val averageOrderValue: Double = 0.0,
    val itemSummaries: List<ItemSalesSummary> = emptyList(),
    val customerDebtSummaries: List<CustomerDebtSummary> = emptyList(),
    val selectedItemSummary: ItemSalesSummary? = null,
    val timeFilter: TimeRangeFilter = TimeRangeFilter.ALL_TIME,
    val activeTab: AccountingTab = AccountingTab.OVERVIEW,
    val appLanguage: AppLanguage = AppLanguage.ARABIC,
    val currentUser: AppUser = AppUser(
        id = "owner_default",
        name = "المشرف المالي (المالك)",
        email = "superwash38@gmail.com",
        role = UserRole.OWNER_EDITOR,
        isOwner = true
    ),
    val teamUsers: List<AppUser> = listOf(
        AppUser("owner_default", "المشرف المالي", "superwash38@gmail.com", UserRole.OWNER_EDITOR, isOwner = true),
        AppUser("user_editor", "المحاسب المالي", "accountant@company.com", UserRole.OWNER_EDITOR, isOwner = false),
        AppUser("user_viewer", "مراقب المبيعات والشركاء", "viewer@partner.com", UserRole.VIEWER_ONLY, isOwner = false)
    ),
    val gmailSettings: GmailBackupSettings = GmailBackupSettings(),
    val isLoading: Boolean = false,
    val backupMessage: String? = null
) {
    val canUserEdit: Boolean
        get() = currentUser.role.canModify
}
