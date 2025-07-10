// UIScene: Could be used for elements that overlay other scenes, like a pause menu or global score display.
// For now, it might not be heavily used if UI elements are managed within each scene.
// However, creating it as per the project structure.

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: false }); // Set to active:true if it should always run and be visible
    }

    preload() {
        // Load assets for UI elements if they are globally used (e.g., common button sprites, fonts)
    }

    create() {
        // Example: A global pause button, or a settings icon
        // This scene runs on top of other scenes if active.

        // const { width, height } = this.scale;

        // Example: Pause button (if we decide to make it global via UIScene)
        /*
        const pauseButton = this.add.text(width - 50, 20, 'PAUSE', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#fff',
            backgroundColor: '#000000aa',
            padding: { x: 5, y: 5 }
        })
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true });

        pauseButton.on('pointerdown', () => {
            // Find the current active game scene and pause it
            const scenes = this.scene.manager.getScenes(false);
            const gameScene = scenes.find(scene => scene.scene.key === 'GameScene' && scene.scene.isActive());
            if (gameScene) {
                // gameScene.scene.pause();
                // this.scene.launch('PauseMenuScene'); // Example: launch a pause menu
                console.log('Pause button clicked - GameScene would be paused.');
            }
        });
        */

        console.log("UIScene created. Currently not displaying active elements.");
    }

    update() {
        // Update UI elements if needed
    }
}
