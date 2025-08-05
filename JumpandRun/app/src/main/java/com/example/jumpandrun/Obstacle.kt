package com.example.jumpandrun

import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Color

open class Obstacle(
    val x: Float,
    var y: Float,
    val width: Float,
    val height: Float
) {
    protected val paint: Paint = Paint().apply {
        color = Color.YELLOW
        style = Paint.Style.FILL
    }

    // For collision smoothing
    // private val collisionTolerance = 5f // This might not be needed or could be handled differently in subclasses

    open fun draw(canvas: Canvas) {
        canvas.drawRect(x, y, x + width, y + height, paint)
    }

    open fun handleCollision(player: Player) {
        // Calculate player boundaries
        val playerLeft = player.x
        val playerRight = player.x + player.size
        val playerTop = player.y
        val playerBottom = player.y + player.size

        // Calculate obstacle boundaries
        val obstacleLeft = x
        val obstacleRight = x + width
        val obstacleTop = y
        val obstacleBottom = y + height

        // Check if player is colliding with obstacle
        if (playerRight > obstacleLeft &&
            playerLeft < obstacleRight &&
            playerBottom > obstacleTop &&
            playerTop < obstacleBottom) {

            // Calculate overlap on all sides
            val overlapLeft = playerRight - obstacleLeft
            val overlapRight = obstacleRight - playerLeft
            val overlapTop = playerBottom - obstacleTop
            val overlapBottom = obstacleBottom - playerTop

            // Find the smallest overlap
            val minOverlap = minOf(overlapLeft, overlapRight, overlapTop, overlapBottom)

            // Resolve collision based on smallest overlap
            when (minOverlap) {
                overlapTop -> {
                    // Player hits top of obstacle (standing on it)
                    player.y = obstacleTop - player.size

                    // Only stop vertical movement if player is falling down
                    if (player.velocityY > 0) {
                        player.velocityY = 0f
                    }

                    player.onGround = true
                    player.isOnPlatform = true
                    player.collidingBottom = true

                    player.landOnPlatform()
                }
                overlapBottom -> {
                    // Player hits bottom of obstacle (head bump)
                    player.y = obstacleBottom

                    // Only stop vertical movement if player is moving up
                    if (player.velocityY < 0) {
                        player.velocityY = 0f
                    }

                    player.collidingTop = true
                }
                overlapLeft -> {
                    // Player hits left side of obstacle
                    player.x = obstacleLeft - player.size

                    // Only stop horizontal movement if player is moving right
                    if (player.velocityX > 0) {
                        player.velocityX = 0f
                    }

                    player.collidingRight = true
                }
                overlapRight -> {
                    // Player hits right side of obstacle
                    player.x = obstacleRight

                    // Only stop horizontal movement if player is moving left
                    if (player.velocityX < 0) {
                        player.velocityX = 0f
                    }

                    player.collidingLeft = true
                }
            }
        }
    }
}
