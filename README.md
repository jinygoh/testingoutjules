# Project: Connect-A-Bird

## 1. Project Overview

Connect-A-Bird is a 2D, two-player, same-keyboard web game developed in HTML5 and JavaScript (using the Phaser 3 framework). It is a strategic-physics game that merges the core mechanics of "Angry Birds" (trajectory-based launching) and "Connect 4" (four-in-a-row). The game is designed for web game portals like Poki and CrazyGames, with a focus on fast load times, responsive design, and a family-friendly aesthetic.

## 2. Core Gameplay

Players take turns launching their colored "birds" from a slingshot on one side of the screen, aiming to land them in one of the seven columns of a Connect 4 grid on the other side. The first player to get four of their birds in a horizontal, vertical, or diagonal line wins.

### Features:
* **Same-Keyboard 2-Player Controls:** Allows two players to compete on a single keyboard.
* **Physics-Based Puzzles:** Players must account for trajectory and power to place their shots.
* **Dynamic Obstacles:** Simple obstacles between the slingshot and the grid change every few rounds to keep gameplay from becoming repetitive.
* **Special Power-Ups:** Every 5th turn, a player may receive a bird with a special ability, adding a layer of strategy.
* **Full Game Loop:** Includes a title screen, instructions, main game arena, and a win/draw screen.

## 3. How to Play

* **Objective:** Be the first player to connect four of your colored birds in a row.
* **Player 1 (Red):**
    * **Aim:** `W` (up) / `S` (down)
    * **Launch:** Hold and release `Spacebar`
* **Player 2 (Yellow):**
    * **Aim:** `Up Arrow` / `Down Arrow`
    * **Launch:** Hold and release `Enter` or `Right Shift`

## 4. Technical Specifications

* **Engine:** Phaser 3 (or a similar lightweight HTML5 game engine)
* **Language:** JavaScript
* **Platform:** Web Browser (Desktop and Mobile)
* **Resolution:** Responsive design, adaptable to landscape and portrait orientations.
* **Input:** Keyboard is primary.

## 5. Project Structure

The codebase should be modular and well-commented to allow for easy maintenance and future integration of third-party SDKs for monetization and analytics as required by web game portals.

* `index.html`: The main entry point for the game.
* `assets/`: Contains all game assets (images, sounds).
* `src/`: Contains the game's source code, likely broken down into scenes:
    * `PreloaderScene.js`: Handles asset loading.
    * `MenuScene.js`: The main menu.
    * `GameScene.js`: The core gameplay.
    * `UIScene.js`: Renders UI elements over the game.
    * `GameOverScene.js`: The win/draw screen.
