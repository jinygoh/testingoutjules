import PreloaderScene from './PreloaderScene.js';
import MenuScene from './MenuScene.js';
import GameScene from './GameScene.js';
import UIScene from './UIScene.js';
import GameOverScene from './GameOverScene.js';
import InstructionsScene from './InstructionsScene.js'; // Import the new scene

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0.6 },
            debug: false // Set to false for production/final testing
        }
    },
    scene: [PreloaderScene, MenuScene, GameScene, UIScene, GameOverScene, InstructionsScene]
};

// Initialize SDK placeholder (example for CrazyGames SDK)
// window.CrazyGames = { SDK: null }; // Mock if not running in their environment
// function initializeSDK() {
//     if (window.CrazyGames && window.CrazyGames.SDK) {
//         window.CrazyGames.SDK.init()
//             .then(() => console.log("CrazyGames SDK Initialized"))
//             .catch(error => console.error("SDK Initialization failed:", error));
//         // Call other SDK methods like happytime(), gameplayStart(), etc.
//     } else {
//         console.log("CrazyGames SDK not found, running in development mode.");
//     }
// }
// initializeSDK(); // Call this early

const game = new Phaser.Game(config);

console.log("Phaser game instance created.");
