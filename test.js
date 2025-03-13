export default class ArenaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ArenaScene' });
    }

    preload() {
        // Загрузка ресурсов
        this.load.image('map', './assets/map.png');
        this.load.image('player', './assets/player.png');
        this.load.image('enemy', './assets/enemy.png');
        this.load.image('coin', './assets/coin.png');
    }

    create() {
        // Фон
        console.log('ArenaScene создана');
        this.add.image(400, 300, 'map');

        // Игрок
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);

        // Управление
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Группы врагов и монет
        this.enemies = this.physics.add.group();
        this.coins = this.physics.add.group({
            maxSize: 100,
            createCallback: (coin) => {
                coin.setActive(true).setVisible(true);
            }
        });

        // Физические взаимодействия
        this.physics.add.collider(this.player, this.enemies);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

        // Текст очков и уровня
        this.score = 0;
        this.currentLevel = 1;
        this.previousScore = 0;
        this.previousLevel = 1;

        this.scoreText = this.add.text(16, 16, `Score: ${this.score}\nLevel: ${this.currentLevel}`, {
            fontSize: '32px',
            fill: '#ffffff'
        });

        // Таймер для спавна врагов
        this.time.addEvent({
            delay: 2000,
            callback: () => { 
                this.spawnEnemy(); 
            },
            callbackScope: this,
            loop: true
        });
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);

        let enemy = this.enemies.create(x, y, 'enemy');
        
        enemy.healthBar = this.add.graphics(); // Полоса здоровья врага
        enemy.health = this.currentLevel + 3; // Здоровье зависит от уровня

        const speedMultiplier = this.currentLevel * 10;

        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1);
        enemy.setVelocity(
            Phaser.Math.Between(-100 - speedMultiplier, 100 + speedMultiplier),
            Phaser.Math.Between(-100 - speedMultiplier, 100 + speedMultiplier)
        );
    }

    collectCoin(player, coin) {
       coin.disableBody(true, true); // Убираем монету с карты
       this.score += 10; // Увеличиваем счёт на фиксированное значение

       if (this.score !== this.previousScore || this.currentLevel !== this.previousLevel) {
           this.updateScoreText();
       }
    }

    updateScoreText() {
       if (this.score !== this.previousScore || this.currentLevel !== this.previousLevel) {
           this.scoreText.setText(`Score: ${this.score}\nLevel: ${this.currentLevel}`);
           this.previousScore = this.score;
           this.previousLevel = this.currentLevel;
       }
    }

    attackEnemies() {
       this.enemies.children.iterate((enemy) => {
           if (!enemy || !enemy.active || !enemy.body) return;
           const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);

           if (distance < 50) { 
               enemy.health -= 1; 
               if (enemy.health <= 0) {
                   enemy.healthBar.destroy();
                   enemy.setActive(false).setVisible(false);
                   console.log('Враг уничтожен!');
               }
           }
       });
    }

    handlePlayerEnemyCollision(player, enemy) {
       console.log('Столкновение с врагом!');
    }

    update() {
       let velocityX = 0;
       let velocityY = 0;

       if (this.cursors.left.isDown) velocityX = -200;
       else if (this.cursors.right.isDown) velocityX = 200;

       if (this.cursors.up.isDown) velocityY = -200;
       else if (this.cursors.down.isDown) velocityY = 200;

       player.setVelocity(velocityX, velocityY);

       if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
           attackEnemies();
       }
   }
}
