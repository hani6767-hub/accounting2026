package com.example.ui.dialogs

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.models.AppUser
import com.example.ui.models.UserRole

@Composable
fun ShareAndAccessDialog(
    currentUser: AppUser,
    teamUsers: List<AppUser>,
    isArabic: Boolean,
    onSwitchUser: (AppUser) -> Unit,
    onToggleRole: () -> Unit,
    onUpdateUserRole: (String, UserRole) -> Unit,
    onAddUser: (String, String, UserRole) -> Unit,
    onRemoveUser: (String) -> Unit,
    onGenerateShareCode: (UserRole) -> String,
    onImportShareCode: (String) -> Boolean,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableIntStateOf(0) }

    // Add user inputs
    var newUserName by remember { mutableStateOf("") }
    var newUserEmail by remember { mutableStateOf("") }
    var newUserRole by remember { mutableStateOf(UserRole.VIEWER_ONLY) }
    var showAddUserForm by remember { mutableStateOf(false) }

    // Share workspace inputs
    var shareWithRole by remember { mutableStateOf(UserRole.VIEWER_ONLY) }
    var generatedShareCode by remember { mutableStateOf("") }
    var importCodeInput by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.ic_accounting_logo),
                    contentDescription = "Accounting House Logo",
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
                Column {
                    Text(
                        text = if (isArabic) "مشاركة البيانات والصلاحيات" else "Data Sharing & Access Control",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (isArabic) "التحكم في وصول المستخدمين (مشاهد فقط أو تعديل)" else "Manage user access (Viewer vs Editor)",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = MaterialTheme.colorScheme.surface
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = {
                            Text(
                                if (isArabic) "المستخدمون والصلاحيات" else "Users & Roles",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        },
                        icon = { Icon(Icons.Default.Group, contentDescription = null, modifier = Modifier.size(16.dp)) }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = {
                            Text(
                                if (isArabic) "مشاركة وإرسال البيانات" else "Share Workspace",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        },
                        icon = { Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp)) }
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                if (selectedTab == 0) {
                    // TAB 1: User Management & Active Session
                    // Current Active User Banner
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (currentUser.role.canModify) {
                            MaterialTheme.colorScheme.primaryContainer
                        } else {
                            MaterialTheme.colorScheme.secondaryContainer
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        imageVector = if (currentUser.role.canModify) Icons.Default.AdminPanelSettings else Icons.Default.Visibility,
                                        contentDescription = null,
                                        tint = if (currentUser.role.canModify) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary
                                    )
                                    Column {
                                        Text(
                                            text = if (isArabic) "المستخدم النشط حالياً:" else "Current Active Session:",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        Text(
                                            text = currentUser.name,
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }

                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = if (currentUser.role.canModify) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary
                                ) {
                                    Text(
                                        text = if (isArabic) currentUser.role.arTitle else currentUser.role.enTitle,
                                        color = Color.White,
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedButton(
                                onClick = onToggleRole,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("toggle_active_role_button")
                            ) {
                                Icon(Icons.Default.SwapHoriz, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (currentUser.role.canModify) {
                                        if (isArabic) "تبديل إلى وضع (مشاهد فقط) للتجربة" else "Switch to (Viewer Only) mode"
                                    } else {
                                        if (isArabic) "تبديل إلى وضع (محرر كامل)" else "Switch to (Full Editor) mode"
                                    },
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Team Members List
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (isArabic) "قائمة المستخدمين المصرح لهم (${teamUsers.size})" else "Authorized Users (${teamUsers.size})",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )

                        TextButton(onClick = { showAddUserForm = !showAddUserForm }) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                if (showAddUserForm) {
                                    if (isArabic) "إخفاء النموذج" else "Hide"
                                } else {
                                    if (isArabic) "+ إضافة مستخدم" else "+ Add User"
                                },
                                fontSize = 12.sp
                            )
                        }
                    }

                    // Add user form
                    if (showAddUserForm) {
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(
                                    text = if (isArabic) "إضافة مستخدم جديد وتحديد الصلاحية" else "Add New User & Set Role",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold
                                )

                                OutlinedTextField(
                                    value = newUserName,
                                    onValueChange = { newUserName = it },
                                    label = { Text(if (isArabic) "اسم المستخدم / الموظف" else "User Name") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                OutlinedTextField(
                                    value = newUserEmail,
                                    onValueChange = { newUserEmail = it },
                                    label = { Text(if (isArabic) "البريد الإلكتروني (Gmail)" else "Email (Gmail)") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Text(
                                    text = if (isArabic) "نوع الصلاحية الممنوحة:" else "Access Level:",
                                    style = MaterialTheme.typography.labelSmall
                                )

                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    FilterChip(
                                        selected = newUserRole == UserRole.VIEWER_ONLY,
                                        onClick = { newUserRole = UserRole.VIEWER_ONLY },
                                        label = { Text(if (isArabic) "مشاهد فقط (View)" else "Viewer Only", fontSize = 11.sp) },
                                        leadingIcon = {
                                            if (newUserRole == UserRole.VIEWER_ONLY) {
                                                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
                                            }
                                        }
                                    )
                                    FilterChip(
                                        selected = newUserRole == UserRole.OWNER_EDITOR,
                                        onClick = { newUserRole = UserRole.OWNER_EDITOR },
                                        label = { Text(if (isArabic) "محرر (Edit)" else "Full Editor", fontSize = 11.sp) },
                                        leadingIcon = {
                                            if (newUserRole == UserRole.OWNER_EDITOR) {
                                                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
                                            }
                                        }
                                    )
                                }

                                Button(
                                    onClick = {
                                        if (newUserName.isNotBlank()) {
                                            onAddUser(newUserName, newUserEmail, newUserRole)
                                            newUserName = ""
                                            newUserEmail = ""
                                            showAddUserForm = false
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(if (isArabic) "حفظ وإضافة المستخدم" else "Save User")
                                }
                            }
                        }
                    }

                    // Users List
                    teamUsers.forEach { user ->
                        val isCurrent = user.id == currentUser.id
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isCurrent) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f) else MaterialTheme.colorScheme.surface
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .border(
                                    width = 1.dp,
                                    color = if (isCurrent) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant,
                                    shape = RoundedCornerShape(10.dp)
                                )
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(34.dp)
                                                .clip(CircleShape)
                                                .background(if (user.role.canModify) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(
                                                imageVector = if (user.isOwner) Icons.Default.AdminPanelSettings else Icons.Default.Person,
                                                contentDescription = null,
                                                tint = Color.White,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }

                                        Column {
                                            Text(
                                                text = user.name + if (user.isOwner) (if (isArabic) " (المالك)" else " (Owner)") else "",
                                                fontWeight = FontWeight.Bold,
                                                style = MaterialTheme.typography.bodyMedium
                                            )
                                            Text(
                                                text = user.email,
                                                style = MaterialTheme.typography.labelSmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }

                                    if (!isCurrent) {
                                        OutlinedButton(
                                            onClick = { onSwitchUser(user) },
                                            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                                        ) {
                                            Text(if (isArabic) "تفعيل" else "Select", fontSize = 11.sp)
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    // Role toggle chips
                                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        FilterChip(
                                            selected = user.role == UserRole.VIEWER_ONLY,
                                            onClick = { onUpdateUserRole(user.id, UserRole.VIEWER_ONLY) },
                                            label = {
                                                Text(
                                                    if (isArabic) "مشاهد فقط" else "Viewer",
                                                    fontSize = 11.sp
                                                )
                                            },
                                            colors = FilterChipDefaults.filterChipColors(
                                                selectedContainerColor = MaterialTheme.colorScheme.secondary,
                                                selectedLabelColor = Color.White
                                            )
                                        )

                                        FilterChip(
                                            selected = user.role == UserRole.OWNER_EDITOR,
                                            onClick = { onUpdateUserRole(user.id, UserRole.OWNER_EDITOR) },
                                            label = {
                                                Text(
                                                    if (isArabic) "محرر كامل" else "Editor",
                                                    fontSize = 11.sp
                                                )
                                            },
                                            colors = FilterChipDefaults.filterChipColors(
                                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                                selectedLabelColor = Color.White
                                            )
                                        )
                                    }

                                    if (!user.isOwner) {
                                        IconButton(
                                            onClick = { onRemoveUser(user.id) },
                                            modifier = Modifier.size(28.dp)
                                        ) {
                                            Icon(
                                                Icons.Default.DeleteOutline,
                                                contentDescription = "Remove User",
                                                tint = MaterialTheme.colorScheme.error,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // TAB 2: Share Workspace & Generate Access Code
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text(
                                text = if (isArabic) "توليد كود مشاركة بصلاحية مخصصة" else "Generate Workspace Share Code",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (isArabic) {
                                    "حدد نوع الصلاحية التي تريد منحها للمستخدم الآخر قبل إرسال البيانات له:"
                                } else {
                                    "Choose which role to grant the recipient before sharing:"
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                FilterChip(
                                    selected = shareWithRole == UserRole.VIEWER_ONLY,
                                    onClick = {
                                        shareWithRole = UserRole.VIEWER_ONLY
                                        generatedShareCode = onGenerateShareCode(UserRole.VIEWER_ONLY)
                                    },
                                    label = {
                                        Text(if (isArabic) "مشاهد فقط (للعرض والتدقيق)" else "Viewer Only (Read)", fontSize = 11.sp)
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(14.dp))
                                    }
                                )

                                FilterChip(
                                    selected = shareWithRole == UserRole.OWNER_EDITOR,
                                    onClick = {
                                        shareWithRole = UserRole.OWNER_EDITOR
                                        generatedShareCode = onGenerateShareCode(UserRole.OWNER_EDITOR)
                                    },
                                    label = {
                                        Text(if (isArabic) "محرر (لتسجيل المبيعات)" else "Full Editor (Write)", fontSize = 11.sp)
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(14.dp))
                                    }
                                )
                            }

                            Button(
                                onClick = {
                                    generatedShareCode = onGenerateShareCode(shareWithRole)
                                    val sendIntent = Intent().apply {
                                        action = Intent.ACTION_SEND
                                        putExtra(
                                            Intent.EXTRA_TEXT,
                                            "بيت المحاسبة - مشاركة مساحة عمل بصلاحية (${if (isArabic) shareWithRole.arTitle else shareWithRole.enTitle}):\n\n$generatedShareCode"
                                        )
                                        type = "text/plain"
                                    }
                                    context.startActivity(Intent.createChooser(sendIntent, if (isArabic) "مشاركة البيانات عبر" else "Share via"))
                                },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(if (isArabic) "مشاركة عبر التطبيقات (واتساب / بريد)" else "Share via Apps (WhatsApp / Email)")
                            }

                            OutlinedButton(
                                onClick = {
                                    generatedShareCode = onGenerateShareCode(shareWithRole)
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    val clip = ClipData.newPlainText("ShareCode", generatedShareCode)
                                    clipboard.setPrimaryClip(clip)
                                    Toast.makeText(
                                        context,
                                        if (isArabic) "تم نسخ كود المشاركة إلى الحافظة!" else "Share code copied to clipboard!",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(if (isArabic) "نسخ كود المشاركة" else "Copy Share Code")
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Import Shared Workspace Section
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                text = if (isArabic) "استيراد مساحة عمل مشاركة" else "Import Shared Workspace",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (isArabic) {
                                    "الصق كود المشاركة الذي استلمته من مستخدم آخر لفتح البيانات بالصلاحية المحددة لك:"
                                } else {
                                    "Paste the share code received from another user to load data with your granted role:"
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            OutlinedTextField(
                                value = importCodeInput,
                                onValueChange = { importCodeInput = it },
                                placeholder = { Text(if (isArabic) "الصق كود المشاركة هنا..." else "Paste share JSON code here...") },
                                maxLines = 4,
                                modifier = Modifier.fillMaxWidth()
                            )

                            Button(
                                onClick = {
                                    if (importCodeInput.isNotBlank()) {
                                        val success = onImportShareCode(importCodeInput)
                                        if (success) {
                                            Toast.makeText(
                                                context,
                                                if (isArabic) "تم استيراد مساحة العمل بنجاح!" else "Workspace imported successfully!",
                                                Toast.LENGTH_SHORT
                                            ).show()
                                            onDismiss()
                                        } else {
                                            Toast.makeText(
                                                context,
                                                if (isArabic) "رمز غير صالح!" else "Invalid code!",
                                                Toast.LENGTH_SHORT
                                            ).show()
                                        }
                                    }
                                },
                                enabled = importCodeInput.isNotBlank(),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(if (isArabic) "استيراد مساحة العمل وتفعيل الصلاحية" else "Import & Apply Role")
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = onDismiss) {
                Text(if (isArabic) "إغلاق" else "Done")
            }
        }
    )
}
