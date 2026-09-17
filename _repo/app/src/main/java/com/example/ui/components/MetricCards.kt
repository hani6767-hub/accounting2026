package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.MoneyOff
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.util.Locale

@Composable
fun AccountingMetricCards(
    totalRevenue: Double,
    totalCashRevenue: Double,
    totalDebtsUnpaid: Double,
    totalExpenses: Double,
    realizedNetProfit: Double,
    totalUnitsSold: Int,
    avgOrderValue: Double,
    topItemName: String?,
    topItemRevenue: Double,
    isArabic: Boolean = false,
    onClickCalculateProfit: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isProfitPositive = realizedNetProfit >= 0.0

    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // 1. Hero Card: Current Realized Profit Banner & Interactive Calculator Button
        // fulfills: "و كبسة لحساب الأرباح الحالية دون الديون التي لم تسدد"
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("metric_realized_profit_banner")
                .clickable { onClickCalculateProfit() },
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (isProfitPositive) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.45f)
                                 else MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.45f)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(
                                    if (isProfitPositive) MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                                    else MaterialTheme.colorScheme.error.copy(alpha = 0.15f)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isProfitPositive) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                                contentDescription = null,
                                tint = if (isProfitPositive) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Column {
                            Text(
                                text = if (isArabic) "صافي الأرباح الحالية في الصندوق" else "Current Realized Cash Profit",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = String.format(Locale.US, "$%.2f", realizedNetProfit),
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.ExtraBold,
                                color = if (isProfitPositive) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                            )
                        }
                    }

                    // Interactive Button: "كبسة لحساب الأرباح الحالية دون الديون"
                    FilledTonalButton(
                        onClick = onClickCalculateProfit,
                        modifier = Modifier.testTag("calculate_profit_button")
                    ) {
                        Icon(
                            Icons.Default.Calculate,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isArabic) "حساب الأرباح" else "Calculate",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Subtitle explanation
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.7f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (isArabic) {
                                "مقبوض نقداً: $${String.format(Locale.US, "%.2f", totalCashRevenue)} • مصاريف: -$${String.format(Locale.US, "%.2f", totalExpenses)}"
                            } else {
                                "Cash: $${String.format(Locale.US, "%.2f", totalCashRevenue)} • Exp: -$${String.format(Locale.US, "%.2f", totalExpenses)}"
                            },
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Text(
                            text = if (isArabic) {
                                "(ديون معلقة: $${String.format(Locale.US, "%.2f", totalDebtsUnpaid)} غير مضافة للربح)"
                            } else {
                                "(Debts: $${String.format(Locale.US, "%.2f", totalDebtsUnpaid)} excluded)"
                            },
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }

        // 2. Row: Debts & Expenses Quick Overview
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricCard(
                title = if (isArabic) "ديون الزبائن المعلقة" else "Customer Debts",
                value = String.format(Locale.US, "$%.2f", totalDebtsUnpaid),
                subtext = if (isArabic) "مستبعدة من الربح الحالي" else "Excluded from profit",
                icon = Icons.Default.CreditCard,
                iconColor = MaterialTheme.colorScheme.error,
                modifier = Modifier
                    .weight(1f)
                    .testTag("metric_debts_card")
            )

            MetricCard(
                title = if (isArabic) "المصاريف (رواتب/غذاء)" else "Expenses",
                value = String.format(Locale.US, "$%.2f", totalExpenses),
                subtext = if (isArabic) "مخصومة من المقبوضات" else "Deducted costs",
                icon = Icons.Default.MoneyOff,
                iconColor = Color(0xFFE11D48),
                modifier = Modifier
                    .weight(1f)
                    .testTag("metric_expenses_card")
            )
        }

        // 3. Row: Total Sales & Units Sold
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricCard(
                title = if (isArabic) "إجمالي المبيعات" else "Total Gross Sales",
                value = String.format(Locale.US, "$%.2f", totalRevenue),
                subtext = if (isArabic) "نقدي + ديون" else "Cash + Debts",
                icon = Icons.Default.AttachMoney,
                iconColor = MaterialTheme.colorScheme.primary,
                modifier = Modifier
                    .weight(1f)
                    .testTag("metric_total_sales")
            )

            MetricCard(
                title = if (isArabic) "القطع المباعة" else "Units Sold",
                value = "$totalUnitsSold",
                subtext = if (isArabic) "إجمالي الكميات" else "Items processed",
                icon = Icons.Default.ShoppingBag,
                iconColor = MaterialTheme.colorScheme.secondary,
                modifier = Modifier
                    .weight(1f)
                    .testTag("metric_units_sold")
            )
        }

        // 4. Row: Top Source & Avg Order
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricCard(
                title = if (isArabic) "الأكثر مبيعاً" else "Top Source",
                value = topItemName ?: if (isArabic) "لا يوجد بعد" else "None yet",
                subtext = if (topItemRevenue > 0) {
                    if (isArabic) String.format(Locale.US, "عائد: $%.2f", topItemRevenue)
                    else String.format(Locale.US, "$%.2f revenue", topItemRevenue)
                } else {
                    if (isArabic) "لا مبيعات بعد" else "No sales yet"
                },
                icon = Icons.Default.Star,
                iconColor = MaterialTheme.colorScheme.tertiary,
                modifier = Modifier
                    .weight(1f)
                    .testTag("metric_top_item")
            )

            MetricCard(
                title = if (isArabic) "متوسط البيع" else "Avg. Sale",
                value = String.format(Locale.US, "$%.2f", avgOrderValue),
                subtext = if (isArabic) "لكل فاتورة" else "Per transaction",
                icon = Icons.Default.Calculate,
                iconColor = Color(0xFF06B6D4),
                modifier = Modifier
                    .weight(1f)
                    .testTag("metric_avg_sale")
            )
        }
    }
}

@Composable
private fun MetricCard(
    title: String,
    value: String,
    subtext: String,
    icon: ImageVector,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .clip(CircleShape)
                        .background(iconColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Text(
                text = subtext,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 11.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
