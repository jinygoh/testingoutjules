export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Load assets specific to MenuScene if any (e.g., background image, button sprites)
        // For now, using graphics for buttons.
    }

    create() {
        const { width, height } = this.scale;

        // Game Title
        this.add.text(width / 2, height / 4, 'Connect-A-Bird', {
            fontSize: '48px',
            fontFamily: 'Arial', // Placeholder font
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Play Button
        const playButton = this.add.graphics()
            .fillStyle(0x00ff00, 1)
            .fillRect(-100, -25, 200, 50); // Centered at (0,0) before positioning
        const playText = this.add.text(0, 0, 'Play', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000'
        }).setOrigin(0.5);

        const playContainer = this.add.container(width / 2, height / 2, [playButton, playText]);
        playContainer.setSize(200, 50); // Important for interaction
        playContainer.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('GameScene');
            })
            .on('pointerover', () => playButton.fillStyle(0x50ff50, 1).fillRect(-100, -25, 200, 50))
            .on('pointerout', () => playButton.fillStyle(0x00ff00, 1).fillRect(-100, -25, 200, 50));


        // How to Play Button
        const howToPlayButton = this.add.graphics()
            .fillStyle(0xffff00, 1)
            .fillRect(-150, -25, 300, 50); // Centered at (0,0) before positioning
        const howToPlayText = this.add.text(0, 0, 'How to Play', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000'
        }).setOrigin(0.5);

        const howToPlayContainer = this.add.container(width / 2, height / 2 + 70, [howToPlayButton, howToPlayText]);
        howToPlayContainer.setSize(300, 50);
        howToPlayContainer.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('InstructionsScene');
            })
            .on('pointerover', () => howToPlayButton.fillStyle(0xffff50, 1).fillRect(-150, -25, 300, 50))
            .on('pointerout', () => howToPlayButton.fillStyle(0xffff00, 1).fillRect(-150, -25, 300, 50));


        // Simple background
        this.cameras.main.setBackgroundColor('#3498db'); // A blue sky color

        console.log("MenuScene created.");
    }
}
