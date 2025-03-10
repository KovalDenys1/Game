const config = {
    type: Phaser.AUTO,
    width: 800, // Размер игрового окна
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Отключаем гравитацию для свободного движения
            debug: false // Включи true для отладки
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config); // Создаем игру

let player; // Переменная для персонажа
let cursors; // Клавиши управления

function preload() {
    // Загрузка ресурсов (например, спрайтов)
    this.load.image('map', 'assets/map.png'); // Карта (замени на свою текстуру)
    this.load.image('player', 'assets/player.png'); // Персонаж (замени на свою текстуру)
}

function create() {
    // Добавляем карту
    this.add.image(400, 300, 'map'); // Центрируем карту

    // Создаем персонажа
    player = this.physics.add.sprite(400, 300, 'player'); // Позиция персонажа

    // Настраиваем границы карты
    player.setCollideWorldBounds(true);

    // Настраиваем управление
    cursors = this.input.keyboard.createCursorKeys(); // Клавиши стрелок
}

function update() {
    // Логика движения персонажа
    player.setVelocity(0); // Останавливаем персонажа по умолчанию

    if (cursors.left.isDown) {
        player.setVelocityX(-200); // Движение влево
    } else if (cursors.right.isDown) {
        player.setVelocityX(200); // Движение вправо
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-200); // Движение вверх
    } else if (cursors.down.isDown) {
        player.setVelocityY(200); // Движение вниз
    }
}
