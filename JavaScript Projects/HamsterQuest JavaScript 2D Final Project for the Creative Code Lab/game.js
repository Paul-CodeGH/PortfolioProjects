// game.js
import { clear, endGame, updateCamera } from './functions.js';
import { InteractiveObjectsClass }     from './InteractiveObjects.js';
import { fakeBreak, trampolineJumping, backgroundMusic, teleportSound }
    from './sounds.js';
import global                           from './globals.js';
import { character }                    from './createCharacter.js';
import { drawShadow } from './Shadow.js';


import { checkCollisions }              from './CollisionHandler.js';
import { loadLevel, nextLevel }         from './LevelManager.js';

// UI handlers
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('Controls').addEventListener('click', () => {
    document.getElementById('Controls').style.display     = 'none';
    document.getElementById('controlsModal').style.display = 'flex';
});
document.getElementById('controlsModal').addEventListener('click', () => {
    document.getElementById('controlsModal').style.display = 'none';
    document.getElementById('Controls').style.display      = 'block';
});

// Canvas setup
export const canvas = document.getElementById('gameCanvas');
export const ctx    = canvas.getContext('2d');

// Game object arrays
export let obstacles          = [];
export let endLevelObject     = [];
export let backgroundImage    = [];
export let trapObjects        = [];
export let foods              = [];
export let fakeObject         = [];
export let damageObjects      = [];
export let mapObjects         = [];
export let interactiveObjects = [];

function gameLoop(timestamp) {
    const deltaTime    = (timestamp - global.lastTime) / 1000;
    global.lastTime    = timestamp;

    // 1) clear previous frame
    clear();

    // 2) draw the scrolling background
    backgroundImage.forEach(bg => bg.drawBackground());

    // 3) remember last Y for collision math
    const prevY = character.y;

    // 4) draw the dynamic shadow under the hamster
    drawShadow(
        ctx,
        character,
        canvas,
        global.gravity,
        obstacles,
        interactiveObjects,
        mapObjects,
        trapObjects,
        endLevelObject
    );

    // 5) move & apply gravity
    character.moveCharacter(deltaTime);
    character.applyGravity(deltaTime);

    // 6) draw the hamster
    character.drawCharacter();
    character.updateAnimation();

    // 7) draw all level objects
    interactiveObjects.forEach(o => {
        o.drawBaseGameObject();
        o.checkMovementReset();
        o.displayMoveDistance();
    });
    obstacles.forEach(o => o.drawBaseGameObject());
    endLevelObject.forEach(o => o.drawLevelEndObject());
    mapObjects.forEach(o => o.drawMapObjects());
    trapObjects.forEach(o => o.drawTrapObjects());
    foods.forEach(f => f.drawFood());
    fakeObject.forEach(f => f.drawFakeObject());
    damageObjects.forEach(d => d.drawDamagingObstacle(deltaTime));

    // 8) handle collisions using the correct prevY
    checkCollisions(prevY);

    // 9) if on final portal, end immediately
    if (global.atEndPortal) {
        endGame();
        return;
    }

    // 10) advance to next level if flagged
    if (global.requestNextLevel) {
        global.requestNextLevel = false;
        nextLevel();
    }

    // 11) scroll camera
    updateCamera();

    // 12) draw HUD (score)
    ctx.fillStyle = 'white';
    ctx.font      = '28px Arial';
    ctx.fillText(`Food eaten: ${global.score}`, 20, 40);

    // 13) schedule next frame
    requestAnimationFrame(gameLoop);
}




function startGame() {
    // Reset state
    global.score            = 0;
    global.atEndPortal      = false;
    global.requestNextLevel = false;
    global.lastTime         = performance.now();

    document.getElementById('mainMenu').style.display    = 'none';
    document.getElementById('gameCanvas').style.display  = 'block';

    if (backgroundMusic.paused) backgroundMusic.play();
    else backgroundMusic.currentTime = 0;

    loadLevel(global.currentLevel);
    requestAnimationFrame(gameLoop);
}
