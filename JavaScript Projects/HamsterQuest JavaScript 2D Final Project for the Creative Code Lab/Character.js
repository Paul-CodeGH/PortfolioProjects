// Character.js
import { ctx, canvas } from './game.js';
import global from './globals.js';

export class Character {
    constructor(
        x, y, width, height, speed,
        spriteSrc, spriteWidth, spriteHeight,
        totalFrames, columnsnumber, rowsnumber
    ) {
        this.x = x;
        this.y = y;
        this.width  = width;
        this.height = height;
        this.speed  = speed;    // px/sec

        this.dx = 0;            // current velocity
        this.dy = 0;

        // Jump strength (px/sec)
        this.jumpPower = 950;

        // Load sprite
        this.image = new Image();
        this.image.src = spriteSrc;

        // Spritesheet
        this.spriteWidth   = spriteWidth;
        this.spriteHeight  = spriteHeight;
        this.totalFrames   = totalFrames;
        this.currentFrame  = 0;
        this.frameDelay    = 10;
        this.frameCounter  = 0;
        this.startIndex    = 0;
        this.endIndex      = totalFrames - 1;
        this.columnsnumber = columnsnumber;
        this.rowsnumber    = rowsnumber;

        this.lastUpdateTime = 0;
        this.animationDelay = 50;

        this.baseWidth    = 120;
        this.baseHeight   = 150;
        this.growthFactor = 1.01;

        // —————— INPUT HANDLERS ——————
        // track keysPressed in global.keysPressed
        document.addEventListener('keydown', e => {
            global.keysPressed[e.key] = true;
        });
        document.addEventListener('keyup', e => {
            delete global.keysPressed[e.key];
        });
    }

    // Decide dx & jump based on which keys are down
    handleInput() {
        // Jump
        if (
            (global.keysPressed['ArrowUp'] ||
                global.keysPressed['w'] ||
                global.keysPressed['W']) &&
            global.isOnGround
        ) {
            this.dy = -this.jumpPower;
            global.isOnGround = false;
        }

        // Left/Right
        if (
            global.keysPressed['ArrowRight'] ||
            global.keysPressed['d'] ||
            global.keysPressed['D']
        ) {
            this.dx = this.speed;
        } else if (
            global.keysPressed['ArrowLeft'] ||
            global.keysPressed['a'] ||
            global.keysPressed['A']
        ) {
            this.dx = -this.speed;
        } else {
            this.dx = 0;
        }
    }

    // Draw at center‐x of canvas, at this.y
    drawCharacter() {
        const col = this.currentFrame % this.columnsnumber;
        const row = Math.floor(this.currentFrame / this.rowsnumber);
        const sx  = col * this.spriteWidth;
        const sy  = row * this.spriteHeight;

        ctx.drawImage(
            this.image,
            sx, sy, this.spriteWidth, this.spriteHeight,
            canvas.width / 2 - this.width / 2,
            this.y,
            this.width, this.height
        );
    }


    // Advance sprite frame
    updateAnimation() {
        if (++this.frameCounter >= this.frameDelay) {
            this.frameCounter = 0;
            this.currentFrame = this.currentFrame < this.endIndex
                ? this.currentFrame + 1
                : this.startIndex;
        }
    }

    // Move & animate, called from gameLoop
    moveCharacter(dt) {
        // 1) read inputs
        this.handleInput();

        // 2) horizontal move
        this.x += this.dx * dt;

        // 3) update animation range based on motion
        const now = Date.now();
        if (now - this.lastUpdateTime >= this.animationDelay) {
            this.lastUpdateTime = now;
            if (!global.isOnGround) {
                this.setAnimationRange(6, 6);        // jump frame
            } else if (this.dx > 0) {
                this.setAnimationRange(3, 4);        // walk right
            } else if (this.dx < 0) {
                this.setAnimationRange(1, 2);        // walk left
            } else {
                this.setAnimationRange(0, 0);        // idle
            }
            this.updateAnimation();
        }

        // 4) constrain left/top
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.dy = 5;
    }

    applyGravity(dt) {
        // v = v0 + g·dt
        this.dy += global.gravity * dt;
        // y = y0 + v·dt
        this.y += this.dy * dt;

        // ground floor
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            global.isOnGround = true;
        }
    }

    setAnimationRange(startIndex, endIndex) {
        if (this.startIndex !== startIndex || this.endIndex !== endIndex) {
            this.startIndex   = startIndex;
            this.endIndex     = endIndex;
            this.currentFrame = startIndex;
        }
    }
}
