let score = 0;
let misses = 0;
const scoreEl = document.getElementById("score");
const gameArea = document.getElementById("game-area");

function spawnDuck() {
    const duck = document.createElement("div");
    duck.classList.add("duck");


    duck.style.position = "absolute";
    duck.style.top = Math.random() * (gameArea.clientHeight - 40) + "px";
    duck.style.left = "0px";


    duck.style.animation = "flyRight 4s linear forwards";

    duck.addEventListener("click", () => {
        score++;
        scoreEl.textContent = score;
        duck.remove();
        saveScore();
    });

    duck.addEventListener("animationend", () => {
        if (gameArea.contains(duck)) {
            duck.remove();
            misses++;
            if (misses >= 3) {
                window.location.href = "scoreboard.html";
            }
        }
    });

    gameArea.appendChild(duck);
}

setInterval(spawnDuck, 2000);

function saveScore() {
    const name = localStorage.getItem('playerName');
    fetch('/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score })
    });
}
