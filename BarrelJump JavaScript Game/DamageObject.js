import { Obstacle } from "./Obstacle.js";
import { player } from "./game.js";

export class DamageObstacle extends Obstacle {
    constructor(parentElement, x, y, width, height, imgSrc) {
        super(parentElement, x, y, width, height, imgSrc);
        this.isVisible = true;
    }

    handleCollision() {
        if (this.isVisible) {
            // Push the player 10 px up for the collision
            player.x = 0;
            player.y = 900;
        }
    }

    getBoundingBox() {
        if (this.isVisible) {
            return super.getBoundingBox();
        }
        // Return an empty box if not visible to avoid collision
        return { left: 0, top: 0, right: 0, bottom: 0 };
    }
}
