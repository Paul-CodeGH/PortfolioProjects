import { obstacles, ctx } from "./game.js";
import global from "./globals.js";

class BaseGameObject {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.imageSrc = imageSrc; // Image source path
        this.image = new Image(); // Image object
        this.image.src = imageSrc; // Set the image source
        obstacles.push(this)
    }

    drawBaseGameObject() {
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
}

export { BaseGameObject };