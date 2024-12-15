// Initialize variables
let score = 0;
let countdown = 30;
let scoreText, timerText, target;
let isGameActive = false;
let countdownEvent, moveTargetEvent;

// Preload assets
function preload() {
    this.load.image('target', '../assets/clicktarget/target.png');
}

// Set up the game scene
function create() {
    const scene = this;

    // Define button style and spacing
    const buttonStyle = {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#A741AD',
        padding: { x: 10, y: 5 },
        fontFamily: 'Joystix'
    };
    const buttonSpacing = 20;
    const centerX = config.width / 2;

    // Add Start button
    const startButton = this.add.text(centerX - 100 - buttonSpacing / 2, 20, 'Start', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            isGameActive = true;
            countdown = 30;
            score = 0;
            scoreText.setText(`Score: ${score}`);
            timerText.setText(`Time: ${countdown}`);
            startTimers(scene); // Start countdown and movement timers
            startButton.destroy(); // Remove Start button
        });

    // Add Restart button
    const restartButton = this.add.text(centerX + 100 + buttonSpacing / 2, 20, 'Restart', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            stopTimers(); // Stop all active timers
            this.scene.restart(); // Restart the scene
        });

    // Add score and timer displays
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Joystix'
    });
    timerText = this.add.text(16, 50, 'Time: 30', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Joystix'
    });

    // Add interactive target sprite
    target = this.physics.add.sprite(400, 300, 'target')
        .setInteractive()
        .setVisible(true);

    // Handle target clicks
    target.on('pointerdown', () => {
        if (!isGameActive) return;
        score += 10;
        scoreText.setText(`Score: ${score}`); // Update score
        moveTarget(); // Move target to a new position
    });
}

// Update logic (unused)
function update() {}

// Start timers for countdown and target movement
function startTimers(scene) {
    countdownEvent = scene.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: scene,
        loop: true
    });
    moveTargetEvent = scene.time.addEvent({
        delay: 1500,
        callback: moveTarget,
        callbackScope: scene,
        loop: true
    });
}

// Stop all active timers
function stopTimers() {
    if (countdownEvent) countdownEvent.remove();
    if (moveTargetEvent) moveTargetEvent.remove();
}

// Update the countdown timer
function updateTimer() {
    if (!isGameActive) return;
    countdown--;
    timerText.setText(`Time: ${countdown}`);

    // End game when time runs out
    if (countdown <= 0) {
        isGameActive = false;
        this.add.text(300, 200, 'Game Over!', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Joystix'
        }).setDepth(1);
        stopTimers();
    }
}

// Move the target to a random position
function moveTarget() {
    if (!isGameActive) return;
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    target.setPosition(x, y);
}

// Game configuration
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
        default: 'arcade'
    }
};

// Create the game instance
const game = new Phaser.Game(config);
