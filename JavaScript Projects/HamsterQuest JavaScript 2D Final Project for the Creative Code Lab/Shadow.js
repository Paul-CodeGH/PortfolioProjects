// Shadow.js

// Pre-compute max jump height in pixels
export function drawShadow(
    ctx,
    character,
    canvas,
    gravity,
    obstacles,
    interactiveObjects,
    mapObjects,
    trapObjects,
    endLevelObject
) {
    const maxJumpHeight = Math.pow(character.jumpPower, 2) / (2 * gravity);

    // world X-center of the hamster
    const worldCenterX = character.x + character.width / 2;

    // Start with the floor
    let groundY = canvas.height;

    function scan(list) {
        list.forEach(obj => {
            if (worldCenterX >= obj.x && worldCenterX <= obj.x + obj.width) {
                const topY = obj.y;
                // only consider platforms whose top is below feet
                if (topY >= character.y + character.height) {
                    groundY = Math.min(groundY, topY);
                }
            }
        });
    }

    scan(obstacles);
    scan(interactiveObjects);
    scan(mapObjects);
    scan(trapObjects);
    scan(endLevelObject);

    const feetY      = character.y + character.height;
    const jumpHeight = Math.max(0, groundY - feetY);
    const t          = Math.min(jumpHeight / maxJumpHeight, 1);

    // opacity and scale falloff
    const alpha = (1 - t) * 0.5;
    const scale = 1 - 0.5 * t;
    const sw    = character.width  * scale;
    const sh    = sw * 0.3;

    // screen coords: hamster always centered horizontally
    const sx = canvas.width/2 - sw/2;
    const sy = groundY - sh/2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(
        sx + sw/2,
        sy + sh/2,
        sw/2,
        sh/2,
        0, 0, Math.PI*2
    );
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.restore();
}
