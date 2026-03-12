package com.example.demonstrator_2.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.FrontHand
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.PanToolAlt
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FabPosition
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RangeSlider
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.demonstrator_2.data.Item
import com.example.demonstrator_2.data.ItemCategory
import com.example.demonstrator_2.viewmodel.ItemViewModel
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemListScreen(
    navController: NavController,
    viewModel: ItemViewModel
) {
    val items by viewModel.allItems.collectAsState()
    var showSettingsMenu by remember { mutableStateOf(false) }
    var showFilterSheet by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }

    // Tutorial state
    var showTutorial by remember { mutableStateOf(false) }
    var tutorialStep by remember { mutableStateOf(0) }

    val tutorialSteps = listOf(
        "Search Bar" to "Use the search bar to find specific items by their name or description.",
        "Notifications" to "Tap here to see alerts for past due items and upcoming tasks.",
        "Settings" to "Access app settings like dark mode, handedness, and this tutorial.",
        "Filters" to "Open the filters menu to narrow down items by price or due date.",
        "Category Filters" to "Quickly filter your items by selecting a specific category.",
        "Add Item" to "Tap the + button to create a new item with details and images.",
        "Explore Shop" to "Browse external products and easily add them to your list.",
        "Calendar" to "View your items and their due dates in a calendar layout.",
        "Statistics" to "Check insights about your items, including total value and gift count.",
        "Gifts" to "Manage items marked as gifts and assign them to recipients."
    )

    // State for selected category filter
    var selectedCategory by remember { mutableStateOf<String?>(null) }

    // Calculate max price from available items - using Double
    val maxPrice = remember(items) { 
        items.maxOfOrNull { it.price }?.coerceAtLeast(1.0) ?: 1000.0 
    }

    // State for price range filter - Note: RangeSlider currently requires Float values for its ClosedFloatingPointRange
    var priceRange by remember { mutableStateOf(0f..maxPrice.toFloat()) }

    // Sync price range if max price changes (e.g. after adding/editing an item)
    LaunchedEffect(maxPrice) {
        val maxPriceFloat = maxPrice.toFloat()
        priceRange = priceRange.start.coerceIn(0f, maxPriceFloat)..maxPriceFloat
    }

    // State for due date filters
    var filterToday by remember { mutableStateOf(false) }
    var filterTomorrow by remember { mutableStateOf(false) }
    var filterThisWeek by remember { mutableStateOf(false) }
    var filterThisMonth by remember { mutableStateOf(false) }

    val todayStart = remember {
        Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis
    }

    // Filter items based on all filter criteria
    val filteredItems = items.filter { item ->
        val categoryMatches = selectedCategory == null || item.category == selectedCategory
        val searchMatches = item.title.contains(searchQuery, ignoreCase = true) ||
                item.description.contains(searchQuery, ignoreCase = true)
        val priceMatches = item.price >= priceRange.start.toDouble() && item.price <= priceRange.endInclusive.toDouble()

        val dueDateMatches = if (filterToday || filterTomorrow || filterThisWeek || filterThisMonth) {
            if (item.dueDate == null) {
                false
            } else {
                val itemCalendar = Calendar.getInstance().apply {
                    timeInMillis = item.dueDate!!
                }
                val today = Calendar.getInstance()
                
                val tomorrow = (today.clone() as Calendar).apply { add(Calendar.DAY_OF_YEAR, 1) }
                
                val startOfWeek = (today.clone() as Calendar).apply {
                    set(Calendar.DAY_OF_WEEK, firstDayOfWeek)
                    set(Calendar.HOUR_OF_DAY, 0)
                    set(Calendar.MINUTE, 0)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                }
                val endOfWeek = (today.clone() as Calendar).apply { 
                    set(Calendar.DAY_OF_WEEK, firstDayOfWeek)
                    add(Calendar.DAY_OF_YEAR, 6)
                    set(Calendar.HOUR_OF_DAY, 23)
                    set(Calendar.MINUTE, 59)
                    set(Calendar.SECOND, 59)
                    set(Calendar.MILLISECOND, 999)
                }
                
                val startOfMonth = (today.clone() as Calendar).apply {
                    set(Calendar.DAY_OF_MONTH, 1)
                    set(Calendar.HOUR_OF_DAY, 0)
                    set(Calendar.MINUTE, 0)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                }
                val endOfMonth = (today.clone() as Calendar).apply { 
                    set(Calendar.DAY_OF_MONTH, getActualMaximum(Calendar.DAY_OF_MONTH))
                    set(Calendar.HOUR_OF_DAY, 23)
                    set(Calendar.MINUTE, 59)
                    set(Calendar.SECOND, 59)
                    set(Calendar.MILLISECOND, 999)
                }

                (filterToday && isSameDay(itemCalendar, today)) ||
                        (filterTomorrow && isSameDay(itemCalendar, tomorrow)) ||
                        (filterThisWeek && !itemCalendar.before(startOfWeek) && !itemCalendar.after(endOfWeek)) ||
                        (filterThisMonth && !itemCalendar.before(startOfMonth) && !itemCalendar.after(endOfMonth))
            }
        } else {
            true
        }

        categoryMatches && searchMatches && priceMatches && dueDateMatches
    }

    // Sort items by timestamp first, then they will be grouped
    val sortedFilteredItems = filteredItems.sortedByDescending { it.timestamp }

    val pastDueItems = sortedFilteredItems.filter { !it.isNotificationRead && it.dueDate != null && it.dueDate!! < todayStart }
    val upcomingItems = sortedFilteredItems.filter { !it.isNotificationRead && (it.dueDate == null || it.dueDate!! >= todayStart) }
    val purchasedItems = sortedFilteredItems.filter { it.isNotificationRead }


    // Calculate statistics ONLY from items that are NOT YET BOUGHT
    val unboughtItems = filteredItems.filter { !it.isNotificationRead }
    val totalPrice = unboughtItems.sumOf { it.price }
    val giftCount = unboughtItems.count { it.isGift }
    val itemCount = unboughtItems.size
    
    val hasUnreadNotifications = items.any { !it.isNotificationRead }

    if (showTutorial) {
        AlertDialog(
            onDismissRequest = { showTutorial = false },
            title = { Text(tutorialSteps[tutorialStep].first) },
            text = { Text(tutorialSteps[tutorialStep].second) },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (tutorialStep < tutorialSteps.size - 1) {
                            tutorialStep++
                        } else {
                            showTutorial = false
                            tutorialStep = 0
                        }
                    }
                ) {
                    Text(if (tutorialStep < tutorialSteps.size - 1) "Next" else "Finish")
                }
            },
            dismissButton = {
                TextButton(onClick = { showTutorial = false; tutorialStep = 0 }) {
                    Text("Skip")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.primary,
                ),
                title = {
                    Text(
                        if (selectedCategory != null) "Category: $selectedCategory" else "My Items",
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                },
                actions = {
                    IconButton(
                        onClick = { navController.navigate("notifications") },
                        modifier = Modifier.then(
                            if (showTutorial && tutorialStep == 1) Modifier.border(4.dp, Color.Red, CircleShape) else Modifier
                        )
                    ) {
                        BadgedBox(
                            badge = {
                                if (hasUnreadNotifications) {
                                    Badge(containerColor = Color.Red)
                                }
                            }
                        ) {
                            Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                        }
                    }
                    Box {
                        IconButton(
                            onClick = { showSettingsMenu = true },
                            modifier = Modifier.then(
                                if (showTutorial && tutorialStep == 2) Modifier.border(4.dp, Color.Red, CircleShape) else Modifier
                            )
                        ) {
                            Icon(Icons.Default.Settings, contentDescription = "Settings")
                        }
                        DropdownMenu(
                            expanded = showSettingsMenu,
                            onDismissRequest = { showSettingsMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            if (viewModel.isDarkMode.value) Icons.Default.LightMode else Icons.Default.DarkMode,
                                            contentDescription = null,
                                            modifier = Modifier.size(20.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(if (viewModel.isDarkMode.value) "Light Mode" else "Dark Mode")
                                    }
                                },
                                onClick = {
                                    viewModel.toggleTheme()
                                    showSettingsMenu = false
                                }
                            )
                            DropdownMenuItem(
                                text = {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            if (viewModel.isRightHanded.value) Icons.Default.FrontHand else Icons.Default.PanToolAlt,
                                            contentDescription = null,
                                            modifier = Modifier.size(20.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(if (viewModel.isRightHanded.value) "Switch to Left Handed Mode" else "Switch to Right Handed Mode")
                                    }
                                },
                                onClick = {
                                    viewModel.toggleHandedness()
                                    showSettingsMenu = false
                                }
                            )
                            DropdownMenuItem(
                                text = {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            Icons.Default.HelpOutline,
                                            contentDescription = null,
                                            modifier = Modifier.size(20.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Tutorial")
                                    }
                                },
                                onClick = {
                                    showSettingsMenu = false
                                    showTutorial = true
                                    tutorialStep = 0
                                }
                            )
                        }
                    }
                }
            )
        },
        floatingActionButton = {
            val scrollState = rememberScrollState()
            
            // Auto-scroll to show the primary action (Add button) depending on handedness
            LaunchedEffect(viewModel.isRightHanded.value) {
                if (viewModel.isRightHanded.value) {
                    scrollState.scrollTo(scrollState.maxValue)
                } else {
                    scrollState.scrollTo(0)
                }
            }

            val fabItems = listOf<@Composable () -> Unit>(
                {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        FloatingActionButton(
                            onClick = { navController.navigate("insights") },
                            containerColor = Color(0xFFF44336), // Red
                            contentColor = Color.White,
                            modifier = Modifier.then(
                                if (showTutorial && tutorialStep == 9) Modifier.border(4.dp, Color.Cyan, RoundedCornerShape(16.dp)) else Modifier
                            )
                        ) {
                            Icon(Icons.Default.CardGiftcard, contentDescription = "Gift Assigner")
                        }
                        Text("Gifts", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
                    }
                },
                {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        FloatingActionButton(
                            onClick = { navController.navigate("statistics") },
                            containerColor = Color(0xFF2196F3), // Blue
                            contentColor = Color.White,
                            modifier = Modifier.then(
                                if (showTutorial && tutorialStep == 8) Modifier.border(4.dp, Color.Cyan, RoundedCornerShape(16.dp)) else Modifier
                            )
                        ) {
                            Icon(Icons.Default.BarChart, contentDescription = "Statistics")
                        }
                        Text("Stats", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
                    }
                },
                {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        FloatingActionButton(
                            onClick = { navController.navigate("calendar") },
                            containerColor = Color(0xFF4CAF50), // Green
                            contentColor = Color.White,
                            modifier = Modifier.then(
                                if (showTutorial && tutorialStep == 7) Modifier.border(4.dp, Color.Cyan, RoundedCornerShape(16.dp)) else Modifier
                            )
                        ) {
                            Icon(Icons.Default.CalendarMonth, contentDescription = "Calendar")
                        }
                        Text("Calendar", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
                    }
                },
                {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        FloatingActionButton(
                            onClick = { navController.navigate("shop") },
                            containerColor = Color(0xFFFFEB3B), // Yellow
                            contentColor = Color.Black,
                            modifier = Modifier.then(
                                if (showTutorial && tutorialStep == 6) Modifier.border(4.dp, Color.Cyan, RoundedCornerShape(16.dp)) else Modifier
                            )
                        ) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = "Explore Shop")
                        }
                        Text("Shop", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
                    }
                },
                {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        FloatingActionButton(
                            onClick = { navController.navigate("add") },
                            modifier = Modifier.then(
                                if (showTutorial && tutorialStep == 5) Modifier.border(4.dp, Color.Cyan, RoundedCornerShape(16.dp)) else Modifier
                            )
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Add Item")
                        }
                        Text("Add", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            )

            // Wrap the scrollable Row in a full-width Box but align the Row
            // to allow touches to pass through empty space in landscape mode.
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp)
            ) {
                Row(
                    modifier = Modifier
                        .align(if (viewModel.isRightHanded.value) Alignment.CenterEnd else Alignment.CenterStart)
                        .horizontalScroll(scrollState),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    if (viewModel.isRightHanded.value) {
                        fabItems.forEach { it() }
                    } else {
                        fabItems.reversed().forEach { it() }
                    }
                }
            }
        },
        floatingActionButtonPosition = FabPosition.Center
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            SearchBar(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.then(
                    if (showTutorial && tutorialStep == 0) Modifier.border(4.dp, Color.Red, RoundedCornerShape(12.dp)) else Modifier
                )
            )

            // Category filter chips
            CategoryFilterRow(
                selectedCategory = selectedCategory,
                onCategorySelected = { category ->
                    if (selectedCategory == category) {
                        selectedCategory = null
                    } else {
                        selectedCategory = category
                    }
                },
                onFilterClick = { showFilterSheet = true },
                modifier = Modifier.padding(start = 8.dp, end = 8.dp, top = 0.dp, bottom = 8.dp),
                highlightFilters = showTutorial && tutorialStep == 3,
                highlightCategories = showTutorial && tutorialStep == 4
            )

            if (filteredItems.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    if (searchQuery.isNotEmpty()) {
                        Text("No items match your search.")
                    } else if (selectedCategory != null) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("No items in category: $selectedCategory")
                            Spacer(modifier = Modifier.height(8.dp))
                            Button(onClick = { selectedCategory = null }) {
                                Text("Show All Items")
                            }
                        }
                    } else {
                        Text("No items yet. Tap + to add one!")
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Statistics display card moved inside LazyColumn to be scrollable with items
                    item {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer
                            )
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // LEFT: Number of Items
                                Column(
                                    modifier = Modifier.weight(1f),
                                    horizontalAlignment = Alignment.Start
                                ) {
                                    Text(
                                        text = "No of Items",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            Icons.Default.Inventory,
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp),
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = itemCount.toString(),
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }

                                // MIDDLE: Gift Items
                                Column(
                                    modifier = Modifier.weight(1f),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = "Gift Items",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            Icons.Default.CardGiftcard,
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp),
                                            tint = MaterialTheme.colorScheme.secondary
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = giftCount.toString(),
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.secondary
                                        )
                                    }
                                }

                                // RIGHT: Total Value
                                Column(
                                    modifier = Modifier.weight(1f),
                                    horizontalAlignment = Alignment.End
                                ) {
                                    Text(
                                        text = "Total Value",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        textAlign = TextAlign.End
                                    )
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            Icons.Default.AttachMoney,
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp),
                                            tint = MaterialTheme.colorScheme.primary
                                        )
                                        Spacer(modifier = Modifier.width(2.dp))
                                        Text(
                                            text = "%.2f".format(totalPrice),
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    }
                                }
                            }
                        }
                    }

                    if (pastDueItems.isNotEmpty()) {
                        item {
                            SectionLabel(text = "Past Due", color = MaterialTheme.colorScheme.error)
                        }
                        items(pastDueItems) { item ->
                            ItemCard(
                                item = item,
                                onClick = { navController.navigate("detail/${item.id}") }
                            )
                        }
                    }

                    if (upcomingItems.isNotEmpty()) {
                        item {
                            SectionLabel(text = "Upcoming Products", color = MaterialTheme.colorScheme.primary)
                        }
                        items(upcomingItems) { item ->
                            ItemCard(
                                item = item,
                                onClick = { navController.navigate("detail/${item.id}") }
                            )
                        }
                    }

                    if (purchasedItems.isNotEmpty()) {
                        item {
                            SectionLabel(text = "Purchased Products", color = MaterialTheme.colorScheme.secondary)
                        }
                        items(purchasedItems) { item ->
                            ItemCard(
                                item = item,
                                onClick = { navController.navigate("detail/${item.id}") }
                            )
                        }
                    }
                    
                    // Add extra spacing at the bottom so FAB doesn't cover content
                    item {
                        Spacer(modifier = Modifier.height(120.dp)) // Sufficient space for FABs + Labels
                    }
                }
            }
        }

        if (showFilterSheet) {
            ModalBottomSheet(onDismissRequest = { showFilterSheet = false }) {
                FilterSheet(
                    priceRange = priceRange,
                    onPriceRangeChange = { priceRange = it },
                    maxPrice = maxPrice,
                    filterToday = filterToday,
                    onFilterTodayChange = { 
                        filterToday = it
                        if (it) { filterTomorrow = false; filterThisWeek = false; filterThisMonth = false }
                    },
                    filterTomorrow = filterTomorrow,
                    onFilterTomorrowChange = { 
                        filterTomorrow = it
                        if (it) { filterToday = false; filterThisWeek = false; filterThisMonth = false }
                    },
                    filterThisWeek = filterThisWeek,
                    onFilterThisWeekChange = { 
                        filterThisWeek = it
                        if (it) { filterToday = false; filterTomorrow = false; filterThisMonth = false }
                    },
                    filterThisMonth = filterThisMonth,
                    onFilterThisMonthChange = { 
                        filterThisMonth = it
                        if (it) { filterToday = false; filterTomorrow = false; filterThisWeek = false }
                    }
                )
            }
        }
    }
}

@Composable
fun SectionLabel(text: String, color: Color) {
    Column(modifier = Modifier.padding(top = 24.dp, bottom = 8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .height(18.dp)
                    .background(color, shape = RoundedCornerShape(2.dp))
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = text.uppercase(),
                style = MaterialTheme.typography.labelLarge,
                color = color,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(color.copy(alpha = 0.2f))
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterSheet(
    priceRange: ClosedFloatingPointRange<Float>,
    onPriceRangeChange: (ClosedFloatingPointRange<Float>) -> Unit,
    maxPrice: Double,
    filterToday: Boolean,
    onFilterTodayChange: (Boolean) -> Unit,
    filterTomorrow: Boolean,
    onFilterTomorrowChange: (Boolean) -> Unit,
    filterThisWeek: Boolean,
    onFilterThisWeekChange: (Boolean) -> Unit,
    filterThisMonth: Boolean,
    onFilterThisMonthChange: (Boolean) -> Unit
) {
    Column(
        modifier = Modifier.padding(16.dp)
    ) {
        Text("Filters", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(16.dp))
        Text("By Price")
        RangeSlider(
            value = priceRange,
            onValueChange = onPriceRangeChange,
            valueRange = 0f..maxPrice.toFloat()
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Min: $${priceRange.start.toLong()}")
            val displayMax = if (priceRange.endInclusive >= maxPrice.toFloat()) {
                maxPrice.toLong()
            } else {
                priceRange.endInclusive.toLong()
            }
            Text("Max: $$displayMax")
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("By Due Date")
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable { onFilterTodayChange(!filterToday) }
        ) {
            RadioButton(selected = filterToday, onClick = { onFilterTodayChange(!filterToday) })
            Text("Today")
        }
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable { onFilterTomorrowChange(!filterTomorrow) }
        ) {
            RadioButton(selected = filterTomorrow, onClick = { onFilterTomorrowChange(!filterTomorrow) })
            Text("Tomorrow")
        }
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable { onFilterThisWeekChange(!filterThisWeek) }
        ) {
            RadioButton(selected = filterThisWeek, onClick = { onFilterThisWeekChange(!filterThisWeek) })
            Text("This Week")
        }
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable { onFilterThisMonthChange(!filterThisMonth) }
        ) {
            RadioButton(selected = filterThisMonth, onClick = { onFilterThisMonthChange(!filterThisMonth) })
            Text("This Month")
        }
    }
}

fun isSameDay(cal1: Calendar, cal2: Calendar): Boolean {
    return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
            cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
}

@Composable
fun SearchBar(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 8.dp),
        placeholder = { Text("Search") },
        leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
        singleLine = true,
        shape = RoundedCornerShape(12.dp)
    )
}

@Composable
fun CategoryFilterRow(
    selectedCategory: String?,
    onCategorySelected: (String?) -> Unit,
    onFilterClick: () -> Unit,
    modifier: Modifier = Modifier,
    highlightFilters: Boolean = false,
    highlightCategories: Boolean = false
) {
    val categories = listOf("All") + ItemCategory.entries.map { it.displayName }

    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Filters",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            IconButton(
                onClick = onFilterClick,
                modifier = Modifier
                    .size(32.dp)
                    .then(
                        if (highlightFilters) Modifier.border(4.dp, Color.Red, CircleShape) else Modifier
                    )
            ) {
                Icon(
                    Icons.Default.FilterList,
                    contentDescription = "Filter",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(20.dp)
                )
            }
        }


        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .then(
                    if (highlightCategories) Modifier.border(4.dp, Color.Red, RoundedCornerShape(8.dp)) else Modifier
                ),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            categories.forEach { category ->
                val isSelected = when (category) {
                    "All" -> selectedCategory == null
                    else -> selectedCategory == category
                }

                CategoryChip(
                    categoryName = category,
                    isSelected = isSelected,
                    onClick = {
                        when (category) {
                            "All" -> onCategorySelected(null)
                            else -> onCategorySelected(category)
                        }
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryChip(
    categoryName: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    AssistChip(
        onClick = onClick,
        label = {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(categoryName)
                if (isSelected && categoryName != "All") {
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Clear filter",
                        modifier = Modifier.size(12.dp)
                    )
                }
            }
        },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = if (isSelected) {
                MaterialTheme.colorScheme.primary
            } else {
                MaterialTheme.colorScheme.surfaceVariant
            },
            labelColor = if (isSelected) {
                MaterialTheme.colorScheme.onPrimary
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            }
        ),
        border = BorderStroke(
            width = 1.dp,
            color = if (isSelected) {
                MaterialTheme.colorScheme.primary
            } else {
                MaterialTheme.colorScheme.outline
            }
        ),
        leadingIcon = if (isSelected && categoryName != "All") {
            {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.onPrimary)
                )
            }
        } else null
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemCard(
    item: Item,
    onClick: () -> Unit
) {
    val isOverdue = remember(item.dueDate, item.isNotificationRead) {
        item.dueDate?.let {
            val today = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            it < today.timeInMillis && !item.isNotificationRead
        } ?: false
    }

    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .alpha(if (item.isNotificationRead) 0.5f else 1f),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isOverdue) MaterialTheme.colorScheme.errorContainer else MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            @Suppress("UNUSED_VARIABLE")
            val dummy = 0 // Keeping original logic mostly intact
            Column(
                modifier = Modifier.weight(1f)
            ) {
                if (isOverdue) {
                    Text(
                        text = "PAST DUE",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                }

                // Category badge
                Text(
                    text = item.category.uppercase(),
                    style = MaterialTheme.typography.labelSmall,
                    color = if (isOverdue) MaterialTheme.colorScheme.onErrorContainer else MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 4.dp)
                )

                Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = item.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 4.dp)
                )

                // Indicators row
                Row(
                    modifier = Modifier.padding(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (item.urls.isNotEmpty()) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Link,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${item.urls.size} Links",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            Column(
                horizontalAlignment = Alignment.End,
                modifier = Modifier.padding(start = 12.dp)
            ) {
                if (item.price > 0) {
                    Text(
                        text = "$${"%.2f".format(item.price)}",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (item.imagePath != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Card(
                        modifier = Modifier.size(60.dp),
                        shape = RoundedCornerShape(8.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        AsyncImage(
                            model = item.imagePath,
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }
                }

                if (item.isGift) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .background(
                                color = MaterialTheme.colorScheme.secondaryContainer,
                                shape = RoundedCornerShape(4.dp)
                            )
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Icon(
                            Icons.Default.CardGiftcard,
                            contentDescription = "Gift",
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "GIFT",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSecondaryContainer,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
