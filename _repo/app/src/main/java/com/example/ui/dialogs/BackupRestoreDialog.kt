package com.example.ui.dialogs

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.ContentPaste
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.MarkEmailRead
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.models.AppLanguage
import com.example.ui.models.GmailBackupSettings
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun BackupRestoreDialog(
    currentLanguage: AppLanguage,
    gmailSettings: GmailBackupSettings,
    onUpdateGmailSettings: (String, Boolean, String) -> Unit,
    onTriggerGmailBackup: () -> Unit,
    onGetGmailEmailDetails: () -> Pair<String, String>,
    onExportJson: () -> String,
    onRestoreJson: (String) -> Boolean,
    onClearAllData: (() -> Unit)? = null,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val isArabic = currentLanguage == AppLanguage.ARABIC
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Gmail, 1: Export, 2: Restore

    // Gmail state
    var gmailInput by remember { mutableStateOf(gmailSettings.email) }
    var autoBackupEnabled by remember { mutableStateOf(gmailSettings.isAutoBackupEnabled) }
    var frequency by remember { mutableStateOf(gmailSettings.frequency) }

    val exportedJson by remember { mutableStateOf(onExportJson()) }
    var importJsonText by remember { mutableStateOf("") }
    var restoreError by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Image(
                    painter = painterResource(id = R.drawable.ic_accounting_logo),
                    contentDescription = "Accounting House Logo",
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isArabic) "النسخ الاحتياطي ومزامنة Gmail" else "Backup & Gmail Sync",
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.titleMedium
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
                TabRow(selectedTabIndex = selectedTab) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = {
                            Text(
                                if (isArabic) "نسخ Gmail تلقائي" else "Gmail Backup",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        },
                        icon = { Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(16.dp)) }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = {
                            Text(
                                if (isArabic) "تصدير كود" else "Export Code",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        },
                        icon = { Icon(Icons.Default.CloudUpload, contentDescription = null, modifier = Modifier.size(16.dp)) }
                    )
                    Tab(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        text = {
                            Text(
                                if (isArabic) "استعادة" else "Restore",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        },
                        icon = { Icon(Icons.Default.CloudDownload, contentDescription = null, modifier = Modifier.size(16.dp)) }
                    )
                }

                if (selectedTab == 0) {
                    // GMAIL AUTOMATIC BACKUP TAB
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.MarkEmailRead,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                    Text(
                                        text = if (isArabic) "النسخ التلقائي التلقائي" else "Automatic Cloud Backup",
                                        fontWeight = FontWeight.Bold,
                                        style = MaterialTheme.typography.titleSmall
                                    )
                                }

                                Switch(
                                    checked = autoBackupEnabled,
                                    onCheckedChange = {
                                        autoBackupEnabled = it
                                        onUpdateGmailSettings(gmailInput, it, frequency)
                                    }
                                )
                            }

                            Text(
                                text = if (isArabic) {
                                    "يقوم النظام تلقائياً بحفظ وتحديث نسخة احتياطية آمنة بعد كل عملية بيع أو تعديل لحساب بريدك الإلكتروني."
                                } else {
                                    "The system automatically creates and syncs a safety backup after each sale to your Gmail."
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            if (gmailSettings.lastBackupTimestamp != null) {
                                val dateFmt = SimpleDateFormat("MMM d, yyyy - h:mm a", if (isArabic) Locale("ar") else Locale.US)
                                val dateStr = dateFmt.format(Date(gmailSettings.lastBackupTimestamp))
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = MaterialTheme.colorScheme.surface
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(horizontal = 10.dp, vertical = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.CheckCircle,
                                            contentDescription = null,
                                            tint = Color(0xFF10B981),
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Column {
                                            Text(
                                                text = if (isArabic) "آخر عملية نسخ تلقائي:" else "Last automated sync:",
                                                style = MaterialTheme.typography.labelSmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                            Text(
                                                text = dateStr,
                                                style = MaterialTheme.typography.bodySmall,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    OutlinedTextField(
                        value = gmailInput,
                        onValueChange = { gmailInput = it },
                        label = { Text(if (isArabic) "حساب Gmail للنسخ الاحتياطي" else "Target Gmail Address") },
                        leadingIcon = {
                            Icon(Icons.Default.Email, contentDescription = null)
                        },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Text(
                        text = if (isArabic) "توقيت النسخ التلقائي:" else "Backup Frequency:",
                        style = MaterialTheme.typography.labelSmall
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = frequency == "after_sale",
                            onClick = {
                                frequency = "after_sale"
                                onUpdateGmailSettings(gmailInput, autoBackupEnabled, "after_sale")
                            },
                            label = { Text(if (isArabic) "بعد كل عملية بيع فوراً" else "After each sale", fontSize = 11.sp) }
                        )

                        FilterChip(
                            selected = frequency == "daily",
                            onClick = {
                                frequency = "daily"
                                onUpdateGmailSettings(gmailInput, autoBackupEnabled, "daily")
                            },
                            label = { Text(if (isArabic) "يومياً" else "Daily", fontSize = 11.sp) }
                        )
                    }

                    Button(
                        onClick = {
                            onUpdateGmailSettings(gmailInput, autoBackupEnabled, frequency)
                            onTriggerGmailBackup()
                            val (subject, body) = onGetGmailEmailDetails()

                            val emailIntent = Intent(Intent.ACTION_SENDTO).apply {
                                data = Uri.parse("mailto:$gmailInput")
                                putExtra(Intent.EXTRA_SUBJECT, subject)
                                putExtra(Intent.EXTRA_TEXT, body)
                            }
                            try {
                                context.startActivity(Intent.createChooser(emailIntent, if (isArabic) "إرسال النسخة عبر Gmail" else "Send via Gmail"))
                            } catch (_: Exception) {
                                // Fallback to general share
                                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_EMAIL, arrayOf(gmailInput))
                                    putExtra(Intent.EXTRA_SUBJECT, subject)
                                    putExtra(Intent.EXTRA_TEXT, body)
                                }
                                context.startActivity(Intent.createChooser(shareIntent, if (isArabic) "مشاركة النسخة" else "Share Backup"))
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(if (isArabic) "إرسال نسخة احتياطية الآن إلى Gmail" else "Send Backup Now to Gmail")
                    }

                    OutlinedButton(
                        onClick = {
                            onUpdateGmailSettings(gmailInput, autoBackupEnabled, frequency)
                            Toast.makeText(
                                context,
                                if (isArabic) "تم حفظ إعدادات النسخ التلقائي!" else "Settings saved!",
                                Toast.LENGTH_SHORT
                            ).show()
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(if (isArabic) "حفظ إعدادات المزامنة" else "Save Settings")
                    }

                } else if (selectedTab == 1) {
                    // EXPORT TAB
                    Text(
                        text = if (isArabic)
                            "يمكنك نسخ بياناتك وحفظها على اللابتوب كملف نصي أو في مستند للاحتفاظ بها في أي وقت."
                        else
                            "You can copy your database to keep a safety copy on your laptop or cloud storage.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    OutlinedTextField(
                        value = exportedJson,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text(if (isArabic) "بيانات النسخة الاحتياطية (JSON)" else "Backup JSON Data") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                            .testTag("export_backup_text_field"),
                        textStyle = MaterialTheme.typography.bodySmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp
                        )
                    )

                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("SalesAccountingBackup", exportedJson)
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(
                                context,
                                if (isArabic) "تم نسخ بيانات النسخة الاحتياطية للحافظة بنجاح!" else "Backup copied to clipboard!",
                                Toast.LENGTH_SHORT
                            ).show()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("copy_backup_button")
                    ) {
                        Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(if (isArabic) "نسخ إلى الحافظة (Copy)" else "Copy to Clipboard")
                    }
                } else {
                    // RESTORE TAB
                    Text(
                        text = if (isArabic)
                            "الصق نص النسخة الاحتياطية (JSON) هنا لاستعادة المنتجات وسجل المبيعات بالكامل."
                        else
                            "Paste the backup JSON text below to restore all items and sales transactions.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    OutlinedTextField(
                        value = importJsonText,
                        onValueChange = {
                            importJsonText = it
                            restoreError = null
                        },
                        placeholder = { Text(if (isArabic) "الصق نص JSON هنا..." else "Paste JSON text here...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(160.dp)
                            .testTag("import_backup_text_field"),
                        textStyle = MaterialTheme.typography.bodySmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp
                        )
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val item = clipboard.primaryClip?.getItemAt(0)
                                val pasted = item?.text?.toString() ?: ""
                                if (pasted.isNotBlank()) {
                                    importJsonText = pasted
                                } else {
                                    Toast.makeText(
                                        context,
                                        if (isArabic) "الحافظة فارغة" else "Clipboard is empty",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                }
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.ContentPaste, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(if (isArabic) "لصق" else "Paste")
                        }

                        Button(
                            onClick = {
                                if (importJsonText.isBlank()) {
                                    restoreError = if (isArabic) "يرجى لصق كود النسخة أولاً" else "Please paste backup JSON first"
                                } else {
                                    val success = onRestoreJson(importJsonText)
                                    if (success) {
                                        Toast.makeText(
                                            context,
                                            if (isArabic) "تمت الاستعادة بنجاح!" else "Restored successfully!",
                                            Toast.LENGTH_SHORT
                                        ).show()
                                        onDismiss()
                                    } else {
                                        restoreError = if (isArabic) "الملف المدخل غير صالح" else "Invalid JSON data"
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("confirm_restore_button")
                        ) {
                            Icon(Icons.Default.CloudDownload, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(if (isArabic) "استعادة" else "Restore")
                        }
                    }

                    if (restoreError != null) {
                        Text(
                            text = restoreError!!,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    if (onClearAllData != null) {
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedButton(
                            onClick = {
                                onDismiss()
                                onClearAllData()
                            },
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = MaterialTheme.colorScheme.error
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("clear_all_data_button")
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(if (isArabic) "مسح وتفريغ جميع الخانات (البدء من الصفر)" else "Wipe All Data & Start Empty")
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("close_backup_dialog")
            ) {
                Text(if (isArabic) "إغلاق" else "Close")
            }
        }
    )
}
