import { canvas, ctx, gravity, jumpStrength, isGameOver } from './game.js';
class Character {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.velocityY = 0;
    }

    jump() {
        this.velocityY = jumpStrength;
    }

    update() {
        this.velocityY += gravity;
        this.y += this.velocityY;

        if (this.y + this.size > canvas.height) {
            this.y = canvas.height - this.size;
            isGameOver = true;
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0;
        }
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

export { Character };