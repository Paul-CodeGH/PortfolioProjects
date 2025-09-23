// DamagingObstacle.js
import { ctx, damageObjects } from "./game.js";
import global from "./globals.js";

class Damage {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originalHeight = height;
        this.imageSrc = imageSrc;
        this.image = new Image();
        this.image.src = imageSrc;
        this.isSquishing = false;
        this.squishFactor = 1;
        this.squishSpeed = 1; // now interpreted as “units of scale per second”
        this.resetting = false;
        damageObjects.push(this);
    }

    drawDamagingObstacle(dt) {
        // Frame-rate–independent squish animation
        if (this.isSquishing && !this.resetting) {
            this.squishFactor -= this.squishSpeed * dt;
            if (this.squishFactor <= 0.4) {
                this.isSquishing = false;
                this.resetting = true;
            }
        }
        if (this.resetting) {
            this.squishFactor += this.squishSpeed * dt;
            if (this.squishFactor >= 1) {
                this.resetting = false;
                this.squishFactor = 1;
                console.log('Damage object reset to original height!');
            }
        }

        const adjustedX = this.x - global.cameraX;
        const currentHeight = this.originalHeight * this.squishFactor;
        const offsetY = (this.originalHeight - currentHeight) / 2;

        if (this.image.complete) {
            ctx.drawImage(this.image, adjustedX, this.y + offsetY, this.width, currentHeight);
        } else {
            this.image.onload = () => {
                ctx.drawImage(this.image, adjustedX, this.y + offsetY, this.width, currentHeight);
            };
        }
    }

    // collision logic unchanged…
    checkCollisions(character) { /* … */ }
}

export { Damage };
