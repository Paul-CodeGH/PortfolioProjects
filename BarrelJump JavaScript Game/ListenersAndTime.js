import { startListeners } from "./eventListeners.js";
import { currentTime } from "./time.JS";
// Importing the event listeners and the time


export function startListenersAndTime() { // This function is going to make all the event listeners work and also the time
    startListeners();
    currentTime();
}