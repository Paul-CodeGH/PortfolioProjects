// CollisionHandler.js
import { character } from './createCharacter.js';
import {
    obstacles,
    interactiveObjects,
    trapObjects,
    fakeObject,
    damageObjects,
    endLevelObject,
    foods
} from './game.js';
import global from './globals.js';
import {
    fakeBreak,
    trampolineJumping,
    teleportSound,
    eatingSound
} from './sounds.js';

const DAMAGE_BOUNCE_POWER = 1300; // px/sec upward bounce

export function checkCollisions(prevY) {
    const feetY = character.y + character.height;

    // 1) Terrain obstacles
    obstacles.forEach(obstacle => {
        // vertical landing
        if (
            character.x + character.width > obstacle.x &&
            character.x < obstacle.x + obstacle.width &&
            prevY + character.height <= obstacle.y &&
            feetY >= obstacle.y
        ) {
            character.y       = obstacle.y - character.height;
            character.dy      = 0;
            global.isOnGround = true;
            return;
        }
        // head bump
        if (
            character.x + character.width > obstacle.x &&
            character.x < obstacle.x + obstacle.width &&
            prevY >= obstacle.y + obstacle.height &&
            character.y <= obstacle.y + obstacle.height
        ) {
            character.y  = obstacle.y + obstacle.height;
            character.dy = 0;
            return;
        }
        // side collisions
        if (
            character.y < obstacle.y + obstacle.height &&
            feetY > obstacle.y
        ) {
            if (
                character.x + character.width > obstacle.x &&
                character.x < obstacle.x
            ) {
                character.x  = obstacle.x - character.width;
                character.dx = 0;
            } else if (
                character.x < obstacle.x + obstacle.width &&
                character.x + character.width > obstacle.x + obstacle.width
            ) {
                character.x  = obstacle.x + obstacle.width;
                character.dx = 0;
            }
        }
    });

    // 2) Interactive (pushable) objects
    interactiveObjects.forEach(obj => {
        // vertical landing
        if (
            character.x + character.width > obj.x &&
            character.x < obj.x + obj.width &&
            prevY + character.height <= obj.y &&
            feetY >= obj.y
        ) {
            character.y       = obj.y - character.height;
            character.dy      = 0;
            global.isOnGround = true;
            return;
        }
        // head bump
        if (
            character.x + character.width > obj.x &&
            character.x < obj.x + obj.width &&
            prevY >= obj.y + obj.height &&
            character.y <= obj.y + obj.height
        ) {
            character.y  = obj.y + obj.height;
            character.dy = 0;
            return;
        }
        // side‐push
        if (
            character.y < obj.y + obj.height &&
            feetY > obj.y
        ) {
            if (
                character.x + character.width > obj.x &&
                character.x < obj.x
            ) {
                character.x  = obj.x - character.width;
                character.dx = 0;
                obj.x       += 3; // faster push
            } else if (
                character.x < obj.x + obj.width &&
                character.x + character.width > obj.x + obj.width
            ) {
                character.x  = obj.x + obj.width;
                character.dx = 0;
                obj.x       -= 3;
            }
        }
    });

    // 2) Trap objects – stand on top and press 'S' once to remove
    trapObjects.forEach((trap, idx) => {
        const onTop =
            character.x + character.width > trap.x &&
            character.x < trap.x + trap.width &&
            prevY + character.height <= trap.y &&
            feetY >= trap.y;

        if (onTop) {
            // land on it
            character.y       = trap.y - character.height;
            character.dy      = 0;
            global.isOnGround = true;

            // if S (or ArrowDown) is held, remove it immediately
            if (global.keysPressed['s'] || global.keysPressed['S'] ||
                global.keysPressed['ArrowDown']
            ) {
                trapObjects.splice(idx, 1);
                if (fakeBreak.paused) fakeBreak.play();
                else fakeBreak.currentTime = 0;
                return;  // stop processing this trap
            }
            return;  // still standing, but no removal yet
        }

        // head‐bump
        if (
            character.x + character.width > trap.x &&
            character.x < trap.x + trap.width &&
            prevY >= trap.y + trap.height &&
            character.y <= trap.y + trap.height
        ) {
            character.y  = trap.y + trap.height;
            character.dy = 0;
            return;
        }

        // side collisions
        if (
            character.y < trap.y + trap.height &&
            feetY > trap.y
        ) {
            if (
                character.x + character.width > trap.x &&
                character.x < trap.x
            ) {
                character.x  = trap.x - character.width;
                character.dx = 0;
            } else if (
                character.x < trap.x + trap.width &&
                character.x + character.width > trap.x + trap.width
            ) {
                character.x  = trap.x + trap.width;
                character.dx = 0;
            }
        }
    });



    // 4) Fake objects – disappear on any collision, no blocking
    for (let i = fakeObject.length - 1; i >= 0; i--) {
        const fake = fakeObject[i];
        if (
            character.x + character.width > fake.x &&
            character.x < fake.x + fake.width &&
            character.y + character.height > fake.y &&
            character.y < fake.y + fake.height
        ) {
            // remove it
            fakeObject.splice(i, 1);
            // play break sound
            if (fakeBreak.paused) fakeBreak.play();
            else fakeBreak.currentTime = 0;
            break;  // only one per frame
        }
    }

    // 5) Food collisions – eating and scoring
// Iterate backwards so removing items doesn’t skip any
    for (let i = foods.length - 1; i >= 0; i--) {
        const food = foods[i];
        if (
            character.x + character.width > food.x &&
            character.x < food.x + food.width &&
            character.y + character.height > food.y &&
            character.y < food.y + food.height
        ) {
            // Remove the food
            foods.splice(i, 1);
            // Add 2 points
            global.score += 0.5;
            // Play sound
            if (eatingSound.paused) eatingSound.play();
            else eatingSound.currentTime = 0;
            // Only one per frame
            break;
        }
    }

    // 6) Damage (trampoline) obstacles — squish + bounce
    damageObjects.forEach(dmg => {
        // squish & bounce on top
        if (
            character.x + character.width > dmg.x &&
            character.x < dmg.x + dmg.width &&
            prevY + character.height <= dmg.y &&
            feetY >= dmg.y
        ) {
            character.y        = dmg.y - character.height;
            character.dy       = -DAMAGE_BOUNCE_POWER;
            global.isOnGround  = false;
            dmg.isSquishing    = true; // trigger squishy effect
            if (trampolineJumping.paused) trampolineJumping.play();
            else trampolineJumping.currentTime = 0;
            return;
        }
        // head bump
        if (
            character.x + character.width > dmg.x &&
            character.x < dmg.x + dmg.width &&
            prevY >= dmg.y + dmg.height &&
            character.y <= dmg.y + dmg.height
        ) {
            character.y  = dmg.y + dmg.height;
            character.dy = 0;
            return;
        }
        // side collisions
        if (
            character.y < dmg.y + dmg.height &&
            feetY > dmg.y
        ) {
            if (
                character.x + character.width > dmg.x &&
                character.x < dmg.x
            ) {
                character.x  = dmg.x - character.width;
                character.dx = 0;
            } else if (
                character.x < dmg.x + dmg.width &&
                character.x + character.width > dmg.x + dmg.width
            ) {
                character.x  = dmg.x + dmg.width;
                character.dx = 0;
            }
        }
    });

    // 7) End‐level portal
    endLevelObject.forEach(portal => {
        if (
            character.x + character.width > portal.x &&
            character.x                   < portal.x + portal.width &&
            feetY                          >= portal.y &&
            feetY                          <= portal.y + portal.height + 5
        ) {
            if (teleportSound.paused) teleportSound.play();
            else teleportSound.currentTime = 0;

            if (global.currentLevel < global.totalLevels - 1) {
                global.requestNextLevel = true;
            } else {
                global.atEndPortal = true;
            }
        }
    });
}
