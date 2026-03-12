package com.example.demonstrator_2.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import android.os.Environment
import androidx.core.content.FileProvider
import androidx.exifinterface.media.ExifInterface
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ImageManager(private val context: Context) {

    // Create a file for the image
    fun createImageFile(): File {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir = context.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile(
            "JPEG_${timeStamp}_",
            ".jpg",
            storageDir
        )
    }

    // Save bitmap to file
    suspend fun saveBitmapToFile(bitmap: Bitmap): String? = withContext(Dispatchers.IO) {
        try {
            val file = createImageFile()
            FileOutputStream(file).use { stream ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 90, stream)
            }
            file.absolutePath
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    // Load bitmap from file path with correct orientation
    suspend fun loadBitmapWithCorrectOrientation(path: String): Bitmap? = withContext(Dispatchers.IO) {
        try {
            // First, decode the image file
            val options = BitmapFactory.Options().apply {
                inPreferredConfig = Bitmap.Config.ARGB_8888
            }

            val bitmap = BitmapFactory.decodeFile(path, options) ?: return@withContext null

            // Read EXIF data to get orientation
            val exif = ExifInterface(path)
            val orientation = exif.getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL
            )

            // Calculate rotation angle
            val rotationAngle = when (orientation) {
                ExifInterface.ORIENTATION_ROTATE_90 -> 90f
                ExifInterface.ORIENTATION_ROTATE_180 -> 180f
                ExifInterface.ORIENTATION_ROTATE_270 -> 270f
                else -> 0f
            }

            // Rotate bitmap if needed
            if (rotationAngle != 0f) {
                val matrix = Matrix()
                matrix.postRotate(rotationAngle)

                return@withContext Bitmap.createBitmap(
                    bitmap,
                    0,
                    0,
                    bitmap.width,
                    bitmap.height,
                    matrix,
                    true
                )
            }

            bitmap
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    // Load bitmap from URI with correct orientation
    suspend fun loadBitmapFromUri(uri: Uri): Bitmap? = withContext(Dispatchers.IO) {
        try {
            context.contentResolver.openInputStream(uri)?.use { inputStream ->
                // First, read the entire stream to get bytes for EXIF
                val bytes = inputStream.readBytes()

                // Create a temporary file to read EXIF data
                val tempFile = File.createTempFile("temp_image", ".jpg")
                tempFile.writeBytes(bytes)

                // Read EXIF data from temp file
                val exif = ExifInterface(tempFile.absolutePath)
                val orientation = exif.getAttributeInt(
                    ExifInterface.TAG_ORIENTATION,
                    ExifInterface.ORIENTATION_NORMAL
                )

                // Decode bitmap from bytes
                val options = BitmapFactory.Options().apply {
                    inPreferredConfig = Bitmap.Config.ARGB_8888
                }

                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
                    ?: return@withContext null

                // Calculate rotation angle
                val rotationAngle = when (orientation) {
                    ExifInterface.ORIENTATION_ROTATE_90 -> 90f
                    ExifInterface.ORIENTATION_ROTATE_180 -> 180f
                    ExifInterface.ORIENTATION_ROTATE_270 -> 270f
                    else -> 0f
                }

                // Clean up temp file
                tempFile.delete()

                // Rotate bitmap if needed
                if (rotationAngle != 0f) {
                    val matrix = Matrix()
                    matrix.postRotate(rotationAngle)

                    return@withContext Bitmap.createBitmap(
                        bitmap,
                        0,
                        0,
                        bitmap.width,
                        bitmap.height,
                        matrix,
                        true
                    )
                }

                bitmap
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    // Delete image file
    suspend fun deleteImageFile(path: String) = withContext(Dispatchers.IO) {
        try {
            File(path).delete()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Get content URI for file
    fun getContentUri(file: File): Uri {
        return FileProvider.getUriForFile(
            context,
            "${context.packageName}.provider",
            file
        )
    }
}