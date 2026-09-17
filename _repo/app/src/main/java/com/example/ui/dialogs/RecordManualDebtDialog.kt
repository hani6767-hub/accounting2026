package com.example.ui.dialogs

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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

@Composable
fun RecordManualDebtDialog(
    isArabic: Boolean = false,
    onDismiss: () -> Unit,
    onConfirm: (customerName: String, customerPhone: String, itemName: String, amount: Double, note: String) -> Unit
) {
    var customerName by remember { mutableStateOf("") }
    var customerPhone by remember { mutableStateOf("") }
    var itemName by remember { mutableStateOf("") }
    var amountText by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }

    var customerNameError by remember { mutableStateOf(false) }
    var amountError by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    Icons.Default.CreditCard,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.error
                )
                Text(
                    text = if (isArabic) "تسجيل دَين جديد على زبون" else "Record New Customer Debt",
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
                OutlinedTextField(
                    value = customerName,
                    onValueChange = {
                        customerName = it
                        customerNameError = false
                    },
                    label = { Text(if (isArabic) "اسم الزبون المدين *" else "Customer Name *") },
                    placeholder = { Text(if (isArabic) "مثال: أبو محمد، حسن المصري" else "e.g. John Doe") },
                    leadingIcon = { Icon(Icons.Default.AccountCircle, contentDescription = null) },
                    isError = customerNameError,
                    supportingText = if (customerNameError) {
                        { Text(if (isArabic) "اسم الزبون مطلوب" else "Customer name is required") }
                    } else null,
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("manual_debt_customer_input")
                )

                OutlinedTextField(
                    value = customerPhone,
                    onValueChange = { customerPhone = it },
                    label = { Text(if (isArabic) "رقم هاتف الزبون (اختياري)" else "Phone Number (Optional)") },
                    placeholder = { Text("05xxxxxxxx") },
                    leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("manual_debt_phone_input")
                )

                OutlinedTextField(
                    value = itemName,
                    onValueChange = { itemName = it },
                    label = { Text(if (isArabic) "البيان / الصنف / سبب الدين" else "Description / Item") },
                    placeholder = { Text(if (isArabic) "مثال: حساب طلبيات، مشتريات بضاعة" else "e.g. Order invoice, grocery") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("manual_debt_item_input")
                )

                OutlinedTextField(
                    value = amountText,
                    onValueChange = {
                        amountText = it
                        amountError = false
                    },
                    label = { Text(if (isArabic) "مبلغ الدين ($) *" else "Debt Amount ($) *") },
                    placeholder = { Text("0.00") },
                    prefix = { Text("$ ") },
                    isError = amountError,
                    supportingText = if (amountError) {
                        { Text(if (isArabic) "أدخل مبلغاً صحيحاً أكبر من 0" else "Enter a valid positive amount") }
                    } else null,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("manual_debt_amount_input")
                )

                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text(if (isArabic) "ملاحظة أو موعد السداد" else "Note / Due Date") },
                    placeholder = { Text(if (isArabic) "مثال: وعد بالدفع نهاية الأسبوع" else "e.g. Promised next Friday") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("manual_debt_note_input")
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val amount = amountText.toDoubleOrNull()
                    var hasErr = false
                    if (customerName.trim().isBlank()) {
                        customerNameError = true
                        hasErr = true
                    }
                    if (amount == null || amount <= 0.0) {
                        amountError = true
                        hasErr = true
                    }
                    if (hasErr) return@Button

                    onConfirm(
                        customerName.trim(),
                        customerPhone.trim(),
                        itemName.trim().ifBlank { if (isArabic) "دين نقدي" else "Cash Debt" },
                        amount ?: 0.0,
                        note.trim()
                    )
                },
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                modifier = Modifier.testTag("confirm_manual_debt_btn")
            ) {
                Text(if (isArabic) "تسجيل الدين" else "Record Debt")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("cancel_manual_debt_btn")
            ) {
                Text(if (isArabic) "إلغاء" else "Cancel")
            }
        }
    )
}
