class BaseGameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Method to update the position of the object (if applicable)
    update() {
        // This can be overridden by subclasses for specific update logic
    }

    // Method to draw the object (to be overridden by subclasses)
    draw() {
        // This can be overridden by subclasses for custom drawing logic
    }

    // Method to check if the object is off-screen (generic version)
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

export { BaseGameObject };
