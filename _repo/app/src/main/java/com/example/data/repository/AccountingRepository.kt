package com.example.data.repository

import com.example.data.db.AccountingDao
import com.example.data.db.ExpenseEntity
import com.example.data.db.ItemEntity
import com.example.data.db.SaleTransactionEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

class AccountingRepository(private val dao: AccountingDao) {

    val allItems: Flow<List<ItemEntity>> = dao.getAllItems()
    val allTransactions: Flow<List<SaleTransactionEntity>> = dao.getAllTransactions()
    val allExpenses: Flow<List<ExpenseEntity>> = dao.getAllExpenses()
    val unpaidDebts: Flow<List<SaleTransactionEntity>> = dao.getUnpaidDebts()

    fun getDebtsForCustomer(customerName: String): Flow<List<SaleTransactionEntity>> {
        return dao.getDebtsForCustomer(customerName)
    }

    fun getTransactionsSince(sinceTimestamp: Long): Flow<List<SaleTransactionEntity>> {
        return dao.getTransactionsSince(sinceTimestamp)
    }

    suspend fun insertItem(item: ItemEntity): Long {
        return dao.insertItem(item)
    }

    suspend fun updateItem(item: ItemEntity) {
        dao.updateItem(item)
    }

    suspend fun deleteItem(item: ItemEntity) {
        dao.deleteTransactionsByItemId(item.id)
        dao.deleteItem(item)
    }

    suspend fun recordSale(
        item: ItemEntity,
        quantity: Int = 1,
        unitPrice: Double = item.unitPrice,
        note: String = "",
        isDebt: Boolean = false,
        customerName: String = "",
        customerPhone: String = ""
    ): Long {
        val total = quantity * unitPrice
        val transaction = SaleTransactionEntity(
            itemId = item.id,
            itemName = item.name,
            category = item.category,
            quantity = quantity,
            unitPrice = unitPrice,
            totalAmount = total,
            timestamp = System.currentTimeMillis(),
            note = note,
            isDebt = isDebt,
            customerName = customerName.trim(),
            customerPhone = customerPhone.trim(),
            isSettled = false
        )
        return dao.insertTransaction(transaction)
    }

    suspend fun recordManualDebt(
        customerName: String,
        customerPhone: String = "",
        itemName: String,
        amount: Double,
        note: String = ""
    ): Long {
        val transaction = SaleTransactionEntity(
            itemId = 0L,
            itemName = itemName.ifBlank { "دين مالي" },
            category = "Debt",
            quantity = 1,
            unitPrice = amount,
            totalAmount = amount,
            timestamp = System.currentTimeMillis(),
            note = note,
            isDebt = true,
            customerName = customerName.trim(),
            customerPhone = customerPhone.trim(),
            isSettled = false
        )
        return dao.insertTransaction(transaction)
    }

    suspend fun settleDebt(id: Long) {
        dao.settleDebtById(id)
    }

    suspend fun settleAllDebtsForCustomer(customerName: String) {
        dao.settleAllDebtsForCustomer(customerName.trim())
    }

    suspend fun deleteTransaction(id: Long) {
        dao.deleteTransactionById(id)
    }

    suspend fun addExpense(
        title: String,
        category: String,
        amount: Double,
        note: String = ""
    ): Long {
        val expense = ExpenseEntity(
            title = title.trim(),
            category = category.trim(),
            amount = amount,
            timestamp = System.currentTimeMillis(),
            note = note.trim()
        )
        return dao.insertExpense(expense)
    }

    suspend fun deleteExpense(id: Long) {
        dao.deleteExpenseById(id)
    }

    suspend fun restoreBackup(
        items: List<ItemEntity>,
        transactions: List<SaleTransactionEntity>,
        expenses: List<ExpenseEntity> = emptyList()
    ) {
        dao.deleteAllTransactions()
        dao.deleteAllItems()
        dao.deleteAllExpenses()
        for (item in items) {
            dao.insertItem(item)
        }
        for (tx in transactions) {
            dao.insertTransaction(tx)
        }
        for (exp in expenses) {
            dao.insertExpense(exp)
        }
    }

    suspend fun clearAllData() {
        dao.deleteAllTransactions()
        dao.deleteAllItems()
        dao.deleteAllExpenses()
    }

    suspend fun resetWithStarter3Items() {
        clearAllData()
    }

    suspend fun removeDefaultStarterDataIfPresent() {
        val defaultNames = setOf("Cold Brew Coffee", "Avocado Toast", "Matcha Croissant")
        val items = dao.getAllItems().first()
        val hasDefaultItems = items.any { it.name in defaultNames }
        if (hasDefaultItems) {
            clearAllData()
        }
    }

    suspend fun seedIfEmpty() {
        // Left intentionally empty: all categories and sections start completely blank as requested
    }
}

