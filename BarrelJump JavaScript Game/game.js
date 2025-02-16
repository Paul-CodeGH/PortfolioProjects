import { global } from "./gameState.js";
import { Player } from "./Player.js";
import { Obstacle } from "./Obstacle.js";
import { SpecialObstacle } from "./SpecialObstacle.js";
import { DamageObstacle } from "./DamageObject.js";
import { startListenersAndTime } from "./ListenersAndTime.js";
// Importing all needed classes and external files that are needed for the game

startListenersAndTime(); // Calling this function is going to make all the event listeners work, but also the time, which is updated in real time


let obstacles = []; // Array to store the obstacles
export let player; // Variable to store the player object

function gameLoop(timestamp) {  // Game loop and also the heart of the game. Runs based on deltaTime to ensure smooth movement
    global.deltaTime = (timestamp - global.lastTime) / 1000; // Time difference in seconds
    global.lastTime = timestamp;

    // Update player
    player.update(global.deltaTime); // Method inside the Player class to update the player's position and velocity, check for collisions, and update the score

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

function startGame() {  // Object creator
    const gameContainer = document.getElementById("gameContainer");


    // Create obstacles dynamically
    for (let i = 0; i < 10; i++) {
        const x = 100 + i * 100;
        const y = 1230;    
        const width = 120;
        const height = 120;
        const imgSrc = "IMGs/barrel.png"; 

        // Add the obstacle to the obstacles array
        obstacles.push(new Obstacle(gameContainer, x, y, width, height, imgSrc));
    }
    obstacles.push(new DamageObstacle(gameContainer, 150, 1200, 120, 120, "IMGs/barreldamage.png"));
    obstacles.push(new DamageObstacle(gameContainer, 250, 1200, 120, 120, "IMGs/barreldamage.png"));
    obstacles.push(new DamageObstacle(gameContainer, 350, 1200, 120, 120, "IMGs/barreldamage.png"));
    obstacles.push(new DamageObstacle(gameContainer, 450, 1200, 120, 120, "IMGs/barreldamage.png"));
    obstacles.push(new DamageObstacle(gameContainer, 550, 1200, 120, 120, "IMGs/barreldamage.png"));
    obstacles.push(new DamageObstacle(gameContainer, 650, 1200, 120, 120, "IMGs/barreldamage.png"));
    obstacles.push(new DamageObstacle(gameContainer, 750, 1200, 120, 120, "IMGs/barreldamage.png"));
    obstacles.push(new DamageObstacle(gameContainer, 850, 1200, 120, 120, "IMGs/barreldamage.png"));
    obstacles.push(new DamageObstacle(gameContainer, 950, 1200, 120, 120, "IMGs/barreldamage.png"));
    obstacles.push(new DamageObstacle(gameContainer, 1050, 1200, 120, 120, "IMGs/barreldamage.png"));

    // Create another 6 obstacles. Each one should be 30px higher than the previous one and moved to the left
    for (let i = 0; i < 6; i++) {
        const x = 1000+ i * 100;
        const y = 1230 - i * 30;    
        const width = 120;
        const height = 120;
        const imgSrc = "IMGs/barrel.png"; 

        // Add the obstacle to the obstacles array
        obstacles.push(new Obstacle(gameContainer, x, y, width, height, imgSrc));
    }

    // Create another 6 obstacles like the previous ones but moved to the right
    for (let i = 1; i < 6; i++) {
        const x = 1550 - i * 100;
        const y = 990 - i * 30;    
        const width = 120;
        const height = 120;
        const imgSrc = "IMGs/barrel.png"; 

        // Add the obstacle to the obstacles array
        obstacles.push(new Obstacle(gameContainer, x, y, width, height, imgSrc));
    }

    obstacles.push(new Obstacle(gameContainer, 1560, 1010, 120, 120, "IMGs/barrel.png"));

    for (let i = 1; i < 5; i++) {
        const x = 1010 - i * 100; // Horizontal position increases by 100px for each obstacle
        const y = 841 + i * 30;          // Fixed vertical position
        const width = 120;       // Width of each obstacle
        const height = 120;      // Height of each obstacle
        const imgSrc = "IMGs/barrel.png"; // Image source for the obstacle

        // Add the obstacle to the obstacles array
        obstacles.push(new Obstacle(gameContainer, x, y, width, height, imgSrc));
    }

    obstacles.push(new Obstacle(gameContainer, 540, 891, 120, 120, "IMGs/barrel.png"));
    obstacles.push(new Obstacle(gameContainer, 620, 821, 120, 120, "IMGs/barrel.png"));
    obstacles.push(new Obstacle(gameContainer, 540, 751, 120, 120, "IMGs/barrel.png"));
    obstacles.push(new Obstacle(gameContainer, 620, 681, 120, 120, "IMGs/barrel.png"));

    // On the right of the last normal obstacle, create 10 special obstacles with the same height, but with a width of 100px in between each
    for (let i = 0; i < 10; i++) {
        const x = 720 + i * 100; // Horizontal position increases by 100px for each obstacle
        const y = 681;          // Fixed vertical position
        const width = 100;       // Width of each obstacle
        const height = 120;      // Height of each obstacle
        const imgSrc = "IMGs/barrelbunny.png"; // Image source for the obstacle
        // Add the obstacle to the obstacles array
        obstacles.push(new SpecialObstacle(gameContainer, x, y, width, height, imgSrc));
    }

    obstacles.push(new Obstacle(gameContainer, 1710, 681, 120, 120, "IMGs/barrel.png"));
    obstacles.push(new Obstacle(gameContainer, 1800, 601, 120, 120, "IMGs/barrel.png"));

    // On the right of the last example, with a gap width of 30px and gap height of 30px, create 10 special obstacles
    for (let i = 0; i < 6; i++) {
        const x = 1700 - i * 50; // Horizontal position increases by 100px for each obstacle
        const y = 551 - i * 50;          // Fixed vertical position
        const width = 100;       // Width of each obstacle
        const height = 120;      // Height of each obstacle
        const imgSrc = "IMGs/barrelbunny.png"; // Image source for the obstacle
        // Add the obstacle to the obstacles array
        obstacles.push(new SpecialObstacle(gameContainer, x, y, width, height, imgSrc));
    }

    obstacles.push(new Obstacle(gameContainer, 1310, 301, 120, 120, "IMGs/barrel.png"));

    // Create 10 special obstacles with the same height, but with a width of 100px in between each
    for (let i = 0; i < 7; i++) {
        const x = 1200 - i * 115; // Horizontal position increases by 100px for each obstacle
        const y = 301;          // Fixed vertical position
        const width = 100;       // Width of each obstacle
        const height = 120;      // Height of each obstacle
        const imgSrc = "IMGs/barrelbunny.png"; // Image source for the obstacle
        // Add the obstacle to the obstacles array
        obstacles.push(new SpecialObstacle(gameContainer, x, y, width, height, imgSrc));
    }

    obstacles.push(new Obstacle(gameContainer, 420, 231, 120, 120, "IMGs/barrel.png"));
    // Check if the player is sitting on top of the last obstacle, if yes, hide the actual div
    

    // Create player
    player = new Player(gameContainer, 100, 1230, 50, 50, "IMGs/character.png", obstacles);

    // Start the game loop
    requestAnimationFrame(gameLoop)
}

// Initialize the game
startGame();

