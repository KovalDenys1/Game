export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('background', 'assets/menu_background.png');
        this.load.image('button', 'assets/button.png');
    }

    create() {
        this.add.image(400, 300, 'background');

        this.createButton(400, 200, 'Игра', () => {
            this.scene.start('MapScene'); // Переход на карту
        });

        this.createButton(400, 300, 'Персонаж', () => {
            this.scene.start('CharacterScene'); // Переход в меню персонажа
        });

        this.createButton(400, 400, 'Магазин', () => {
            this.scene.start('ShopScene'); // Переход в магазин
        });

        this.createButton(400, 500, 'Настройки', () => {
            this.scene.start('SettingsScene'); // Переход в настройки
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.image(x, y, 'button').setInteractive();

        button.on('pointerdown', callback);

        const buttonText = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }
}
