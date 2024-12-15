let player;
let cursors;
let bullets;
let enemies;
let lastFired = 0;
let score = 0;
let scoreText;
let isGameActive = false;
let spawnEnemyEvent;

const gameSpeed = 300; // Speed of enemies
const bulletSpeed = 500; // Speed of bullets
const fireRate = 300; // Fire rate for bullets (in ms)

function preload() {
    this.load.image('player', '../assets/spaceShooter/player.png'); // Player spaceship
    this.load.image('bullet', '../assets/spaceShooter/bullet.png'); // Bullets
    this.load.image('enemy', '../assets/spaceShooter/enemy.png'); // Enemy ships
}

function create() {
    const scene = this;

    // Button configurations
    const buttonStyle = {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#A741AD',
        padding: { x: 10, y: 5 },
        fontFamily: 'Joystix'
    };
    const buttonSpacing = 20;
    const centerX = config.width / 2;

    // Add Start Button
    const startButton = this.add.text(centerX - 100 - buttonSpacing / 2, 20, 'Start', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            isGameActive = true;
            score = 0;
            scoreText.setText(`Score: ${score}`);
            startGame(scene);
            startButton.destroy(); // Remove Start button after starting
        });

    // Add Restart Button
    const restartButton = this.add.text(centerX + 100 + buttonSpacing / 2, 20, 'Restart', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            stopGame(); // Stop game logic
            this.scene.restart(); // Restart the scene
        });

    // Add player spaceship
    player = this.physics.add.sprite(400, 550, 'player');
    player.setCollideWorldBounds(true);

    // Add score text
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Joystix'
    });

    // Group for bullets (reusable)
    bullets = this.physics.add.group({
        classType: Phaser.Physics.Arcade.Image,
        maxSize: 10,
        runChildUpdate: true
    });

    // Group for enemies
    enemies = this.physics.add.group();

    // Enable cursor keys for player movement
    cursors = this.input.keyboard.createCursorKeys();

    // Collision between bullets and enemies
    this.physics.add.collider(bullets, enemies, destroyEnemy, null, this);

    // Collision between player and enemies
    this.physics.add.collider(player, enemies, hitPlayer, null, this);
}

function update(time) {
    if (!isGameActive) return;

    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
    } else {
        player.setVelocityX(0);
    }

    // Shooting bullets
    if (cursors.space.isDown && time > lastFired) {
        shootBullet();
        lastFired = time + fireRate;
    }

    // Recycle bullets when they leave the screen
    bullets.children.iterate((bullet) => {
        if (bullet && bullet.active && bullet.y < 0) {
            bullet.setActive(false);
            bullet.setVisible(false);
            bullet.body.setVelocityY(0);
        }
    });
}

function startGame(scene) {
    spawnEnemyEvent = scene.time.addEvent({
        delay: 1000, // Enemies spawn every second
        callback: spawnEnemy,
        callbackScope: scene,
        loop: true
    });
}

function stopGame() {
    isGameActive = false;

    if (spawnEnemyEvent) spawnEnemyEvent.remove();
    bullets.clear(true, true);
    enemies.clear(true, true);
}

function shootBullet() {
    const bullet = bullets.get(player.x, player.y - 20, 'bullet');
    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.body.velocity.y = -bulletSpeed;
    }
}

function spawnEnemy() {
    const x = Phaser.Math.Between(50, 750);
    const enemy = enemies.create(x, 0, 'enemy');
    if (enemy) {
        enemy.setVelocityY(gameSpeed);
        enemy.setCollideWorldBounds(false);
    }
}

function destroyEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocityY(0);

    enemy.destroy();
    score += 10; // Increase score
    scoreText.setText(`Score: ${score}`);
}

function hitPlayer(player, enemy) {
    isGameActive = false;
    stopGame();

    // Turn the player red
    player.setTint(0xff0000);

    this.add.text(config.width / 2, config.height / 2, 'Game Over!', {
        fontSize: '48px',
        fill: '#fff',
        fontFamily: 'Joystix'
    }).setOrigin(0.5);
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#260651',
    parent: 'phaser-game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
