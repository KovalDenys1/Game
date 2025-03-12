export default class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapScene' });
    }

    preload() {
        this.load.image('map', 'assets/map.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('door', 'assets/door.png');
    }

    create() {
        this.add.image(400, 300, 'map');

        player = this.physics.add.sprite(400, 300, 'player');
        player.setCollideWorldBounds(true);

        cursors = this.input.keyboard.createCursorKeys();

        // Двери к разным сценам
        const arenaDoor = this.physics.add.sprite(200, 300, 'door').setInteractive();
        const bossDoor = this.physics.add.sprite(600, 300, 'door').setInteractive();
        const shopDoor = this.physics.add.sprite(400, 200, 'door').setInteractive();
        const characterDoor = this.physics.add.sprite(400, 500, 'door').setInteractive();

        arenaDoor.on('pointerdown', () => {
            this.scene.start('ArenaScene'); // Переход на арену для фарма
        });

        bossDoor.on('pointerdown', () => {
            this.scene.start('BossScene'); // Переход к сражению с боссами
        });

        shopDoor.on('pointerdown', () => {
            this.scene.start('ShopScene'); // Переход в магазин
        });

        characterDoor.on('pointerdown', () => {
            this.scene.start('CharacterScene'); // Переход в прокачку персонажа
        });
    }

    update() {
       let velocityX = 0;
       let velocityY = 0;

       if (cursors.left.isDown) velocityX = -200;
       else if (cursors.right.isDown) velocityX = 200;

       if (cursors.up.isDown) velocityY = -200;
       else if (cursors.down.isDown) velocityY = 200;

       player.setVelocity(velocityX, velocityY);
   }
}
