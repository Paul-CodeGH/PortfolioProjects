package com.example.jumpandrun

import android.app.AlertDialog
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Bundle
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class SecondActivity : AppCompatActivity(), SensorEventListener {

    lateinit var gameView: GameView
    private var gameThread: GameThread? = null
    private lateinit var sensorManager: SensorManager
    private var accelerometer: Sensor? = null
    private var tiltValue: Float = 0f
    private var lastTiltValue: Float = 0f
    private var lastSensorUpdate: Long = 0
    private val sensorUpdateInterval: Long = 5 // ms

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
        gameView = GameView(this)
        setContentView(gameView)

        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

        // Add this block for handling back press
        val callback = object : OnBackPressedCallback(true /* enabled by default */) {
            override fun handleOnBackPressed() {
                AlertDialog.Builder(this@SecondActivity)
                    .setTitle("Exit Game")
                    .setMessage("Are you sure you want to exit?")
                    .setPositiveButton("Yes") { _, _ ->
                        // If "Yes" is clicked, finish the activity
                        finish()
                    }
                    .setNegativeButton("No", null) // If "No", just dismiss the dialog
                    .show()
            }
        }
        onBackPressedDispatcher.addCallback(this, callback)
    }

    override fun onPause() {
        super.onPause()
        sensorManager.unregisterListener(this)
        gameThread?.running = false
        try {
            gameThread?.join()
        } catch (e: InterruptedException) {
            e.printStackTrace()
        }
    }

    override fun onResume() {
        super.onResume()
        sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME)
        gameThread = GameThread(gameView)
        gameThread?.running = true
        gameThread?.start()
    }

    override fun onSensorChanged(event: SensorEvent?) {
        event?.let {
            val currentTime = System.currentTimeMillis()
            if (currentTime - lastSensorUpdate > sensorUpdateInterval) {
                lastSensorUpdate = currentTime
                val rawTilt = event.values[1]

                // Improved tilt filtering (low-pass filter)
                val alpha = 0.1f
                tiltValue = rawTilt * alpha + lastTiltValue * (1 - alpha)
                lastTiltValue = tiltValue

                // Deadzone with hysteresis
                if (Math.abs(tiltValue) < 0.2f) tiltValue = 0f

                // Pass tilt value to GameView
                gameView.setTiltValue(tiltValue)
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}