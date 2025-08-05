package com.example.jumpandrun

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect

class ResetObstacle(
    x: Float,
    y: Float,
    width: Float,
    height: Float
) : Obstacle(x, y, width, height) {

    private val textPaint = Paint().apply {
        color = Color.WHITE // White text
        textSize = 40f // Adjust as needed
        textAlign = Paint.Align.CENTER // To help with centering
    }
    private val textBounds = Rect() // To measure text for precise centering

    init {
        paint.color = Color.RED // Make it visually distinct
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

        // Check if player is colliding with this obstacle
        if (playerRight > obstacleLeft &&
            playerLeft < obstacleRight &&
            playerBottom > obstacleTop &&
            playerTop < obstacleBottom) {

            // Collision detected! Reset player's position and state.
            player.x = player.initialX
            player.y = player.initialY
            player.velocityX = 0f
            player.velocityY = 0f
            player.onGround = false // Player might be repositioned in the air or at a starting point
            player.isOnPlatform = false
            player.isJumping = false // Stop any current jump action
        }
    }

    override fun draw(canvas: Canvas) {
        super.draw(canvas) // Draw the red rectangle first

        val textToDraw = "Don't"
        // Get bounds of the text to center it correctly
        textPaint.getTextBounds(textToDraw, 0, textToDraw.length, textBounds)

        // Calculate x and y for the text
        // For x: center of the obstacle
        val textX = x + width / 2f
        // For y: center of the obstacle, plus half the height of the text (because drawText anchors at baseline)
        val textY = y + height / 2f + textBounds.height() / 2f

        canvas.drawText(textToDraw, textX, textY, textPaint)
    }
}