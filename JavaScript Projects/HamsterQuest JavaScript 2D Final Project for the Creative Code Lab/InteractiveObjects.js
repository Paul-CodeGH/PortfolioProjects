// InteractiveObject.js
import { interactiveObjects, ctx } from "./game.js";
import global from "./globals.js";

class InteractiveObjectsClass {
    constructor(x, y, width, height, imageSrc, move) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.imageSrc = imageSrc;
        this.image = new Image();
        this.image.src = imageSrc;
        this.move = move;
        this.startingX = this.x;
        this.index = interactiveObjects.length;
        this.pushSpeed = 150;        // <<< added: pixels per second
        interactiveObjects.push(this);
    }

    drawBaseGameObject() {
        const adjustedX = this.x - global.cameraX;
        if (this.image.complete) {
            ctx.drawImage(this.image, adjustedX, this.y, this.width, this.height);
        } else {
            this.image.onload = () => {
                ctx.drawImage(this.image, adjustedX, this.y, this.width, this.height);
            };
        }
    }

    checkMovementReset() {
        if (Math.abs(this.x - this.startingX) > this.move) {
            this.x = this.startingX;
        }
    }

    displayMoveDistance() {
        const leftDistance = Math.max(0, this.x - (this.startingX - this.move));
        const rightDistance = Math.max(0, (this.startingX + this.move) - this.x);

        ctx.fillStyle = "red";
        ctx.font = "20px Arial";
        ctx.fillText(
            `Object${this.index + 1} - Left: ${leftDistance}px, Right: ${rightDistance}px`,
            500,
            20 + this.index * 30
        );
    }

    reset() {
        this.x = this.startingX;
        this.y = 0;
    }
}

export { InteractiveObjectsClass };
