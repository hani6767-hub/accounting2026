package com.example

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.db.AccountingDao
import com.example.data.db.AppDatabase
import com.example.data.db.ItemEntity
import com.example.data.repository.AccountingRepository
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class AccountingDatabaseTest {

    private lateinit var db: AppDatabase
    private lateinit var dao: AccountingDao
    private lateinit var repository: AccountingRepository

    @Before
    fun setup() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        dao = db.accountingDao()
        repository = AccountingRepository(dao)
    }

    @After
    fun tearDown() {
        db.close()
    }

    @Test
    fun testAdd3ItemsAndVerifySalesTotalsAndBreakdown() = runBlocking {
        // User scenario: "adding 3 items and it see what the total of sales from these items and details easy to see the total of sales and which most come from like circle"
        val item1 = ItemEntity(name = "Espresso", category = "Beverage", unitPrice = 3.50, colorHex = "#10B981")
        val item2 = ItemEntity(name = "Sandwich", category = "Food", unitPrice = 7.00, colorHex = "#F59E0B")
        val item3 = ItemEntity(name = "Pastry", category = "Bakery", unitPrice = 4.00, colorHex = "#3B82F6")

        val id1 = repository.insertItem(item1)
        val id2 = repository.insertItem(item2)
        val id3 = repository.insertItem(item3)

        val items = repository.allItems.first()
        assertEquals(3, items.size)

        // Record sales:
        // Item 1: 4 sales @ $3.50 = $14.00
        repository.recordSale(item = item1.copy(id = id1), quantity = 4, unitPrice = 3.50)

        // Item 2: 6 sales @ $7.00 = $42.00 (Most sales come from Sandwich!)
        repository.recordSale(item = item2.copy(id = id2), quantity = 6, unitPrice = 7.00)

        // Item 3: 2 sales @ $4.00 = $8.00
        repository.recordSale(item = item3.copy(id = id3), quantity = 2, unitPrice = 4.00)

        val transactions = repository.allTransactions.first()
        assertEquals(3, transactions.size)

        val totalSales = transactions.sumOf { it.totalAmount }
        assertEquals(64.00, totalSales, 0.001)

        val totalUnits = transactions.sumOf { it.quantity }
        assertEquals(12, totalUnits)

        // Verify which most come from
        val salesByItem = transactions.groupBy { it.itemId }
        val revenueItem1 = salesByItem[id1]?.sumOf { it.totalAmount } ?: 0.0
        val revenueItem2 = salesByItem[id2]?.sumOf { it.totalAmount } ?: 0.0
        val revenueItem3 = salesByItem[id3]?.sumOf { it.totalAmount } ?: 0.0

        assertEquals(14.00, revenueItem1, 0.001)
        assertEquals(42.00, revenueItem2, 0.001)
        assertEquals(8.00, revenueItem3, 0.001)

        // Sandwich generates the most revenue (42.00 / 64.00 = 65.6%)
        assertTrue(revenueItem2 > revenueItem1)
        assertTrue(revenueItem2 > revenueItem3)
    }

    @Test
    fun testQuickSaleAndVoidTransaction() = runBlocking {
        val item = ItemEntity(name = "Notebook", category = "Stationery", unitPrice = 12.50)
        val id = repository.insertItem(item)

        repository.recordSale(item.copy(id = id), quantity = 1, unitPrice = 12.50)
        val transactions = repository.allTransactions.first()
        assertEquals(1, transactions.size)
        assertEquals(12.50, transactions[0].totalAmount, 0.001)

        // Void transaction
        repository.deleteTransaction(transactions[0].id)
        val remaining = repository.allTransactions.first()
        assertEquals(0, remaining.size)
    }

    @Test
    fun testCustomerDebtsExpensesAndRealizedProfitCalculation() = runBlocking {
        // 1. Setup item
        val item = ItemEntity(name = "Car Wash Deluxe", category = "Services", unitPrice = 25.0)
        val itemId = repository.insertItem(item)

        // 2. Record 1 Cash Sale ($25.00)
        repository.recordSale(
            item = item.copy(id = itemId),
            quantity = 1,
            unitPrice = 25.0,
            note = "Cash payment",
            isDebt = false
        )

        // 3. Record 1 Debt Sale on customer "Abu Mohammed" ($50.00, 2 units)
        // (مربع دَين مفعل يذهب لخانة ديون الزبائن)
        repository.recordSale(
            item = item.copy(id = itemId),
            quantity = 2,
            unitPrice = 25.0,
            note = "Deferred debt",
            isDebt = true,
            customerName = "Abu Mohammed",
            customerPhone = "0512345678"
        )

        // 4. Record a manual direct debt for "Khaled" ($30.00)
        repository.recordManualDebt(
            customerName = "Khaled",
            customerPhone = "0599999999",
            itemName = "Cleaning Supplies",
            amount = 30.0,
            note = "Will pay on weekend"
        )

        // Verify debts exist
        val unpaidDebts = repository.unpaidDebts.first()
        assertEquals(2, unpaidDebts.size)
        val totalUnpaidDebtAmount = unpaidDebts.sumOf { it.totalAmount }
        assertEquals(80.00, totalUnpaidDebtAmount, 0.001)

        // Verify customer statement for "Abu Mohammed"
        val abuMohDebts = repository.getDebtsForCustomer("Abu Mohammed").first()
        assertEquals(1, abuMohDebts.size)
        assertEquals(50.00, abuMohDebts[0].totalAmount, 0.001)
        assertEquals(false, abuMohDebts[0].isSettled)

        // 5. Record Expenses: Salaries ($10.00) and Food ($5.00)
        repository.addExpense(title = "Worker Salary", category = "Salaries", amount = 10.0)
        repository.addExpense(title = "Lunch Food", category = "Food", amount = 5.0)

        val expenses = repository.allExpenses.first()
        assertEquals(2, expenses.size)
        val totalExpenses = expenses.sumOf { it.amount }
        assertEquals(15.00, totalExpenses, 0.001)

        // 6. Test Profit Calculation:
        // Cash collected = $25.00
        // Unpaid debts = $80.00 (Exempted from current profit!)
        // Total expenses = $15.00
        // Realized Net Profit = Cash ($25.00) - Expenses ($15.00) = $10.00
        val allTx = repository.allTransactions.first()
        val cashCollectedBefore = allTx.filter { !it.isDebt || (it.isDebt && it.isSettled) }.sumOf { it.totalAmount }
        assertEquals(25.00, cashCollectedBefore, 0.001)

        val realizedNetProfitBefore = cashCollectedBefore - totalExpenses
        assertEquals(10.00, realizedNetProfitBefore, 0.001)

        // 7. Settle Debt for "Abu Mohammed" (كبسة تشيل الدين على صاحبها)
        val debtToSettle = abuMohDebts[0]
        repository.settleDebt(debtToSettle.id)

        // Now verify debt is settled
        val remainingUnpaid = repository.unpaidDebts.first()
        assertEquals(1, remainingUnpaid.size) // Only Khaled remains
        assertEquals("Khaled", remainingUnpaid[0].customerName)

        // Now Abu Mohammed's $50.00 is settled and collected into cash!
        val allTxAfter = repository.allTransactions.first()
        val cashCollectedAfter = allTxAfter.filter { !it.isDebt || (it.isDebt && it.isSettled) }.sumOf { it.totalAmount }
        assertEquals(75.00, cashCollectedAfter, 0.001) // $25 + $50 = $75

        val realizedNetProfitAfter = cashCollectedAfter - totalExpenses
        assertEquals(60.00, realizedNetProfitAfter, 0.001) // $75 - $15 = $60
    }
}
