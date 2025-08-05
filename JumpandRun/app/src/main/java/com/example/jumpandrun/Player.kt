package com.example.jumpandrun

import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Color

class Player(
    val size: Float = 80f,
    private val moveSpeed: Float = 700f,
    private val jumpStrength: Float = -2500f,
    private val gravity: Float = 9.8f * 130f,
    startX: Float = 200f, // This remains a constructor parameter
    startY: Float = 300f  // This remains a constructor parameter
) {
    // Store initial positions
    val initialX: Float = startX
    val initialY: Float = startY

    private val paint: Paint = Paint().apply {
        style = Paint.Style.FILL
    }

    // Rotation variables
    private var rotationAngle: Float = 0f
    private val rotationSpeed: Float = 1800f // Degrees per second
    private var isRotating: Boolean = false

    var x: Float = initialX // Initialize current x with initialX
    var y: Float = initialY // Initialize current y with initialY
    var velocityY: Float = 0f
    var velocityX: Float = 0f
    var onGround: Boolean = false
    var isOnPlatform: Boolean = false

    // Jump control variables
    var isJumping: Boolean = false

    var isDead: Boolean = false
    private var jumpStartTime: Long = 0
    private val maxJumpDuration: Long = 200 // ms
    private var jumpBufferTime: Long = 0
    private val jumpBufferDuration: Long = 150 // ms
    private var coyoteTime: Long = 0
    private val coyoteTimeDuration: Long = 100 // ms

    // Collision flags for smooth movement
    var collidingLeft: Boolean = false
    var collidingRight: Boolean = false
    var collidingTop: Boolean = false
    var collidingBottom: Boolean = false

    // Color cycling properties
    private val colorCycle = listOf(Color.BLUE, Color.YELLOW, Color.BLACK, Color.RED)
    private var currentColorIndex = 0 // Start with BLUE (index 0)

    init {
        // Set initial color
        paint.color = colorCycle[currentColorIndex]
    }

    fun update(deltaTime: Float, tilt: Float, screenWidth: Int, screenHeight: Int, currentTime: Long) {
        // Handle coyote time (grace period after leaving platform)
        if (onGround || isOnPlatform) {
            coyoteTime = currentTime
        }

        // Apply horizontal movement based on tilt
        val targetVelocityX = tilt * moveSpeed

        // Smooth acceleration/deceleration
        val acceleration = if (collidingLeft || collidingRight) 5000f else 2000f
        if (velocityX < targetVelocityX) {
            velocityX = minOf(velocityX + acceleration * deltaTime, targetVelocityX)
        } else if (velocityX > targetVelocityX) {
            velocityX = maxOf(velocityX - acceleration * deltaTime, targetVelocityX)
        }

        // Apply gravity if not jumping and not on platform
        if (!isJumping && !isOnPlatform) {
            velocityY += gravity * deltaTime
        }

        if (y > screenHeight) { // Assuming positive y is downwards
            isDead = true
        }

        // Top boundary collision
        if (y < 0) {
            y = 0f
            // Reverse vertical velocity to make character fall down
            velocityY = if (velocityY < 0) -velocityY * 0.5f else velocityY
            collidingTop = true
            // Stop jumping state when hitting top boundary
            isJumping = false
            isRotating = false
        } else {
            collidingTop = false
        }

        // Cap fall speed
        if (velocityY > 2000f) velocityY = 2000f

        // Update position
        y += velocityY * deltaTime
        x += velocityX * deltaTime


        // Boundary checks (left/right edges)
        if (x < 0) {
            x = 0f
            collidingLeft = true
        } else {
            collidingLeft = false
        }

        if (x + size > screenWidth) {
            x = screenWidth - size
            collidingRight = true
        } else {
            collidingRight = false
        }

        // Ground collision
        if (y + size > screenHeight) {
            y = screenHeight - size
            velocityY = 0f
            onGround = true
            isOnPlatform = false
            collidingBottom = true
            isJumping = false
            isRotating = false // Stop rotation when hitting ground
        } else {
            onGround = false
            collidingBottom = false
        }

        // Reset collision flags for next frame
        collidingTop = false

        // Update rotation only during jumps
        updateRotation(deltaTime)
    }

    private fun updateRotation(deltaTime: Float) {
        if (isRotating) {
            rotationAngle += rotationSpeed * deltaTime

            // Keep angle between 0-360 for efficiency
            if (rotationAngle >= 360f) {
                rotationAngle -= 360f
            }
        }
    }

    fun startJump(currentTime: Long) {
        // Allow jump if on ground, on platform, or within coyote time
        val canJump = (onGround || isOnPlatform || (currentTime - coyoteTime) < coyoteTimeDuration)

        if (canJump && !isJumping && !collidingTop) {
            isJumping = true
            isRotating = true
            jumpStartTime = currentTime
            velocityY = jumpStrength
            onGround = false
            isOnPlatform = false
        } else {
            // Buffer jump request for later
            jumpBufferTime = currentTime
        }
    }

    fun updateJump(currentTime: Long) {
        if (isJumping) {
            // Apply variable jump height based on tap duration
            val jumpProgress = (currentTime - jumpStartTime).toFloat() / maxJumpDuration
            if (jumpProgress < 1.0f) {
                // Gradually reduce upward velocity
                velocityY = jumpStrength * (1 - jumpProgress * 0.7f)
            } else {
                // End jump phase
                isJumping = false
            }
        }

        // Process buffered jump if conditions are met
        if (!isJumping && (currentTime - jumpBufferTime) < jumpBufferDuration) {
            if (onGround || isOnPlatform || (currentTime - coyoteTime) < coyoteTimeDuration) {
                startJump(currentTime)
                jumpBufferTime = 0 // Consume buffered jump
            }
        }
    }

    // Call this when landing on a platform to stop rotation
    fun landOnPlatform() {
        isRotating = false
    }

    fun draw(canvas: Canvas) {
        val centerX = x + size / 2
        val centerY = y + size / 2

        // Save current canvas state
        canvas.save()

        // Rotate canvas around player center only if rotating
        if (isRotating) {
            canvas.rotate(rotationAngle, centerX, centerY)
        }

        // Draw player
        canvas.drawRect(x, y, x + size, y + size, paint)

        // Restore canvas to original state
        canvas.restore()
    }


    // New method to cycle player's color
    fun cycleColor() {
        currentColorIndex = (currentColorIndex + 1) % colorCycle.size
        paint.color = colorCycle[currentColorIndex]
    }
}