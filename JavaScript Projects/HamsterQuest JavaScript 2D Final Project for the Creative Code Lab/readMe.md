### Game Documentation ###

This documentation provides an overview of the structure, features, and design decisions of my game. While I recognize that the overall structure is somewhat unorganized, this was primarily due to the limited time I had to refine and clean up the code, as I was preoccupied with other responsibilities after the coding labs. I want to specify that every element of this game was created entirely from scratch without using any templates, such as the one provided by Lukas, or any external assistance.

## 🌐 **Play the Game**
(https://paul-codegh.github.io/HamsterQuestUpdate/)

### Overview of the Game ###

The game is a 2D platformer in which players take on the role of a hamster. The primary goal is to collect as much food as possible while navigating through a series of levels. Players must overcome obstacles by jumping, pushing objects, and strategizing to successfully complete each level. A unique mechanic adds depth to the gameplay: the hamster grows in size by 1% each time it eats food, which can affect its ability to navigate the environment.


### Player Character ###
![Image](https://github.com/user-attachments/assets/1ed96f6e-638a-47ae-b8b6-ef932dee2fac)

## 🎨 **Spritesheets**
![Image](https://github.com/user-attachments/assets/09329482-dde2-44de-9656-ffd881480aca)


### Growth Mechanic ###
This growth mechanic introduces an interesting challenge, where players must balance collecting food with ensuring the hamster remains agile enough to complete levels. The game is designed to provide engaging and dynamic gameplay that tests the player’s ability to plan and adapt to changing conditions.

### Code Structure ###

The game’s codebase comprises 10 classes and 4 additional JavaScript files. Each of these components plays a distinct role in the overall functionality of the game. Below is a breakdown of the files and their respective purposes:

Sound Management File: This file is dedicated to managing and storing all sound effects used in the game, such as background music, jumping sounds, and collision effects.

Character Creation and Export File: This file handles the creation and export of the character class, allowing the character to be instantiated and used in the main game logic.

Utility Functions File: This file contains reusable functions that are frequently called in the main file. Examples include helper methods for specific calculations or actions that are repeated throughout the game.

Global Variables File: This file is used to store global variables, organized within an array. These variables serve as constants or references that are accessed across multiple files.

While I could have used a more structured approach, such as creating a base object class or further modularizing the code, I opted for a more hardcoded and straightforward approach to better understand how everything works at a fundamental level.

### Collision Detection ###

Collision detection is a key component of the game and is implemented in two distinct ways:

Object-Specific Collision Methods: Each class file includes a method to check for collisions related to that specific object. For example, walls and platforms have their own collision detection logic to determine how they interact with other objects in the game. These methods typically focus on what should happen to the object itself during a collision.

Centralized Collision Handling for the Character: In the main file, I implemented a centralized collision detection function specifically for the character. This function determines the character’s behavior upon colliding with different objects. For instance, if the character collides with food, it triggers the growth mechanic, whereas a collision with a wall stops the character's movement.

Although there is no universal gameBaseObject class, I created a class named “gameBaseObject” to represent walls and platforms. This class includes typical collision effects and basic functionality.

### Development Approach and Design Choices ###

This project was my second or third attempt at game development, and I approached it as a learning experience. My primary goal was to gain a deeper understanding of game mechanics and how individual components interact within a larger system. As a result, I intentionally hardcoded many elements to solidify my grasp of these concepts.

I acknowledge that the code structure is not ideal, and there is significant room for improvement in terms of organization and modularity. However, this does not reflect my usual programming practices. In future projects, I plan to apply more advanced techniques to achieve cleaner and more efficient codebases.

### Rendering and Camera System ###

Each class in the game includes a draw() function, responsible for rendering objects or the character on the game map. The rendering is tied to a horizontal camera system that I implemented. This system keeps the character centered on the screen, creating the effect of the background scrolling to the left or right as the character moves in either direction.

The character class is particularly complex, as it incorporates several advanced features:

Gravity Simulation: The character class includes methods to simulate gravity, ensuring the character behaves realistically when jumping or falling.

Sprite Sheet Animation: The character’s appearance is rendered using sprite sheet animations, allowing for smooth and visually appealing movement.

Dynamic Customization: The methods within the character class are designed to be flexible, enabling adjustments to the character’s behavior or appearance to suit different gameplay scenarios.

### Game Loop and Level Loading ###

The main file contains the game loop, which is relatively long. I am aware that I could have optimized it by creating separate methods within each class, especially within the character class, and combining multiple related functions into a single method. However, I deliberately chose a more complex approach, partly as a challenge and partly to gain a deeper understanding of how everything interacts within the game.

### The game loop consists of two primary tasks:

Rendering – It calls a draw() function for the character, background, and all in-game objects.

Collision Handling – It runs a checkForCollision() function for the character and every object in the game to determine interactions.

To manage game objects and the background efficiently, I implemented arrays to store their instances. Whenever a new object is created, it is added to the corresponding array. This approach allows the game to iterate over all objects efficiently during each frame of the game loop. The background is also a class, meaning it is treated like any other object and follows the same logic.

### Game Start and Level Loading ###
(background Image for the Main Screen)
![backgroundMain](https://github.com/user-attachments/assets/7d616a00-d4ea-4fca-9f9f-5d077615e8a5)


At the beginning of the game, a startGame() function is executed. This function:

Hides the main screen (menu or splash screen).
Displays the game canvas and the score counter to track the player's progress.
A crucial function in the game is the loadLevel() function, which is quite lengthy due to the number of elements it handles. This function is responsible for determining:

The types of objects that need to be placed on the map.
The background that should be displayed.
The starting coordinates of the character for each level.
Currently, the game consists of three levels, where the first level is represented as level 0. Progression between levels is handled through portals, which the player must reach at the end of the map to advance.

### End Screen and Restart Mechanism ###

When the game is completed, an end screen is displayed, providing feedback to the player. To restart the game, the player can press a button, which simply reloads the entire page. This is a straightforward but effective way to reset all game elements without manually hiding or displaying HTML elements. While this approach could be refined further, it serves its purpose efficiently.





### Game Development Summary ###

The project is a 2D platformer game developed entirely from scratch, showcasing creativity, problem-solving, and foundational programming principles. The game's concept is simple yet engaging: players control a hamster whose goal is to collect food, jump across platforms, push objects, and complete levels successfully. A unique feature is that the hamster grows by 1% with every piece of food consumed, adding a dynamic and entertaining mechanic to the gameplay.

### Game Architecture ###

The game is built with a structured yet flexible architecture, featuring 10 classes and 4 JavaScript files, each serving distinct purposes:

Sound Management: A dedicated file to handle audio effects.

Character Creation: A file for defining and exporting the character.
Utility Functions: A file containing reusable functions for various game mechanics.

Global Variables: A file where key global values are stored in an array for easy management.

Each class includes a draw() method to render its respective objects or the character on the map. A horizontal camera system ensures the character remains centered on the screen, with the background scrolling dynamically as the character moves. This gives the game a polished and professional feel.

The character class is particularly sophisticated, incorporating methods for handling gravity and animations using sprite sheets. These methods are highly customizable, allowing for fine-tuning to achieve the desired visual effects.

### Collision Detection ###

The game employs two distinct methods for collision detection:

Class-specific methods: 

Each class includes a collision-checking method that determines the interaction between objects, such as walls, platforms, or collectibles.

Global collision logic: A centralized checkForCollision() function in the main file, which dictates the character's behavior upon colliding with different object types.

Although the game lacks a generic base object class, a class called GameBaseObject was created to handle the collision effects for walls and platforms.

### Game Loop ###

The main file includes the game loop, which drives the core mechanics:

Rendering: The loop draws the character, background, and all objects on the screen during each frame.

Collision Handling: It evaluates interactions between the character and all other objects to determine the game's response.

Arrays are used to manage game objects and backgrounds efficiently, ensuring that all instances are easily accessible for rendering and logic execution.

### Level Management ###

A loadLevel() function is responsible for loading the appropriate objects, backgrounds, and starting coordinates for the character based on the level. The game currently features three levels, starting from level 0. Players progress by reaching portals at the end of each level. This function, while lengthy, ensures each level has its unique layout and gameplay elements.

### Start and End Mechanics ###

The game starts with a startGame() function, which transitions from the main menu to the gameplay environment. It hides the menu, displays the canvas, and initializes the score counter. Upon completing the game, an end screen is shown, and players can restart the game by pressing a button that reloads the page, a simple yet effective solution for resetting the game state.

Challenges and Reflection

The developer acknowledges areas where the code structure could be improved, such as simplifying the game loop by combining related methods and reducing redundancy. However, the decision to hard-code elements was intentional, providing a hands-on understanding of how all components interact within the game. This was only the second or third game the developer created, highlighting a remarkable effort to build everything from scratch and gain deeper insight into game development.
