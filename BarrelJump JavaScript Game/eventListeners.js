import { 
    score, startButton, creditsButton, credits, creditsExitButton, tutorialButton, 
    exitButton, mainScreen, gameContainer, restartButton, resetPositionButton, 
    mainScreenContent, tutorial, exitTutorialButton, conclusion, finalgame, 
    restartLevelButton 
} from "./elements.js";
import { backgroundMusic, finalSound } from "./audio.js";
import { player } from "./game.js";
// importing everything that is needed for the event listeners to work


export function startListeners() {
    conclusion.addEventListener("click", () => {
        conclusion.style.display = "none";
        finalgame.style.display = "block";
        finalSound.play();
        backgroundMusic.pause();
    })
    
    restartLevelButton.addEventListener("click", () => {
        
        finalSound.pause();
        // Refresh the page
        location.reload();
        
    });
    
    
    startButton.addEventListener("click", () => {
        mainScreen.style.display = "none";
        gameContainer.style.display = "block";
        backgroundMusic.play();
        score.textContent = 0;
    });
    
    restartButton.addEventListener("click", () => {
        gameContainer.style.display = "none";
        mainScreen.style.display = "flex";
        backgroundMusic.pause();
        score.textContent = 0;
    });
    
    resetPositionButton.addEventListener("click", () => {
        player.x = 150;
        player.y = 1200;
        player.imgElement.style.left = `${player.x}px`;
        player.imgElement.style.top = `${player.y}px`;
    });
    
    tutorialButton.addEventListener("click", () => {
        mainScreenContent.style.display = "none";
        tutorial.style.display = "flex";
    });
    
    exitTutorialButton.addEventListener("click", () => {
        tutorial.style.display = "none";
        mainScreenContent.style.display = "flex";
    });
    
    exitButton.addEventListener("click", () => {
        window.close();
    });
    
    creditsButton.addEventListener("click", () => {
        mainScreenContent.style.display = "none";
        credits.style.display = "flex";
    });
    
    creditsExitButton.addEventListener("click", () => {
        credits.style.display = "none";
        mainScreenContent.style.display = "flex";
    });
}