import { Pipe } from './Pipe.js';
import { canvas } from './game.js';

export class GameUtils {
    static pipeGap = 150;

    static spawnPipe(pipes) {
        const pipeHeight = Math.random() * (canvas.height - GameUtils.pipeGap - 100) + 50;
        pipes.push(new Pipe(canvas.width, pipeHeight, GameUtils.pipeGap));
    }

    static handleUserInput(bird) {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                bird.jump();
            }
        });
    }
}
