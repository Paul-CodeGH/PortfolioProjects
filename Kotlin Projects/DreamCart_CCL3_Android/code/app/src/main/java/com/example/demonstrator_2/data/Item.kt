package com.example.demonstrator_2.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.example.demonstrator_2.data.converters.StringListConverter

@Entity(tableName = "items")
@TypeConverters(StringListConverter::class)
data class Item(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val description: String,
    val price: Double = 0.0,
    val isGift: Boolean = false,
    val giftRecipient: String? = null,
    val dueDate: Long? = null, // New field for due date
    val imagePath: String? = null,
    val urls: List<String> = emptyList(),
    val category: String = "General",
    val timestamp: Long = System.currentTimeMillis(),
    val isNotificationRead: Boolean = false,
    val boughtDate: Long? = null // Field to track when it was actually bought
)

enum class ItemCategory(val displayName: String) {
    ELECTRONICS("Electronics"),
    HOUSEHOLD("Household"),
    PERSONAL("Personal"),
    IMPORTANT_STUFF("Important Stuff"),
    GENERAL("General")
}