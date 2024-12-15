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
    }
};

const game = new Phaser.Game(config);

let snake;
let food;
let cursors;
let direction = 'RIGHT';
let newDirection = 'RIGHT';
let score = 0;
let scoreText;
let isGameActive = false; // Track if the game has started
let moveSnakeEvent;

function preload() {
    const fontStyle = document.createElement('style');
    fontStyle.innerHTML = `
        @font-face {
            font-family: 'Joystix';
            src: url('../assets/joystix monospace.otf') format('opentype');
        }
    `;
    document.head.appendChild(fontStyle);

    this.load.image('snakeBody', '../assets/snakeBody.png');
    this.load.image('food', '../assets/food.png');
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
            isGameActive = true;
            initializeGame(scene);
            startButton.destroy(); // Remove Start button after the game starts
        });

    // Add Restart Button
    const restartButton = this.add.text(centerX + 100 + buttonSpacing / 2, 20, 'Restart', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            isGameActive = false;
            stopGame(); // Stop the game logic
            this.scene.restart(); // Restart the scene
        });
}

function initializeGame(scene) {
    // Initialize snake
    snake = [
        scene.add.rectangle(400, 300, 20, 20, 0x00ff00),
        scene.add.rectangle(380, 300, 20, 20, 0x00ff00),
        scene.add.rectangle(360, 300, 20, 20, 0x00ff00)
    ];

    // Create food
    food = scene.add.rectangle(getRandomPosition(800), getRandomPosition(600), 20, 20, 0xff0000);

    // Display score
    score = 0;
    scoreText = scene.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Joystix'
    });

    // Input keys
    cursors = scene.input.keyboard.createCursorKeys();

    // Game loop timer
    moveSnakeEvent = scene.time.addEvent({
        delay: 150,
        callback: moveSnake,
        callbackScope: scene,
        loop: true
    });
}

function update() {
    if (!isGameActive) return;

    // Handle direction change
    if (cursors.left.isDown && direction !== 'RIGHT') {
        newDirection = 'LEFT';
    } else if (cursors.right.isDown && direction !== 'LEFT') {
        newDirection = 'RIGHT';
    } else if (cursors.up.isDown && direction !== 'DOWN') {
        newDirection = 'UP';
    } else if (cursors.down.isDown && direction !== 'UP') {
        newDirection = 'DOWN';
    }
}

function moveSnake() {
    if (!isGameActive) return;

    // Update direction
    direction = newDirection;

    // Get head position
    const head = snake[0];
    let newX = head.x;
    let newY = head.y;

    if (direction === 'LEFT') newX -= 20;
    else if (direction === 'RIGHT') newX += 20;
    else if (direction === 'UP') newY -= 20;
    else if (direction === 'DOWN') newY += 20;

    // Check collision with walls
    if (newX < 0 || newX >= 800 || newY < 0 || newY >= 600) {
        return gameOver(this);
    }

    // Check collision with itself
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === newX && snake[i].y === newY) {
            return gameOver(this);
        }
    }

    // Move snake
    const newPart = this.add.rectangle(newX, newY, 20, 20, 0x00ff00);
    snake.unshift(newPart);

    // Check if food is eaten
    if (newX === food.x && newY === food.y) {
        score += 10;
        scoreText.setText(`Score: ${score}`);
        food.setPosition(getRandomPosition(800), getRandomPosition(600));
    } else {
        // Remove last part of snake
        const tail = snake.pop();
        tail.destroy();
    }
}

function stopGame() {
    if (moveSnakeEvent) moveSnakeEvent.remove(); // Stop snake movement
    snake.forEach((part) => part.destroy()); // Remove all snake parts
    food.destroy(); // Remove food
}

function getRandomPosition(max) {
    return Phaser.Math.Snap.Floor(Math.random() * max, 20);
}

function gameOver(scene) {
    isGameActive = false;

    scene.add.text(config.width / 2, config.height / 2, 'GAME OVER', {
        fontSize: '48px',
        fill: '#f00',
        fontFamily: 'Joystix'
    }).setOrigin(0.5);

    stopGame();
}

