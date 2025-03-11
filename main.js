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

    enemies = this.physics.add.group({
        key: 'enemy',
        repeat: 4,
        setXY: { x: 100, y: 100, stepX: 150 }
    });

    enemies.children.iterate(function (enemy) {
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1);
        enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
        enemy.health = 3;
        enemy.healthBar = this.add.graphics();
        updateHealthBar(enemy);
    }, this);

    this.physics.add.collider(player, enemies);
    
    this.physics.add.overlap(player, enemies, handlePlayerEnemyCollision);

    coins = this.physics.add.group({
        key: 'coin',
        repeat: 9,
        setXY: { x: Phaser.Math.Between(50, 750), y: Phaser.Math.Between(50, 550) }
    });

    this.physics.add.overlap(player, coins, collectCoin, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
}

function collectCoin(player, coin) {
    coin.disableBody(true, true); // Отключаем физическое тело и делаем монету невидимой
    score += 10; // Увеличиваем счёт на 10 очков
    scoreText.setText('Score: ' + score); // Обновляем текст очков
}

function attackEnemies() {
    enemies.children.iterate(function (enemy) {
        if (!enemy.active || !enemy.body) return; // Пропускаем уничтоженных врагов

        const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);

        if (distance < 50) { // Если враг находится в радиусе атаки
            enemy.health -= 1; // Уменьшаем здоровье врага
            updateHealthBar(enemy);

            if (enemy.health <= 0) {
                enemy.healthBar.clear(); // Удаляем полоску здоровья
                enemy.setActive(false).setVisible(false); // Делаем врага неактивным и невидимым
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
   enemy.healthBar.fillRect(enemy.x - barWidth / 2, enemy.y - 20, barWidth, barHeight);

   const healthPercentage = Math.max(enemy.health / 3, 0);
   enemy.healthBar.fillStyle(0x00ff00);
   enemy.healthBar.fillRect(enemy.x - barWidth / 2, enemy.y - 20, barWidth * healthPercentage, barHeight);
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
           const velocityX = (player.x - enemy.x) * 0.5;
           const velocityY = (player.y - enemy.y) * 0.5;
           enemy.setVelocity(velocityX, velocityY);
       }
   });
}