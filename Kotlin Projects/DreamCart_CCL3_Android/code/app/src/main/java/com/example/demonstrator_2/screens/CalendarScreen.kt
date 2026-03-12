package com.example.demonstrator_2.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.demonstrator_2.data.Item
import com.example.demonstrator_2.viewmodel.ItemViewModel
import java.time.Instant
import java.time.LocalDate
import java.time.YearMonth
import java.time.ZoneId
import java.time.format.TextStyle
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarScreen(navController: NavController, viewModel: ItemViewModel) {
    var currentMonth by remember { mutableStateOf(YearMonth.now()) }
    val today = remember { LocalDate.now() }
    val items by viewModel.allItems.collectAsState()

    var selectedDateItems by remember { mutableStateOf<List<Item>?>(null) }
    var selectedDateText by remember { mutableStateOf("") }

    if (selectedDateItems != null) {
        AlertDialog(
            onDismissRequest = { selectedDateItems = null },
            title = { Text("Items for $selectedDateText") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    selectedDateItems?.forEach { item ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            onClick = {
                                selectedDateItems = null
                                navController.navigate("detail/${item.id}")
                            }
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(text = item.title, fontWeight = FontWeight.Bold)
                                if (item.isGift && !item.giftRecipient.isNullOrBlank()) {
                                    Text(
                                        text = "Gift for: ${item.giftRecipient}",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.secondary
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { selectedDateItems = null }) {
                    Text("Close")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("My Calendar") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.primary
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(18.dp))

            // Month Selector
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { currentMonth = currentMonth.minusMonths(1) }) {
                    Icon(Icons.Default.ChevronLeft, contentDescription = "Previous Month")
                }

                Text(
                    text = "${currentMonth.month.getDisplayName(TextStyle.FULL, Locale.getDefault())} ${currentMonth.year}",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )

                IconButton(onClick = { currentMonth = currentMonth.plusMonths(1) }) {
                    Icon(Icons.Default.ChevronRight, contentDescription = "Next Month")
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Days of Week Header
            Row(modifier = Modifier.fillMaxWidth()) {
                val daysOfWeek = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
                daysOfWeek.forEach { day ->
                    Text(
                        text = day,
                        modifier = Modifier.weight(1f),
                        textAlign = TextAlign.Center,
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Calendar Grid
            val firstDayOfMonth = currentMonth.atDay(1)
            val firstDayOfWeek = firstDayOfMonth.dayOfWeek.value // 1 (Mon) to 7 (Sun)
            val daysInMonth = currentMonth.lengthOfMonth()
            val emptySlots = if (firstDayOfWeek == 1) 0 else firstDayOfWeek - 1
            val totalCells = emptySlots + daysInMonth
            val numRows = (totalCells + 6) / 7

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                for (week in 0 until numRows) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        for (dayOfWeek in 0 until 7) {
                            val cellIndex = week * 7 + dayOfWeek
                            if (cellIndex < emptySlots || cellIndex >= emptySlots + daysInMonth) {
                                Box(modifier = Modifier.weight(1f).aspectRatio(1f))
                            } else {
                                val day = cellIndex - emptySlots + 1
                                val date = currentMonth.atDay(day)
                                val isToday = date == today

                                val itemsForDate = items.filter { item ->
                                    item.dueDate?.let {
                                        Instant.ofEpochMilli(it).atZone(ZoneId.systemDefault()).toLocalDate() == date
                                    } ?: false
                                }
                                
                                val hasUnboughtPastDue = itemsForDate.any { !it.isNotificationRead && date.isBefore(today) }
                                val hasUnboughtFuture = itemsForDate.any { !it.isNotificationRead && date.isAfter(today) }
                                val hasUnboughtTodayOrFuture = itemsForDate.any { !it.isNotificationRead && !date.isBefore(today) }
                                val allBought = itemsForDate.isNotEmpty() && itemsForDate.all { it.isNotificationRead }
                                val hasGifts = itemsForDate.any { it.isGift && !it.isNotificationRead }

                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .aspectRatio(1f)
                                        .clip(CircleShape)
                                        .background(
                                            when {
                                                hasUnboughtPastDue -> MaterialTheme.colorScheme.error
                                                isToday -> MaterialTheme.colorScheme.primary
                                                hasGifts -> MaterialTheme.colorScheme.secondaryContainer
                                                hasUnboughtTodayOrFuture -> MaterialTheme.colorScheme.surfaceVariant
                                                allBought -> Color.Gray.copy(alpha = 0.2f)
                                                else -> Color.Transparent
                                            }
                                        )
                                        .then(
                                            if (isToday || hasUnboughtPastDue) Modifier else Modifier.border(
                                                width = if (hasUnboughtFuture) 2.dp else 1.dp,
                                                color = when {
                                                    hasUnboughtFuture -> MaterialTheme.colorScheme.primary
                                                    hasGifts -> MaterialTheme.colorScheme.secondary
                                                    allBought -> Color.Gray.copy(alpha = 0.4f)
                                                    else -> MaterialTheme.colorScheme.outlineVariant
                                                },
                                                shape = CircleShape
                                            )
                                        )
                                        .clickable {
                                            if (itemsForDate.isNotEmpty()) {
                                                selectedDateItems = itemsForDate
                                                selectedDateText = date.toString()
                                            }
                                        },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = day.toString(),
                                        color = when {
                                            hasUnboughtPastDue -> MaterialTheme.colorScheme.onError
                                            isToday -> MaterialTheme.colorScheme.onPrimary
                                            hasGifts -> MaterialTheme.colorScheme.onSecondaryContainer
                                            allBought -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                            else -> MaterialTheme.colorScheme.onSurface
                                        },
                                        fontWeight = if (isToday || hasGifts || hasUnboughtPastDue) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Upcoming Items
            val itemsForCurrentMonth = items.filter { item ->
                item.dueDate?.let {
                    val itemDate = Instant.ofEpochMilli(it).atZone(ZoneId.systemDefault()).toLocalDate()
                    itemDate.year == currentMonth.year && itemDate.month == currentMonth.month
                } ?: false
            }.sortedWith(compareBy<Item> { it.isNotificationRead }.thenBy { it.dueDate })

            if (itemsForCurrentMonth.isNotEmpty()) {
                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Items this Month",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.secondaryContainer)
                        .padding(vertical = 8.dp, horizontal = 16.dp),
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(16.dp))

                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    itemsForCurrentMonth.forEach { item ->
                        UpcomingItemRow(item = item, today = today, navController = navController)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun UpcomingItemRow(item: Item, today: LocalDate, navController: NavController) {
    val itemDate = Instant.ofEpochMilli(item.dueDate!!).atZone(ZoneId.systemDefault()).toLocalDate()
    val isToday = itemDate == today
    val isPastDue = itemDate.isBefore(today) && !item.isNotificationRead
    val isBought = item.isNotificationRead
    val isGift = item.isGift

    val dateColor = when {
        isBought -> Color.Gray.copy(alpha = 0.2f)
        isPastDue -> MaterialTheme.colorScheme.error
        isToday -> MaterialTheme.colorScheme.primary
        isGift -> MaterialTheme.colorScheme.secondaryContainer
        else -> MaterialTheme.colorScheme.surfaceVariant
    }
    val onDateColor = when {
        isBought -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
        isPastDue -> MaterialTheme.colorScheme.onError
        isToday -> MaterialTheme.colorScheme.onPrimary
        isGift -> MaterialTheme.colorScheme.onSecondaryContainer
        else -> MaterialTheme.colorScheme.onSurfaceVariant
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .alpha(if (isBought) 0.6f else 1f)
            .clickable { navController.navigate("detail/${item.id}") },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(dateColor),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "%02d".format(itemDate.dayOfMonth),
                    color = onDateColor,
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.bodyLarge,
                )
                Text(
                    text = itemDate.month.getDisplayName(TextStyle.SHORT, Locale.getDefault()).uppercase(),
                    color = onDateColor,
                    style = MaterialTheme.typography.labelSmall,
                )
            }
        }

        Card(
            modifier = Modifier.weight(1f),
            colors = if (isBought) CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)) 
                     else CardDefaults.cardColors()
        ) {
            Row(
                modifier = Modifier
                    .padding(horizontal = 16.dp, vertical = 12.dp)
                    .fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = item.title, 
                    style = MaterialTheme.typography.bodyLarge,
                    color = if (isBought) MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f) else MaterialTheme.colorScheme.onSurface
                )
                if (item.isGift) {
                    Icon(
                        Icons.Filled.CardGiftcard, 
                        contentDescription = "Gift Icon",
                        tint = if (isBought) MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f) else MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}
