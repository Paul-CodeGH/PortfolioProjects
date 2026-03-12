package com.example.demonstrator_2.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.demonstrator_2.viewmodel.ItemViewModel
import kotlin.random.Random

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InsightsScreen(
    navController: NavController,
    viewModel: ItemViewModel
) {
    val coroutineScope = rememberCoroutineScope()
    var names = remember { mutableStateListOf("", "") }
    var results by remember { mutableStateOf<List<Pair<String, String>>>(emptyList()) }
    var isSpinning by remember { mutableStateOf(false) }
    var rotationAngle by remember { mutableStateOf(0f) }

    val infiniteTransition = rememberInfiniteTransition(label = "wheel")
    val spinningRotation by animateFloatAsState(
        targetValue = if (isSpinning) rotationAngle + 3600f else rotationAngle,
        animationSpec = tween(durationMillis = 3000, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f)),
        label = "rotation",
        finishedListener = {
            rotationAngle = it % 360f
            isSpinning = false
            // Perform assignment after spin
            val validNames = names.filter { it.isNotBlank() }
            if (validNames.size >= 2) {
                results = performAssignment(validNames)
            }
        }
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Secret Santa") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.primary
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Add participants to start the Secret Santa draw!",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Name inputs
            names.forEachIndexed { index, name ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { names[index] = it },
                        label = { Text("Participant ${index + 1}") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    IconButton(
                        onClick = { if (names.size > 2) names.removeAt(index) },
                        enabled = names.size > 2
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete")
                    }
                }
            }

            Button(
                onClick = { names.add("") },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondaryContainer, contentColor = MaterialTheme.colorScheme.onSecondaryContainer)
            ) {
                Icon(Icons.Default.Add, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Add Participant")
            }

            Spacer(Modifier.height(16.dp))

            // Lucky Wheel
            Box(
                modifier = Modifier.size(200.dp),
                contentAlignment = Alignment.Center
            ) {
                LuckyWheel(modifier = Modifier.rotate(spinningRotation))
            }

            Button(
                onClick = {
                    if (names.count { it.isNotBlank() } >= 2) {
                        results = emptyList()
                        isSpinning = true
                        rotationAngle += (Random.nextFloat() * 360f + 1800f)
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isSpinning && names.count { it.isNotBlank() } >= 2
            ) {
                Text(if (isSpinning) "Assigning..." else "Draw Secret Santa")
            }

            // Results
            if (results.isNotEmpty() && !isSpinning) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Assignments Ready!",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                        results.forEach { (giver, receiver) ->
                            Row(
                                modifier = Modifier.padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(giver, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                Text(" 🎁 buys for 🎁 ", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                                Text(receiver, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LuckyWheel(modifier: Modifier = Modifier) {
    val christmasColors = listOf(
        Color(0xFF165B33), // Deep Green
        Color(0xFFD42426), // Christmas Red
        Color(0xFF146B3A), // Bright Green
        Color(0xFFBB2528), // Bright Red
        Color(0xFFF8B229), // Golden Yellow
        Color(0xFFEA4630)  // Orange Red
    )

    Canvas(modifier = modifier.fillMaxSize()) {
        val sweepAngle = 360f / christmasColors.size
        christmasColors.forEachIndexed { index, color ->
            drawArc(
                color = color,
                startAngle = index * sweepAngle,
                sweepAngle = sweepAngle,
                useCenter = true,
                size = size
            )
        }
        
        // Add some "snow" dots/lights around the edge for a festive look
        val radius = size.minDimension / 2
        for (i in 0 until 12) {
            val angleInDegrees = i * 30f
            val angleInRadians = Math.toRadians(angleInDegrees.toDouble()).toFloat()
            val x = center.x + (radius - 12.dp.toPx()) * Math.cos(angleInRadians.toDouble()).toFloat()
            val y = center.y + (radius - 12.dp.toPx()) * Math.sin(angleInRadians.toDouble()).toFloat()
            drawCircle(
                color = Color.White.copy(alpha = 0.9f),
                radius = 3.dp.toPx(),
                center = Offset(x, y)
            )
        }

        // Center circle (Gold like a Christmas ornament)
        drawCircle(
            color = Color(0xFFF8B229),
            radius = 18.dp.toPx(),
            center = center
        )
        drawCircle(
            color = Color.White,
            radius = 6.dp.toPx(),
            center = center
        )
        
        // Festive outer border
        drawCircle(
            color = Color(0xFF165B33),
            radius = size.minDimension / 2,
            style = Stroke(width = 6.dp.toPx())
        )
    }
}

fun performAssignment(names: List<String>): List<Pair<String, String>> {
    val shuffled = names.shuffled()
    val assignments = mutableListOf<Pair<String, String>>()
    
    for (i in shuffled.indices) {
        val giver = shuffled[i]
        val receiver = if (i == shuffled.size - 1) shuffled[0] else shuffled[i + 1]
        assignments.add(giver to receiver)
    }
    
    return assignments
}