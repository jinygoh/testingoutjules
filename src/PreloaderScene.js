export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloaderScene' });
    }

    preload() {
        // Later: Load all game assets here
        // For now, a placeholder for loading bar
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        let loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        let percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // Simulate asset loading
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            this.scene.start('MenuScene'); // Start MenuScene after loading
        }, this);

        // Simulate loading of a few assets to make the bar move
        // In a real game, you'd list all your assets here
        this.load.image('logo', 'assets/placeholder_logo.png'); // Placeholder - will need to create this
        for (let i = 0; i < 100; i++) { // Simulate loading multiple assets
            this.load.image('dummyAsset' + i, 'assets/placeholder_logo.png');
        }
    }

    create() {
        // Preloader logic is mostly in preload, create is often minimal for this scene
        console.log("PreloaderScene created and assets loaded (simulated). Transitioning to MenuScene.");
    }
}
