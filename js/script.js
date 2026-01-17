const mario = document.querySelector(".mario");
const clouds = document.querySelector(".clouds");
const gameOverScreen = document.querySelector(".game-over-screen");
const scoreDisplay = document.querySelector(".score-display");
const enemiesContainer = document.querySelector(".enemies-container");
const leaderboardList = document.querySelector(".leaderboard-list");

let score = 0;
let isGameOver = false;

/* =======================================================
   LEADERBOARD
======================================================= */
function loadLeaderboard() {
  const saved = localStorage.getItem("leaderboard");
  return saved ? JSON.parse(saved) : [];
}

function saveLeaderboard(lb) {
  localStorage.setItem("leaderboard", JSON.stringify(lb));
}

function renderLeaderboard() {
  const lb = loadLeaderboard();
  leaderboardList.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    if (lb[i]) {
      leaderboardList.innerHTML += `<li>${lb[i].name}: ${lb[i].score}</li>`;
    } else {
      leaderboardList.innerHTML += `<li>---</li>`;
    }
  }
}

renderLeaderboard();

/* =======================================================
   INIMIGOS
======================================================= */

const enemies = [
  {
    name: "Goomba",
    src: "https://th.bing.com/th/id/R.ce4237530821a39f0c60517b5f0fd1d6?rik=NUK3f4fMEXRaiA&pid=ImgRaw&r=0",
    width: 60,
    height: 55,
    speed: 1300,
    rarity: 60,
  },
  {
    name: "Boo",
    src: "assets/imgs/boo.png",
    width: 200,
    height: 150,
    speed: 200,
    rarity: 1,
  },
  {
    name: "Piranha Plant",
    src: "assets/imgs/piranha-plant.png",
    width: 120,
    height: 200,
    speed: 1500,
    rarity: 25,
  },
  {
    name: "Pipe Médio",
    src: "assets/imgs/pipe.png",
    width: 70,
    height: 140,
    speed: 1300,
    rarity: 40,
  },
  {
    name: "Bullet Bill",
    src: "assets/imgs/bullet.png",
    width: 140,
    height: 120,
    speed: 500,
    rarity: 30,
  },
  {
    name: "Bowser Jr",
    src: "assets/imgs/tartuga.png",
    width: 90,
    height: 100,
    speed: 1600,
    rarity: 8,
  },
];

function pickEnemy() {
  const weights = enemies.flatMap((enemy) => Array(enemy.rarity).fill(enemy));
  return weights[Math.floor(Math.random() * weights.length)];
}

function spawnEnemy() {
  if (isGameOver) return;

  const enemy = pickEnemy();
  const el = document.createElement("img");

  el.classList.add("enemy");
  el.src = enemy.src;

  el.style.width = enemy.width + "px";
  el.style.height = enemy.height + "px";
  el.style.bottom = "0";
  el.style.animationDuration = enemy.speed + "ms";

  enemiesContainer.appendChild(el);

  el.addEventListener("animationend", () => el.remove());

  setTimeout(spawnEnemy, Math.random() * 1500 + 800);
}
spawnEnemy();

/* =======================================================
   PULO VARIÁVEL
======================================================= */

let jumpPressed = false;
let jumpStartTime = 0;
let velocityY = 0;
let gravity = 1;
let marioBottom = 0;

document.addEventListener("keydown", (e) => {
  if (isGameOver) return;
  if (jumpPressed) return;

  if (e.code === "Space" || e.code === "ArrowUp") {
    jumpPressed = true;
    jumpStartTime = Date.now();
  }
});

document.addEventListener("keyup", (e) => {
  if (!jumpPressed) return;
  if (e.code !== "Space" && e.code !== "ArrowUp") return;

  const pressTime = Date.now() - jumpStartTime;

  let jumpForce = pressTime / 12;
  if (jumpForce < 12) jumpForce = 12;
  if (jumpForce > 28) jumpForce = 28;

  velocityY = jumpForce;

  jumpPressed = false;
});

/* =======================================================
   LOOP PRINCIPAL
======================================================= */

function gameLoop() {
  if (isGameOver) return;

  score++;
  scoreDisplay.textContent = "Score: " + score;

  // Física do pulo
  if (velocityY > 0 || marioBottom > 0) {
    marioBottom += velocityY;
    velocityY -= gravity;

    if (marioBottom < 0) {
      marioBottom = 0;
      velocityY = 0;
    }

    mario.style.bottom = marioBottom + "px";
  }

  // Colisão
  const marioRect = mario.getBoundingClientRect();

  document.querySelectorAll(".enemy").forEach((enemy) => {
    const rect = enemy.getBoundingClientRect();

    const collision =
      marioRect.left < rect.right &&
      marioRect.right > rect.left &&
      marioRect.bottom > rect.top &&
      marioBottom < rect.height - 40;

    if (collision) triggerGameOver();
  });

  requestAnimationFrame(gameLoop);
}

gameLoop();

/* =======================================================
   GAME OVER
======================================================= */

function triggerGameOver() {
  isGameOver = true;

  clouds.style.animation = "none";
  mario.src = "assets/imgs/game-over.png";
  mario.style.width = "75px";

  checkRecord(score);
  gameOverScreen.style.display = "flex";
}

/* =======================================================
   RECORD
======================================================= */

function checkRecord(newScore) {
  let lb = loadLeaderboard();

  const isRecord = lb.length < 3 || newScore > lb[lb.length - 1].score;

  if (!isRecord) return;

  let name = prompt("Novo Recorde! Nickname (max 10 chars):");
  if (!name) name = "Player";

  lb.push({ name: name.substring(0, 10), score: newScore });

  lb.sort((a, b) => b.score - a.score);
  lb = lb.slice(0, 3);

  saveLeaderboard(lb);
  renderLeaderboard();
}

/* =======================================================
   RESTART
======================================================= */

function restartGame() {
  location.reload();
}
