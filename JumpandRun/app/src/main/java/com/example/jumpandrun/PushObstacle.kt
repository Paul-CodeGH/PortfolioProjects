package com.example.jumpandrun

import android.graphics.Color

class PushObstacle(
    x: Float,
    y: Float,
    width: Float,
    height: Float,
    private val pushForceX: Float = -455f, // Negative for left
    private val pushForceY: Float = -830f  // Negative for upwards
) : Obstacle(x, y, width, height) {

    init {
        paint.color = Color.BLUE // Let's make it a different color
    }

    override fun handleCollision(player: Player) {
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

        // Check if player is colliding with obstacle (basic AABB check)
        if (playerRight > obstacleLeft &&
            playerLeft < obstacleRight &&
            playerBottom > obstacleTop &&
            playerTop < obstacleBottom) {

            // Apply the push effect
            player.velocityX = pushForceX
            player.velocityY = pushForceY
            player.onGround = false // Player is now airborne
            player.isOnPlatform = false

            // Optional: You might want to reset collision flags in the Player class or handle them here
            // For example, if you want the push to take precedence over standard collision resolution for this frame
            player.collidingLeft = false
            player.collidingRight = false
            player.collidingTop = false
            player.collidingBottom = false

            player.cycleColor()

            // After applying the push, we can decide if we still want to resolve the penetration
            // or if the push itself is enough. For a simple push, we might not need to do the full
            // penetration resolution that the parent Obstacle does, as it could counteract the push.
            // For example, if the player slightly penetrates then gets pushed out, the parent's logic
            // might snap them back.

            // For now, let's assume the push is the primary interaction, and we don't call super.handleCollision()
            // If you wanted the push AND the standard snap-out behavior, you might call super.handleCollision(player)
            // *after* applying the push, or integrate parts of it here carefully.
        }
    }
}
