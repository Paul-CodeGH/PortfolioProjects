package com.example.jumpandrun

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import kotlin.random.Random

class AnimatedBackgroundView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val particles = mutableListOf<Particle>()
    private val paint = Paint().apply {
        isAntiAlias = true
    }
    private var lastUpdateTime = 0L
    private val colors = listOf(
        Color.parseColor("#4CAF50"),  // Green
        Color.parseColor("#2196F3"),  // Blue
        Color.parseColor("#FFC107"),  // Amber
        Color.parseColor("#FF5722")   // Deep Orange
    )

    init {
        // Initialize particles
        for (i in 0..50) {
            particles.add(createRandomParticle())
        }
    }

    private fun createRandomParticle(): Particle {
        return Particle(
            x = Random.nextFloat() * width,
            y = Random.nextFloat() * height,
            radius = Random.nextFloat() * 10 + 5,
            speedX = Random.nextFloat() * 2 - 1,
            speedY = Random.nextFloat() * 2 - 1,
            color = colors.random()
        )
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        particles.clear()
        for (i in 0..50) {
            particles.add(createRandomParticle())
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val currentTime = System.currentTimeMillis()
        val deltaTime = if (lastUpdateTime == 0L) 0f else (currentTime - lastUpdateTime) / 1000f
        lastUpdateTime = currentTime

        // Draw dark background
        canvas.drawColor(Color.parseColor("#121212"))

        // Update and draw particles
        particles.forEach { particle ->
            // Update position
            particle.x += particle.speedX * 50 * deltaTime
            particle.y += particle.speedY * 50 * deltaTime

            // Bounce off edges
            if (particle.x < 0 || particle.x > width) particle.speedX *= -1
            if (particle.y < 0 || particle.y > height) particle.speedY *= -1

            // Draw particle
            paint.color = particle.color
            canvas.drawCircle(particle.x, particle.y, particle.radius, paint)
        }

        // Schedule next frame
        postInvalidateOnAnimation()
    }

}