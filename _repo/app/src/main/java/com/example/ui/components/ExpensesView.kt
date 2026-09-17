package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Fastfood
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MoneyOff
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Power
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.db.ExpenseEntity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ExpensesView(
    expenses: List<ExpenseEntity>,
    totalExpenses: Double,
    canEdit: Boolean,
    isArabic: Boolean = false,
    onRequestAddExpense: () -> Unit,
    onDeleteExpense: (Long) -> Unit
) {
    val dateFormat = SimpleDateFormat("yyyy/MM/dd - hh:mm a", Locale.US)
    var selectedCategoryFilter by remember { mutableStateOf<String?>(null) }
    var expenseToDelete by remember { mutableStateOf<ExpenseEntity?>(null) }

    val filteredExpenses = if (selectedCategoryFilter != null) {
        expenses.filter { it.category.equals(selectedCategoryFilter, ignoreCase = true) }
    } else {
        expenses
    }

    // Categories summary breakdown
    val categoryTotals = expenses.groupBy { it.category }
        .mapValues { entry -> entry.value.sumOf { it.amount } }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Expenses Summary Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = if (isArabic) "إجمالي المصاريف والتكاليف" else "Total Business Expenses",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        Text(
                            text = String.format(Locale.US, "$%.2f", totalExpenses),
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.error
                        )
                    }

                    if (canEdit) {
                        Button(
                            onClick = onRequestAddExpense,
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                            modifier = Modifier.testTag("add_expense_button")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(if (isArabic) "إضافة مصروف" else "Add Expense")
                        }
                    }
                }

                // Quick stats pills (رواتب، غذاء، إلخ)
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        val salariesTotal = categoryTotals["Salaries"] ?: 0.0
                        ExpenseQuickPill(
                            icon = Icons.Default.Payments,
                            title = if (isArabic) "رواتب" else "Salaries",
                            amount = salariesTotal
                        )
                    }
                    item {
                        val foodTotal = categoryTotals["Food"] ?: 0.0
                        ExpenseQuickPill(
                            icon = Icons.Default.Fastfood,
                            title = if (isArabic) "غذاء" else "Food",
                            amount = foodTotal
                        )
                    }
                    item {
                        val rentTotal = categoryTotals["Rent"] ?: 0.0
                        ExpenseQuickPill(
                            icon = Icons.Default.Home,
                            title = if (isArabic) "إيجار" else "Rent",
                            amount = rentTotal
                        )
                    }
                    item {
                        val utilitiesTotal = categoryTotals["Utilities"] ?: 0.0
                        ExpenseQuickPill(
                            icon = Icons.Default.Power,
                            title = if (isArabic) "فواتير" else "Utilities",
                            amount = utilitiesTotal
                        )
                    }
                }
            }
        }

        // Category Filter Chips
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            item {
                FilterChip(
                    selected = selectedCategoryFilter == null,
                    onClick = { selectedCategoryFilter = null },
                    label = { Text(if (isArabic) "الكل (${expenses.size})" else "All (${expenses.size})") }
                )
            }
            item {
                FilterChip(
                    selected = selectedCategoryFilter == "Salaries",
                    onClick = {
                        selectedCategoryFilter = if (selectedCategoryFilter == "Salaries") null else "Salaries"
                    },
                    label = { Text(if (isArabic) "رواتب" else "Salaries") }
                )
            }
            item {
                FilterChip(
                    selected = selectedCategoryFilter == "Food",
                    onClick = {
                        selectedCategoryFilter = if (selectedCategoryFilter == "Food") null else "Food"
                    },
                    label = { Text(if (isArabic) "غذاء" else "Food") }
                )
            }
            item {
                FilterChip(
                    selected = selectedCategoryFilter == "Rent",
                    onClick = {
                        selectedCategoryFilter = if (selectedCategoryFilter == "Rent") null else "Rent"
                    },
                    label = { Text(if (isArabic) "إيجار" else "Rent") }
                )
            }
            item {
                FilterChip(
                    selected = selectedCategoryFilter == "Supplies",
                    onClick = {
                        selectedCategoryFilter = if (selectedCategoryFilter == "Supplies") null else "Supplies"
                    },
                    label = { Text(if (isArabic) "مستلزمات" else "Supplies") }
                )
            }
        }

        // Expenses List
        if (filteredExpenses.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        Icons.Default.MoneyOff,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.outline
                    )
                    Text(
                        text = if (isArabic) "لا توجد مصاريف مسجلة" else "No expenses recorded",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = if (isArabic) "سجل مصاريفك كالرواتب، الغذاء، والإيجار لتتبع الأرباح بدقة" else "Record salaries, food, and rent to calculate net profits",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.outline
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                items(filteredExpenses, key = { it.id }) { expense ->
                    ExpenseRowCard(
                        expense = expense,
                        canEdit = canEdit,
                        isArabic = isArabic,
                        dateFormat = dateFormat,
                        onDeleteClick = { expenseToDelete = expense }
                    )
                }
            }
        }
    }

    // Delete Confirmation Dialog
    if (expenseToDelete != null) {
        val exp = expenseToDelete!!
        AlertDialog(
            onDismissRequest = { expenseToDelete = null },
            title = {
                Text(
                    text = if (isArabic) "حذف قيد المصروف" else "Delete Expense",
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Text(
                    text = if (isArabic) {
                        "هل أنت متأكد من حذف مصروف '${exp.title}' بقيمة $${String.format(Locale.US, "%.2f", exp.amount)}؟"
                    } else {
                        "Are you sure you want to delete expense '${exp.title}' for $${String.format(Locale.US, "%.2f", exp.amount)}?"
                    }
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        onDeleteExpense(exp.id)
                        expenseToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text(if (isArabic) "حذف" else "Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { expenseToDelete = null }) {
                    Text(if (isArabic) "إلغاء" else "Cancel")
                }
            }
        )
    }
}

@Composable
private fun ExpenseQuickPill(
    icon: ImageVector,
    title: String,
    amount: Double
) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.85f)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(14.dp),
                tint = MaterialTheme.colorScheme.error
            )
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = String.format(Locale.US, "$%.2f", amount),
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.error
            )
        }
    }
}

@Composable
private fun ExpenseRowCard(
    expense: ExpenseEntity,
    canEdit: Boolean,
    isArabic: Boolean,
    dateFormat: SimpleDateFormat,
    onDeleteClick: () -> Unit
) {
    val categoryIcon = when (expense.category.lowercase()) {
        "salaries" -> Icons.Default.Payments
        "food" -> Icons.Default.Fastfood
        "rent" -> Icons.Default.Home
        "utilities" -> Icons.Default.Power
        "supplies" -> Icons.Default.ShoppingBag
        else -> Icons.Default.MoneyOff
    }

    val categoryLabel = when (expense.category.lowercase()) {
        "salaries" -> if (isArabic) "رواتب" else "Salaries"
        "food" -> if (isArabic) "غذاء" else "Food"
        "rent" -> if (isArabic) "إيجار" else "Rent"
        "utilities" -> if (isArabic) "فواتير" else "Utilities"
        "supplies" -> if (isArabic) "مستلزمات" else "Supplies"
        else -> if (isArabic) "أخرى" else "Other"
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("expense_card_${expense.id}"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = categoryIcon,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.error,
                        modifier = Modifier.size(22.dp)
                    )
                }

                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = expense.title,
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant
                        ) {
                            Text(
                                text = categoryLabel,
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Text(
                        text = dateFormat.format(Date(expense.timestamp)),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    if (expense.note.isNotBlank()) {
                        Text(
                            text = expense.note,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = String.format(Locale.US, "-$%.2f", expense.amount),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.error
                )

                if (canEdit) {
                    IconButton(
                        onClick = onDeleteClick,
                        modifier = Modifier.testTag("delete_expense_btn_${expense.id}")
                    ) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Delete Expense",
                            tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}
