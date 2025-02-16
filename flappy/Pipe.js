import { canvas, ctx, pipeWidth, pipeSpeed } from './game.js';
import { BaseGameObject } from './BaseGameObject.js';  // Import the BaseGameObject class

class Pipe extends BaseGameObject {
    constructor(x, height, gap) {
        super(x, 0, pipeWidth, height);  // Call the BaseGameObject constructor using super
        this.height = height;
        this.gap = gap;
    }

    // Update method to move the pipe to the left
    update() {
        this.x -= pipeSpeed;
    }

    // Draw method to draw both top and bottom parts of the pipe
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);  // Top part of the pipe
        ctx.fillRect(this.x, this.height + this.gap, this.width, canvas.height - this.height - this.gap);  // Bottom part of the pipe
    }

    // Collision detection method
    checkCollision(character) {
        const inPipeXRange = character.x + character.size > this.x && character.x < this.x + pipeWidth;
        const hitTopPipe = character.y < this.height;
        const hitBottomPipe = character.y + character.size > this.height + this.gap;

        return inPipeXRange && (hitTopPipe || hitBottomPipe);
    }
}

export { Pipe };
