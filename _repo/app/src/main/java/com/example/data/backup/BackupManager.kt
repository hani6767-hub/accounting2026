package com.example.data.backup

import com.example.data.db.ExpenseEntity
import com.example.data.db.ItemEntity
import com.example.data.db.SaleTransactionEntity
import com.example.ui.models.UserRole
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class FullBackupData(
    val items: List<ItemEntity>,
    val transactions: List<SaleTransactionEntity>,
    val expenses: List<ExpenseEntity>
)

data class ShareImportResult(
    val items: List<ItemEntity>,
    val transactions: List<SaleTransactionEntity>,
    val expenses: List<ExpenseEntity>,
    val grantedRole: UserRole,
    val sharedBy: String?
)

object BackupManager {

    fun exportToJson(
        items: List<ItemEntity>,
        transactions: List<SaleTransactionEntity>,
        expenses: List<ExpenseEntity> = emptyList()
    ): String {
        val root = JSONObject()
        root.put("version", 3)
        root.put("app", "Accounting House")
        root.put("exportedAt", System.currentTimeMillis())

        val itemsArray = JSONArray()
        for (item in items) {
            val obj = JSONObject()
            obj.put("id", item.id)
            obj.put("name", item.name)
            obj.put("category", item.category)
            obj.put("unitPrice", item.unitPrice)
            obj.put("colorHex", item.colorHex)
            obj.put("sku", item.sku)
            obj.put("description", item.description)
            obj.put("createdAt", item.createdAt)
            itemsArray.put(obj)
        }
        root.put("items", itemsArray)

        val txArray = JSONArray()
        for (tx in transactions) {
            val obj = JSONObject()
            obj.put("id", tx.id)
            obj.put("itemId", tx.itemId)
            obj.put("itemName", tx.itemName)
            obj.put("category", tx.category)
            obj.put("quantity", tx.quantity)
            obj.put("unitPrice", tx.unitPrice)
            obj.put("totalAmount", tx.totalAmount)
            obj.put("timestamp", tx.timestamp)
            obj.put("note", tx.note)
            obj.put("isDebt", tx.isDebt)
            obj.put("customerName", tx.customerName)
            obj.put("customerPhone", tx.customerPhone)
            obj.put("isSettled", tx.isSettled)
            if (tx.settledAt != null) obj.put("settledAt", tx.settledAt)
            txArray.put(obj)
        }
        root.put("transactions", txArray)

        val expArray = JSONArray()
        for (exp in expenses) {
            val obj = JSONObject()
            obj.put("id", exp.id)
            obj.put("title", exp.title)
            obj.put("category", exp.category)
            obj.put("amount", exp.amount)
            obj.put("timestamp", exp.timestamp)
            obj.put("note", exp.note)
            expArray.put(obj)
        }
        root.put("expenses", expArray)

        return root.toString(2)
    }

    fun exportSharePackage(
        items: List<ItemEntity>,
        transactions: List<SaleTransactionEntity>,
        expenses: List<ExpenseEntity> = emptyList(),
        grantedRole: UserRole,
        sharedBy: String
    ): String {
        val root = JSONObject()
        root.put("version", 3)
        root.put("app", "Accounting House")
        root.put("type", "shared_workspace")
        root.put("sharedBy", sharedBy)
        root.put("grantedRole", grantedRole.name)
        root.put("exportedAt", System.currentTimeMillis())

        val itemsArray = JSONArray()
        for (item in items) {
            val obj = JSONObject()
            obj.put("id", item.id)
            obj.put("name", item.name)
            obj.put("category", item.category)
            obj.put("unitPrice", item.unitPrice)
            obj.put("colorHex", item.colorHex)
            obj.put("sku", item.sku)
            obj.put("description", item.description)
            obj.put("createdAt", item.createdAt)
            itemsArray.put(obj)
        }
        root.put("items", itemsArray)

        val txArray = JSONArray()
        for (tx in transactions) {
            val obj = JSONObject()
            obj.put("id", tx.id)
            obj.put("itemId", tx.itemId)
            obj.put("itemName", tx.itemName)
            obj.put("category", tx.category)
            obj.put("quantity", tx.quantity)
            obj.put("unitPrice", tx.unitPrice)
            obj.put("totalAmount", tx.totalAmount)
            obj.put("timestamp", tx.timestamp)
            obj.put("note", tx.note)
            obj.put("isDebt", tx.isDebt)
            obj.put("customerName", tx.customerName)
            obj.put("customerPhone", tx.customerPhone)
            obj.put("isSettled", tx.isSettled)
            if (tx.settledAt != null) obj.put("settledAt", tx.settledAt)
            txArray.put(obj)
        }
        root.put("transactions", txArray)

        val expArray = JSONArray()
        for (exp in expenses) {
            val obj = JSONObject()
            obj.put("id", exp.id)
            obj.put("title", exp.title)
            obj.put("category", exp.category)
            obj.put("amount", exp.amount)
            obj.put("timestamp", exp.timestamp)
            obj.put("note", exp.note)
            expArray.put(obj)
        }
        root.put("expenses", expArray)

        return root.toString(2)
    }

    fun parseSharePackage(jsonStr: String): ShareImportResult {
        val root = JSONObject(jsonStr)
        val itemsList = mutableListOf<ItemEntity>()
        val txList = mutableListOf<SaleTransactionEntity>()
        val expList = mutableListOf<ExpenseEntity>()

        val roleStr = root.optString("grantedRole", UserRole.OWNER_EDITOR.name)
        val grantedRole = try {
            UserRole.valueOf(roleStr)
        } catch (_: Exception) {
            UserRole.VIEWER_ONLY
        }

        val sharedBy = if (root.has("sharedBy")) root.getString("sharedBy") else null

        if (root.has("items")) {
            val itemsArray = root.getJSONArray("items")
            for (i in 0 until itemsArray.length()) {
                val obj = itemsArray.getJSONObject(i)
                itemsList.add(
                    ItemEntity(
                        id = obj.optLong("id", 0L),
                        name = obj.optString("name", "Item"),
                        category = obj.optString("category", "General"),
                        unitPrice = obj.optDouble("unitPrice", 0.0),
                        colorHex = obj.optString("colorHex", "#10B981"),
                        sku = obj.optString("sku", ""),
                        description = obj.optString("description", ""),
                        createdAt = obj.optLong("createdAt", System.currentTimeMillis())
                    )
                )
            }
        }

        if (root.has("transactions")) {
            val txArray = root.getJSONArray("transactions")
            for (i in 0 until txArray.length()) {
                val obj = txArray.getJSONObject(i)
                txList.add(
                    SaleTransactionEntity(
                        id = obj.optLong("id", 0L),
                        itemId = obj.optLong("itemId", 0L),
                        itemName = obj.optString("itemName", ""),
                        category = obj.optString("category", "General"),
                        quantity = obj.optInt("quantity", 1),
                        unitPrice = obj.optDouble("unitPrice", 0.0),
                        totalAmount = obj.optDouble("totalAmount", 0.0),
                        timestamp = obj.optLong("timestamp", System.currentTimeMillis()),
                        note = obj.optString("note", ""),
                        isDebt = obj.optBoolean("isDebt", false),
                        customerName = obj.optString("customerName", ""),
                        customerPhone = obj.optString("customerPhone", ""),
                        isSettled = obj.optBoolean("isSettled", false),
                        settledAt = if (obj.has("settledAt")) obj.optLong("settledAt") else null
                    )
                )
            }
        }

        if (root.has("expenses")) {
            val expArray = root.getJSONArray("expenses")
            for (i in 0 until expArray.length()) {
                val obj = expArray.getJSONObject(i)
                expList.add(
                    ExpenseEntity(
                        id = obj.optLong("id", 0L),
                        title = obj.optString("title", ""),
                        category = obj.optString("category", "Other"),
                        amount = obj.optDouble("amount", 0.0),
                        timestamp = obj.optLong("timestamp", System.currentTimeMillis()),
                        note = obj.optString("note", "")
                    )
                )
            }
        }

        return ShareImportResult(
            items = itemsList,
            transactions = txList,
            expenses = expList,
            grantedRole = grantedRole,
            sharedBy = sharedBy
        )
    }

    fun buildGmailBackupEmailBody(
        items: List<ItemEntity>,
        transactions: List<SaleTransactionEntity>,
        expenses: List<ExpenseEntity>,
        totalCashRevenue: Double,
        totalDebtsUnpaid: Double,
        totalExpenses: Double,
        netProfit: Double,
        isArabic: Boolean
    ): String {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US)
        val dateStr = dateFormat.format(Date())
        val jsonPayload = exportToJson(items, transactions, expenses)

        return if (isArabic) {
            """
            نسخة احتياطية آلية - بيت المحاسبة (Accounting House)
            ==================================================
            تاريخ ووقت النسخ: $dateStr
            
            [الملخص المالي الفعلي]:
            • المقبوضات النقدية المحصلة: ${String.format(Locale.US, "$%.2f", totalCashRevenue)}
            • الديون المعلقة غير المسددة: ${String.format(Locale.US, "$%.2f", totalDebtsUnpaid)}
            • إجمالي المصاريف المسجلة: ${String.format(Locale.US, "$%.2f", totalExpenses)}
            • صافي الربح الفعلي المحصل: ${String.format(Locale.US, "$%.2f", netProfit)}
            
            [بيانات السجلات]:
            • عدد المنتجات: ${items.size}
            • إجمالي حركات المبيعات والديون: ${transactions.size}
            • إجمالي قيود المصاريف: ${expenses.size}
            
            يمكنك استعادة هذه النسخة في أي وقت بلصق البيانات أدناه في نافذة "استعادة النسخة الاحتياطية" داخل التطبيق.
            
            ---------------- بيانات النسخة (JSON Backup) ----------------
            $jsonPayload
            ---------------- نهاية النسخة الاحتياطية ----------------
            """.trimIndent()
        } else {
            """
            Automated Backup - Accounting House
            ===================================
            Backup Date & Time: $dateStr
            
            [Financial Summary]:
            • Realized Cash Collected: ${String.format(Locale.US, "$%.2f", totalCashRevenue)}
            • Outstanding Unpaid Debts: ${String.format(Locale.US, "$%.2f", totalDebtsUnpaid)}
            • Total Recorded Expenses: ${String.format(Locale.US, "$%.2f", totalExpenses)}
            • Net Realized Cash Profit: ${String.format(Locale.US, "$%.2f", netProfit)}
            
            [Records Count]:
            • Products: ${items.size}
            • Transactions & Debts: ${transactions.size}
            • Expenses: ${expenses.size}
            
            You can restore this backup anytime by pasting the data below in the "Restore Backup" dialog inside Accounting House.
            
            ---------------- JSON Backup Payload ----------------
            $jsonPayload
            ---------------- End of Backup ----------------
            """.trimIndent()
        }
    }

    fun parseBackup(jsonStr: String): FullBackupData {
        val root = JSONObject(jsonStr)
        val itemsList = mutableListOf<ItemEntity>()
        val txList = mutableListOf<SaleTransactionEntity>()
        val expList = mutableListOf<ExpenseEntity>()

        if (root.has("items")) {
            val itemsArray = root.getJSONArray("items")
            for (i in 0 until itemsArray.length()) {
                val obj = itemsArray.getJSONObject(i)
                itemsList.add(
                    ItemEntity(
                        id = obj.optLong("id", 0L),
                        name = obj.optString("name", "Item"),
                        category = obj.optString("category", "General"),
                        unitPrice = obj.optDouble("unitPrice", 0.0),
                        colorHex = obj.optString("colorHex", "#10B981"),
                        sku = obj.optString("sku", ""),
                        description = obj.optString("description", ""),
                        createdAt = obj.optLong("createdAt", System.currentTimeMillis())
                    )
                )
            }
        }

        if (root.has("transactions")) {
            val txArray = root.getJSONArray("transactions")
            for (i in 0 until txArray.length()) {
                val obj = txArray.getJSONObject(i)
                txList.add(
                    SaleTransactionEntity(
                        id = obj.optLong("id", 0L),
                        itemId = obj.optLong("itemId", 0L),
                        itemName = obj.optString("itemName", ""),
                        category = obj.optString("category", "General"),
                        quantity = obj.optInt("quantity", 1),
                        unitPrice = obj.optDouble("unitPrice", 0.0),
                        totalAmount = obj.optDouble("totalAmount", 0.0),
                        timestamp = obj.optLong("timestamp", System.currentTimeMillis()),
                        note = obj.optString("note", ""),
                        isDebt = obj.optBoolean("isDebt", false),
                        customerName = obj.optString("customerName", ""),
                        customerPhone = obj.optString("customerPhone", ""),
                        isSettled = obj.optBoolean("isSettled", false),
                        settledAt = if (obj.has("settledAt")) obj.optLong("settledAt") else null
                    )
                )
            }
        }

        if (root.has("expenses")) {
            val expArray = root.getJSONArray("expenses")
            for (i in 0 until expArray.length()) {
                val obj = expArray.getJSONObject(i)
                expList.add(
                    ExpenseEntity(
                        id = obj.optLong("id", 0L),
                        title = obj.optString("title", ""),
                        category = obj.optString("category", "Other"),
                        amount = obj.optDouble("amount", 0.0),
                        timestamp = obj.optLong("timestamp", System.currentTimeMillis()),
                        note = obj.optString("note", "")
                    )
                )
            }
        }

        return FullBackupData(itemsList, txList, expList)
    }
}
