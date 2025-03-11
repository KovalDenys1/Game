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

let player;
let cursors;
let enemies;
let attackKey;
let coins;
let score = 0;
let scoreText;
let currentLevel = 1; // Текущий уровень

function preload() {
    this.load.image('map', 'assets/map.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('coin', 'assets/coin.png');
}

function create() {
    this.add.image(400, 300, 'map');

    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
    
    attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    enemies = this.physics.add.group();

    coins = this.physics.add.group();

    this.physics.add.collider(player, enemies);
    
    this.physics.add.overlap(player, enemies, handlePlayerEnemyCollision);

    this.physics.add.overlap(player, coins, collectCoin, null, this);

    scoreText = this.add.text(16, 16, 'Score: ' + score + '\nLevel: ' + currentLevel,
                              { fontSize: '32px', fill: '#ffffff' });

    // Запускаем спавнер врагов
    this.time.addEvent({
        delay: 2000, // Каждые 2 секунды
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });
}

function spawnEnemy() {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);

    let enemy = enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
    enemy.setVelocity(
        Phaser.Math.Between(-100 - currentLevel * 10, 100 + currentLevel * 10),
        Phaser.Math.Between(-100 - currentLevel * 10, 100 + currentLevel * 10)
    );
    enemy.health = currentLevel + 3; // Увеличиваем здоровье врагов с каждым уровнем
    enemy.healthBar = this.add.graphics();
}

function collectCoin(player, coin) {
   coin.disableBody(true, true); // Убираем монету с карты
   score += 10; // Увеличиваем счёт на фиксированное значение
   scoreText.setText('Score: ' + score + '\nLevel: ' + currentLevel); // Обновляем текст очков и уровня
}

function attackEnemies() {
   enemies.children.iterate(function (enemy) {
       if (!enemy.active || !enemy.body) return;

       const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);

       if (distance < 50) { 
           enemy.health -= 1; 
           updateHealthBar(enemy);

           if (enemy.health <= 0) {
               enemy.healthBar.clear();
               enemy.setActive(false).setVisible(false);

               // Выпадение монет
               for (let i = 0; i < currentLevel; i++) { // Количество монет зависит от уровня
                   let coin = coins.create(enemy.x, enemy.y, 'coin'); // Монета остаётся на месте
               }

               console.log('Враг уничтожен!');
           }
       }
   });
}

function updateHealthBar(enemy) {
   if (!enemy.active || !enemy.body) return;

   const barWidth = 40;
   const barHeight = 5;

   enemy.healthBar.clear();

   enemy.healthBar.fillStyle(0xff0000);
   enemy.healthBar.fillRect(enemy.x - barWidth / 2, enemy.y - barHeight - 20, barWidth * (enemy.health / (currentLevel + 3)), barHeight);
}

function handlePlayerEnemyCollision(player, enemy) {
   console.log('Столкновение с врагом!');
}

function update() {
   player.setVelocity(0);

   if (cursors.left.isDown) {
       player.setVelocityX(-200);
   } else if (cursors.right.isDown) {
       player.setVelocityX(200);
   }

   if (cursors.up.isDown) {
       player.setVelocityY(-200);
   } else if (cursors.down.isDown) {
       player.setVelocityY(200);
   }

   if (Phaser.Input.Keyboard.JustDown(attackKey)) {
       attackEnemies();
   }

   enemies.children.iterate(function (enemy) {
       if (!enemy.active || !enemy.body) return;

       updateHealthBar(enemy);

       const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);

       if (distance < 150) { 
           const velocityX = (player.x - enemy.x) * 0.75;
           const velocityY = (player.y - enemy.y) * 0.75;
           enemy.setVelocity(velocityX, velocityY);
       }
   });
}
