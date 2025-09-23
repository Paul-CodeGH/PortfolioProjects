// LevelManager.js
import global from './globals.js';
import { character } from './createCharacter.js';
import {
    obstacles,
    interactiveObjects,
    endLevelObject,
    mapObjects,
    trapObjects,
    foods,
    fakeObject,
    damageObjects,
    backgroundImage
} from './game.js';

import { BaseGameObject }          from './BaseObject.js';
import { InteractiveObjectsClass } from './InteractiveObjects.js';
import { EndLevelObjectNL }        from './EndLevelObjects.js';
import { MapObjectsNC }            from './MapObjectsView.js';
import { TrapObjects }             from './TrapObjectsFall.js';
import { Food }                    from './Food.js';
import { FakeObject }              from './FakeObject.js';
import { Damage }                  from './DamagingObstacle.js';
import { Background }              from './Background.js';

export function loadLevel(level) {
    // Reset all arrays
    obstacles.length       = 0;
    interactiveObjects.length = 0;
    endLevelObject.length  = 0;
    mapObjects.length      = 0;
    trapObjects.length     = 0;
    foods.length           = 0;
    fakeObject.length      = 0;
    damageObjects.length   = 0;
    backgroundImage.length = 0;

    // Reset character & camera
    character.x       = 50;
    character.y       = 200;
    global.cameraX    = 0;
    global.isOnGround = false;

    if (level === 0) {
        // Level 0 geometry
        obstacles.push(
            new BaseGameObject(0,    880, 4000,  10, './imgs/terrain1.jpg'),
            new BaseGameObject(200,  700,  150, 180, './imgs/ciupearca.png'),
            new BaseGameObject(700,  380,  550, 500, './imgs/hamsterwheel.png'),
            new BaseGameObject(2240, 480,  550, 400, './imgs/hamsterhouse.png')
        );

        interactiveObjects.push(
            new InteractiveObjectsClass(1700, 680, 200, 200, './imgs/boxNoBG.png', 400)
        );

        endLevelObject.push(
            new EndLevelObjectNL(3100, 500, 400, 400, './imgs/portalfinalNoBG.png')
        );

        mapObjects.push(
            new MapObjectsNC(1100, 100, 1300, 900, './imgs/waterbottle.png')
        );

        trapObjects.push();

        foods.push(
            new Food(400,  600, 100, 100, './imgs/apple.png'),
            new Food(500,  600, 100, 100, './imgs/apple.png'),
            new Food(600,  600, 100, 100, './imgs/apple.png'),
            new Food(1000, 200, 100, 100, './imgs/pizzaNoBG.png'),
            new Food(2900, 650, 100, 100, './imgs/pizzaNoBG.png')
        );

        fakeObject.push();

        damageObjects.push(
            new Damage(500, 745, 150, 150, './imgs/ball.png')
        );

        backgroundImage.push(
            new Background('./imgs/cage.png')
        );
    }
    else if (level === 1) {
        // Level 1 geometry
        mapObjects.push();

        obstacles.push(
            new BaseGameObject(0,    1050, 8000,  50,  './imgs/Wood.jpg'),
            new BaseGameObject(1100, 600,   75,  450, './imgs/book1.png'),
            new BaseGameObject(1000, 700,   75,  350, './imgs/book3.png'),
            new BaseGameObject(1500,   0,   75,  890, './imgs/Wood.jpg'),
            new BaseGameObject(2100, 250,   75,  800, './imgs/Wood.jpg'),
            new BaseGameObject(1575, 790,  175,  100, './imgs/Wood.jpg'),
            new BaseGameObject(1930, 950,  175,  100, './imgs/Wood.jpg'),
            new BaseGameObject(1575, 400,  175,  100, './imgs/Wood.jpg'),
            new BaseGameObject(1930, 600,  175,  100, './imgs/Wood.jpg'),
            new BaseGameObject(2175, 250,  600,  100, './imgs/Wood.jpg'),
            new BaseGameObject(2975, 250,  600,  100, './imgs/Wood.jpg'),
            new BaseGameObject(3575,   0,  100,  350, './imgs/Wood.jpg'),
            new BaseGameObject(3150, 555,  200,  500, './imgs/book4.png'),
            new BaseGameObject(3350, 555,  200,   80, './imgs/book4.png'),
            new BaseGameObject(3750, 555,  500,   80, './imgs/book4.png'),
            new BaseGameObject(4250, 855,   50,  200, './imgs/book4.png'),
            new BaseGameObject(5000, 855,  200,  200, './imgs/rubikNoBG.png'),
            new BaseGameObject(5600, 655,  200,  200, './imgs/rubikNoBG.png'),
            new BaseGameObject(5600, 255,  200,  200, './imgs/rubikNoBG.png')
        );

        foods.push(
            new Food(800,  900, 100, 100, './imgs/pizzaNoBG.png'),
            new Food(1600, 200, 100, 100, './imgs/pizzaNoBG.png'),
            new Food(2200, 900, 100, 100, './imgs/pizzaNoBG.png'),
            new Food(3400, 100, 100, 100, './imgs/pizzaNoBG.png'),
            new Food(3400, 900, 100, 100, './imgs/pizzaNoBG.png'),
            new Food(5700, 100, 100, 100, './imgs/pizzaNoBG.png')
        );

        fakeObject.push(
            new FakeObject(3550, 555, 200,  80, './imgs/book4.png'),
            new FakeObject(4250, 555,  50, 300, './imgs/blackBlock.png')
        );

        trapObjects.push(
            new TrapObjects(2775, 250, 200, 100, './imgs/blackBlock.png')
        );

        endLevelObject.push(
            new EndLevelObjectNL(6300, 650, 200, 400, './imgs/portalfinalNoBG.png')
        );

        interactiveObjects.push(
            new InteractiveObjectsClass(400,  850, 200, 200, './imgs/rubikNoBG.png', 400),
            new InteractiveObjectsClass(5000, 655, 200, 200, './imgs/rubikNoBG.png', 400),
            new InteractiveObjectsClass(5600, 855, 200, 200, './imgs/rubikNoBG.png', 400),
            new InteractiveObjectsClass(5600, 455, 200, 200, './imgs/rubikNoBG.png', 400)
        );

        damageObjects.push(
            new Damage(2800, 870, 200, 200, './imgs/ball.png')
        );

        backgroundImage.push(
            new Background('./imgs/backgroundlevel2.png')
        );
    }
    else if (level === 2) {
        // Level 2 geometry
        mapObjects.push(
            new MapObjectsNC(5500, 400, 400, 400, './imgs/jumpIMG.jpg')
        );

        obstacles.push(
            new BaseGameObject(300, 900,  30, 150, './imgs/Wood.jpg'),
            new BaseGameObject(500, 800,  30, 250, './imgs/Wood.jpg'),
            new BaseGameObject(500,   0,  30, 500, './imgs/Wood.jpg'),
            new BaseGameObject(700,   0,  30, 700, './imgs/Wood.jpg'),
            new BaseGameObject(700, 930,  30, 120, './imgs/Wood.jpg'),
            new BaseGameObject(1000,  0,  30, 400, './imgs/Wood.jpg'),
            new BaseGameObject(1400,630,  30, 470, './imgs/Wood.jpg'),
            new BaseGameObject(1430,630, 300,  20, './imgs/Wood.jpg'),
            new BaseGameObject(1930,630, 400,  20, './imgs/Wood.jpg'),
            new BaseGameObject(2330,   0,  30, 650, './imgs/Wood.jpg'),
            new BaseGameObject(0,  1050, 5300,  50, './imgs/Wood.jpg'),
            new BaseGameObject(2800,350, 400, 700, './imgs/Wood.jpg'),
            new BaseGameObject(2800,   0, 400, 100, './imgs/Wood.jpg'),
            new BaseGameObject(3200,1000,200,  50, './imgs/Wood.jpg'),
            new BaseGameObject(3400,   0,200, 400, './imgs/Wood.jpg'),
            new BaseGameObject(3400, 650,400, 400, './imgs/Wood.jpg'),
            new BaseGameObject(3600,   0,200, 300, './imgs/Wood.jpg'),
            new BaseGameObject(3800,   0,400, 300, './imgs/Wood.jpg'),
            new BaseGameObject(3800, 520,400, 530, './imgs/Wood.jpg'),
            new BaseGameObject(4200,   0,200, 300, './imgs/Wood.jpg'),
            new BaseGameObject(4400,   0,900, 850, './imgs/Wood.jpg'),
            new BaseGameObject(5100, 850,200, 200, './imgs/ventOBJ.png')
        );

        foods.push(
            new Food(3250, 800,100,100, './imgs/pizzaNoBG.png'),
            new Food(4250, 900,100,100, './imgs/pizzaNoBG.png'),
            new Food(970, 400,100,100, './imgs/pizzaNoBG.png'),
            new Food(1500, 950,100,100, './imgs/pizzaNoBG.png')
        );

        fakeObject.push(
            new FakeObject(2800,100,200,250, './imgs/ventOBJ.png')
        );

        trapObjects.push(
            new TrapObjects(1730,630,300, 20, './imgs/blackBlock.png')
        );

        endLevelObject.push(
            new EndLevelObjectNL(4900, 890, 150, 150, './imgs/portalfinalNoBG.png')
        );

        interactiveObjects.push();

        damageObjects.push(
            new Damage(2400, 870,200,200, './imgs/ball.png'),
            new Damage(2600, 730,200,200, './imgs/ball.png'),
            new Damage(3250, 910,100,100, './imgs/ball.png'),
            new Damage(1100, 960,100,100, './imgs/ball.png')
        );

        backgroundImage.push(
            new Background('./imgs/3rdLevelWhite.png')
        );
    }
}

export function nextLevel() {
    if (global.currentLevel < global.totalLevels - 1) {
        global.currentLevel++;
        loadLevel(global.currentLevel);
    } else {
        // game.js handles endGame via requestNextLevel flag
        global.requestNextLevel = false;
    }
}
