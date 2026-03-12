package com.example.demonstrator_2.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.demonstrator_2.data.Item
import com.example.demonstrator_2.viewmodel.ItemViewModel
import java.time.Instant
import java.time.LocalDate
import java.time.YearMonth
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.time.temporal.IsoFields
import java.time.temporal.TemporalAdjusters
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatisticsScreen(navController: NavController, viewModel: ItemViewModel) {
    val items by viewModel.allItems.collectAsState()
    var selectedMonth by remember { mutableStateOf(YearMonth.now()) }
    var selectedWeeks by remember { mutableStateOf(setOf<Int>()) }
    var isWeeklyBreakdownVisible by remember { mutableStateOf(false) }
    val scrollState = rememberScrollState()
    val today = LocalDate.now()

    // 1. Library Statistics (Global)
    val totalItems = items.size
    val itemsToBuy = items.count { !it.isNotificationRead }
    val itemsBought = items.count { it.isNotificationRead }
    
    val totalGifts = items.count { it.isGift }
    val giftsToBuy = items.count { it.isGift && !it.isNotificationRead }
    val giftsBought = items.count { it.isGift && it.isNotificationRead }
    
    val totalInvestment = items.sumOf { it.price.toDouble() }
    val totalSpent = items.filter { it.isNotificationRead }.sumOf { it.price.toDouble() }
    val totalLeft = items.filter { !it.isNotificationRead }.sumOf { it.price.toDouble() }

    // 2. Spending Statistics (Based on items marked as read/bought)
    // Updated to use boughtDate instead of dueDate
    val boughtItems = items.filter { it.isNotificationRead && it.boughtDate != null }
    
    // Filter items for the selected month
    val monthItems = boughtItems.filter {
        val date = Instant.ofEpochMilli(it.boughtDate!!).atZone(ZoneId.systemDefault()).toLocalDate()
        date.year == selectedMonth.year && date.month == selectedMonth.month
    }

    val totalMonthSpending = monthItems.sumOf { it.price.toDouble() }

    // Grouping by week
    val weeklySpending = monthItems.groupBy {
        val date = Instant.ofEpochMilli(it.boughtDate!!).atZone(ZoneId.systemDefault()).toLocalDate()
        date.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR)
    }.mapValues { (_, items) -> items.sumOf { it.price.toDouble() } }

    // Auto-scroll logic when weekly breakdown is expanded
    LaunchedEffect(isWeeklyBreakdownVisible) {
        if (isWeeklyBreakdownVisible) {
            scrollState.animateScrollTo(scrollState.maxValue)
        }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Statistics") },
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
                .padding(16.dp)
                .verticalScroll(scrollState),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Section: Library Overview
            StatSection(title = "Library Overview") {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // 1. Total Products Card
                    DetailedStatCard(
                        label = "Total Products",
                        value = totalItems.toString(),
                        icon = Icons.Default.Inventory,
                        color = MaterialTheme.colorScheme.primary,
                        subStats = listOf(
                            "Already bought" to itemsBought.toString(),
                            "Left to buy" to itemsToBuy.toString()
                        )
                    )

                    // 2. Gift Items Card
                    DetailedStatCard(
                        label = "Gift Items",
                        value = totalGifts.toString(),
                        icon = Icons.Default.CardGiftcard,
                        color = Color(0xFFF44336) // Red
                        ,
                        subStats = listOf(
                            "Gifts already bought" to giftsBought.toString(),
                            "Gifts left to buy" to giftsToBuy.toString()
                        )
                    )
                    
                    // 3. Total Value Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.AttachMoney, contentDescription = null, tint = Color(0xFF4CAF50), modifier = Modifier.size(28.dp))
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(text = "Total Value", style = MaterialTheme.typography.titleMedium)
                                }
                                Text(
                                    text = "$${"%.2f".format(totalInvestment)}",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color(0xFF4CAF50)
                                )
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            HorizontalDivider(modifier = Modifier.alpha(0.3f))
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Already Spent", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(text = "$${"%.2f".format(totalSpent)}", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
                            }
                            
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Left to Spend", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(text = "$${"%.2f".format(totalLeft)}", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            Divider(color = MaterialTheme.colorScheme.outlineVariant)

            // Section: Spending Analysis (Interactive)
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Spending Analysis",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Month Picker
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { 
                            selectedMonth = selectedMonth.minusMonths(1)
                            selectedWeeks = emptySet() 
                        }) {
                            Icon(Icons.Default.ChevronLeft, contentDescription = "Previous Month")
                        }

                        Text(
                            text = "${selectedMonth.month.getDisplayName(TextStyle.FULL, Locale.getDefault())} ${selectedMonth.year}",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )

                        IconButton(onClick = { 
                            selectedMonth = selectedMonth.plusMonths(1)
                            selectedWeeks = emptySet()
                        }) {
                            Icon(Icons.Default.ChevronRight, contentDescription = "Next Month")
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Unified View: Month Breakdown always visible, Weeks expand below
                SpendingSummaryCard(
                    title = "Total for ${selectedMonth.month.getDisplayName(TextStyle.FULL, Locale.getDefault())}",
                    amount = totalMonthSpending,
                    color = MaterialTheme.colorScheme.primaryContainer,
                    isExpandable = true,
                    isExpanded = isWeeklyBreakdownVisible,
                    onToggleExpand = { isWeeklyBreakdownVisible = !isWeeklyBreakdownVisible }
                )

                if (isWeeklyBreakdownVisible) {
                    Spacer(modifier = Modifier.height(24.dp))

                    if (weeklySpending.isNotEmpty()) {
                        Text("Weekly Breakdown (Tap to toggle days)", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(8.dp))
                        weeklySpending.toSortedMap().forEach { (week, amount) ->
                            val isWeekExpanded = selectedWeeks.contains(week)
                            Column {
                                ClickableStatRow(
                                    label = "Week $week",
                                    value = "$${"%.2f".format(amount)}",
                                    isExpanded = isWeekExpanded,
                                    onClick = { 
                                        selectedWeeks = if (isWeekExpanded) {
                                            selectedWeeks - week
                                        } else {
                                            selectedWeeks + week
                                        }
                                    }
                                )
                                
                                if (isWeekExpanded) {
                                    Column(
                                        modifier = Modifier.padding(start = 16.dp, top = 4.dp, bottom = 8.dp),
                                        verticalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        val dailySpending = monthItems.filter {
                                            val date = Instant.ofEpochMilli(it.boughtDate!!).atZone(ZoneId.systemDefault()).toLocalDate()
                                            date.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR) == week
                                        }.groupBy {
                                            Instant.ofEpochMilli(it.boughtDate!!).atZone(ZoneId.systemDefault()).toLocalDate()
                                        }.mapValues { (_, items) -> items.sumOf { it.price.toDouble() } }

                                        if (dailySpending.isNotEmpty()) {
                                            dailySpending.toSortedMap().forEach { (date, dailyAmount) ->
                                                StatRowStatic(
                                                    label = date.dayOfWeek.getDisplayName(TextStyle.FULL, Locale.getDefault()),
                                                    subLabel = date.format(DateTimeFormatter.ofPattern("MMM dd")),
                                                    value = "$${"%.2f".format(dailyAmount)}"
                                                )
                                            }
                                        } else {
                                            EmptyPlaceholder()
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        EmptyPlaceholder()
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun StatSection(title: String, content: @Composable () -> Unit) {
    Column {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        content()
    }
}

@Composable
fun DetailedStatCard(
    label: String, 
    value: String, 
    icon: ImageVector, 
    color: Color,
    subStats: List<Pair<String, String>>
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(28.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(text = label, style = MaterialTheme.typography.titleMedium)
                }
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.ExtraBold,
                    color = color
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(modifier = Modifier.alpha(0.3f))
            Spacer(modifier = Modifier.height(8.dp))
            
            subStats.forEachIndexed { index, (subLabel, subValue) ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = subLabel, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(text = subValue, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
                }
                if (index < subStats.size - 1) {
                    Spacer(modifier = Modifier.height(4.dp))
                }
            }
        }
    }
}

@Composable
fun StatCard(label: String, value: String, icon: ImageVector, color: Color) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(28.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Text(text = label, style = MaterialTheme.typography.titleMedium)
            }
            Text(value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold, color = color)
        }
    }
}

@Composable
fun ClickableStatRow(label: String, value: String, isExpanded: Boolean = false, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = label, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary)
                Icon(
                    imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown, 
                    contentDescription = null, 
                    tint = MaterialTheme.colorScheme.outline
                )
            }
        }
    }
}

@Composable
fun StatRowStatic(label: String, subLabel: String, value: String) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = label, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold)
                Text(text = subLabel, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text(text = value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun SpendingSummaryCard(
    title: String, 
    amount: Double, 
    color: Color,
    isExpandable: Boolean = false,
    isExpanded: Boolean = false,
    onToggleExpand: () -> Unit = {}
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = color),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "$${"%.2f".format(amount)}", style = MaterialTheme.typography.displaySmall, fontWeight = FontWeight.Black)
            }
            if (isExpandable) {
                IconButton(onClick = onToggleExpand) {
                    Icon(
                        imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = if (isExpanded) "Collapse" else "Expand"
                    )
                }
            }
        }
    }
}

@Composable
fun EmptyPlaceholder() {
    Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
        Text("No spending data found.", color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
