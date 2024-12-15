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
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

let playerPaddle, opponentPaddle, ball;
let cursors;
let playerScore = 0;
let opponentScore = 0;
let playerScoreText, opponentScoreText;
let isGameActive = false; // Track if the game has started

function preload() {
    // Load custom font dynamically
    const fontStyle = document.createElement('style');
    fontStyle.innerHTML = `
        @font-face {
            font-family: 'Joystix';
            src: url('../assets/joystix monospace.otf') format('opentype');
        }
    `;
    document.head.appendChild(fontStyle);

    // Load assets
    this.load.image('paddle', '../assets/pong/paddle.png');
    this.load.image('ball', '../assets/pong/ball.png');
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
            console.log('Start button clicked');
            isGameActive = true; // Mark the game as active
            ball.setVelocity(200, Phaser.Math.Between(-200, 200)); // Start the ball's movement
            startButton.destroy(); // Remove the Start button after the game starts
        });

    // Add Restart Button
    const restartButton = this.add.text(centerX + 100 + buttonSpacing / 2, 20, 'Restart', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            console.log('Restart button clicked');
            this.scene.restart(); // Restart the game
        });

    // Add paddles
    playerPaddle = this.physics.add.sprite(50, 300, 'paddle').setImmovable(true);
    opponentPaddle = this.physics.add.sprite(750, 300, 'paddle').setImmovable(true);

    // Add ball
    ball = this.physics.add.sprite(400, 300, 'ball');
    ball.body.setCollideWorldBounds(true);
    ball.body.setBounce(1, 1);
    this.physics.world.setBoundsCollision(false, false, true, true);

    // Set ball to be stationary initially
    ball.setVelocity(0, 0);

    // Add scores
    const scoreY = config.height - 50;
    playerScoreText = this.add.text(centerX - 200, scoreY, 'Player: 0', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Joystix'
    }).setOrigin(0.5);

    opponentScoreText = this.add.text(centerX + 200, scoreY, 'Opponent: 0', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Joystix'
    }).setOrigin(0.5);

    // Enable cursor keys for player control
    cursors = this.input.keyboard.createCursorKeys();

    // Add ball collision with paddles
    this.physics.add.collider(ball, playerPaddle, hitPaddle, null, this);
    this.physics.add.collider(ball, opponentPaddle, hitPaddle, null, this);

    // Bind resetBall to the scene
    resetBall = resetBall.bind(this);
}

function update() {
    if (!isGameActive) {
        // Do nothing if the game is not active
        return;
    }

    // Player paddle movement
    if (cursors.up.isDown) {
        playerPaddle.setVelocityY(-300);
    } else if (cursors.down.isDown) {
        playerPaddle.setVelocityY(300);
    } else {
        playerPaddle.setVelocityY(0);
    }

    // Opponent paddle AI
    if (ball.y < opponentPaddle.y - 10) {
        opponentPaddle.setVelocityY(-200);
    } else if (ball.y > opponentPaddle.y + 10) {
        opponentPaddle.setVelocityY(200);
    } else {
        opponentPaddle.setVelocityY(0);
    }

    // Check if the ball goes off screen
    if (ball.x < 0) {
        opponentScore++;
        opponentScoreText.setText(`Opponent: ${opponentScore}`);
        resetBall();
    } else if (ball.x > config.width) {
        playerScore++;
        playerScoreText.setText(`Player: ${playerScore}`);
        resetBall();
    }
}

function hitPaddle(ball, paddle) {
    // Add some variation to ball velocity based on where it hits the paddle
    let diff = ball.y - paddle.y;
    ball.setVelocityY(10 * diff);
}

function resetBall() {
    // Reset ball to the center
    ball.setPosition(400, 300);
    ball.setVelocity(0, 0);

    // Reactivate ball with velocity after 1 second
    this.time.delayedCall(1000, () => {
        ball.setVelocity(200, Phaser.Math.Between(-200, 200));
    });
}
