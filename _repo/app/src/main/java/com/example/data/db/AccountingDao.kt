package com.example.data.db

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface AccountingDao {
    // --- Items ---
    @Query("SELECT * FROM items ORDER BY createdAt ASC")
    fun getAllItems(): Flow<List<ItemEntity>>

    @Query("SELECT * FROM items WHERE id = :id")
    suspend fun getItemById(id: Long): ItemEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItem(item: ItemEntity): Long

    @Update
    suspend fun updateItem(item: ItemEntity)

    @Delete
    suspend fun deleteItem(item: ItemEntity)

    @Query("DELETE FROM items WHERE id = :id")
    suspend fun deleteItemById(id: Long)

    @Query("DELETE FROM items")
    suspend fun deleteAllItems()

    // --- Sales Transactions & Debts ---
    @Query("SELECT * FROM sales_transactions ORDER BY timestamp DESC")
    fun getAllTransactions(): Flow<List<SaleTransactionEntity>>

    @Query("SELECT * FROM sales_transactions WHERE isDebt = 1 AND isSettled = 0 ORDER BY timestamp DESC")
    fun getUnpaidDebts(): Flow<List<SaleTransactionEntity>>

    @Query("SELECT * FROM sales_transactions WHERE isDebt = 1 ORDER BY timestamp DESC")
    fun getAllDebts(): Flow<List<SaleTransactionEntity>>

    @Query("SELECT * FROM sales_transactions WHERE isDebt = 1 AND customerName = :customerName ORDER BY timestamp DESC")
    fun getDebtsForCustomer(customerName: String): Flow<List<SaleTransactionEntity>>

    @Query("SELECT * FROM sales_transactions WHERE itemId = :itemId ORDER BY timestamp DESC")
    fun getTransactionsByItem(itemId: Long): Flow<List<SaleTransactionEntity>>

    @Query("SELECT * FROM sales_transactions WHERE timestamp >= :sinceTimestamp ORDER BY timestamp DESC")
    fun getTransactionsSince(sinceTimestamp: Long): Flow<List<SaleTransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: SaleTransactionEntity): Long

    @Update
    suspend fun updateTransaction(transaction: SaleTransactionEntity)

    @Query("UPDATE sales_transactions SET isSettled = 1, settledAt = :settledAt WHERE id = :id")
    suspend fun settleDebtById(id: Long, settledAt: Long = System.currentTimeMillis())

    @Query("UPDATE sales_transactions SET isSettled = 1, settledAt = :settledAt WHERE customerName = :customerName AND isDebt = 1 AND isSettled = 0")
    suspend fun settleAllDebtsForCustomer(customerName: String, settledAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM sales_transactions WHERE id = :id")
    suspend fun deleteTransactionById(id: Long)

    @Query("DELETE FROM sales_transactions WHERE itemId = :itemId")
    suspend fun deleteTransactionsByItemId(itemId: Long)

    @Query("DELETE FROM sales_transactions")
    suspend fun deleteAllTransactions()

    // --- Expenses ---
    @Query("SELECT * FROM expenses ORDER BY timestamp DESC")
    fun getAllExpenses(): Flow<List<ExpenseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity): Long

    @Query("DELETE FROM expenses WHERE id = :id")
    suspend fun deleteExpenseById(id: Long)

    @Query("DELETE FROM expenses")
    suspend fun deleteAllExpenses()
}
