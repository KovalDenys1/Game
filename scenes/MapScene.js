export default class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapScene' });
    }

    preload() {
        // Загрузка ресурсов
        this.load.image('map', 'assets/map.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('door', 'assets/door.png');
    }

    create() {
        // Добавление фона карты
        this.add.image(400, 300, 'map');

        // Создание игрока
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);

        // Управление
        this.cursors = this.input.keyboard.createCursorKeys();

        // Создание дверей с физикой
        this.arenaDoor = this.createDoor(200, 300, 'ArenaScene'); // Дверь на арену
        this.bossDoor = this.createDoor(600, 300, 'BossScene'); // Дверь к боссам
        this.shopDoor = this.createDoor(400, 200, 'ShopScene'); // Дверь в магазин
        this.characterDoor = this.createDoor(400, 500, 'CharacterScene'); // Дверь к персонажу

        // Добавление физического взаимодействия между игроком и дверями
        this.physics.add.overlap(this.player, this.arenaDoor, () => {
            console.log('Вход в арену');
            this.scene.start('ArenaScene'); // Переход на арену для фарма
        });

        this.physics.add.overlap(this.player, this.bossDoor, () => {
            console.log('Вход к боссам');
            this.scene.start('BossScene'); // Переход к сражению с боссами
        });

        this.physics.add.overlap(this.player, this.shopDoor, () => {
            console.log('Вход в магазин');
            this.scene.start('ShopScene'); // Переход в магазин
        });

        this.physics.add.overlap(this.player, this.characterDoor, () => {
            console.log('Вход к персонажу');
            this.scene.start('CharacterScene'); // Переход в прокачку персонажа
        });
    }

    createDoor(x, y, sceneKey) {
        const door = this.physics.add.sprite(x, y, 'door');
        
        // Добавление текста над дверью для обозначения назначения (опционально)
        const labelText = {
            ArenaScene: 'Арена для фарма',
            BossScene: 'Сражение с боссами',
            ShopScene: 'Магазин',
            CharacterScene: 'Прокачка персонажа'
        }[sceneKey];

        if (labelText) {
            this.add.text(x, y - 50, labelText, {
                fontSize: '16px',
                fill: '#ffffff'
            }).setOrigin(0.5);
        }

        return door;
    }

    update() {
       let velocityX = 0;
       let velocityY = 0;

       if (this.cursors.left.isDown) velocityX = -200;
       else if (this.cursors.right.isDown) velocityX = 200;

       if (this.cursors.up.isDown) velocityY = -200;
       else if (this.cursors.down.isDown) velocityY = 200;

       this.player.setVelocity(velocityX, velocityY);
   }
}