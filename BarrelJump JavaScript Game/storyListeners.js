import { div1Screen, MainScreen, storyButton, storyBtn1, div2Screen, storyBtn2, div3Screen, storyBtn3, div4Screen, storyBtn4, div5Screen, storyBtn5, div6Screen, storyBtnFalse1, storyBtnTrue1, div7Screen,
    storyBtnFalse2, storyBtnTrue2, div8Screen, storyBtnFalse3, storyBtnTrue3, div9Screen, continueBtn, div10Screen, continueFinalBtn
 } from "./storyElements.js";
import { raggae } from "./audio.js";
// Importing the audio and the DOM elements that will be used for Story

export function startStoryListeners () {
    storyButton.addEventListener("click", () => {
        MainScreen.style.display = "none";
        div1Screen.style.display = "flex";
        raggae.play();
    });
    
    storyBtn1.addEventListener("click", () => {
        div1Screen.style.display = "none";
        div2Screen.style.display = "flex";
    });
    
    
    storyBtn2.addEventListener("click", () => {
        div2Screen.style.display = "none";
        div3Screen.style.display = "flex";
    });
    
    storyBtn3.addEventListener("click", () => {
        div3Screen.style.display = "none";
        div4Screen.style.display = "flex";
    });
    
    storyBtn4.addEventListener("click", () => {
        div4Screen.style.display = "none";
        div5Screen.style.display = "flex";
    });
    
    storyBtn5.addEventListener("click", () => {
        div5Screen.style.display = "none";
        div6Screen.style.display = "flex";
    });
    
    // Here starts the quiz, from first to last page
    
    storyBtnTrue1.addEventListener("click", () => {
        div6Screen.style.display = "none";
        div7Screen.style.display = "flex";
    });
    
    storyBtnFalse1.addEventListener("click", () => {
        // Make true button red
        storyBtnTrue1.style.backgroundColor = "red";
        // Make true button a big bigger
        storyBtnTrue1.style.fontSize = "50px";
        // Make false button blue
        storyBtnFalse1.style.backgroundColor = "blue";
    });
    
    storyBtnTrue2.addEventListener("click", () => {
        // Change color of true button to blue and false button to red
        storyBtnTrue2.style.backgroundColor = "blue";
        storyBtnFalse2.style.backgroundColor = "red";
        storyBtnFalse2.style.fontSize = "50px";
    });
    
    storyBtnFalse2.addEventListener("click", () => {
        div7Screen.style.display = "none";
        div8Screen.style.display = "flex";
    });
    
    storyBtnTrue3.addEventListener("click", () => {
        // Change color of true button to blue and false button to red
        storyBtnTrue3.style.backgroundColor = "blue";
        storyBtnFalse3.style.backgroundColor = "red";
        storyBtnFalse3.style.fontSize = "50px";
    });
    
    storyBtnFalse3.addEventListener("click", () => {
        div8Screen.style.display = "none";
        div9Screen.style.display = "flex";
    });
    
    continueBtn.addEventListener("click", () => {
        div9Screen.style.display = "none";
        div10Screen.style.display = "flex";
    });
    
    continueFinalBtn.addEventListener("click", () => {
        div10Screen.style.display = "none";
        MainScreen.style.display = "flex";
        raggae.pause();
    });
}