package com.example.jumpandrun

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.Button

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Force landscape orientation
        requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE

        setContentView(R.layout.activity_main)

        // Start Game button
        val startButton = findViewById<Button>(R.id.startButton)
        startButton.setOnClickListener {
            startActivity(Intent(this, SecondActivity::class.java))
        }

        // Settings button
        val settingsButton = findViewById<Button>(R.id.settingsButton)
        settingsButton.setOnClickListener {
            // Placeholder for settings functionality
        }

        // Exit Game button
        val exitButton = findViewById<Button>(R.id.exitButton)
        exitButton.setOnClickListener {
            finishAffinity()
        }
    }
}