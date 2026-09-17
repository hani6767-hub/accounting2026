package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = FinanceGreen,
    onPrimary = Color(0xFF022C22),
    primaryContainer = FinanceGreenContainer,
    onPrimaryContainer = FinanceGreenLight,
    secondary = FinanceBlue,
    onSecondary = Color(0xFF082F49),
    tertiary = FinanceAmber,
    onTertiary = Color(0xFF451A03),
    background = FinanceNavy,
    surface = FinanceNavySurface,
    surfaceVariant = FinanceNavyCard,
    onBackground = FinanceTextPrimary,
    onSurface = FinanceTextPrimary,
    onSurfaceVariant = FinanceTextSecondary,
    outline = FinanceNavyBorder
)

private val LightColorScheme = lightColorScheme(
    primary = FinanceGreenDark,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD1FAE5),
    onPrimaryContainer = Color(0xFF064E3B),
    secondary = Color(0xFF2563EB),
    onSecondary = Color.White,
    tertiary = Color(0xFFD97706),
    onTertiary = Color.White,
    background = Color(0xFFF8FAFC),
    surface = Color.White,
    surfaceVariant = Color(0xFFF1F5F9),
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A),
    onSurfaceVariant = Color(0xFF475569),
    outline = Color(0xFFCBD5E1)
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
