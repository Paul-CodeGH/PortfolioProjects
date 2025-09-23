import { ctx } from "./game.js";
import { eatingSound } from "./sounds.js";
import global from "./globals.js";

import { foods } from "./game.js";
class Food {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.imageSrc = imageSrc; // Image source path
        this.image = new Image(); // Image object
        this.image.src = imageSrc; // Set the image source
        foods.push(this)
    }

    drawFood() {
        const adjustedX = this.x - global.cameraX;  // Adjust for camera movement (if needed)
        
        // Draw the food image once it is loaded
        if (this.image.complete) {
            ctx.drawImage(this.image, adjustedX, this.y, this.width, this.height);
        } else {
            // If the image is not loaded, load it and draw
            this.image.onload = () => {
                ctx.drawImage(this.image, adjustedX, this.y, this.width, this.height);
            };
        }
    }

    // Collision detection with the character
    checkCollisions(character) {
        // Check if the food intersects with the character
        if (
            this.x < character.x + character.width &&
            this.x + this.width > character.x &&
            this.y < character.y + character.height &&
            this.y + this.height > character.y
        ) {
            // Make the food disappear
            this.x = -100000000;
            // Check if eatingSound is already playing
            if (eatingSound.paused) {
                eatingSound.play();
            } else {
                eatingSound.currentTime = 0;
            }
            console.log('Apple eaten!');
            return true;  // Collision detected
        }
        return false;  // No collision
    }
    
}

export { Food };