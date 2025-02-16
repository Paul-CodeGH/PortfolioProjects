import { Obstacle } from "./Obstacle.js";
export class SpecialObstacle extends Obstacle {
    constructor(parentElement, x, y, width, height, imgSrc) {
        super(parentElement, x, y, width, height, imgSrc);
        this.isVisible = true;
    }

    handleCollision() {
        if (this.isVisible) {
            this.isVisible = false;
            this.imgElement.style.visibility = 'hidden';

            // Use setTimeout to show the obstacle after 5 seconds. Each obstacle reappears 5 seconds after it has been touched
            setTimeout(() => {
                this.imgElement.style.visibility = 'visible';
                this.isVisible = true;
            }, 5000);
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
