package com.example.demonstrator_2.repository

import com.example.demonstrator_2.data.Item
import com.example.demonstrator_2.data.ItemDao
import kotlinx.coroutines.flow.Flow

class ItemRepository(private val itemDao: ItemDao) {
    val allItems: Flow<List<Item>> = itemDao.getAllItems()

    suspend fun insertItem(item: Item): Long {
        return itemDao.insertItem(item)
    }

    suspend fun deleteItem(item: Item) {
        itemDao.deleteItem(item)
    }

    suspend fun updateItem(item: Item) {
        itemDao.updateItem(item)
    }

    suspend fun getItemById(id: Long): Item? {
        return itemDao.getItemById(id)
    }

    fun getItemByIdFlow(id: Long): Flow<Item?> {
        return itemDao.getItemByIdFlow(id)
    }
}