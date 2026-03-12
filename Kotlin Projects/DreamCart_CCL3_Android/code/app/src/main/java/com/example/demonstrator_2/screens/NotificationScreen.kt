package com.example.demonstrator_2.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.demonstrator_2.data.Item
import com.example.demonstrator_2.viewmodel.ItemViewModel
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.TemporalAdjusters
import java.time.DayOfWeek

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationScreen(navController: NavController, viewModel: ItemViewModel) {
    val items by viewModel.allItems.collectAsState()
    val today = LocalDate.now()
    
    // Only count as unread if it has a due date
    val unreadCount = items.count { it.dueDate != null && !it.isNotificationRead }

    // Calculate end of this week (Sunday)
    val endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
    // Calculate end of this month
    val endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth())

    val itemsOverdue = items.filter { item ->
        item.dueDate?.let {
            val date = Instant.ofEpochMilli(it).atZone(ZoneId.systemDefault()).toLocalDate()
            date.isBefore(today) && !item.isNotificationRead
        } ?: false
    }

    val itemsThisWeek = items.filter { item ->
        item.dueDate?.let {
            val date = Instant.ofEpochMilli(it).atZone(ZoneId.systemDefault()).toLocalDate()
            (date == today || (date.isAfter(today) && !date.isAfter(endOfWeek))) && !item.isNotificationRead
        } ?: false
    }

    val itemsThisMonth = items.filter { item ->
        item.dueDate?.let {
            val date = Instant.ofEpochMilli(it).atZone(ZoneId.systemDefault()).toLocalDate()
            date.isAfter(endOfWeek) && !date.isAfter(endOfMonth) && !item.isNotificationRead
        } ?: false
    }

    val itemsLeftToBuy = items.filter { item ->
        item.dueDate?.let {
            val date = Instant.ofEpochMilli(it).atZone(ZoneId.systemDefault()).toLocalDate()
            date.isAfter(endOfMonth) && !item.isNotificationRead
        } ?: false
    }

    val itemsNoDueDate = items.filter { it.dueDate == null && !it.isNotificationRead }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Notifications")
                        if (unreadCount > 0) {
                            Spacer(modifier = Modifier.width(8.dp))
                            Badge(
                                containerColor = MaterialTheme.colorScheme.error,
                                contentColor = MaterialTheme.colorScheme.onError
                            ) {
                                Text("$unreadCount")
                            }
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    TextButton(onClick = { navController.navigate("finished_notifications") }) {
                        Text("History")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.primary
                )
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (itemsOverdue.isNotEmpty()) {
                item { SectionHeader(text = "Overdue", color = MaterialTheme.colorScheme.error) }
                items(itemsOverdue) { item ->
                    NotificationCard(
                        item = item,
                        timeFrame = "PAST DUE",
                        today = today,
                        onClick = { navController.navigate("detail/${item.id}") }
                    )
                }
            }

            item { SectionHeader(text = "This Week", color = MaterialTheme.colorScheme.primary) }
            if (itemsThisWeek.isEmpty()) {
                item { EmptySectionText("No items due the rest of this week.") }
            } else {
                items(itemsThisWeek) { item ->
                    NotificationCard(
                        item = item,
                        timeFrame = "this week",
                        today = today,
                        onClick = { navController.navigate("detail/${item.id}") }
                    )
                }
            }

            item { SectionHeader(text = "This Month", color = MaterialTheme.colorScheme.primary) }
            if (itemsThisMonth.isEmpty()) {
                item { EmptySectionText("No other items due this month.") }
            } else {
                items(itemsThisMonth) { item ->
                    NotificationCard(
                        item = item,
                        timeFrame = "this month",
                        today = today,
                        onClick = { navController.navigate("detail/${item.id}") }
                    )
                }
            }

            item { SectionHeader(text = "Left to buy", color = MaterialTheme.colorScheme.primary) }
            if (itemsLeftToBuy.isEmpty()) {
                item { EmptySectionText("No other items due after this month.") }
            } else {
                items(itemsLeftToBuy) { item ->
                    NotificationCard(
                        item = item,
                        timeFrame = "the future",
                        today = today,
                        onClick = { navController.navigate("detail/${item.id}") }
                    )
                }
            }

            item { SectionHeader(text = "Other products", color = MaterialTheme.colorScheme.secondary) }
            if (itemsNoDueDate.isEmpty()) {
                item { EmptySectionText("No other products without due date.") }
            } else {
                items(itemsNoDueDate) { item ->
                    NotificationCard(
                        item = item,
                        timeFrame = "",
                        today = today,
                        onClick = { navController.navigate("detail/${item.id}") }
                    )
                }
            }
        }
    }
}

@Composable
fun SectionHeader(text: String, color: Color) {
    Column(modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)) {
        Text(
            text = text.uppercase(),
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Bold,
            color = color,
            letterSpacing = 1.2.sp
        )
        Spacer(modifier = Modifier.height(4.dp))
        Divider(thickness = 1.dp, color = color.copy(alpha = 0.2f))
    }
}

@Composable
fun EmptySectionText(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
        modifier = Modifier.padding(vertical = 4.dp)
    )
}

@Composable
fun NotificationCard(
    item: Item,
    timeFrame: String,
    today: LocalDate,
    onClick: () -> Unit
) {
    val isRead = item.isNotificationRead
    val isOverdue = item.dueDate?.let {
        val date = Instant.ofEpochMilli(it).atZone(ZoneId.systemDefault()).toLocalDate()
        date.isBefore(today)
    } ?: false && !isRead
    
    val isUnscheduled = item.dueDate == null

    val cardColor = when {
        isOverdue -> MaterialTheme.colorScheme.errorContainer
        isRead -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        else -> MaterialTheme.colorScheme.surfaceVariant
    }
    
    val icon = when {
        isOverdue -> Icons.Default.Warning
        isRead -> Icons.Default.CheckCircle
        isUnscheduled -> Icons.Default.Info
        else -> Icons.Default.Notifications
    }
    
    val statusColor = when {
        isOverdue -> MaterialTheme.colorScheme.error
        isRead -> Color.Gray
        isUnscheduled -> MaterialTheme.colorScheme.secondary
        else -> MaterialTheme.colorScheme.primary
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = cardColor),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isRead) 0.dp else 2.dp)
    ) {
        Row(modifier = Modifier.height(IntrinsicSize.Min)) {
            // Color indicator bar on the left
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(5.dp)
                    .background(statusColor)
            )
            
            Column(modifier = Modifier.padding(16.dp)) {
                if (isOverdue) {
                    Surface(
                        color = MaterialTheme.colorScheme.error,
                        shape = RoundedCornerShape(4.dp),
                        modifier = Modifier.padding(bottom = 8.dp)
                    ) {
                        Text(
                            text = "OVERDUE",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onError,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                } else if (isUnscheduled && !isRead) {
                    Surface(
                        color = MaterialTheme.colorScheme.secondary,
                        shape = RoundedCornerShape(4.dp),
                        modifier = Modifier.padding(bottom = 8.dp)
                    ) {
                        Text(
                            text = "UNSCHEDULED",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSecondary,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                
                Row(verticalAlignment = Alignment.Top) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = statusColor,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    val recipient = if (item.isGift && !item.giftRecipient.isNullOrBlank()) {
                        " for ${item.giftRecipient}"
                    } else ""

                    val message = buildAnnotatedString {
                        append("Do not forget to buy the ")
                        withStyle(style = SpanStyle(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)) {
                            append(item.title)
                        }
                        append(recipient)
                        
                        if (isUnscheduled) {
                            append(". The due date is unscheduled.")
                        } else {
                            append(". The due date is in ")
                            append(timeFrame)
                            append(".")
                        }
                    }

                    Text(
                        text = message,
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (isRead) Color.Gray else MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 20.sp
                    )
                }
            }
        }
    }
}
