let score = 0;
let lives = 10;
let timeElapsed = 0;

// --- ELEMENTOS DO DOM ---
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const livesEl = document.getElementById("lives");
const gameArea = document.getElementById("game-area");
const gameAreaWidth = gameArea.clientWidth;
const gameAreaHeight = gameArea.clientHeight;

// --- VARIÁVEIS DE CONTROLE DO JOGO ---
let maxDucksOnScreen = 2;
let initialDuckSpawnInterval = 1800;
let currentDuckSpawnInterval = initialDuckSpawnInterval;

// --- IDs DOS INTERVALOS ---
let duckSpawnIntervalId;
let balloonSpawnIntervalId;
let difficultyIncreaseIntervalId;
let gameTimerIntervalId;
let bossBalloonIntervalId;

// --- VARIÁVEIS DE CONTROLE DO CHEFE ---
let isBossFightActive = false;
let bossElement = null;
let bossLives = 3;
let bossPhase = 0;


// --- FUNÇÕES DE SPAWN ---
function spawnDuck() {
    const duck = document.createElement("div");
    duck.classList.add("duck");

    const startSide = Math.random() < 0.5 ? 'left' : 'right';
    duck.style.top = Math.random() * (gameAreaHeight - 40) + "px";

    if (startSide === 'left') {
        duck.style.left = "-40px";
        duck.style.animation = `flyRight ${3 + Math.random() * 2}s linear forwards`;
    } else {
        duck.style.right = "-40px";
        duck.style.transform = 'scaleX(-1)';
        duck.style.animation = `flyLeft ${3 + Math.random() * 2}s linear forwards`;
    }

    duck.addEventListener("click", () => {
        score++;
        updateScoreDisplay();
        duck.remove();
        saveScore();
    });

    duck.addEventListener("animationend", () => {
        if (gameArea.contains(duck)) {
            duck.remove();
            lives--;
            updateLivesDisplay();
            if (lives <= 0) {
                stopGame();
                alert("Fim de Jogo!");
                setTimeout(() => {
                    window.location.href = "scoreboard.html";
                }, 500);
            }
        }
    });

    gameArea.appendChild(duck);
}

function trySpawnMultipleDucks() {
    const currentDucks = document.querySelectorAll('.duck').length;
    const ducksToSpawn = maxDucksOnScreen - currentDucks;

    for (let i = 0; i < ducksToSpawn; i++) {
        setTimeout(spawnDuck, i * 200);
    }
}

// Spawn de balão para o JOGO NORMAL (com limite)
function spawnBalloon() {
    if (document.querySelectorAll('.balloon').length >= 2) {
        return;
    }

    const balloon = document.createElement("div");
    balloon.classList.add("balloon");

    balloon.style.left = Math.random() * (gameAreaWidth - 50) + "px";
    balloon.style.bottom = "-70px";

    const animationDuration = 5 + Math.random() * 3;
    balloon.style.animation = `floatUp ${animationDuration}s linear forwards`;

    balloon.addEventListener("click", () => {
        score -= 3;
        if (score < 0) score = 0;
        updateScoreDisplay();
        balloon.remove();
        saveScore();
    });

    balloon.addEventListener("animationend", () => {
        if (gameArea.contains(balloon)) {
            balloon.remove();
        }
    });

    gameArea.appendChild(balloon);
}

// Spawn de balão para o CHEFE (sem limite)
function spawnBossBalloon() {
    const balloon = document.createElement("div");
    balloon.classList.add("balloon");

    balloon.style.left = Math.random() * (gameAreaWidth - 50) + "px";
    balloon.style.bottom = "-70px";

    const animationDuration = 3 + Math.random() * 2;
    balloon.style.animation = `floatUp ${animationDuration}s linear forwards`;


    balloon.addEventListener("animationend", () => {
        if (gameArea.contains(balloon)) {
            balloon.remove();
        }
    });

    gameArea.appendChild(balloon);
}


// --- FUNÇÕES DE ATUALIZAÇÃO DA HUD E LÓGICA ---
function updateScoreDisplay() {
    scoreEl.textContent = score;
}
function updateLivesDisplay() {
    livesEl.textContent = lives;
}
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
function updateTimerDisplay() {
    timerEl.textContent = formatTime(timeElapsed);
}
async function saveScore() {
    const name = localStorage.getItem('playerName');
    if (name) {
        try {
            await fetch('/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score })
            });
        } catch (error) {
            console.error("Erro ao salvar pontuação:", error);
        }
    }
}
function increaseDifficulty() {
    maxDucksOnScreen++;
    console.log("Dificuldade aumentada! Máximo de patos:", maxDucksOnScreen);


    if (currentDuckSpawnInterval > 800) {
        currentDuckSpawnInterval -= 100;
        clearInterval(duckSpawnIntervalId);
        duckSpawnIntervalId = setInterval(trySpawnMultipleDucks, currentDuckSpawnInterval);
        console.log("Novo intervalo de spawn de patos:", currentDuckSpawnInterval);
    }
}


// --- FUNÇÕES DE CONTROLE DO JOGO ---
function stopAllSpawns() {
    clearInterval(duckSpawnIntervalId);
    clearInterval(balloonSpawnIntervalId);
    clearInterval(difficultyIncreaseIntervalId);
}

function resumeNormalSpawns() {
    duckSpawnIntervalId = setInterval(trySpawnMultipleDucks, currentDuckSpawnInterval);
    balloonSpawnIntervalId = setInterval(spawnBalloon, 4000 + Math.random() * 2000);
    difficultyIncreaseIntervalId = setInterval(increaseDifficulty, 10000);
}

function stopGame() {
    stopAllSpawns();
    clearInterval(gameTimerIntervalId);
    clearInterval(bossBalloonIntervalId);
    document.querySelectorAll('.duck, .balloon, .boss-duck').forEach(el => el.remove());
}


// --- MECÂNICA DO CHEFE ---

function startBossFight() {
    console.log("INICIANDO LUTA COM O CHEFE!");
    isBossFightActive = true;
    bossLives = 3;
    bossPhase = 0;

    stopAllSpawns();
    document.querySelectorAll('.duck, .balloon').forEach(el => el.remove());

    bossElement = document.createElement("div");
    bossElement.className = "boss-duck";
    bossElement.style.left = (gameAreaWidth / 2) - 60 + "px";
    bossElement.style.top = (gameAreaHeight / 2) - 60 + "px";
    gameArea.appendChild(bossElement);

    runBossPhase();
}

function runBossPhase() {
    let spawnRate = 75 - (bossPhase * 12);
    if (spawnRate < 100) spawnRate = 100;

    bossBalloonIntervalId = setInterval(spawnBossBalloon, spawnRate);
    setTimeout(spawnBossMinionDuck, 2000);
}

function spawnBossMinionDuck() {
    const minion = document.createElement("div");
    minion.className = "duck";

    const startSide = Math.random() < 0.5 ? 'left' : 'right';
    minion.style.top = Math.random() * (gameAreaHeight - 40) + "px";

    if (startSide === 'left') {
        minion.style.left = "-40px";
        minion.style.animation = `flyRight 4s linear forwards`;
    } else {
        minion.style.right = "-40px";
        minion.style.transform = 'scaleX(-1)';
        minion.style.animation = `flyLeft 4s linear forwards`;
    }

    minion.addEventListener("click", () => {
        bossTakesDamage();
        minion.remove();
    });

    minion.addEventListener("animationend", () => {
        if (gameArea.contains(minion)) {
            minion.remove();
            alert("Você errou o pato! Fim de jogo.");
            stopGame();
            window.location.href = "scoreboard.html";
        }
    });

    gameArea.appendChild(minion);
}

function bossTakesDamage() {
    bossLives--;
    bossPhase++;

    clearInterval(bossBalloonIntervalId);

    bossElement.classList.add("hit");
    setTimeout(() => bossElement.classList.remove("hit"), 300);

    if (bossLives > 0) {
        runBossPhase();
    } else {
        endBossFight();
    }
}

function endBossFight() {
    console.log("CHEFE DERROTADO!");
    score += 100;
    updateScoreDisplay();
    saveScore();

    clearInterval(bossBalloonIntervalId);

    bossElement.remove();
    document.querySelectorAll('.balloon').forEach(el => el.remove());

    isBossFightActive = false;
    resumeNormalSpawns();
}



function startGame() {
    updateScoreDisplay();
    updateLivesDisplay();
    updateTimerDisplay();

    resumeNormalSpawns();

    gameTimerIntervalId = setInterval(() => {
        timeElapsed++;
        updateTimerDisplay();

        if (timeElapsed === 10 && !isBossFightActive) {
            startBossFight();
        }

    }, 1000);
}


startGame();