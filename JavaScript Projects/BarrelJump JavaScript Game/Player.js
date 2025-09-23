import {SpecialObstacle} from "./SpecialObstacle.js";
import { DamageObstacle } from "./DamageObject.js";
import { jumpSound } from "./audio.js";
import { global } from "./gameState.js";
import { bonus } from "./elements.js";
import { Checkpoint } from "./CheckPoint.js";

class Player {
    constructor(parentElement, x, y, width, height, imgSrc, obstacles) {
        this.parentElement = parentElement;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.imgSrc = imgSrc;
        this.obstacles = obstacles;
        this.score = 0;

        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 509.8;
        this.jumpStrength = -270;
        this.speed = 95;
        this.isOnGround = false;

        this.previousX = x;
        this.previousY = y;
        this.checkpoint = { x: null, y: null };
        this.checkpointElement = null;


        this.imgElement = new Image();
        this.imgElement.src = this.imgSrc;
        this.imgElement.style.position = 'absolute';
        this.imgElement.style.left = `${this.x}px`;
        this.imgElement.style.top = `${this.y}px`;
        this.imgElement.style.width = `${this.width}px`;
        this.imgElement.style.height = `${this.height}px`;

        this.parentElement.appendChild(this.imgElement);

        this.keys = {};
        window.addEventListener("keydown", (e) => this.keys[e.key] = true);
        window.addEventListener("keyup", (e) => this.keys[e.key] = false);

        this.touchedObstacles = [];
    }

    getBoundingBox() { // Get the bounding box of the player for the collisions
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height,
        };
    }

    isCollidingWith(bounds) {
        const playerBounds = this.getBoundingBox();
        return !(
            playerBounds.right < bounds.left ||
            playerBounds.left > bounds.right ||
            playerBounds.bottom < bounds.top ||
            playerBounds.top > bounds.bottom
        );
    }

    handleCollisions() { // Handle collisions between the player and the obstacles
        this.isOnGround = false;
    
        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacle = this.obstacles[i];
            const obstacleBounds = obstacle.getBoundingBox();
    
            if (this.isCollidingWith(obstacleBounds)) {
                const overlapX = Math.min( // Calculate the overlap between the player and the obstacle
                    this.getBoundingBox().right - obstacleBounds.left,
                    obstacleBounds.right - this.getBoundingBox().left
                );
                const overlapY = Math.min( // Calculate the overlap between the player and the obstacle
                    this.getBoundingBox().bottom - obstacleBounds.top,
                    obstacleBounds.bottom - this.getBoundingBox().top
                );

    
                if (overlapX < overlapY) { // Check if the collision is horizontal
                    // Horizontal collision
                    if (this.previousX < obstacleBounds.left) {
                        this.x = obstacleBounds.left - this.width; // Left side collision
                    } else {
                        this.x = obstacleBounds.right; // Right side collision
                    }
                    this.velocityX = 0; // Stop horizontal movement
                } else {
                    // Vertical collision
                    if (this.previousY < obstacleBounds.top) {
                        this.y = obstacleBounds.top - this.height; // Landing on top
                        this.isOnGround = true;
                    } else {
                        this.y = obstacleBounds.bottom; // Hitting from below
                    }
                    this.velocityY = 0; // Stop vertical movement
                }

                // Check if the player is sitting on top of the last obstacle. if yes, hide the gameContainer and display the final game screen
                if (i === this.obstacles.length - 1 && this.isOnGround) {
                    gameContainer.style.display = "none";
                    conclusion.style.display = "block";
                }
    
                // Check if the obstacle is a SpecialObstacle and when collision occurs, decrease character height by 1
                if (obstacle instanceof SpecialObstacle || obstacle instanceof DamageObstacle) {
                    obstacle.handleCollision()
                }

                if (obstacle instanceof SpecialObstacle) {
                    this.height -= 1;
                }
    
                // Check if the obstacle has already been touched and when collision with a normal obstacle occurs, increase the score, increase character height by 0.5
                if (!this.touchedObstacles.includes(i)) {
                    this.touchedObstacles.push(i);
                    this.score += 1;
                    this.y = this.y - 0.5;
                    this.height += 0.5;
                    score.textContent = `Score: ${this.score}`;
                    if (this.score >= 20 && !global.speedBoostApplied) {// give player a bonus if score reaches 20
                        this.speed += 5;
                        bonus.textContent += " (5 Speed Boost)";
                        global.speedBoostApplied = true;
                    } 
                    
                    if (this.score >= 40 && !global.jumpBoostApplied) {// give player a bonus if score reaches 40
                        this.jumpStrength -= 25;
                        bonus.textContent += " (25 Jump Boost)";
                        global.jumpBoostApplied = true;
                    }

                }
            }
        }
    }
    

    update(deltaTime) { // Method inside the Player class to update the player's position and velocity, check for collisions, and update the score
        this.previousX = this.x;
        this.previousY = this.y;

        if (this.keys["a"] || this.keys["A"]) {
            this.velocityX = -this.speed;
        } else if (this.keys["d"] || this.keys["D"]) {
            this.velocityX = this.speed;
        } else {
            this.velocityX = 0;
        }
        if ((this.keys["w"] || this.keys["W"]) && this.isOnGround) {
            this.velocityY = this.jumpStrength;
            this.isOnGround = false;
            // Play jump sound when the player jumps, if the sound is already playing, stop it and play it again
            if (jumpSound.paused) {
                jumpSound.play();
            }
        }

        if (this.keys["c"] || this.keys["C"]) {
            this.saveCheckpoint();
        } else if (this.keys["v"] || this.keys["V"]) {
            this.loadCheckpoint();
        } else {
            // 
        }

        // Apply gravity if not on the ground
        if (!this.isOnGround) {
            this.velocityY += this.gravity * deltaTime;
        }

        // Update position
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        // Collision handling
        this.handleCollisions();

        // Prevent movement outside parent boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.parentElement.offsetWidth) {
            this.x = this.parentElement.offsetWidth - this.width;
        }

        if (this.y + this.height > this.parentElement.offsetHeight) {
            this.y = this.parentElement.offsetHeight - this.height;
            this.velocityY = 0;
            this.isOnGround = true;
        }

        // Update the position of the image
        this.imgElement.style.left = `${this.x}px`;
        this.imgElement.style.top = `${this.y}px`;
    }

    saveCheckpoint() {// method to save the player's current position as a checkpoint
        this.checkpoint.x = this.x;
        this.checkpoint.y = this.y;
        console.log("Checkpoint saved at:", this.checkpoint);

        // Remove previous checkpoint marker if it exists
    if (this.checkpointElement) {
        this.checkpointElement.remove();
    }

    // Create new checkpoint marker
    this.checkpointElement = new Checkpoint(this.parentElement, this.x, this.y);// creating a checkpoint object
    }
    
    loadCheckpoint() {//method to load the player's checkpoint position by teleporting the player to the checkpoint
        if (this.checkpoint.x !== null && this.checkpoint.y !== null) {
            this.x = this.checkpoint.x;
            this.y = this.checkpoint.y;
            this.velocityX = 0;
            this.velocityY = 0;
            console.log("Teleported to checkpoint:", this.checkpoint);
        }
    }
}

export { Player };