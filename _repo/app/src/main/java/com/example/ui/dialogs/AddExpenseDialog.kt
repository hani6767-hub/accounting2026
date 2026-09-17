package com.example.ui.dialogs

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MoneyOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp

data class ExpenseCategoryPreset(val enName: String, val arName: String)

val EXPENSE_CATEGORIES = listOf(
    ExpenseCategoryPreset("Salaries", "رواتب"),
    ExpenseCategoryPreset("Food", "غذاء ومأكولات"),
    ExpenseCategoryPreset("Rent", "إيجار"),
    ExpenseCategoryPreset("Utilities", "فواتير وكهرباء"),
    ExpenseCategoryPreset("Supplies", "مستلزمات"),
    ExpenseCategoryPreset("Other", "أخرى")
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AddExpenseDialog(
    isArabic: Boolean = false,
    onDismiss: () -> Unit,
    onConfirmExpense: (title: String, category: String, amount: Double, note: String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf(EXPENSE_CATEGORIES[0]) }
    var amountText by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }

    var titleError by remember { mutableStateOf(false) }
    var amountError by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    Icons.Default.MoneyOff,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.error
                )
                Text(
                    text = if (isArabic) "تسجيل مصروف جديد" else "Record New Expense",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Category Chips (رواتب، غذاء، إلخ)
                Text(
                    text = if (isArabic) "نوع المصروف" else "Expense Category",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    EXPENSE_CATEGORIES.forEach { category ->
                        val isSelected = category.enName == selectedCategory.enName
                        FilterChip(
                            selected = isSelected,
                            onClick = {
                                selectedCategory = category
                                if (title.isBlank() || EXPENSE_CATEGORIES.any { it.arName == title || it.enName == title }) {
                                    title = if (isArabic) category.arName else category.enName
                                }
                            },
                            label = { Text(if (isArabic) category.arName else category.enName) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.errorContainer,
                                selectedLabelColor = MaterialTheme.colorScheme.onErrorContainer
                            ),
                            modifier = Modifier.testTag("expense_cat_${category.enName}")
                        )
                    }
                }

                // Title Field
                OutlinedTextField(
                    value = title,
                    onValueChange = {
                        title = it
                        titleError = false
                    },
                    label = { Text(if (isArabic) "وصف المصروف *" else "Expense Description *") },
                    placeholder = { Text(if (isArabic) "مثال: رواتب عمال، وجبات غداء، إيجار محل" else "e.g. Weekly salary, Food, Rent") },
                    isError = titleError,
                    supportingText = if (titleError) {
                        { Text(if (isArabic) "يرجى إدخال وصف المصروف" else "Description is required") }
                    } else null,
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("expense_title_input")
                )

                // Amount Field
                OutlinedTextField(
                    value = amountText,
                    onValueChange = {
                        amountText = it
                        amountError = false
                    },
                    label = { Text(if (isArabic) "المبلغ المدفوع ($) *" else "Amount ($) *") },
                    placeholder = { Text("0.00") },
                    prefix = { Text("$ ") },
                    isError = amountError,
                    supportingText = if (amountError) {
                        { Text(if (isArabic) "يرجى إدخال مبلغ صحيح أكبر من 0" else "Enter a valid positive amount") }
                    } else null,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("expense_amount_input")
                )

                // Optional Note
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text(if (isArabic) "ملاحظات إضافية (اختياري)" else "Notes (Optional)") },
                    placeholder = { Text(if (isArabic) "مثال: تم الدفع نقداً، دفعة جزئية" else "e.g. Paid in cash") },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("expense_note_input")
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val amount = amountText.toDoubleOrNull()
                    var hasErr = false
                    if (title.trim().isBlank()) {
                        titleError = true
                        hasErr = true
                    }
                    if (amount == null || amount <= 0.0) {
                        amountError = true
                        hasErr = true
                    }
                    if (hasErr) return@Button

                    onConfirmExpense(
                        title.trim(),
                        selectedCategory.enName,
                        amount ?: 0.0,
                        note.trim()
                    )
                },
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                modifier = Modifier.testTag("confirm_add_expense_button")
            ) {
                Text(if (isArabic) "حفظ المصروف" else "Save Expense")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("cancel_add_expense_button")
            ) {
                Text(if (isArabic) "إلغاء" else "Cancel")
            }
        }
    )
}
