class Obstacle {
    constructor(parentElement, x, y, width, height, imgSrc) {
        this.parentElement = parentElement;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.imgSrc = imgSrc;

        this.imgElement = new Image();
        this.imgElement.src = this.imgSrc;
        this.imgElement.style.position = 'absolute';
        this.imgElement.style.left = `${this.x}px`;
        this.imgElement.style.top = `${this.y}px`;
        this.imgElement.style.width = `${this.width}px`;
        this.imgElement.style.height = `${this.height}px`;

        this.parentElement.appendChild(this.imgElement);
    }

    getBoundingBox() {
        return {
            left: this.x + this.width - 65,
            top: this.y + this.height - 80,
            right: this.x + 65,
            bottom: this.y + 80
        };
    }
}

export { Obstacle };