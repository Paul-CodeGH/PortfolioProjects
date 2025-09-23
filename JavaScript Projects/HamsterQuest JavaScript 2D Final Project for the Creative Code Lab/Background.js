// Background.js
import { backgroundImage, ctx, canvas } from "./game.js";
import global from "./globals.js";

class Background {
    constructor(imageSrc) {
        this.imageSrc = imageSrc;
        this.image    = new Image();

        // mark if load fails
        this.broken = false;
        this.image.onerror = () => {
            console.warn(`Background load failed: ${imageSrc}`);
            this.broken = true;
        };

        this.image.src = imageSrc;
        backgroundImage.push(this);
    }

    drawBackground() {
        // skip if it never loaded
        if (this.broken || !this.image.complete || this.image.naturalWidth === 0) {
            return;
        }

        const backgroundX = global.cameraX * global.backgroundSpeedFactor;

        // draw the two halves for scrolling
        ctx.drawImage(
            this.image,
            backgroundX, 0,
            this.image.width, canvas.height
        );
        ctx.drawImage(
            this.image,
            backgroundX + this.image.width, 0,
            this.image.width, canvas.height
        );
    }
}

export { Background };
