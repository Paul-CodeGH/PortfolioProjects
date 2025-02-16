import { Character } from './Character.js';
import { GameUtils } from './GameUtils.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export let gravity = 0.5;
export let jumpStrength = -10;
export let pipeWidth = 80;
export let pipeSpeed = 3;
export let score = 0;
export let isGameOver = false;

// Initialize game objects
const bird = new Character(100, canvas.height / 2, 30);
const pipes = [];
GameUtils.handleUserInput(bird);

// FPS Limit
const FPS = 80;
const FRAME_TIME = 1000 / FPS; // ~16.67ms per frame
let lastTime = 0;
let accumulatedTime = 0;

function gameLoop(timestamp) {
    accumulatedTime += timestamp - lastTime;
    lastTime = timestamp;

    while (accumulatedTime >= FRAME_TIME) {
        if (isGameOver) {
            ctx.fillStyle = 'black';
            ctx.font = '48px Arial';
            ctx.fillText(`Game Over! Score: ${score}`, canvas.width / 4, canvas.height / 2);
            return;
        }

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw the bird
        bird.update(FRAME_TIME);
        bird.draw();

        // Update and draw the pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            const pipe = pipes[i];
            pipe.update();
            pipe.draw();

            // Check for collision
            if (pipe.checkCollision(bird)) {
                isGameOver = true;
            }

            // Remove pipes that are off-screen
            if (pipe.isOffScreen()) {
                pipes.splice(i, 1);
                score += 1; // Increment score for passing a pipe
            }
        }

        // Spawn new pipes periodically
        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
            GameUtils.spawnPipe(pipes);
        }

        // Draw score
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}`, 10, 30);

        accumulatedTime -= FRAME_TIME;
    }

    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);
