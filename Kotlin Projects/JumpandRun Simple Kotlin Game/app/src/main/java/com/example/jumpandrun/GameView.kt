package com.example.jumpandrun

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.SurfaceView
import kotlin.math.max
import kotlin.math.min

class GameView(context: Context) : SurfaceView(context), SurfaceHolder.Callback {

    private val player: Player = Player(
        size = 80f,
        moveSpeed = 400f,
        jumpStrength = -1000f,
        gravity = 9.8f * 150f,
        startX = 300f,
        startY = 300f
    )
    val obstacles = mutableListOf<Obstacle>()
    private var lastUpdateTime: Long = System.currentTimeMillis()
    private var touchDownTime: Long = 0
    var cameraX: Float = 0f
    private var worldWidth: Float = 0f
    private var tiltValue: Float = 0f

    init {
        holder.addCallback(this)
        setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    touchDownTime = System.currentTimeMillis()
                    player.startJump(touchDownTime)
                    true
                }
                MotionEvent.ACTION_UP -> {
                    player.isJumping = false
                    true
                }
                else -> false
            }
        }

        createSmoothObstacles()
    }

    fun setTiltValue(value: Float) {
        tiltValue = value
    }

    private fun createSmoothObstacles() {
        obstacles.clear() // Clear existing obstacles

        obstacles.add(Obstacle(0f, 1000f, 3250f, 40f)) // Your existing platform
        obstacles.add(Obstacle(0f, 0f, 50f, 1040f))    // Your existing left wall
        obstacles.add(Obstacle(600f, 600f, 50f, 400f)) // First big red object
        obstacles.add(Obstacle(50f, 800f, 100f, 40f))  // First platform on the left, small one
        obstacles.add(Obstacle(750f, 850f, 50f, 150f))  // Second platform on the left, small one
        obstacles.add(Obstacle(1650f, 250f, 100f, 50f)) // Small platform on the big blue bar
        obstacles.add(Obstacle(2000f, 0f, 100f, 750f)) // After the red bar, the first wall on the left
        obstacles.add(Obstacle(1850f, 850f, 400f, 100f)) // After the red bar, the yellow platform for falling
        obstacles.add(Obstacle(2250f, 650f, 100f, 300f)) // After the red bar, the yellow platform for fallingf, 850f, 300f, 100f)) // After the red bar, the yellow platform for falling


        // PushObstacles
        obstacles.add(PushObstacle(x = 950f, y = 0f, width = 100f, height = 300f)) // First blue obstacle on the top
        obstacles.add(PushObstacle(x = 950f, y = 500f, width = 100f, height = 500f)) // Second blue obstacle on the bottom
        obstacles.add(PushObstacle(x = 1650f, y = 300f, width = 100f, height = 700f)) // Third blue obstacle, big bar
        obstacles.add(PushObstacle(2250f, 350f, 100f, 300f))

        // Add the new ResetObstacle
        obstacles.add(ResetObstacle(x = 1100f, y = 900f, width = 500f, height = 100f)) // Red reset obstacle, big platform
        obstacles.add(ResetObstacle(x = 650f, y = 950f, width = 100f, height = 50f)) // Red reset obstacle, small first one
        obstacles.add(ResetObstacle(x = 1750f, y = 250f, width = 100f, height = 750f)) // Small red obstacle on the blue bar, after the small yellow platform

        // Add win obstacle at the end of your level
        obstacles.add(WinObstacle(2800f, 700f, 500f, 100f) {
            // Win callback
            obstacles.clear() // Clear all obstacles
            (context as? Activity)?.runOnUiThread {
                showWinDialog() // Then show the win dialog
            }
        })

        // Ensure worldWidth is calculated after all obstacles are added
        if (obstacles.isNotEmpty()) {
            worldWidth = obstacles.maxOfOrNull { it.x + it.width } ?: 0f
        } else {
            worldWidth = 0f
        }
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        lastUpdateTime = System.currentTimeMillis()
    }

    private fun showWinDialog() {
        AlertDialog.Builder(context)
            .setTitle("You Won!")
            .setMessage("Congratulations!")
            .setPositiveButton("OK") { _, _ ->
                (context as? Activity)?.finish()
            }
            .setCancelable(false)
            .show()
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        val targetCameraX = player.x - width / 2f
        cameraX = max(0f, min(targetCameraX, if (worldWidth > width) worldWidth - width else 0f))
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {}

    fun update() {
        val currentTime = System.currentTimeMillis()
        val deltaTime = (currentTime - lastUpdateTime) / 1000f
        lastUpdateTime = currentTime

        player.isOnPlatform = false
        player.update(deltaTime, tiltValue, worldWidth.toInt(), height, currentTime)
        player.updateJump(currentTime)

        for (obstacle in obstacles) {
            obstacle.handleCollision(player)
        }

        val targetCameraX = player.x - width / 2f
        cameraX = max(0f, min(targetCameraX, if (worldWidth > width) worldWidth - width else 0f))
    }

    fun render(canvas: Canvas?) {
        canvas?.let {
            it.drawColor(Color.rgb(240, 240, 240))
            val savedState = it.save()
            it.translate(-cameraX, 0f)

            player.draw(it)

            for (obstacle in obstacles) {
                obstacle.draw(it)
                val outlinePaint = Paint().apply {
                    color = Color.BLACK
                    style = Paint.Style.STROKE
                    strokeWidth = 3f
                }
                it.drawRect(
                    obstacle.x,
                    obstacle.y,
                    obstacle.x + obstacle.width,
                    obstacle.y + obstacle.height,
                    outlinePaint
                )
            }

            it.restoreToCount(savedState)

            val debugPaint = Paint().apply {
                color = Color.BLACK
                textSize = 30f
            }
            it.drawText("CameraX: ${"%.1f".format(cameraX)}", 50f, 50f, debugPaint)
            it.drawText("PlayerX: ${"%.1f".format(player.x)}", 50f, 90f, debugPaint)
            it.drawText("WorldWidth: $worldWidth", 50f, 130f, debugPaint)
        }
    }
}
