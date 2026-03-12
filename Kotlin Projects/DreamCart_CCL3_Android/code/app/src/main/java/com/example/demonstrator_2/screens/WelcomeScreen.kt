package com.example.demonstrator_2.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.demonstrator_2.R

@Composable
fun WelcomeScreen(navController: NavController) {
    // Disable back button on the Welcome Screen
    BackHandler {
        // Intercept back press and do nothing
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Image(
            painter = painterResource(id = R.drawable.welcome_bg1),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
        
        Button(
            onClick = { navController.navigate("intro2") },
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFD9D9D9),
                contentColor = Color.Black
            ),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 114.dp)
                .fillMaxWidth(0.7f)
                .height(56.dp)
        ) {
            Text(text = "Next",
                fontSize = 25.sp
            )
        }
    }
}