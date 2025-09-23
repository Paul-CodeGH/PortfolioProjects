import { ctx } from "./game.js";
import { fakeBreak } from "./sounds.js";
import global from "./globals.js";

import { fakeObject } from "./game.js";
class FakeObject {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.imageSrc = imageSrc; // Image source path
        this.image = new Image(); // Image object
        this.image.src = imageSrc; // Set the image source
        fakeObject.push(this)
    }

    drawFakeObject() {
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
            // Check if fakeBreak is already playing
            if (fakeBreak.paused) {
                fakeBreak.play();
            } else {
                fakeBreak.currentTime = 0;
            }
            console.log('FakeObject Disappeared!');
            return true;  // Collision detected
        }
        return false;  // No collision
    }
    
}

export { FakeObject };