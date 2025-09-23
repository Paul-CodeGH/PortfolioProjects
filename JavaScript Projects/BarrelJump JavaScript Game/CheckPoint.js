class Checkpoint {
    constructor(parentElement, x, y) {
        this.parentElement = parentElement;
        this.x = x;
        this.y = y;
        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.width = "10px";
        this.element.style.height = "10px";
        this.element.style.backgroundColor = "green";
        this.element.style.left = `${this.x + 20}px`;
        this.element.style.top = `${this.y + 20}px`;
        this.element.style.borderRadius = "50%";
        
        this.parentElement.appendChild(this.element);
    }
    
    remove() {// method to remove the checkpoint, if needed
        this.element.remove();
    }
}

export { Checkpoint };

// Creating a checkpoint class to create the checkpoint object within the Player class. The CP is used to store a specific location where the player can teleport to