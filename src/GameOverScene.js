export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.winner = data.winner;
        this.winningLine = data.winningLine; // Array of {row, col} objects
        this.scores = data.scores;
    }

    preload() {
        // Load any assets specific to this screen if not already loaded
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#4CAF50'); // A green background, can be themed

        let message = '';
        if (this.winner === 'Draw') {
            message = "It's a Draw!";
        } else {
            message = `${this.winner} Wins!`;
        }

        // Display Winner/Draw Message
        this.add.text(width / 2, height / 3, message, {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Display final scores (optional, if scores are passed)
        if (this.scores) {
            this.add.text(width / 2, height / 3 + 60, `Score: P1: ${this.scores.p1} - P2: ${this.scores.p2}`, {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        }


        // "Play Again" Button
        const playAgainButton = this.add.graphics()
            .fillStyle(0x00ff00, 1)
            .fillRect(-125, -25, 250, 50);
        const playAgainText = this.add.text(0, 0, 'Play Again', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000'
        }).setOrigin(0.5);

        const playAgainContainer = this.add.container(width / 2, height / 2 + 50, [playAgainButton, playAgainText]);
        playAgainContainer.setSize(250, 50);
        playAgainContainer.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // monetization placeholder: Call ad SDK before restarting
                console.log("Placeholder: Ad could be shown here before 'Play Again'");
                // sdk.showInterstitialAd(); // Example SDK call

                this.scene.start('GameScene'); // Restart the game
            })
            .on('pointerover', () => playAgainButton.fillStyle(0x50ff50, 1).fillRect(-125, -25, 250, 50))
            .on('pointerout', () => playAgainButton.fillStyle(0x00ff00, 1).fillRect(-125, -25, 250, 50));


        // "Main Menu" Button
        const mainMenuButton = this.add.graphics()
            .fillStyle(0xffff00, 1)
            .fillRect(-125, -25, 250, 50);
        const mainMenuText = this.add.text(0, 0, 'Main Menu', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000'
        }).setOrigin(0.5);

        const mainMenuContainer = this.add.container(width / 2, height / 2 + 130, [mainMenuButton, mainMenuText]);
        mainMenuContainer.setSize(250, 50);
        mainMenuContainer.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // monetization placeholder: Call ad SDK before going to menu
                console.log("Placeholder: Ad could be shown here before 'Main Menu'");
                // sdk.showInterstitialAd(); // Example SDK call

                this.scene.start('MenuScene');
            })
            .on('pointerover', () => mainMenuButton.fillStyle(0xffff50, 1).fillRect(-125, -25, 250, 50))
            .on('pointerout', () => mainMenuButton.fillStyle(0xffff00, 1).fillRect(-125, -25, 250, 50));

        console.log("GameOverScene created. Winner:", this.winner);
        if (this.winningLine) {
            console.log("Winning line:", this.winningLine);
            this.highlightWinningPieces(width, height);
        }

        // TODO: Conceptual placeholder for a 'Rewarded Ad' button if scores/currency were implemented.
        // e.g., a button: "Watch Ad to Double Score?" (if applicable to game design)

        // SDK call for game over
        // if (window.CrazyGames && window.CrazyGames.SDK) {
        //     const finalScore = this.scores ? Math.max(this.scores.p1, this.scores.p2) : 0; // Example score
        //     window.CrazyGames.SDK.gameplayStop({ score: finalScore });
        //     console.log("SDK: gameplayStop called with score", finalScore);
        // } else {
        //     console.log("Placeholder: SDK gameplayStop/gameOver would be called here.");
        // }
    }

    highlightWinningPieces(sceneWidth, sceneHeight) {
        // Re-draw a simplified grid and highlight pieces
        // This is a simplified representation. A more direct approach might involve
        // passing the actual grid display data or using a shared texture.
        const gridColumns = 7;
        const gridRows = 6;
        const cellWidth = 40; // Smaller cells for display
        const cellHeight = 40;
        const gridDisplayWidth = gridColumns * cellWidth;
        const gridDisplayHeight = gridRows * cellHeight;

        // Center the display grid area, perhaps below the win message
        const gridDisplayX = sceneWidth / 2;
        const gridDisplayY = sceneHeight / 2 - 30; // Adjust Y position as needed

        const gridGraphics = this.add.graphics();
        gridGraphics.fillStyle(0xaaaaaa, 0.8);
        gridGraphics.fillRect(gridDisplayX - gridDisplayWidth / 2, gridDisplayY - gridDisplayHeight / 2, gridDisplayWidth, gridDisplayHeight);
        gridGraphics.lineStyle(1, 0x000000, 1);
        for (let i = 0; i <= gridColumns; i++) {
            gridGraphics.moveTo(gridDisplayX - gridDisplayWidth / 2 + i * cellWidth, gridDisplayY - gridDisplayHeight / 2);
            gridGraphics.lineTo(gridDisplayX - gridDisplayWidth / 2 + i * cellWidth, gridDisplayY + gridDisplayHeight / 2);
        }
        for (let j = 0; j <= gridRows; j++) {
            gridGraphics.moveTo(gridDisplayX - gridDisplayWidth / 2, gridDisplayY - gridDisplayHeight / 2 + j * cellHeight);
            gridGraphics.lineTo(gridDisplayX + gridDisplayWidth / 2, gridDisplayY - gridDisplayHeight / 2 + j * cellHeight);
        }
        gridGraphics.strokePath();


        // Determine winner color
        let winnerPlayerNumber = 0;
        if (this.winner && this.winner.includes("Player 1")) winnerPlayerNumber = 1;
        else if (this.winner && this.winner.includes("Player 2")) winnerPlayerNumber = 2;

        const pieceColor = winnerPlayerNumber === 1 ? 0xff0000 : (winnerPlayerNumber === 2 ? 0xffff00 : 0x555555);

        this.winningLine.forEach(piecePos => {
            const pieceX = (gridDisplayX - gridDisplayWidth / 2) + (piecePos.col * cellWidth) + (cellWidth / 2);
            const pieceY = (gridDisplayY - gridDisplayHeight / 2) + (piecePos.row * cellHeight) + (cellHeight / 2);

            // Draw a slightly larger, glowing, or differently styled circle for winning pieces
            this.add.circle(pieceX, pieceY, cellWidth / 2 * 0.7, pieceColor, 1);
            this.add.circle(pieceX, pieceY, cellWidth / 2 * 0.85, pieceColor, 0).setStrokeStyle(2, 0xffffff, 0.7); // White outline

            // Example of a simple pulsing animation (optional, can be more refined)
            const highlightCircle = this.add.circle(pieceX, pieceY, cellWidth / 2 * 0.7, pieceColor).setAlpha(0.5);
            this.tweens.add({
                targets: highlightCircle,
                alpha: 0.1,
                scaleX: 1.2,
                scaleY: 1.2,
                ease: 'Sine.easeInOut',
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        });
    }
}
