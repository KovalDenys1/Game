// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gameWidth = 320;
const gameHeight = 180;
// Resize canvas to fit screen size
function resizeCanvas() {
  const scale = Math.min(window.innerWidth / gameWidth, window.innerHeight / gameHeight);
  canvas.width = gameWidth * scale;
  canvas.height = gameHeight * scale;
  ctx.imageSmoothingEnabled = false; // Отключаем сглаживание (важно для пиксельных игр)
}

resizeCanvas(); // Initial resize

window.addEventListener('resize', resizeCanvas); // Resize on window resize

// Game objects
const player = {
  x: 100,
  y: 100,
  width: 50,
  height: 50,
  color: 'blue',
  health: 100,
  speed: 5,
  damage: 20,
  isDefending: false,
  lastAttackTime: 0, // Time of the last attack
  attackCooldown: 1000, // 1 second cooldown between attacks
  attackRange: 100 // Distance within which player can attack
};

const enemy = {
  x: 700,
  y: 100,
  width: 50,
  height: 50,
  color: 'red',
  health: 100,
  speed: 2,
  damage: 10,
  attackCooldown: 2000,
  lastAttackTime: 0,
  attackRange: 150, // Distance within which enemy can attack player
  attackDistance: 50, // Distance within which the enemy starts moving toward the player
};

// Movement controls (WASD & Arrow keys)
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  ArrowUp: false,
  ArrowLeft: false,
  ArrowDown: false,
  ArrowRight: false
};

// Event listeners for keyboard (WASD and Arrow keys)
document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyW' || event.code === 'ArrowUp') keys.w = true;
  if (event.code === 'KeyA' || event.code === 'ArrowLeft') keys.a = true;
  if (event.code === 'KeyS' || event.code === 'ArrowDown') keys.s = true;
  if (event.code === 'KeyD' || event.code === 'ArrowRight') keys.d = true;
});

document.addEventListener('keyup', (event) => {
  if (event.code === 'KeyW' || event.code === 'ArrowUp') keys.w = false;
  if (event.code === 'KeyA' || event.code === 'ArrowLeft') keys.a = false;
  if (event.code === 'KeyS' || event.code === 'ArrowDown') keys.s = false;
  if (event.code === 'KeyD' || event.code === 'ArrowRight') keys.d = false;
});

// Mouse events for attack and defense
document.addEventListener('mousedown', (event) => {
  if (event.button === 0) { // Left mouse button (Attack)
    const distanceToEnemy = getDistance(player.x, player.y, enemy.x, enemy.y);
    if (!player.isDefending && Date.now() - player.lastAttackTime > player.attackCooldown && distanceToEnemy <= player.attackRange) {
      attackEnemy();
      player.lastAttackTime = Date.now(); // Update the last attack time
    }
  } else if (event.button === 2) { // Right mouse button (Defend)
    player.isDefending = true;
  }
});

document.addEventListener('mouseup', (event) => {
  if (event.button === 2) { // Right mouse button (Defend)
    player.isDefending = false;
  }
});

// Disable right-click menu
canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault(); // Prevent the right-click menu from appearing
});

// Calculate distance between two points (Pythagorean theorem)
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Update player position
function updatePlayer() {
  if (keys.w || keys.ArrowUp) {
    player.y -= player.speed;
  }
  if (keys.s || keys.ArrowDown) {
    player.y += player.speed;
  }
  if (keys.a || keys.ArrowLeft) {
    player.x -= player.speed;
  }
  if (keys.d || keys.ArrowRight) {
    player.x += player.speed;
  }

  // Keep player within screen boundaries
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

// Update enemy position and attack logic
function updateEnemy() {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;

  const distanceToPlayer = getDistance(enemy.x, enemy.y, player.x, player.y);

  if (distanceToPlayer > enemy.attackRange) {
    // Move towards the player if outside attack range
    if (Math.abs(dx) > 1) {
      enemy.x += dx > 0 ? enemy.speed : -enemy.speed;
    }
    if (Math.abs(dy) > 1) {
      enemy.y += dy > 0 ? enemy.speed : -enemy.speed;
    }
  }

  if (distanceToPlayer <= enemy.attackRange && Date.now() - enemy.lastAttackTime > enemy.attackCooldown) {
    // Enemy can attack if within attack range
    attackPlayer();
    enemy.lastAttackTime = Date.now(); // Update last attack time
  }
}

// Player attack logic
function attackEnemy() {
  if (enemy.health > 0) {
    enemy.health -= player.damage;
    if (enemy.health < 0) enemy.health = 0;
  }

  if (enemy.health <= 0) {
    alert('You win!');
    resetGame();
  }
}

// Enemy attack logic
function attackPlayer() {
  let damageTaken = enemy.damage;
  if (player.isDefending) {
    damageTaken *= 0.5;
  }

  if (player.health > 0) {
    player.health -= damageTaken;

    if (player.health <= 0) {
      alert('Game over! You lost.');
      resetGame();
    }
  }
}

// Add attack animations and effects
function drawAttackEffect(x, y) {
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2 * Math.PI);
  ctx.fill();
}

// Draw game elements
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw enemy
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

  // Draw player health
  ctx.fillStyle = 'blue';
  ctx.font = '20px Arial';
  ctx.fillText(`Player Health: ${player.health}`, 20, 30);

  // Draw enemy health (with adjustment to make it fit within the screen)
  ctx.fillStyle = 'red';
  ctx.fillText(`Enemy Health: ${enemy.health}`, canvas.width - 190, 30);
}

// Reset game state
function resetGame() {
  player.health = 100;
  enemy.health = 100;
  player.x = 100;
  player.y = 100;
  enemy.x = 700;
  enemy.y = 100;

  Object.keys(keys).forEach(key => keys[key] = false);
}

// Game loop
function gameLoop() {
  updatePlayer();
  updateEnemy();
  drawScene();
  requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
