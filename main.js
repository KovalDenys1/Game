// Конфигурация игры
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

// Глобальные переменные
let player;
let cursors;
let enemies;
let attackKey;
let coins;
let score = 0;
let scoreText;
let currentLevel = 1; // Текущий уровень
let previousScore = score;
let previousLevel = currentLevel;

// Функция загрузки ресурсов
function preload() {
    this.load.image('map', 'assets/map.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('coin', 'assets/coin.png');
}

// Создание сцены
function create() {
    // Фон
    this.add.image(400, 300, 'map');

    // Игрок
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    // Управление
    cursors = this.input.keyboard.createCursorKeys();
    attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Группы врагов и монет
    enemies = this.physics.add.group();
    coins = this.physics.add.group({
        maxSize: 100,
        createCallback: function (coin) {
            coin.setActive(true).setVisible(true);
        }
    });
    

    // Физические взаимодействия
    this.physics.add.collider(player, enemies);
    this.physics.add.overlap(player, enemies, handlePlayerEnemyCollision);
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    // Текст очков и уровня
    scoreText = this.add.text(16, 16, `Score: ${score}\nLevel: ${currentLevel}`, {
        fontSize: '32px',
        fill: '#ffffff'
    });

    // Таймер для спавна врагов
    this.time.addEvent({
        delay: 2000,
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });
}

// Спавн врагов с настройкой параметров
function spawnEnemy() {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);

    let enemy = enemies.create(x, y, 'enemy');
    
    configureEnemy(enemy); // Настраиваем параметры врага

    enemy.healthBar = this.add.graphics(); // Полоса здоровья врага
}

// Настройка параметров врага
function configureEnemy(enemy) {
    const speedMultiplier = currentLevel * 10;

    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
    enemy.setVelocity(
        Phaser.Math.Between(-100 - speedMultiplier, 100 + speedMultiplier),
        Phaser.Math.Between(-100 - speedMultiplier, 100 + speedMultiplier)
    );

    enemy.health = currentLevel + 3; // Здоровье зависит от уровня
}

// Сбор монет игроком
function collectCoin(player, coin) {
   coin.disableBody(true, true); // Убираем монету с карты
   score += 10; // Увеличиваем счёт на фиксированное значение

   updateScoreText(); // Обновляем текст очков и уровня только при изменении значений
}

// Обновление текста очков и уровня
function updateScoreText() {
   if (score !== previousScore || currentLevel !== previousLevel) {
       scoreText.setText(`Score: ${score}\nLevel: ${currentLevel}`);
       previousScore = score;
       previousLevel = currentLevel;
   }
}

// Атака врагов игроком
function attackEnemies() {
   enemies.children.iterate(function (enemy) {
    if (!enemy || !enemy.active || !enemy.body) return;
       attackEnemy(enemy);
   });
}

// Логика атаки одного врага
function attackEnemy(enemy) {
   const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);

   if (distance < 50) { 
       enemy.health -= 1; 
       updateHealthBar(enemy);

       if (enemy.health <= 0) {
           destroyEnemy(enemy);
       }
   }
}

// Уничтожение врага и спавн монет
function destroyEnemy(enemy) {
    enemy.healthBar.destroy();
   enemy.setActive(false).setVisible(false);
   spawnCoins(enemy.x, enemy.y, currentLevel);
   console.log('Враг уничтожен!');
}

// Спавн монет из пула объектов
function spawnCoins(x, y, count) {
   for (let i = 0; i < count; i++) {
       let coin = coins.get(x, y, 'coin'); // Берём монету из пула
       if (!coin) break; // Если пул пустой, выходим из цикла

       coin.setActive(true).setVisible(true);
       coin.body.enable = true; // Включаем физику для монеты
   }
}

// Обновление полосы здоровья врага
function updateHealthBar(enemy) {
    if (!enemy || !enemy.active || !enemy.body) return;

   const barWidth = 40;
   const barHeight = 5;

   enemy.healthBar.clear();
   enemy.healthBar.fillStyle(0xff0000);
   enemy.healthBar.fillRect(
       enemy.x - barWidth / 2,
       enemy.y - barHeight - 20,
       barWidth * (enemy.health / (currentLevel + 3)), barHeight
   );
}

// Обработка столкновения игрока с врагом
function handlePlayerEnemyCollision(player, enemy) {
   console.log('Столкновение с врагом!');
}

// Основной игровой цикл (обновление)
function update() {
   let velocityX = 0;
   let velocityY = 0;

   if (cursors.left.isDown) {
       velocityX = -200;
   } else if (cursors.right.isDown) {
       velocityX = 200;
   }

   if (cursors.up.isDown) {
       velocityY = -200;
   } else if (cursors.down.isDown) {
       velocityY = 200;
   }

   player.setVelocity(velocityX, velocityY);

   if (Phaser.Input.Keyboard.JustDown(attackKey)) {
       attackEnemies();
   }

   updateEnemies(); // Обновляем состояние всех врагов
}

// Обновление состояния врагов на каждом кадре
function updateEnemies() {
   enemies.children.iterate(function (enemy) {
    if (!enemy || !enemy.active || !enemy.body) return;

       const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);

       if (distance < 150) { 
        const velocityX = (player.x - enemy.x) * 0.75;
        const velocityY = (player.y - enemy.y) * 0.75;
           enemy.setVelocity(velocityX, velocityY);
       } else {
           enemy.setVelocity(0); // Останавливаем врага, если он далеко от игрока
       }

       updateHealthBar(enemy); // Обновляем полосу здоровья только для активных врагов
   });
}
