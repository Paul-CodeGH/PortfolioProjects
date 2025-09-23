// functions.js
import global from './globals.js';
import { character } from './createCharacter.js';

export function clear() {
    const canvas = document.getElementById('gameCanvas');
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function updateCamera() {
    const canvas = document.getElementById('gameCanvas');
    global.cameraX = character.x - canvas.width / 2 + character.width / 2;
}

export function endGame() {
    clear();
    document.getElementById('gameCanvas').style.display = 'none';
    // Hide the menu or overlays if any remain
    const EndScreen = document.getElementById('EndScreen');
    EndScreen.style.display = 'flex';
    document.getElementById('restartButton')
        .addEventListener('click', () => location.reload());
}
