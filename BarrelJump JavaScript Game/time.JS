export function currentTime() {
    setInterval(() => {
        const timeElement = document.getElementById("time");
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const seconds = currentTime.getSeconds();
        timeElement.textContent = `Actual Time: ${hours}:${minutes}:${seconds}`;
    })
} // This function is going to update the time in real time and also create the time 