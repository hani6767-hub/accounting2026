package com.example.data.db

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "items")
data class ItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val category: String = "General",
    val unitPrice: Double,
    val colorHex: String = "#10B981",
    val sku: String = "",
    val description: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "sales_transactions",
    indices = [
        Index(value = ["itemId"]),
        Index(value = ["timestamp"]),
        Index(value = ["customerName"]),
        Index(value = ["isDebt"])
    ]
)
data class SaleTransactionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val itemId: Long,
    val itemName: String,
    val category: String = "General",
    val quantity: Int = 1,
    val unitPrice: Double,
    val totalAmount: Double,
    val timestamp: Long = System.currentTimeMillis(),
    val note: String = "",
    val isDebt: Boolean = false,
    val customerName: String = "",
    val customerPhone: String = "",
    val isSettled: Boolean = false,
    val settledAt: Long? = null
)

@Entity(
    tableName = "expenses",
    indices = [
        Index(value = ["timestamp"]),
        Index(value = ["category"])
    ]
)
data class ExpenseEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val category: String = "Other",
    val amount: Double,
    val timestamp: Long = System.currentTimeMillis(),
    val note: String = ""
)
