export default class InstructionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene' });
    }

    preload() {
        // No specific assets needed for this basic version
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#2c3e50'); // A dark slate color

        // Title
        this.add.text(width / 2, height / 6, 'How to Play Connect-A-Bird', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5);

        // Instructions Text
        const instructions = [
            "Objective: Be the first player to connect four of your colored birds in a row (horizontally, vertically, or diagonally) on the grid.",
            "",
            "Player 1 (Red Bird):",
            "- Aim: W (up) and S (down) keys.",
            "- Power: Hold Spacebar to increase power, release to launch.",
            "",
            "Player 2 (Yellow Bird):",
            "- Aim: Up Arrow and Down Arrow keys.",
            "- Power: Hold Enter key to increase power, release to launch.",
            "",
            "Gameplay:",
            "- Launch your bird from the slingshot on the left.",
            "- Land your bird in one of the seven columns on the right.",
            "- Birds fall to the lowest available slot in the chosen column.",
            "- If you miss the grid, you forfeit your turn.",
            "",
            "Special Power-Up: Ghost Bird!",
            "- Every 5th turn, the current player gets a Ghost Bird.",
            "- The Ghost Bird can pass through ONE obstacle without being affected.",
        ];

        this.add.text(width / 2, height / 2, instructions, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ecf0f1',
            align: 'left',
            lineSpacing: 8,
            wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5);

        // Back Button
        const backButton = this.add.graphics()
            .fillStyle(0x3498db, 1) // Blue button
            .fillRect(-100, -25, 200, 50);
        const backText = this.add.text(0, 0, 'Back to Menu', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        const backContainer = this.add.container(width / 2, height * 0.85, [backButton, backText]);
        backContainer.setSize(200, 50);
        backContainer.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MenuScene');
            })
            .on('pointerover', () => backButton.fillStyle(0x5dade2, 1).fillRect(-100, -25, 200, 50))
            .on('pointerout', () => backButton.fillStyle(0x3498db, 1).fillRect(-100, -25, 200, 50));

        console.log("InstructionsScene created.");
    }
}
