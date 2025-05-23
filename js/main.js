import Player from './player.js';
import GameMap from './map.js';
import Enemy from './enemy.js';
import { spells } from './spells.js';

let projectiles = []; // Array to store projectiles
let player; // Player instance
let map; // Game map instance
let enemies = []; // Array to store enemies

// DOM elements
const menu = document.getElementById('menu');
const canvas = document.getElementById('gameCanvas');
const gameContainer = document.getElementById('game-container');
const buttons = document.querySelectorAll('#menu-buttons button');
const authButtons = document.querySelectorAll('#auth-buttons button');

// Game constants
const GAME_WIDTH = 512;
const GAME_HEIGHT = 288;
const SCALE = 2;

// Set canvas dimensions
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
canvas.style.width = `${GAME_WIDTH * SCALE}px`;
canvas.style.height = `${GAME_HEIGHT * SCALE}px`;

// Game state variables
let cameraX = 0; // Camera X position
let cameraY = 0; // Camera Y position
let lastTime = 0; // Last timestamp for game loop
let gameStarted = false; // Flag to check if the game has started
let isGameOver = false; // Flag to check if the game is over
let animationFrameId = null; // ID for requestAnimationFrame

// Add event listeners to menu buttons
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'start' && !gameStarted) {
      startGame(); // Start the game when "start" button is clicked
    } else if (['character', 'shop', 'exit'].includes(action)) {
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} is under development.`);
    }
  });
});

// Add event listeners to authentication buttons
authButtons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    alert(`${action.charAt(0).toUpperCase() + action.slice(1)} is under development.`);
  });
});

// Add keyboard event listeners
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyF' && player && !isGameOver) {
    spells.fireball(player, canvas.getContext('2d'), projectiles); // Cast fireball spell
  }
  if (e.code === 'KeyE' && player && !isGameOver) {
    meleeAttack(); // Perform melee attack
  }
});

// Function to handle melee attacks
function meleeAttack() {
  const meleeRange = 30; // Range for melee attack

  enemies.forEach(enemy => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy); // Calculate distance to enemy

    if (dist < meleeRange) {
      enemy.hp -= 20; // Reduce enemy health if within range
    }
  });
}

// Function to find a free tile on the map
function getFreeTile(map, enemyWidthTiles = 2, enemyHeightTiles = 2) {
  const height = map.length;
  const width = map[0].length;

  while (true) {
    const x = Math.floor(Math.random() * (width - enemyWidthTiles));
    const y = Math.floor(Math.random() * (height - enemyHeightTiles));

    let free = true;
    for (let dy = 0; dy < enemyHeightTiles; dy++) {
      for (let dx = 0; dx < enemyWidthTiles; dx++) {
        if (map[y + dy][x + dx] !== 0) {
          free = false;
          break;
        }
      }
      if (!free) break;
    }

    if (free) {
      return { x, y };
    }
  }
}

// Function to start the game
function startGame() {
  // Stop the previous animation if it exists
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  const ctx = canvas.getContext('2d');

  // Disable image smoothing
  ctx.imageSmoothingEnabled = false;


  
  map = new GameMap(16, SCALE); // Initialize the game map

  const tileSize = 16;

  // Find the center of the map
  let centerX = Math.floor(map.map[0].length / 2);
  let centerY = Math.floor(map.map.length / 2);

  // If the center is not free, find a free tile
  if (map.map[centerY][centerX] !== 0) {
    const spawn = getFreeTile(map.map);
    centerX = spawn.x;
    centerY = spawn.y;
  }

  // Initialize the player
  player = new Player(centerX * tileSize * SCALE, centerY * tileSize * SCALE, SCALE, map.map);
  enemies = []; // Reset enemies
  projectiles = []; // Reset projectiles

  // Spawn enemies
  const enemyCount = 6 + Math.floor(Math.random() * 5);
  for (let i = 0; i < enemyCount; i++) {
    const spawn = getFreeTile(map.map);
    const type = Math.random() < 0.5 ? 'skeleton' : 'vampire';
    enemies.push(new Enemy(spawn.x * tileSize * SCALE, spawn.y * tileSize * SCALE, SCALE, type));
  }

  lastTime = performance.now();
  isGameOver = false;
  gameStarted = true;

  // Hide the menu and show the game container
  menu.style.display = 'none';
  gameContainer.style.display = 'flex';

  // Start the game loop
  animationFrameId = requestAnimationFrame(gameLoop);
}

// Main game loop
function gameLoop(timeStamp) {
  if (!player) {
    animationFrameId = requestAnimationFrame(gameLoop);
    return;
  }

  const deltaTime = timeStamp - lastTime; // Calculate time difference
  lastTime = timeStamp;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Update camera position
  cameraX = player.x + player.width / 2 - canvas.width / 2;
  cameraY = player.y + player.height / 2 - canvas.height / 2;

  const mapWidthPx = map.map[0].length * 16 * SCALE;
  const mapHeightPx = map.map.length * 16 * SCALE;

  // Clamp camera position to map boundaries
  cameraX = Math.max(0, Math.min(cameraX, mapWidthPx - canvas.width));
  cameraY = Math.max(0, Math.min(cameraY, mapHeightPx - canvas.height));

  ctx.save();
  ctx.translate(-cameraX, -cameraY); // Apply camera translation

  if (!isGameOver) {
    map.draw(ctx); // Draw the map
    player.update(deltaTime); // Update the player
    player.draw(ctx); // Draw the player

    // Update and draw enemies
    enemies.forEach(enemy => {
      enemy.update(deltaTime, player, map.map);
      enemy.draw(ctx);
    });

    // Update and draw projectiles
    projectiles.forEach(p => {
      p.update(deltaTime);
      p.draw(ctx);
    });
    projectiles = projectiles.filter(p => !p.markedForDeletion); // Remove deleted projectiles

    // Check for collisions between projectiles and enemies
    projectiles.forEach(projectile => {
      enemies.forEach(enemy => {
        const dx = (enemy.x + enemy.width / 2) - (projectile.x + 8);
        const dy = (enemy.y + enemy.height / 2) - (projectile.y + 8);
        const dist = Math.hypot(dx, dy);

        if (dist < 20) {
          enemy.hp -= projectile.damage || 10; // Reduce enemy health
          projectile.markedForDeletion = true; // Mark projectile for deletion
        }
      });
    });

    enemies = enemies.filter(enemy => enemy.hp > 0); // Remove dead enemies

    // Check if the player is dead
    if (player.hp <= 0) {
      isGameOver = true;
      showGameOverScreen(); // Show game over screen
    }
  }

  ctx.restore();

  drawPlayerHpBar(ctx); // Draw the player's health bar

  if (isGameOver) {
    drawGameOverScreen(ctx); // Draw the game over screen
  }

  animationFrameId = requestAnimationFrame(gameLoop); // Continue the game loop
}

// Function to draw the player's health bar
function drawPlayerHpBar(ctx) {
  if (!player || isGameOver) return;

  const barX = 20;
  const barY = 20;
  const barWidth = 100;
  const barHeight = 10;
  const healthRatio = player.hp / player.maxHp;

  ctx.fillStyle = 'red';
  ctx.fillRect(barX, barY, barWidth, barHeight); // Draw the background bar

  ctx.fillStyle = 'lime';
  ctx.fillRect(barX, barY, barWidth * Math.max(healthRatio, 0), barHeight); // Draw the health bar

  ctx.strokeStyle = 'black';
  ctx.strokeRect(barX, barY, barWidth, barHeight); // Draw the border
}

// Function to show the game over screen
function showGameOverScreen() {
  const gameOverButton = document.createElement('button');
  gameOverButton.innerText = 'Back to Menu';
  gameOverButton.style.position = 'absolute';
  gameOverButton.style.top = '60%';
  gameOverButton.style.left = '50%';
  gameOverButton.style.transform = 'translate(-50%, -50%)';
  gameOverButton.style.fontSize = '24px';
  gameOverButton.style.padding = '10px 20px';
  gameOverButton.style.zIndex = '1000';
  gameOverButton.id = 'gameOverButton';

  document.body.appendChild(gameOverButton);

  // Add event listener to return to the menu
  gameOverButton.addEventListener('click', () => {
    document.getElementById('gameOverButton').remove();
    menu.style.display = 'block';
    gameContainer.style.display = 'none';
    player = null;
    enemies = [];
    projectiles = [];
    gameStarted = false;
    isGameOver = false;

    // Stop the game loop
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });
}

// Function to draw the game over screen
function drawGameOverScreen(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Draw a semi-transparent overlay

  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2); // Display "Game Over" text
  ctx.restore();
}