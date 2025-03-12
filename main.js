import MenuScene from './scenes/MenuScene.js';
import MapScene from './scenes/MapScene.js';
import ArenaScene from './scenes/ArenaScene.js';
import BossScene from './scenes/BossScene.js';
import ShopScene from './scenes/ShopScene.js';
import CharacterScene from './scenes/CharacterScene.js';
import SettingsScene from './scenes/SettingsScene.js';

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
    scene: [
        MenuScene,
        MapScene,
        ArenaScene,
        BossScene,
        ShopScene,
        CharacterScene,
        SettingsScene
    ]
};

const game = new Phaser.Game(config);
