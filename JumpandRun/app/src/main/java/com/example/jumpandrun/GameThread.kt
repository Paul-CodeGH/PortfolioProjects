package com.example.jumpandrun

import android.graphics.Canvas

class GameThread(private val gameView: GameView) : Thread() {
    var running: Boolean = false
    private val targetFPS: Long = 100
    private val targetFrameTime: Long = 1000 / targetFPS

    override fun run() {
        var startTime: Long
        var timeMillis: Long
        var waitTime: Long

        while (running) {
            startTime = System.currentTimeMillis()

            gameView.update()

            var canvas: Canvas? = null
            try {
                canvas = gameView.holder.lockCanvas()
                synchronized(gameView.holder) {
                    gameView.render(canvas)
                }
            } finally {
                canvas?.let { gameView.holder.unlockCanvasAndPost(it) }
            }

            timeMillis = System.currentTimeMillis() - startTime
            waitTime = targetFrameTime - timeMillis

            try {
                if (waitTime > 0) sleep(waitTime)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}