// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#260651',
    parent: 'phaser-game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let bird;
let pipes;
let ground;
let score = 0;
let scoreText;
let isGameActive = false;
let pipeGenerationEvent;

function preload() {
    // Load assets
    this.load.image('ground', '../assets/endlessRunner/ground.png');
    this.load.image('bird', '../assets/flappyBird/bird.png');
    this.load.image('pipe', '../assets/flappyBird/pipe.png');
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
            startGame(scene);
            startButton.destroy();
        });

    // Add Restart Button
    const restartButton = this.add.text(centerX + 100 + buttonSpacing / 2, 20, 'Restart', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.restart();
        });

    // Create ground
    ground = this.add.tileSprite(0, config.height - 50, config.width, 50, 'ground');
    ground.setOrigin(0, 0);
    this.physics.add.existing(ground, true);

    // Create bird
    bird = this.physics.add.sprite(100, config.height / 2, 'bird');
    bird.setCollideWorldBounds(true);
    bird.body.allowGravity = false;

    // Create pipes group
    pipes = this.physics.add.group();

    // Score text
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Joystix'
    });

    // Collision between bird and ground
    this.physics.add.collider(bird, ground, gameOver, null, this);

    // Collision between bird and pipes
    this.physics.add.collider(bird, pipes, gameOver, null, this);

    // Input for flapping
    this.input.on('pointerdown', () => {
        if (isGameActive) flap();
    });
}

function generatePipes() {
    const gapHeight = 150; // Space between the top and bottom pipes
    const gapPosition = Phaser.Math.Between(100, config.height - gapHeight - 50);

    // Create top pipe
    const topPipe = pipes.create(config.width, gapPosition, 'pipe');
    topPipe.setOrigin(0, 1);
    topPipe.setDisplaySize(50, gapPosition);
    topPipe.flipY = true; // Mirror vertically
    topPipe.body.setVelocityX(-150);
    topPipe.body.immovable = true;
    topPipe.body.allowGravity = false;

    // Create bottom pipe
    const bottomPipe = pipes.create(config.width, gapPosition + gapHeight, 'pipe');
    bottomPipe.setOrigin(0, 0);
    bottomPipe.setDisplaySize(50, config.height - (gapPosition + gapHeight));
    bottomPipe.body.setVelocityX(-150);
    bottomPipe.body.immovable = true;
    bottomPipe.body.allowGravity = false;

    // Add a "passed" flag to the top pipe to track scoring
    topPipe.passed = false;

    topPipe.bottomPipe = bottomPipe;
}

function update() {
    if (!isGameActive) return;

    // Move ground to simulate scrolling
    ground.tilePositionX += 2;

    // Check for scoring and cleanup
    pipes.getChildren().forEach(pipe => {
        // Only check the top pipes for scoring
        if (pipe.flipY && !pipe.passed && bird.x > pipe.x + pipe.displayWidth) {
            score++;
            scoreText.setText('Score: ' + score);
            pipe.passed = true; // Mark this pipe set as passed
        }

        // Destroy pipes when they move off-screen
        if (pipe.x + pipe.displayWidth < 0) {
            pipe.destroy();
            if (pipe.bottomPipe) pipe.bottomPipe.destroy();
        }
    });
}

function startGame(scene) {
    bird.body.allowGravity = true;

    // Generate pipes every 1.5 seconds
    pipeGenerationEvent = scene.time.addEvent({
        delay: 1500,
        callback: generatePipes,
        callbackScope: scene,
        loop: true
    });
}

function flap() {
    bird.setVelocityY(-350);
}

function gameOver() {
    isGameActive = false;

    this.physics.pause();
    bird.setTint(0xff0000);

    this.add.text(config.width / 2, config.height / 2, 'Game Over', {
        fontSize: '48px',
        fill: '#fff',
        fontFamily: 'Joystix'
    }).setOrigin(0.5);

    if (pipeGenerationEvent) {
        pipeGenerationEvent.remove();
    }
}
