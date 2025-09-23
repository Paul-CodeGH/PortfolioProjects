// TrapObjectsFall.js
import { trapObjects, ctx } from "./game.js";
import global from "./globals.js";

class TrapObjects {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.image = new Image();
        // if load fails, flag so draw never attempts it
        this.image.onerror = () => {
            console.warn(`Failed to load trap image: ${imageSrc}`);
            this.broken = true;
        };
        this.image.src = imageSrc;
        trapObjects.push(this);
    }

    drawTrapObjects() {
        if (this.broken) return;           // skip broken images
        if (!this.image.complete) return;  // not yet loaded

        // also guard against zero‐width images
        if (this.image.naturalWidth === 0) return;

        const adjustedX = this.x - global.cameraX;
        ctx.drawImage(this.image, adjustedX, this.y, this.width, this.height);
    }
}

export { TrapObjects };
