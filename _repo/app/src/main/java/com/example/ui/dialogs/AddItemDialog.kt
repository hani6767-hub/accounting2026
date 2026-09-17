package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.data.db.ItemEntity
import java.util.Locale

private val CategorySuggestionsEn = listOf(
    "Beverages", "Food", "Bakery", "Retail", "Services", "Custom"
)

private val CategorySuggestionsAr = listOf(
    "مشروبات", "مأكولات", "مخبوزات", "تجزئة", "خدمات", "أخرى"
)

private val PresetColorHexes = listOf(
    "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#F43F5E",
    "#06B6D4", "#F97316", "#EC4899", "#14B8A6", "#84CC16"
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AddOrEditItemDialog(
    itemToEdit: ItemEntity? = null,
    isArabic: Boolean = false,
    onDismiss: () -> Unit,
    onSave: (name: String, category: String, unitPrice: Double, colorHex: String, sku: String, description: String) -> Unit
) {
    val categoryList = if (isArabic) CategorySuggestionsAr else CategorySuggestionsEn
    var name by remember { mutableStateOf(itemToEdit?.name ?: "") }
    var category by remember { mutableStateOf(itemToEdit?.category ?: categoryList.first()) }
    var priceText by remember {
        mutableStateOf(itemToEdit?.let { String.format(Locale.US, "%.2f", it.unitPrice) } ?: "")
    }
    var selectedColorHex by remember {
        mutableStateOf(itemToEdit?.colorHex ?: PresetColorHexes.first())
    }
    var sku by remember { mutableStateOf(itemToEdit?.sku ?: "") }
    var description by remember { mutableStateOf(itemToEdit?.description ?: "") }

    var nameError by remember { mutableStateOf(false) }
    var priceError by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (itemToEdit == null) {
                    if (isArabic) "إضافة صنف / منتج جديد" else "Add New Item / Product"
                } else {
                    if (isArabic) "تعديل المنتج" else "Edit Item"
                },
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Name
                OutlinedTextField(
                    value = name,
                    onValueChange = {
                        name = it
                        if (it.isNotBlank()) nameError = false
                    },
                    label = { Text(if (isArabic) "اسم المنتج *" else "Item Name *") },
                    placeholder = { Text(if (isArabic) "مثال: قهوة مثلجة، عصير برتقال" else "e.g. Cold Brew, Special Blend") },
                    isError = nameError,
                    supportingText = if (nameError) {
                        { Text(if (isArabic) "اسم المنتج مطلوب" else "Item name is required") }
                    } else null,
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_item_name")
                )

                // Price
                OutlinedTextField(
                    value = priceText,
                    onValueChange = {
                        priceText = it
                        priceError = false
                    },
                    label = { Text(if (isArabic) "سعر القطعة ($) *" else "Unit Price ($) *") },
                    placeholder = { Text("e.g. 4.50") },
                    isError = priceError,
                    supportingText = if (priceError) {
                        { Text(if (isArabic) "أدخل سعراً صالحاً أكبر من صفر" else "Enter a valid price greater than 0") }
                    } else null,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                    prefix = { Text("$ ") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_item_price")
                )

                // Category selection chips
                Column {
                    Text(
                        text = if (isArabic) "التصنيف" else "Category",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        categoryList.forEach { cat ->
                            FilterChip(
                                selected = category.equals(cat, ignoreCase = true),
                                onClick = { category = cat },
                                label = { Text(cat) },
                                modifier = Modifier.testTag("category_chip_$cat")
                            )
                        }
                    }
                }

                // Color Picker for circular slice
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Palette,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isArabic) "لون شريحة الدائرة" else "Circle Chart Color",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        PresetColorHexes.forEach { hex ->
                            val colorLong = hex.removePrefix("#").toLong(16)
                            val composeColor = Color(0xFF000000 or colorLong)
                            val isSelected = selectedColorHex.equals(hex, ignoreCase = true)

                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(CircleShape)
                                    .background(composeColor)
                                    .border(
                                        width = if (isSelected) 3.dp else 1.dp,
                                        color = if (isSelected) MaterialTheme.colorScheme.onSurface else Color.Transparent,
                                        shape = CircleShape
                                    )
                                    .clickable { selectedColorHex = hex }
                                    .testTag("color_picker_$hex"),
                                contentAlignment = Alignment.Center
                            ) {
                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Selected",
                                        tint = Color.White,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                // SKU
                OutlinedTextField(
                    value = sku,
                    onValueChange = { sku = it },
                    label = { Text(if (isArabic) "رمز الصنف (SKU - اختياري)" else "SKU / Code (Optional)") },
                    placeholder = { Text("e.g. BEV-001") },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_item_sku")
                )

                // Description
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text(if (isArabic) "ملاحظات أو وصف (اختياري)" else "Description / Notes (Optional)") },
                    placeholder = { Text(if (isArabic) "تفاصيل إضافية عن الصنف..." else "Ingredients, size, notes...") },
                    maxLines = 3,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_item_description")
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val price = priceText.toDoubleOrNull()
                    var hasError = false

                    if (name.isBlank()) {
                        nameError = true
                        hasError = true
                    }
                    if (price == null || price <= 0.0) {
                        priceError = true
                        hasError = true
                    }

                    if (!hasError && price != null) {
                        onSave(name, category, price, selectedColorHex, sku, description)
                    }
                },
                modifier = Modifier.testTag("save_item_button")
            ) {
                Text(
                    text = if (itemToEdit == null) {
                        if (isArabic) "حفظ الصنف" else "Add Item"
                    } else {
                        if (isArabic) "حفظ التعديل" else "Save Changes"
                    }
                )
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("cancel_item_button")
            ) {
                Text(if (isArabic) "إلغاء" else "Cancel")
            }
        }
    )
}
