let score = 0;
let scoreText;
let countdown = 30;
let timerText;
let isGameActive = false;
let countdownEvent, spawnObjectEvent;
let basket, fallingObjects;

// Preload assets
function preload() {
    this.load.image('basket', '../assets/fallingGame/basket.png');
    this.load.image('object', '../assets/fallingGame/object.png');
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
            countdown = 30;
            score = 0;
            scoreText.setText(`Score: ${score}`);
            timerText.setText(`Time: ${countdown}`);
            startTimers(scene);
        });

    this.add.text(centerX + 120, 20, 'Restart', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            stopTimers();
            this.scene.restart();
        });

    // Display score and timer
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff', fontFamily: 'Joystix' });
    timerText = this.add.text(16, 50, 'Time: 30', { fontSize: '32px', fill: '#fff', fontFamily: 'Joystix' });

    // Add basket
    basket = this.physics.add.sprite(400, 550, 'basket').setCollideWorldBounds(true);

    // Enable cursor keys for basket movement
    this.cursors = this.input.keyboard.createCursorKeys();

    // Group for falling objects
    fallingObjects = this.physics.add.group();

    // Collision detection between basket and objects
    this.physics.add.overlap(basket, fallingObjects, catchObject, null, this);
}

// Update basket movement
function update() {
    if (!isGameActive) return;

    if (this.cursors.left.isDown) {
        basket.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
        basket.setVelocityX(300);
    } else {
        basket.setVelocityX(0);
    }
}

// Start timers for game logic
function startTimers(scene) {
    countdownEvent = scene.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: scene,
        loop: true
    });

    spawnObjectEvent = scene.time.addEvent({
        delay: 1000,
        callback: spawnFallingObject,
        callbackScope: scene,
        loop: true
    });
}

// Stop active timers
function stopTimers() {
    if (countdownEvent) countdownEvent.remove();
    if (spawnObjectEvent) spawnObjectEvent.remove();
}

// Update game timer
function updateTimer() {
    if (!isGameActive) return;

    countdown--;
    timerText.setText(`Time: ${countdown}`);

    if (countdown <= 0) {
        isGameActive = false;
        this.add.text(300, 200, 'Game Over!', { fontSize: '32px', fill: '#fff', fontFamily: 'Joystix' }).setDepth(1);
        stopTimers();
        fallingObjects.clear(true, true);
    }
}

// Spawn a new falling object
function spawnFallingObject() {
    if (!isGameActive) return;

    const x = Phaser.Math.Between(50, 750);
    const fallingObject = fallingObjects.create(x, 0, 'object');
    fallingObject.setVelocityY(200);
    fallingObject.setCollideWorldBounds(false);
}

// Handle collision between basket and falling object
function catchObject(basket, object) {
    if (!isGameActive) return;

    object.destroy();
    score += 10;
    scoreText.setText(`Score: ${score}`);
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#260651',
    parent: 'phaser-game-container',
    scene: { preload: preload, create: create, update: update },
    physics: { default: 'arcade' }
};

// Create the game instance
const game = new Phaser.Game(config);
