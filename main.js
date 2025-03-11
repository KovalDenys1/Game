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

function preload() {
    this.load.image('map', 'assets/map.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/enemy.png');
}

function create() {
    // Добавляем карту
    this.add.image(400, 300, 'map');

    // Создаем персонажа
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    // Настраиваем управление
    cursors = this.input.keyboard.createCursorKeys();
    
    // Настраиваем клавишу атаки
    attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Создаем группу врагов
    enemies = this.physics.add.group({
        key: 'enemy',
        repeat: 4,
        setXY: { x: 100, y: 100, stepX: 150 }
    });

    enemies.children.iterate(function (enemy) {
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1);
        enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));

        enemy.health = 3; // Устанавливаем здоровье врага

        // Добавляем полосу здоровья
        enemy.healthBar = this.add.graphics();
        updateHealthBar(enemy);
    }, this);

    // Коллизия между игроком и врагами
    this.physics.add.collider(player, enemies);

    // Обработка столкновений (перекрытий) между игроком и врагами
    this.physics.add.overlap(player, enemies, handlePlayerEnemyCollision);
}

function attackEnemies() {
    enemies.children.iterate(function (enemy) {
        if (!enemy.active || !enemy.body) return; // Пропускаем уничтоженных врагов

        const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);

        if (distance < 50) { // Если враг находится в радиусе атаки
            enemy.health -= 1; // Уменьшаем здоровье врага
            console.log(`Враг получил урон! Осталось здоровья: ${enemy.health}`);

            updateHealthBar(enemy); // Обновляем полосу здоровья

            if (enemy.health <= 0) {
                enemy.healthBar.destroy(); // Уничтожаем полосу здоровья
                enemies.killAndHide(enemy); // Скрываем врага и убираем из физического мира
                console.log('Враг уничтожен!');
            }
        }
    });
}

function updateHealthBar(enemy) {
    if (!enemy.active || !enemy.body) return; // Пропускаем уничтоженных врагов

    const barWidth = 40;
    const barHeight = 5;

    enemy.healthBar.clear();

    // Фон полосы здоровья (красный)
    enemy.healthBar.fillStyle(0xff0000);
    enemy.healthBar.fillRect(enemy.x - barWidth / 2, enemy.y - 20, barWidth, barHeight);

    // Текущая полоса здоровья (зелёный)
    const healthPercentage = Math.max(enemy.health / 3, 0); // Защита от отрицательных значений
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
        if (!enemy.active || !enemy.body) return; // Пропускаем уничтоженных врагов

        updateHealthBar(enemy); // Обновляем полосу здоровья

        const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);

        if (distance < 150) { // Если игрок рядом с врагом (<150 пикселей)
            const velocityX = (player.x - enemy.x) * 0.5;
            const velocityY = (player.y - enemy.y) * 0.5;
            enemy.setVelocity(velocityX, velocityY); // Враг движется к игроку
        }
    });
}