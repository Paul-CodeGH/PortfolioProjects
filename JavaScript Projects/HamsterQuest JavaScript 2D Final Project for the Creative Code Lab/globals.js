// globals.js
const global = {
    lastTime:              0,
    score:                 0,
    currentLevel:          0,
    totalLevels:           3,
    gravity:               2000,
    cameraX:               0,
    backgroundWidth:       0,
    backgroundSpeedFactor: -0.5,
    keysPressed:           {},
    isOnGround:            false,
    requestNextLevel:      false,

    // NEW:
    atEndPortal:           false,  // true once you touch the final portal
    finishCounter:         0       // counts W presses at final portal
};

export default global;
