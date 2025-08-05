package com.example.jumpandrun

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import kotlin.math.min

class WinObstacle(
    x: Float,
    y: Float,
    width: Float,
    height: Float,
    private val winCallback: () -> Unit
) : Obstacle(x, y, width, height) {

    private val starPaint: Paint = Paint().apply {
        color = Color.GREEN
        style = Paint.Style.FILL
    }

    init {
        paint.color = Color.GREEN // Base color for the obstacle
    }

    override fun handleCollision(player: Player) {
        // Check collision with player
        if (isCollidingWith(player)) {
            winCallback.invoke()
        }
        super.handleCollision(player) // Maintain physical collision
    }

    private fun isCollidingWith(player: Player): Boolean {
        return player.x + player.size > x &&
                player.x < x + width &&
                player.y + player.size > y &&
                player.y < y + height
    }

    override fun draw(canvas: Canvas) {
        // Draw base rectangle
        super.draw(canvas)

        // Draw star indicator
        val centerX = x + width / 2
        val centerY = y + height / 2
        val radius = min(width, height) / 3

        // Draw simple star (circle for simplicity)
        canvas.drawCircle(centerX, centerY, radius, starPaint)

        // Draw "WIN" text
        val textPaint = Paint().apply {
            color = Color.BLACK
            textSize = radius
            textAlign = Paint.Align.CENTER
        }
        canvas.drawText("WIN", centerX, centerY + radius/3, textPaint)
    }
}