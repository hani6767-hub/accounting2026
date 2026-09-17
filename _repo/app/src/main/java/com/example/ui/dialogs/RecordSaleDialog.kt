package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.data.db.ItemEntity
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecordSaleDialog(
    items: List<ItemEntity>,
    preSelectedItem: ItemEntity? = null,
    isArabic: Boolean = false,
    onDismiss: () -> Unit,
    onConfirmSale: (
        item: ItemEntity,
        quantity: Int,
        unitPrice: Double,
        note: String,
        isDebt: Boolean,
        customerName: String,
        customerPhone: String
    ) -> Unit
) {
    var selectedItem by remember {
        mutableStateOf(preSelectedItem ?: items.firstOrNull())
    }
    var expandedDropdown by remember { mutableStateOf(false) }

    var quantity by remember { mutableIntStateOf(1) }
    var unitPriceText by remember(selectedItem) {
        mutableStateOf(
            selectedItem?.let { String.format(Locale.US, "%.2f", it.unitPrice) } ?: "0.00"
        )
    }
    var note by remember { mutableStateOf("") }
    var priceError by remember { mutableStateOf(false) }

    // Debt parameters (المربع الفارغ مع كلمة دين)
    var isDebt by remember { mutableStateOf(false) }
    var customerName by remember { mutableStateOf("") }
    var customerPhone by remember { mutableStateOf("") }
    var customerNameError by remember { mutableStateOf(false) }

    val currentUnitPrice = unitPriceText.toDoubleOrNull() ?: 0.0
    val totalSale = quantity * currentUnitPrice

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = if (isDebt) Icons.Default.CreditCard else Icons.Default.Add,
                    contentDescription = null,
                    tint = if (isDebt) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                )
                Text(
                    text = if (isDebt) {
                        if (isArabic) "تسجيل حركة دَين على زبون" else "Record Customer Debt"
                    } else {
                        if (isArabic) "تسجيل حركة بيع" else "Record Sale Transaction"
                    },
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
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Item Selector Dropdown
                ExposedDropdownMenuBox(
                    expanded = expandedDropdown,
                    onExpandedChange = { expandedDropdown = !expandedDropdown }
                ) {
                    OutlinedTextField(
                        value = selectedItem?.let { "${it.name} ($${String.format(Locale.US, "%.2f", it.unitPrice)})" }
                            ?: if (isArabic) "اختر منتجاً" else "Select an item",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text(if (isArabic) "المنتج المحدد *" else "Selected Item *") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedDropdown) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(MenuAnchorType.PrimaryNotEditable)
                            .testTag("sale_item_selector")
                    )

                    ExposedDropdownMenu(
                        expanded = expandedDropdown,
                        onDismissRequest = { expandedDropdown = false }
                    ) {
                        items.forEach { item ->
                            DropdownMenuItem(
                                text = {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(item.name, fontWeight = FontWeight.SemiBold)
                                        Text(
                                            String.format(Locale.US, "$%.2f", item.unitPrice),
                                            color = MaterialTheme.colorScheme.primary,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                },
                                onClick = {
                                    selectedItem = item
                                    unitPriceText = String.format(Locale.US, "%.2f", item.unitPrice)
                                    expandedDropdown = false
                                },
                                modifier = Modifier.testTag("dropdown_item_${item.id}")
                            )
                        }
                    }
                }

                // Quantity Stepper
                Column {
                    Text(
                        text = if (isArabic) "الكمية" else "Quantity",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        FilledIconButton(
                            onClick = { if (quantity > 1) quantity-- },
                            enabled = quantity > 1,
                            shape = CircleShape,
                            colors = IconButtonDefaults.filledIconButtonColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant
                            ),
                            modifier = Modifier.testTag("quantity_minus_button")
                        ) {
                            Icon(Icons.Default.Remove, contentDescription = "Decrease")
                        }

                        Text(
                            text = "$quantity",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.testTag("quantity_display")
                        )

                        FilledIconButton(
                            onClick = { quantity++ },
                            shape = CircleShape,
                            colors = IconButtonDefaults.filledIconButtonColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            ),
                            modifier = Modifier.testTag("quantity_plus_button")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Increase")
                        }
                    }
                }

                // Unit Price Field
                OutlinedTextField(
                    value = unitPriceText,
                    onValueChange = {
                        unitPriceText = it
                        priceError = false
                    },
                    label = { Text(if (isArabic) "سعر الوحدة ($)" else "Unit Price ($)") },
                    isError = priceError,
                    supportingText = if (priceError) {
                        { Text(if (isArabic) "أدخل سعراً صالحاً" else "Enter a valid price") }
                    } else null,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                    prefix = { Text("$ ") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("sale_unit_price_input")
                )

                // Total Calculation Display Box
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (isDebt) MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.4f)
                            else MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = if (isArabic) {
                                    if (isDebt) "قيمة الدين الإجمالية" else "إجمالي الفاتورة"
                                } else {
                                    if (isDebt) "TOTAL DEBT AMOUNT" else "TOTAL SALE"
                                },
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "$quantity × $${String.format(Locale.US, "%.2f", currentUnitPrice)}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Text(
                            text = String.format(Locale.US, "$%.2f", totalSale),
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (isDebt) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                        )
                    }
                }

                // CHECKBOX DEBT (خانة الديون: مربع فارغ مع كلمة دَين)
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (isDebt) MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.35f)
                            else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    border = if (isDebt) androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.error) else null,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Checkbox(
                            checked = isDebt,
                            onCheckedChange = { isDebt = it },
                            colors = CheckboxDefaults.colors(
                                checkedColor = MaterialTheme.colorScheme.error
                            ),
                            modifier = Modifier.testTag("sale_is_debt_checkbox")
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = if (isArabic) "دَين (غير مسدد - يذهب لخانة ديون الزبائن)" else "Debt (Unpaid - routes to Customer Debts)",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = if (isDebt) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = if (isArabic) "ضع علامة صح لتحويل هذه الفاتورة إلى ذمة زبون" else "Check to record as unpaid customer debt",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                // If isDebt is checked, show customer details
                if (isDebt) {
                    OutlinedTextField(
                        value = customerName,
                        onValueChange = {
                            customerName = it
                            customerNameError = false
                        },
                        label = { Text(if (isArabic) "اسم الزبون المدين *" else "Customer Name *") },
                        placeholder = { Text(if (isArabic) "مثال: أبو محمد، أحمد خالد" else "e.g. John Doe") },
                        leadingIcon = { Icon(Icons.Default.AccountCircle, contentDescription = null) },
                        isError = customerNameError,
                        supportingText = if (customerNameError) {
                            { Text(if (isArabic) "يرجى كتابة اسم الزبون لتسجيل الدين" else "Customer name is required for debt") }
                        } else null,
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("debt_customer_name_input")
                    )

                    OutlinedTextField(
                        value = customerPhone,
                        onValueChange = { customerPhone = it },
                        label = { Text(if (isArabic) "رقم هاتف الزبون (اختياري)" else "Phone Number (Optional)") },
                        placeholder = { Text("05xxxxxxxx / +96...") },
                        leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("debt_customer_phone_input")
                    )
                }

                // Optional Note
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text(if (isArabic) "ملاحظات الفاتورة (اختياري)" else "Sale Note (Optional)") },
                    placeholder = { Text(if (isArabic) "مثال: دفع نقدي، دين مؤجل، إلخ" else "e.g. Counter sale, deferred, etc.") },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("sale_note_input")
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val item = selectedItem
                    val price = unitPriceText.toDoubleOrNull()
                    if (item == null) return@Button
                    if (price == null || price <= 0.0) {
                        priceError = true
                        return@Button
                    }
                    if (isDebt && customerName.trim().isBlank()) {
                        customerNameError = true
                        return@Button
                    }
                    onConfirmSale(
                        item,
                        quantity,
                        price,
                        note,
                        isDebt,
                        customerName.trim(),
                        customerPhone.trim()
                    )
                },
                enabled = selectedItem != null,
                colors = if (isDebt) ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                         else ButtonDefaults.buttonColors(),
                modifier = Modifier.testTag("confirm_record_sale_button")
            ) {
                Text(
                    text = if (isArabic) {
                        if (isDebt) "تسجيل دَين ($${String.format(Locale.US, "%.2f", totalSale)})"
                        else "تأكيد البيع النقدي ($${String.format(Locale.US, "%.2f", totalSale)})"
                    } else {
                        if (isDebt) "Record Debt ($${String.format(Locale.US, "%.2f", totalSale)})"
                        else "Confirm Sale ($${String.format(Locale.US, "%.2f", totalSale)})"
                    }
                )
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("cancel_record_sale_button")
            ) {
                Text(if (isArabic) "إلغاء" else "Cancel")
            }
        }
    )
}
