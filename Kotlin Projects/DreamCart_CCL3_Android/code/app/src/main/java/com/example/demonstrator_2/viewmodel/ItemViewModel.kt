package com.example.demonstrator_2.viewmodel

import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.demonstrator_2.data.Item
import com.example.demonstrator_2.data.ItemCategory
import com.example.demonstrator_2.repository.ItemRepository
import com.example.demonstrator_2.utils.ImageManager
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.URL

// Data classes for API
data class ProductData(val categories: List<ProductCategory>)
data class ProductCategory(val name: String, val products: List<ApiProduct>)
data class ApiProduct(
    val name: String,
    val description: String,
    val price: Double,
    val imageUrl: String,
    val categoryName: String? = null // Added to help with filtering
)

class ItemViewModel(private val repository: ItemRepository, private val context: Context) : ViewModel() {
    private val imageManager = ImageManager(context)
    
    // Theme state - set to true by default for Dark Mode start
    var isDarkMode = mutableStateOf(true)
        private set

    fun toggleTheme() {
        isDarkMode.value = !isDarkMode.value
    }

    // Floating Button Position state - true for Right (End), false for Left (Start)
    var isRightHanded = mutableStateOf(true)
        private set

    fun toggleHandedness() {
        isRightHanded.value = !isRightHanded.value
    }

    val allItems = repository.allItems.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // API Products state
    private val _productCategories = MutableStateFlow<List<ProductCategory>>(emptyList())
    val productCategories: StateFlow<List<ProductCategory>> = _productCategories.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        fetchProducts()
    }

    fun fetchProducts() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = withContext(Dispatchers.IO) {
                    val url = "https://cc241003-10963.node.ustp.cloud/api/products"
                    URL(url).readText()
                }
                val productData = Gson().fromJson(response, ProductData::class.java)
                _productCategories.value = productData.categories
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    // Add these new functions for image loading
    suspend fun loadBitmapFromUri(uri: Uri): Bitmap? {
        return imageManager.loadBitmapFromUri(uri)
    }

    suspend fun loadBitmapFromPath(path: String): Bitmap? {
        return imageManager.loadBitmapWithCorrectOrientation(path)
    }

    // Function to get a single item as Flow
    fun getItemFlow(itemId: Long): Flow<Item?> {
        return repository.getItemByIdFlow(itemId)
    }

    fun markNotificationAsRead(item: Item) {
        viewModelScope.launch(Dispatchers.IO) {
            val updatedItem = item.copy(
                isNotificationRead = true,
                boughtDate = System.currentTimeMillis()
            )
            repository.updateItem(updatedItem)
        }
    }

    fun toggleNotificationReadStatus(item: Item) {
        viewModelScope.launch(Dispatchers.IO) {
            val newStatus = !item.isNotificationRead
            val updatedItem = item.copy(
                isNotificationRead = newStatus,
                boughtDate = if (newStatus) System.currentTimeMillis() else null
            )
            repository.updateItem(updatedItem)
        }
    }

    suspend fun insertItem(
        title: String,
        description: String,
        price: Double = 0.0,
        isGift: Boolean = false,
        giftRecipient: String? = null,
        dueDate: Long? = null,
        imageBitmap: Bitmap? = null,
        urls: List<String> = emptyList(),
        category: String = ItemCategory.GENERAL.displayName
    ): Long {
        return withContext(Dispatchers.IO) {
            val imagePath = imageBitmap?.let { imageManager.saveBitmapToFile(it) }
            val item = Item(
                title = title,
                description = description,
                price = price,
                isGift = isGift,
                giftRecipient = giftRecipient,
                dueDate = dueDate,
                imagePath = imagePath,
                urls = urls,
                category = category
            )
            repository.insertItem(item)
        }
    }

    fun insertItemFromShop(
        title: String,
        description: String,
        price: Double,
        imageUrl: String,
        category: String
    ) {
        viewModelScope.launch(Dispatchers.IO) {
            val item = Item(
                title = title,
                description = description,
                price = price,
                imagePath = imageUrl, // Storing remote URL directly
                category = category
            )
            repository.insertItem(item)
        }
    }

    fun updateItem(
        itemId: Long,
        title: String,
        description: String,
        price: Double = 0.0,
        isGift: Boolean = false,
        giftRecipient: String? = null,
        dueDate: Long? = null,
        imageBitmap: Bitmap? = null,
        urls: List<String> = emptyList(),
        category: String = ItemCategory.GENERAL.displayName
    ) {
        viewModelScope.launch {
            val existingItem = repository.getItemById(itemId)
            existingItem?.let { item ->
                val imagePath = if (imageBitmap != null) {
                    item.imagePath?.let { oldPath ->
                        imageManager.deleteImageFile(oldPath)
                    }
                    imageManager.saveBitmapToFile(imageBitmap)
                } else {
                    item.imagePath
                }

                val updatedItem = item.copy(
                    title = title,
                    description = description,
                    price = price,
                    isGift = isGift,
                    giftRecipient = giftRecipient,
                    dueDate = dueDate,
                    imagePath = imagePath,
                    urls = urls,
                    category = category
                )
                repository.updateItem(updatedItem)
            }
        }
    }

    fun deleteItem(item: Item) {
        viewModelScope.launch(Dispatchers.IO) {
            item.imagePath?.let { imageManager.deleteImageFile(it) }
            repository.deleteItem(item)
        }
    }

    suspend fun getItemById(id: Long): Item? {
        return withContext(Dispatchers.IO) {
            repository.getItemById(id)
        }
    }

    fun getAllCategories(): List<String> {
        return ItemCategory.entries.map { it.displayName }
    }

    companion object {
        fun Factory(repository: ItemRepository, context: Context): ItemViewModelFactory {
            return ItemViewModelFactory(repository, context)
        }
    }
}
