/*
Disclaimer:
The Design of the game was developed using a 2K Wide Gaming Monitor.
If using a Full HD Screen, the game will look different. Zoom out if needed.
Controls remain the same and so is the gameplay.
Recommended Resolution: 2560 x 1440
A Scale of 0.8 was used for a max resolution width of 1920 
*/


/*
Game Idea - What it is About?
There is a Robot, let's call him Jay!
He lives in a technologically overdeveloped city and has some difficulties getting from a point to another to be able to escape from it!
There are 2 levels the user can finish until the game ends!
So what the user is supposed to do is to write the right commands to tell the robot in which direction to go!
If the robot gets to the last checkpoint, the user successfully finishes the level.
Also, there are some more commands the user can use for a better experience. Just type !help to find out all the other commands!
The input field is where the user types the command. The console prints the output!
*/


const canvas = document.getElementById("gameCanvas"); // Targets the canvas where the game will be drawn
const ctx = canvas.getContext("2d");  //Specifies the context of the canvas where the game will be drawn based on the 2D context
const console = document.getElementById("console");  // Targets the console where the game output will be displayed
const commandInput = document.getElementById("userInput");  // Targets the input field for the user to enter commands
const startButton = document.getElementById("startButton");  // Targets the start button on the main page
const instructions = document.getElementById("instructions");  // Targets the div where the instructions will be displayed
const finishDiv = document.getElementById("congratsDiv");  // Targets the div where the congratulations message will be displayed

/*
After each movement of the robot or changes of the map, the position of the robot should be updated.
Use the function updateRobotPosition() to update the map and robot position.
*/


// Global variables for the game
/* Game starts at level 0. If level 0 is finished, level 1 will start automatically */
let gameLevel = 0;  // Game starts at level 0. Switching the value of the variable to 1 will start the next level
let robotX = 95; // Actual position of the robot for the first level based on X Axis
let robotY = 560; // Actual position of the robot for the first level based on Y Axis
let robotX2 = 95;  // Actual position of the robot for the second level based on X Axis
let robotY2 = 696;  // Actual position of the robot for the second level based on Y Axis


// Array to store some jokes
const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "What's the best thing about Switzerland? I don't know, but the flag is a big plus!",
    "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
    "What do you call a fake noodle? An Impasta!",
    "I'm reading a book about anti-gravity. It's impossible to put down!",
    "Why don't skeletons fight each other? They don't have the guts!",
    "What's the difference between a hippo and a zippo? One is really heavy, the other is a little lighter."
];
// Those jokes will randomly be picked and written to the console when the user enters "!randomjoke" in the command input

// Path coordinates for the first level. If the robot is on a different path than specified, the game will restart
const correctPath = [
    {x: 229, y: 560},
    {x: 363, y: 560},
    {x: 363, y: 416},
    {x: 497, y: 416},
    {x: 631, y: 416},
    {x: 765, y: 416},
    {x: 765, y: 272},
    {x: 899, y: 272},
    {x: 1033, y: 272},
    {x: 1033, y: 416},
    {x: 1167, y: 416},
    {x: 1301, y: 416},
    {x: 1301, y: 272},
    {x: 1435, y: 272},
    {x: 1569, y: 272},
    {x: 1569, y: 128},
    {x: 1703, y: 128},
];

// Path coordinates for the second level. If the robot is on a different path than specified, the game will restart
const correctPath2 = [
    { x: 95, y: 696 },
    { x: 95, y: 564 },
    { x: 224, y: 564 },
    { x: 353, y: 564 },
    { x: 353, y: 432 },
    { x: 353, y: 300 },
    { x: 224, y: 300 },
    { x: 95, y: 300 },
    { x: 95, y: 168 },
    { x: 95, y: 36 },
    { x: 224, y: 36 },
    { x: 353, y: 36 },
    { x: 482, y: 36 },
    { x: 611, y: 36 },
    { x: 611, y: 168 },
    { x: 611, y: 300 },
    { x: 740, y: 300 },
    { x: 740, y: 432 },
    { x: 740, y: 564 },
    { x: 869, y: 564 },
    { x: 998, y: 564 },
    { x: 998, y: 696 },
    { x: 1127, y: 696 },
    { x: 1256, y: 696 },
    { x: 1256, y: 564 },
    { x: 1385, y: 564 },
    { x: 1514, y: 564 },
    { x: 1514, y: 432 },
    { x: 1514, y: 300 },
    { x: 1385, y: 300 },
    { x: 1256, y: 300 },
    { x: 1127, y: 300 },
    { x: 1127, y: 168 },
    { x: 1127, y: 36 },
    { x: 1256, y: 36 },
    { x: 1385, y: 36 },
    { x: 1514, y: 36 },
    { x: 1643, y: 36 },
];


// Variables for importing the map images for the first and second level
const mapImage = new Image();
mapImage.src = "GameIMGs/CSCGame.png"; 
const mapImage2 = new Image();
mapImage2.src = "GameIMGs/CSCGame2.png"; 

// Import robot images for both levels using different global variables
const robotImage = new Image();
robotImage.src = "GameIMGs/robotPNG.png"; 
const robotImage2 = new Image();
robotImage2.src = "GameIMGs/robotPNG.png"; 


// When the start button is clicked, the loading screen is hidden, the start button is hidden, and the game canvas is shown. After that, the user can start playing the game.
startButton.addEventListener("click", function() {
    document.getElementById("loadingScreen").style.display = "none"; // Hide the loading screen
    document.getElementById("startButton").style.display = "none"; // Hide the start button
    document.getElementById("gameCanvas").style.display = "block"; // Show the game canvas
});

// Function so if the user clicks on the finish div, the page should automatically reload
finishDiv.addEventListener("click", function() {
    location.reload(); // Method to reload the page
});


// Function to play the winning sound. It targets a sound file with the id "WinningSound" and when the function is called, the sound will be played. 
function playWinningSound() {
    const winningSound = document.getElementById("WinningSound");
    winningSound.play();
}

// Add the laughing sound
function playLaughingSound() {
    const laughSound = document.getElementById("laughingSound");
    laughSound.play();
}

// Function to play a clicky sound each time the robot is moving. It targets a sound file with the id "clickSound" and when the function is called, the sound will be played.
// Also, if the sound is already playing, it will be paused and the current time will be set to 0 to avoid skipping the sound if the user clicks the button multiple times
function playClickSound() {
    const clickSound = document.getElementById("clickSound");
    clickSound.pause();
    clickSound.currentTime = 0;
    clickSound.play();
}

// Function to write messages to the console. In order to use it, call the function and add the message inside the parentheses as a parameter
function writeToConsole(message) {
    console.innerHTML += message + "<br>";
}

// Use this function to clear the console. After using this function, the console will be empty
function clearConsole() {
    console.innerHTML = "";
}

// Function to pick a random joke from the jokes array and write it to the console
function writeJoke() {
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    console.innerHTML = "";
    writeToConsole(randomJoke);
}

// Function to check if the robot is on the correct path (Level 1)
function checkRobotPosition() {
    const isOnPath = correctPath.some(point => point.x === robotX && point.y === robotY);
    // JavaScript method to check if at least one element in the array "correctPath" satisfies the condition "point.x === robotX && point.y === robotY".

    if (isOnPath) {
        // If the robot is on a path that is specified in the "correctPath" array, print "You are on the correct path" to the console and do nothing more
        writeToConsole("You are on the correct path");
    } else {
        // If the robot is not on a path that is specified in the "correctPath" array, print "Oh, that was wrong! You lost." to the console and reset the robot position
        writeToConsole("Oh, that was wrong! You lost.");
        robotX = 95;
        robotY = 560;
        updateRobotPosition();
    }
}

// Function to check if the robot is on the correct path (Level 2)
function checkRobotPosition2() {
    const isOnPath = correctPath2.some(point => point.x === robotX2 && point.y === robotY2);
    // JavaScript method to check if at least one element in the array "correctPath2" satisfies the condition "point.x === robotX2 && point.y === robotY2".

    if (isOnPath) {
        // If the robot is on a path that is specified in the "correctPath2" array, print "You are on the correct path" to the console and do nothing more
        writeToConsole("You are on the correct path");
    } else {
        // If the robot is not on a path that is specified in the "correctPath2" array, print "Oh, that was wrong! You lost." to the console and reset the robot position
        writeToConsole("Oh, that was wrong! You lost.");
        robotX2 = 95;
        robotY2 = 696;
        updateRobotPosition();
    }
}

// Function to update the map and robot position based on the current game level, 0 or 1
function updateRobotPosition() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas starting from the top-left corner
    if (gameLevel === 0) { 
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(robotImage, robotX, robotY, 50, 50);
        // Also write the actual position of the robot based on X and Y coordinates to the console.
        writeToConsole(`Robot X: ${robotX}, Robot Y: ${robotY}`);
    } else if (gameLevel === 1) { 
        ctx.drawImage(mapImage2, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(robotImage2, robotX2, robotY2, 50, 50);
        // Also write the actual position of the robot based on X and Y coordinates to the console.
        writeToConsole(`Robot X: ${robotX2}, Robot Y: ${robotY2}`);
        
    }
}

// Function to check if the robot reached the final position on the first level
function checkFinalPosition() {
    const finalPosition = correctPath[correctPath.length - 1];  // Get the last element of the "correctPath" array based on its index, calculating the length of the array - 1, because the index starts from 0
    if (robotX === finalPosition.x && robotY === finalPosition.y) {
        writeToConsole("Congratulations! You've reached the final coordinate!");
        playWinningSound();

        // Transition to Level 2
        gameLevel = 1;  // Switch the variable's value to 1 will start the next level
        updateRobotPosition(); // Update the canvas with the new level
        writeToConsole("Level 2 starts now!");
    } else {
        writeToConsole("You haven't reached the final coordinate yet.");
    }
}

// Function to check if the robot reached the final position on the second level
function checkFinalPosition2() {
    const finalPosition = correctPath2[correctPath2.length - 1];  // Get the last element of the "correctPath2" array based on its index, calculating the length of the array - 1, because the index starts from 0
    if (robotX2 === finalPosition.x && robotY2 === finalPosition.y) {
        writeToConsole("Congratulations! You've completed Level 2!");
        canvas.style.display = "none";  // Hide the canvas
        console.style.display = "none";  // Hide the console
        commandInput.style.display = "none";  // Hide the command input
        instructions.style.display = "none";  // Hide the instructions
        playWinningSound();  // Play the winning sound
        // Display the congratulations message
        finishDiv.style.display = "block";  // Show the congratulations message. No button to close the message or restart the game, but you can just refresh the page

    } else {
        writeToConsole("You haven't reached the final coordinate yet.");
    }
}

// Function to activate darkmode
function activateDarkMode() {
    document.body.style.backgroundImage = "none"; //Remove the actual background image
    document.body.style.backgroundColor = "black";  // Set the background color to black
}

// Function to activate lightmode
function activateLightMode() {
    document.body.style.backgroundImage = "none";  //Remove the actual background image
    document.body.style.backgroundColor = "white";  // Set the background color to white
}

function resetBackgroundImage() {
    document.body.style.backgroundImage = "url('GameIMGs/backgrIMG.jpeg')";  // Set the background image based on the specified url, in this case a local image saved in GameIMGs folder, named backgrIMG
}

// Function for the user to skip the first level and go to level 2 ***NOT FINISHED YET*** and ***WILL PROBABLY NOT BE USED IN THE FINAL VERSION***
function goToLevel2() {
    gameLevel = 1;
    updateRobotPosition();
    writeToConsole("Level 2 starts now!");
}

// Initial setup for the first level
mapImage.onload = function() {
    robotImage.onload = function() {
        updateRobotPosition();
    };
};



// Create a function to handle user commands for the first level
function firstLevelCommands(command) {
    if (command === "up") {
        robotY -= 144;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving up");
        checkRobotPosition();
        checkFinalPosition();
    } else if (command === "2up") {
        robotY -= 288;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving up");
        checkRobotPosition();
        checkFinalPosition();
    } else if (command === "down") {
        robotY += 144;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving down");
        checkRobotPosition();
        checkFinalPosition();
    } else if (command === "2down") {
        robotY += 288;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving down");
        checkRobotPosition();
        checkFinalPosition();
    } else if (command === "left") {
        robotX -= 134;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving left");
        checkRobotPosition();
        checkFinalPosition();
    } else if (command === "2left") {
        robotX -= 268;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving left");
        checkRobotPosition();
        checkFinalPosition();
    } else if (command === "right") {
        robotX += 134;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving right");
        checkRobotPosition();
        checkFinalPosition();
    } else if (command === "2right") {
        robotX += 268;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving right");
        checkRobotPosition();
        checkFinalPosition();
    } else if (command === "!help") {
        clearConsole();
        writeToConsole("Available commands: up, down, left, right, !reset, !darkmode, !lightmode, !skiplevel, !randomjoke, !resetbackground, 2up, 2down, 2left, 2right.");
    } else if (command === "!skiplevel") {
    if (gameLevel === 0) {
        writeToConsole("Skipping to Level 2");
        goToLevel2();
    }
    } else if (command === "!darkmode") {
        writeToConsole("Dark mode enabled");
        activateDarkMode();
    } else if (command === "!lightmode") {
        writeToConsole("Light mode enabled");
        activateLightMode();
    } else if (command === "!reset") {
        robotX = 95;
        robotY = 560;
        updateRobotPosition();
        writeToConsole("Resetting the game");
    } else if (command === "!randomjoke") {
        writeJoke();
    } else if (command === "!resetbackground") {
        writeToConsole("Resetting the background");
        resetBackgroundImage();
    } else if (command === "!laugh") {
        playLaughingSound();
    } else if(command === "") {
        // Do nothing. Added this empty command to avoid the "Command does not exist. Try again!" message
    } else {
        writeToConsole("Command does not exist. Try again!");
    }
}

// Create a function to handle user commands for the second level
function secondLevelCommands(command) {
    if (command === "up") {
        robotY2 -= 132;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving up");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (command === "2up") {
        robotY2 -= 264;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving up");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (command === "down") {
        robotY2 += 132;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving down");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (command === "2down") {
        robotY2 += 264;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving down");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (command === "left") {
        robotX2 -= 129;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving left");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (command === "2left") {
        robotX2 -= 258;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving left");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (command === "right") {
        robotX2 += 129;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving right");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (command === "2right") {
        robotX2 += 258;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving right");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (command === "!help") {
        clearConsole();
        writeToConsole("Available commands: up, down, left, right, !reset, !darkmode, !lightmode, !randomjoke, !resetbackground, 2up, 2down, 2left, 2right.");
    } else if (command === "!darkmode") {
        writeToConsole("Dark mode enabled");
        activateDarkMode();
    } else if (command === "!lightmode") {
        writeToConsole("Light mode enabled");
        activateLightMode();
    } else if (command === "!reset") {
        robotX2 = 95;
        robotY2 = 696;
        updateRobotPosition();
        writeToConsole("Resetting the game");
    } else if (command === "!randomjoke") {
        writeJoke();
    } else if (command === "!resetbackground") {
        writeToConsole("Resetting the background");
        resetBackgroundImage();
    } else if(command === "") {
        // Do nothing. Added this empty command to avoid the "Command does not exist. Try again!" message
    } else if (command === "!laugh") {
        playLaughingSound();
    } else {
        writeToConsole("Command does not exist. Try again!");
    }
}

// Function to add keyboard event listeners for the first level, so the user can move the bot using the keys, not only the commands  #Cheating#

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowUp") {
        robotY -= 144;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving up");
        checkRobotPosition();
        checkFinalPosition();
    } else if (event.key === "ArrowDown") {
        robotY += 144;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving down");
        checkRobotPosition();
        checkFinalPosition();
    } else if (event.key === "ArrowLeft") {
        robotX -= 134;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving left");
        checkRobotPosition();
        checkFinalPosition();
    } else if (event.key === "ArrowRight") {
        robotX += 134;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving right");
        checkRobotPosition();
        checkFinalPosition();
        
    }
});


// Function to add keyboard event listeners for the seconds level, so the user can move the bot using the keys, not only the commands  #Cheating#


document.addEventListener("keydown", function(event) {
     if (event.key === "ArrowUp") {
        robotY2 -= 132;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving up");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (event.key === "ArrowDown") {
        robotY2 += 132;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving down");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (event.key === "ArrowLeft") {
        robotX2 -= 129;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving left");
        checkRobotPosition2();
        checkFinalPosition2();
    } else if (event.key === "ArrowRight") {
        robotX2 += 129;
        playClickSound();
        clearConsole();
        updateRobotPosition();
        writeToConsole("Robot is moving right");
        checkRobotPosition2();
        checkFinalPosition2();
    }
});


commandInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const command = commandInput.value.trim();
        if (gameLevel === 0) {
            firstLevelCommands(command);
        } else {
            secondLevelCommands(command);
        }
        commandInput.value = "";
    }
});


