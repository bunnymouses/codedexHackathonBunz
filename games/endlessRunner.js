let player, ground, obstacles;
let cursors;
let score = 0;
let scoreText;
let isGameActive = false;
let spawnObstacleEvent;
let gameSpeed = 200;

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#260651',
    parent: 'phaser-game-container',
    scene: { preload: preload, create: create, update: update },
    physics: { default: 'arcade', arcade: { debug: false } }
};

// Create the game instance
const game = new Phaser.Game(config);

// Load assets
function preload() {
    this.load.image('ground', '../assets/endlessRunner/ground.png');
    this.load.image('player', '../assets/endlessRunner/player.png');
    this.load.image('obstacle', '../assets/endlessRunner/obstacle.png');
}

// Set up the game scene
function create() {
    const scene = this;

    // Add Start and Restart buttons
    const buttonStyle = {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#A741AD',
        padding: { x: 10, y: 5 },
        fontFamily: 'Joystix'
    };
    const centerX = config.width / 2;

    this.add.text(centerX - 120, 20, 'Start', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            isGameActive = true;
            score = 0;
            scoreText.setText(`Score: ${score}`);
            startGame(scene);
        });

    this.add.text(centerX + 120, 20, 'Restart', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            stopGame();
            this.scene.restart();
        });

    // Create ground, player, and obstacles group
    ground = this.add.tileSprite(400, 580, 800, 40, 'ground');
    this.physics.add.existing(ground, true);
    player = this.physics.add.sprite(150, 500, 'player').setCollideWorldBounds(true).setGravityY(1000);
    obstacles = this.physics.add.group();

    // Enable collisions
    this.physics.add.collider(player, ground);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    // Display score
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff', fontFamily: 'Joystix' });

    // Set up controls
    cursors = this.input.keyboard.createCursorKeys();
}

// Update game logic
function update() {
    if (!isGameActive) return;

    // Scroll ground and check for jumps
    ground.tilePositionX += gameSpeed * 0.016;
    if (cursors.up.isDown && player.body.touching.down) player.setVelocityY(-500);

    // Remove off-screen obstacles and update score
    obstacles.children.iterate(obstacle => {
        if (obstacle && obstacle.x < -50) {
            obstacle.destroy();
            score += 10;
            scoreText.setText(`Score: ${score}`);
        }
    });
}

// Start game logic
function startGame(scene) {
    spawnObstacle(scene);
    spawnObstacleEvent = scene.time.addEvent({
        delay: Phaser.Math.Between(1500, 3000),
        callback: () => {
            spawnObstacle(scene);
            spawnObstacleEvent.delay = Phaser.Math.Between(1500, 3000);
        },
        callbackScope: scene,
        loop: true
    });
}

// Stop game logic
function stopGame() {
    isGameActive = false;
    if (spawnObstacleEvent) spawnObstacleEvent.remove();
    obstacles.clear(true, true);
}

// Spawn a new obstacle
function spawnObstacle(scene) {
    const obstacle = obstacles.create(850, 540, 'obstacle');
    obstacle.setVelocityX(-gameSpeed).setImmovable(true);
}

// Handle player collision with obstacles
function hitObstacle() {
    isGameActive = false;
    stopGame();
    player.setTint(0xff0000);
    this.add.text(300, 200, 'Game Over!', { fontSize: '32px', fill: '#fff', fontFamily: 'Joystix' }).setDepth(1);
}
