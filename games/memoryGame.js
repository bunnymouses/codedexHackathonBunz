const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#260651',
    parent: 'phaser-game-container',
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

let cards, firstCard, secondCard;
let isChecking = false;
let matches = 0;
const totalPairs = 6;
let isGameActive = false;

// Preload assets
function preload() {
    this.load.image('cardBack', '../assets/memoryGame/cardBack.png');
    for (let i = 1; i <= totalPairs; i++) {
        this.load.image(`card${i}`, `../assets/memoryGame/card${i}.png`);
    }
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
            initializeGame(scene);
        });

    this.add.text(centerX + 120, 20, 'Restart', buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            isGameActive = false;
            this.scene.restart();
        });
}

// Initialize the memory game
function initializeGame(scene) {
    const cardKeys = [];
    for (let i = 1; i <= totalPairs; i++) cardKeys.push(`card${i}`, `card${i}`);
    Phaser.Utils.Array.Shuffle(cardKeys);

    cards = scene.add.group();
    const cardWidth = 100, cardHeight = 140, cols = 4, spacing = 20;
    const totalGridWidth = (cardWidth + spacing) * cols - spacing;
    const totalGridHeight = (cardHeight + spacing) * Math.ceil(cardKeys.length / cols) - spacing;
    const startX = (config.width - totalGridWidth) / 2 + 80;
    const startY = (config.height - totalGridHeight) / 2 + 80;

    cardKeys.forEach((key, index) => {
        const x = startX + (index % cols) * (cardWidth + spacing);
        const y = startY + Math.floor(index / cols) * (cardHeight + spacing);
        const card = scene.add.image(x, y, 'cardBack').setInteractive();
        card.setData('face', key);
        card.on('pointerdown', () => { if (isGameActive) flipCard(scene, card); });
        cards.add(card);
    });

    matches = 0;
    firstCard = null;
    secondCard = null;
    isChecking = false;
}

// Flip a card
function flipCard(scene, card) {
    if (isChecking || card === firstCard || card.getData('isMatched')) return;
    card.setTexture(card.getData('face'));

    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        checkMatch(scene);
    }
}

// Check for a match
function checkMatch(scene) {
    isChecking = true;

    if (firstCard.getData('face') === secondCard.getData('face')) {
        firstCard.setData('isMatched', true);
        secondCard.setData('isMatched', true);
        matches++;

        if (matches === totalPairs) {
            scene.add.text(config.width / 2 - 100, config.height / 2 - 50, 'You Win!', {
                fontSize: '48px',
                fill: '#fff',
                fontFamily: 'Joystix'
            });
        }
        resetSelection();
    } else {
        scene.time.delayedCall(1000, () => {
            firstCard.setTexture('cardBack');
            secondCard.setTexture('cardBack');
            resetSelection();
        });
    }
}

// Reset selection after each check
function resetSelection() {
    firstCard = null;
    secondCard = null;
    isChecking = false;
}

function update() {
    // No continuous updates required
}
