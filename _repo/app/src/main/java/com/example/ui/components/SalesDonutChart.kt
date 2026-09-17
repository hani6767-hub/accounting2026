package com.example.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.models.ItemSalesSummary
import java.util.Locale
import kotlin.math.atan2

@Composable
fun SalesDonutChart(
    itemSummaries: List<ItemSalesSummary>,
    totalRevenue: Double,
    totalUnitsSold: Int,
    selectedSummary: ItemSalesSummary?,
    onSelectSummary: (ItemSalesSummary?) -> Unit,
    isArabic: Boolean = false,
    modifier: Modifier = Modifier
) {
    val activeSlices = remember(itemSummaries) {
        itemSummaries.filter { it.totalRevenue > 0.0 }
    }

    val animProgress = remember { Animatable(0f) }
    LaunchedEffect(totalRevenue, activeSlices.size) {
        animProgress.snapTo(0f)
        animProgress.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 800, easing = FastOutSlowInEasing)
        )
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("sales_circle_chart_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.PieChart,
                            contentDescription = "Circle chart",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = if (isArabic) "توزيع المبيعات الدائري" else "Sales Distribution",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (isArabic) "المنتجات الأكثر جلباً للمبيعات" else "Which items sales come from most",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                if (selectedSummary != null) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                        modifier = Modifier.clickable { onSelectSummary(null) }
                    ) {
                        Text(
                            text = if (isArabic) "إلغاء التحديد" else "Clear Filter",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // The Circular / Donut Canvas
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(240.dp)
                    .testTag("donut_chart_canvas_box")
            ) {
                Canvas(
                    modifier = Modifier
                        .size(230.dp)
                        .pointerInput(activeSlices, totalRevenue) {
                            detectTapGestures { tapOffset ->
                                if (totalRevenue <= 0 || activeSlices.isEmpty()) return@detectTapGestures

                                val center = Offset(size.width / 2f, size.height / 2f)
                                val touchAngleRad = atan2(
                                    y = (tapOffset.y - center.y).toDouble(),
                                    x = (tapOffset.x - center.x).toDouble()
                                )
                                var touchAngleDeg = Math.toDegrees(touchAngleRad).toFloat()
                                if (touchAngleDeg < 0) touchAngleDeg += 360f

                                var normAngle = touchAngleDeg - 270f
                                if (normAngle < 0) normAngle += 360f

                                var accumulated = 0f
                                for (slice in activeSlices) {
                                    val sweep = (slice.totalRevenue / totalRevenue * 360f).toFloat()
                                    if (normAngle >= accumulated && normAngle <= (accumulated + sweep)) {
                                        if (selectedSummary?.item?.id == slice.item.id) {
                                            onSelectSummary(null)
                                        } else {
                                            onSelectSummary(slice)
                                        }
                                        break
                                    }
                                    accumulated += sweep
                                }
                            }
                        }
                ) {
                    val diameter = size.minDimension
                    val strokeWidthDefault = 28.dp.toPx()
                    val strokeWidthSelected = 34.dp.toPx()
                    val chartSize = Size(diameter - strokeWidthSelected, diameter - strokeWidthSelected)
                    val topLeft = Offset(strokeWidthSelected / 2f, strokeWidthSelected / 2f)

                    if (totalRevenue <= 0.0 || activeSlices.isEmpty()) {
                        drawArc(
                            color = Color.Gray.copy(alpha = 0.2f),
                            startAngle = 0f,
                            sweepAngle = 360f,
                            useCenter = false,
                            topLeft = topLeft,
                            size = chartSize,
                            style = Stroke(width = strokeWidthDefault, cap = StrokeCap.Round)
                        )
                    } else {
                        var startAngle = 270f
                        val gapAngle = if (activeSlices.size > 1) 2.5f else 0f

                        for (slice in activeSlices) {
                            val isSelected = selectedSummary?.item?.id == slice.item.id
                            val rawSweep = (slice.totalRevenue / totalRevenue * 360f).toFloat() * animProgress.value
                            val sweep = (rawSweep - gapAngle).coerceAtLeast(0.5f)

                            val currentStroke = if (isSelected) strokeWidthSelected else strokeWidthDefault
                            val sliceColor = if (selectedSummary == null || isSelected) {
                                slice.color
                            } else {
                                slice.color.copy(alpha = 0.35f)
                            }

                            drawArc(
                                color = sliceColor,
                                startAngle = startAngle + (gapAngle / 2f),
                                sweepAngle = sweep,
                                useCenter = false,
                                topLeft = topLeft,
                                size = chartSize,
                                style = Stroke(width = currentStroke, cap = StrokeCap.Round)
                            )

                            startAngle += rawSweep
                        }
                    }
                }

                // Center Display
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .padding(32.dp)
                        .clickable { onSelectSummary(null) }
                ) {
                    if (selectedSummary != null) {
                        Text(
                            text = selectedSummary.item.name,
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = selectedSummary.color,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            textAlign = TextAlign.Center
                        )
                        Text(
                            text = String.format(Locale.US, "$%.2f", selectedSummary.totalRevenue),
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = selectedSummary.color.copy(alpha = 0.2f),
                            modifier = Modifier.padding(top = 2.dp)
                        ) {
                            Text(
                                text = if (isArabic) {
                                    String.format(Locale.US, "%.1f%% من المبيعات", selectedSummary.percentageOfTotal)
                                } else {
                                    String.format(Locale.US, "%.1f%% of sales", selectedSummary.percentageOfTotal)
                                },
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = selectedSummary.color,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                        Text(
                            text = if (isArabic) "${selectedSummary.totalUnitsSold} قطعة مباعة" else "${selectedSummary.totalUnitsSold} units sold",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    } else {
                        Text(
                            text = if (isArabic) "إجمالي المبيعات" else "TOTAL SALES",
                            style = MaterialTheme.typography.labelSmall,
                            letterSpacing = 1.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = String.format(Locale.US, "$%.2f", totalRevenue),
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (isArabic) "$totalUnitsSold قطعة مباعة" else "$totalUnitsSold items sold",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Highlight top contributor banner
            val topContributor = activeSlices.firstOrNull()
            if (topContributor != null && totalRevenue > 0.0) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.EmojiEvents,
                                contentDescription = "Top contributor",
                                tint = MaterialTheme.colorScheme.tertiary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isArabic) "الأكثر مبيعاً:" else "Top Source:",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = topContributor.item.name,
                                style = MaterialTheme.typography.labelMedium,
                                color = topContributor.color,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        Text(
                            text = String.format(Locale.US, "$%.2f (%.1f%%)", topContributor.totalRevenue, topContributor.percentageOfTotal),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            } else {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Tip",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isArabic) "اضغط على +1 بيع على أي منتج لتحديث الرسم الدائري" else "Tap +1 Sale on any item below to update the circle chart",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Breakdown List / Legend with Ranks
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                itemSummaries.forEach { summary ->
                    val isSelected = selectedSummary?.item?.id == summary.item.id

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) summary.color.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface,
                        border = if (isSelected) androidx.compose.foundation.BorderStroke(1.5.dp, summary.color) else null,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                if (isSelected) onSelectSummary(null) else onSelectSummary(summary)
                            }
                            .testTag("legend_item_${summary.item.id}")
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (summary.rank == 1 && summary.totalRevenue > 0) {
                                            MaterialTheme.colorScheme.tertiary
                                        } else {
                                            MaterialTheme.colorScheme.surfaceVariant
                                        }
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "#${summary.rank}",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = if (summary.rank == 1 && summary.totalRevenue > 0) {
                                        Color.White
                                    } else {
                                        MaterialTheme.colorScheme.onSurfaceVariant
                                    }
                                )
                            }

                            Spacer(modifier = Modifier.width(10.dp))

                            Box(
                                modifier = Modifier
                                    .size(12.dp)
                                    .clip(CircleShape)
                                    .background(summary.color)
                            )

                            Spacer(modifier = Modifier.width(10.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = summary.item.name,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = String.format(Locale.US, "$%.2f", summary.totalRevenue),
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }

                                Spacer(modifier = Modifier.height(4.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    LinearProgressIndicator(
                                        progress = { (summary.percentageOfTotal / 100f).coerceIn(0f, 1f) },
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(6.dp)
                                            .clip(RoundedCornerShape(3.dp)),
                                        color = summary.color,
                                        trackColor = MaterialTheme.colorScheme.surfaceVariant
                                    )

                                    Spacer(modifier = Modifier.width(8.dp))

                                    Text(
                                        text = if (isArabic) {
                                            String.format(Locale.US, "%.1f%% (%d مبيع)", summary.percentageOfTotal, summary.totalUnitsSold)
                                        } else {
                                            String.format(Locale.US, "%.1f%% (%d sold)", summary.percentageOfTotal, summary.totalUnitsSold)
                                        },
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
