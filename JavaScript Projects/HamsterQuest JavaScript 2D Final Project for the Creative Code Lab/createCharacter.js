import { Character } from "./Character.js";
export let character = new Character(
    0, 0, 120, 150, 500, // x, y, width, height, speed
    './imgs/hamsterspritemovement.png', // Path to your spritesheet
    150, 150,           // Frame width and height
    25, 5, 5                  // Total number of frames in the spritesheet
);