package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.MoneyOff
import androidx.compose.material.icons.filled.RemoveCircleOutline
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.util.Locale

@Composable
fun RealizedProfitCalculatorDialog(
    totalRevenue: Double,
    totalCashRevenue: Double,
    totalUnpaidDebts: Double,
    totalExpenses: Double,
    realizedNetProfit: Double,
    isArabic: Boolean = false,
    onDismiss: () -> Unit
) {
    val isProfitable = realizedNetProfit >= 0.0

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(
                            if (isProfitable) MaterialTheme.colorScheme.primaryContainer
                            else MaterialTheme.colorScheme.errorContainer
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isProfitable) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                        contentDescription = null,
                        tint = if (isProfitable) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                    )
                }
                Column {
                    Text(
                        text = if (isArabic) "حساب الأرباح الفعلية الحالية" else "Current Realized Profit",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (isArabic) "(دون احتساب الديون غير المسددة)" else "(Excluding unpaid customer debts)",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Hero Net Profit Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isProfitable) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                                         else MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f)
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = if (isArabic) "صافي الربح الفعلي في الصندوق" else "NET CASH PROFIT IN HAND",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (isProfitable) MaterialTheme.colorScheme.onPrimaryContainer
                                    else MaterialTheme.colorScheme.onErrorContainer
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = String.format(Locale.US, "$%.2f", realizedNetProfit),
                            style = MaterialTheme.typography.headlineLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (isProfitable) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (isArabic) {
                                if (isProfitable) "أرباح نقدية صافية محصلة ومسددة" else "عجز مالي: المصاريف تتجاوز المقبوضات"
                            } else {
                                if (isProfitable) "Positive realized cash flow" else "Deficit: expenses exceed cash receipts"
                            },
                            style = MaterialTheme.typography.labelSmall,
                            color = if (isProfitable) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                        )
                    }
                }

                // Step-by-Step Breakdown Table
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // 1. Cash In Hand
                        BreakdownItemRow(
                            label = if (isArabic) "المقبوضات النقدية المحصلة" else "Cash Sales & Collected Debts",
                            value = String.format(Locale.US, "+$%.2f", totalCashRevenue),
                            color = MaterialTheme.colorScheme.primary,
                            subLabel = if (isArabic) "(مبيعات نقدية + ديون تم سدادها فقط)" else "(Cash sales + paid debts only)"
                        )

                        // 2. Unpaid Debts (Exempted)
                        BreakdownItemRow(
                            label = if (isArabic) "الديون المعلقة غير المسددة" else "Uncollected Debts (Exempted)",
                            value = String.format(Locale.US, "$%.2f", totalUnpaidDebts),
                            color = MaterialTheme.colorScheme.error.copy(alpha = 0.8f),
                            subLabel = if (isArabic) "مستبعدة تماماً من الربح الحالي حتى تُسدد" else "Zero impact on current profit until paid",
                            isExcluded = true
                        )

                        // 3. Expenses
                        BreakdownItemRow(
                            label = if (isArabic) "المصاريف والتكاليف (رواتب، غذاء...)" else "Expenses (Salaries, Food, Rent)",
                            value = String.format(Locale.US, "-$%.2f", totalExpenses),
                            color = MaterialTheme.colorScheme.error,
                            subLabel = if (isArabic) "تكاليف مدفوعة ومخصومة من الصندوق" else "Deducted from cash in hand"
                        )

                        HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))

                        // Final Result
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = if (isArabic) "المعادلة: [المقبوضات] - [المصاريف]" else "Formula: [Cash] - [Expenses]",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = String.format(Locale.US, "$%.2f", realizedNetProfit),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.ExtraBold,
                                color = if (isProfitable) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                            )
                        }
                    }
                }

                // Educational Note
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.4f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            Icons.Default.Info,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = if (isArabic) {
                                "ملاحظة: لحساب الأرباح بدقة واقعية، تم استبعاد الديون التي لم تسدد ($${String.format(Locale.US, "%.2f", totalUnpaidDebts)}) من الربح الفعلي، ولا تُحتسب في الصندوق إلا عند قيام الزبون بسدادها عبر زر (سداد الدين)."
                            } else {
                                "Note: Uncollected debts ($${String.format(Locale.US, "%.2f", totalUnpaidDebts)}) are strictly excluded from current profit until paid."
                            },
                            style = MaterialTheme.typography.bodySmall,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                modifier = Modifier.testTag("close_profit_calc_btn")
            ) {
                Text(if (isArabic) "تم الفهم" else "Done")
            }
        }
    )
}

@Composable
private fun BreakdownItemRow(
    label: String,
    value: String,
    color: Color,
    subLabel: String,
    isExcluded: Boolean = false
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = label,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
                if (isExcluded) {
                    Spacer(modifier = Modifier.width(4.dp))
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = MaterialTheme.colorScheme.error.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = "مستثناة",
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 10.sp
                        )
                    }
                }
            }
            Text(
                text = subLabel,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Text(
            text = value,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = color
        )
    }
}
