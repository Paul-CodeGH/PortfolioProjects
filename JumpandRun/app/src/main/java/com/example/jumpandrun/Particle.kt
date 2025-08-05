package com.example.jumpandrun

import androidx.annotation.ColorInt

data class Particle(
    var x: Float,
    var y: Float,
    val radius: Float,
    var speedX: Float,
    var speedY: Float,
    @ColorInt val color: Int
)