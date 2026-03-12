package com.example.demonstrator_2

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.demonstrator_2.data.AppDatabase
import com.example.demonstrator_2.repository.ItemRepository
import com.example.demonstrator_2.screens.*
import com.example.demonstrator_2.ui.theme.Demonstrator_2Theme
import com.example.demonstrator_2.viewmodel.ItemViewModel

class MainActivity : ComponentActivity() {
    private val database by lazy { AppDatabase.getDatabase(this) }
    private val repository by lazy { ItemRepository(database.itemDao()) }
    private val viewModel by viewModels<ItemViewModel> {
        ItemViewModel.Factory(repository, this)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            // Use the dark mode state from view model
            Demonstrator_2Theme(darkTheme = viewModel.isDarkMode.value) {
                AppNavigation(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun AppNavigation(viewModel: ItemViewModel) {
    val navController = rememberNavController()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        NavHost(
            navController = navController,
            startDestination = "welcome",
            enterTransition = {
                fadeIn(animationSpec = tween(400)) + slideInHorizontally(
                    initialOffsetX = { it },
                    animationSpec = tween(400)
                )
            },
            exitTransition = {
                fadeOut(animationSpec = tween(400)) + slideOutHorizontally(
                    targetOffsetX = { -it },
                    animationSpec = tween(400)
                )
            },
            popEnterTransition = {
                fadeIn(animationSpec = tween(400)) + slideInHorizontally(
                    initialOffsetX = { -it },
                    animationSpec = tween(400)
                )
            },
            popExitTransition = {
                fadeOut(animationSpec = tween(400)) + slideOutHorizontally(
                    targetOffsetX = { it },
                    animationSpec = tween(400)
                )
            }
        ) {
            composable("welcome") {
                WelcomeScreen(navController = navController)
            }

            composable("intro2") {
                IntroScreen2(navController = navController)
            }

            composable("intro3") {
                IntroScreen3(navController = navController)
            }

            composable("list") {
                ItemListScreen(
                    navController = navController,
                    viewModel = viewModel
                )
            }

            composable("add") {
                AddEditItemScreen(
                    navController = navController,
                    viewModel = viewModel
                )
            }

            composable("insights") {
                InsightsScreen(
                    navController = navController,
                    viewModel = viewModel
                )
            }

            composable("statistics") {
                StatisticsScreen(
                    navController = navController,
                    viewModel = viewModel
                )
            }

            composable("calendar") {
                CalendarScreen(navController = navController, viewModel = viewModel)
            }

            composable("notifications") {
                NotificationScreen(navController = navController, viewModel = viewModel)
            }

            composable("finished_notifications") {
                FinishedNotificationsScreen(navController = navController, viewModel = viewModel)
            }

            composable("shop") {
                ShopScreen(navController = navController, viewModel = viewModel)
            }

            composable(
                "shop_detail/{name}/{description}/{price}/{imageUrl}/{category}",
                arguments = listOf(
                    navArgument("name") { type = NavType.StringType },
                    navArgument("description") { type = NavType.StringType },
                    navArgument("price") { type = NavType.StringType },
                    navArgument("imageUrl") { type = NavType.StringType },
                    navArgument("category") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                val name = backStackEntry.arguments?.getString("name") ?: ""
                val description = backStackEntry.arguments?.getString("description") ?: ""
                val priceString = backStackEntry.arguments?.getString("price") ?: "0.0"
                val price = priceString.toDoubleOrNull() ?: 0.0
                val imageUrl = backStackEntry.arguments?.getString("imageUrl") ?: ""
                val category = backStackEntry.arguments?.getString("category") ?: "General"
                ShopDetailScreen(
                    navController = navController,
                    viewModel = viewModel,
                    name = name,
                    description = description,
                    price = price,
                    imageUrl = imageUrl,
                    category = category
                )
            }

            composable(
                "edit/{itemId}",
                arguments = listOf(navArgument("itemId") { type = NavType.LongType })
            ) { backStackEntry ->
                val itemId = backStackEntry.arguments?.getLong("itemId")
                AddEditItemScreen(
                    navController = navController,
                    viewModel = viewModel,
                    itemId = itemId
                )
            }

            composable(
                "detail/{itemId}",
                arguments = listOf(navArgument("itemId") { type = NavType.LongType })
            ) { backStackEntry ->
                val itemId = backStackEntry.arguments?.getLong("itemId") ?: 0L
                DetailScreen(
                    navController = navController,
                    viewModel = viewModel,
                    itemId = itemId
                )
            }
        }
    }
}
