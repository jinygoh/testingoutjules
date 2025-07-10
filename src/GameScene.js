const PLAYER1_CONTROLS = {
    up: 'W',
    down: 'S',
    launch: 'SPACE'
};
const PLAYER2_CONTROLS = {
    up: 'UP',
    down: 'DOWN',
    launch: 'ENTER' // Or 'SHIFT' if we want to support Right Shift specifically. 'ENTER' is simpler.
};

const MIN_ANGLE = -120;
const MAX_ANGLE = -30;  // Degrees, relative to positive X-axis. Upwards-right, more shallow.
const MIN_POWER = 100;
const MAX_POWER = 700; // Max launch power
const POWER_INCREMENT_SPEED = 200; // Power units per second

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        this.currentPlayer = 1; // Player 1 starts
        this.bird = null;
        this.slingshotAngle = -75;
        this.launchPower = MIN_POWER;
        this.isCharging = false;

        this.playerTurnCount = 0; // For special bird power-up
        this.isGhostBirdTurn = false;

        this.slingshotPosition = null;
        this.powerMeter = null;
        this.powerMeterBar = null;
        this.aimLine = null;
    }

    preload() {
        this.load.image('redBird', 'assets/red_bird_placeholder.png');
        this.load.image('yellowBird', 'assets/yellow_bird_placeholder.png');
        this.load.image('obstacle', 'assets/obstacle_placeholder.png');
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#add8e6');
        this.matter.world.setBounds(0, 0, width, height); // Set physics bounds

        this.slingshotPosition = { x: width * 0.15, y: height * 0.70 };

        // Player Turn Indicator
        this.turnText = this.add.text(width / 2, 30, "Player 1's Turn (Red)", {
            fontSize: '24px', fontFamily: 'Arial', color: '#ff0000', align: 'center'
        }).setOrigin(0.5);

        // Score Tracker
        this.scoreText = this.add.text(width - 150, 30, "P1: 0 | P2: 0", {
            fontSize: '20px', fontFamily: 'Arial', color: '#000000',
        }).setOrigin(0.5);

        // Grid (Visual Placeholder)
        this.drawGridPlaceholder(width, height);

        // Slingshot (Visual Placeholder)
        this.drawSlingshotPlaceholder(width, height);

        // Aiming line
        this.aimLine = this.add.graphics({ lineStyle: { width: 2, color: 0xff0000 } });

        // Power Meter
        this.powerMeter = this.add.graphics();
        this.powerMeterBar = this.add.graphics();
        this.updatePowerMeterDisplay();


        // Placeholder Obstacles (make them static matter bodies)
        this.matter.add.image(width * 0.45, height * 0.6, 'obstacle', null, { isStatic: true }).setScale(0.5);
        this.matter.add.image(width * 0.5, height * 0.4, 'obstacle', null, { isStatic: true }).setScale(0.4);

        this.prepareBird();
        this.setupInputHandlers();

        console.log("GameScene created with basic physics and P1 launch setup.");
    }

    drawGridPlaceholder(width, height) {
        const gridX = width * 0.7;
        const gridY = height / 2;
        const columns = 7;
        const rows = 6;
        const cellWidth = 50;
        const cellHeight = 50;
        const gridWidth = columns * cellWidth;
        const gridHeight = rows * cellHeight;

        const gridGraphics = this.add.graphics();
        gridGraphics.fillStyle(0xcccccc, 1);
        gridGraphics.fillRect(gridX - gridWidth / 2, gridY - gridHeight / 2, gridWidth, gridHeight);
        gridGraphics.lineStyle(2, 0x000000, 1);

        for (let i = 0; i <= columns; i++) {
            gridGraphics.moveTo(gridX - gridWidth / 2 + i * cellWidth, gridY - gridHeight / 2);
            gridGraphics.lineTo(gridX - gridWidth / 2 + i * cellWidth, gridY + gridHeight / 2);
        }
        for (let j = 0; j <= rows; j++) {
            gridGraphics.moveTo(gridX - gridWidth / 2, gridY - gridHeight / 2 + j * cellHeight);
            gridGraphics.lineTo(gridX + gridWidth / 2, gridY - gridHeight / 2 + j * cellHeight);
        }
        this.add.text(gridX, gridY - gridHeight/2 - 20, "Connect 4 Grid Area", {fontSize: '16px', color: '#000'}).setOrigin(0.5);
    }

    drawSlingshotPlaceholder(width, height) {
        this.add.circle(this.slingshotPosition.x, this.slingshotPosition.y, 20, 0x8B4513).setOrigin(0.5);
        this.add.rectangle(this.slingshotPosition.x - 15, this.slingshotPosition.y - 40, 10, 40, 0x8B4513).setOrigin(0.5);
        this.add.rectangle(this.slingshotPosition.x + 15, this.slingshotPosition.y - 40, 10, 40, 0x8B4513).setOrigin(0.5);
        this.add.text(this.slingshotPosition.x, this.slingshotPosition.y + 30, "Slingshot", {fontSize: '16px', color: '#000'}).setOrigin(0.5);
    }

    updateAimLine() {
        this.aimLine.clear();
        if (this.bird && !this.bird.isLaunched) {
            const angleRad = Phaser.Math.DegToRad(this.slingshotAngle);
            const length = 50 + (this.launchPower / MAX_POWER) * 50; // Line length indicates power a bit
            const endX = this.bird.x + length * Math.cos(angleRad);
            const endY = this.bird.y + length * Math.sin(angleRad);
            this.aimLine.lineStyle(2, this.currentPlayer === 1 ? 0xff0000 : 0xffff00);
            this.aimLine.beginPath();
            this.aimLine.moveTo(this.bird.x, this.bird.y);
            this.aimLine.lineTo(endX, endY);
            this.aimLine.strokePath();
        }
    }


    prepareBird() {
        if (this.bird && this.bird.active) {
            this.bird.destroy();
        }

        const birdKey = this.currentPlayer === 1 ? 'redBird' : 'yellowBird';
        // Create bird as a Matter physics body
        this.bird = this.matter.add.image(this.slingshotPosition.x, this.slingshotPosition.y - 30, birdKey, null, {
            isSensor: false, // Will detect collisions
            restitution: 0.5, // Bounciness
            friction: 0.5,
            density: 0.01, // Adjust for mass/trajectory
            label: 'bird' // Add a label for collision detection
        });
        this.bird.setCircle(this.bird.width / 2 * 0.7); // Make collision shape circular and match scale
        this.bird.setScale(0.7);
        this.bird.setIgnoreGravity(true);
        this.bird.isLaunched = false;
        this.bird.hasLanded = false;
        this.bird.isGhost = this.isGhostBirdTurn; // Set ghost property
        if (this.bird.isGhost) {
            this.bird.setAlpha(0.7); // Visual cue for ghost bird
            // Make the bird a sensor so it passes through things initially
            // We will handle consuming the ghost power on first obstacle collision
            this.bird.setSensor(true);
            console.log("Ghost Bird prepared!");
        } else {
            this.bird.setAlpha(1.0);
            this.bird.setSensor(false);
        }

        this.launchPower = MIN_POWER;
        this.updateAimLine();
        this.isGhostBirdTurn = false; // Reset for next turn preparation
    }

    setupInputHandlers() {
        // Player 1 listeners
        this.input.keyboard.on(`keydown-${PLAYER1_CONTROLS.up}`, () => {
            if (this.currentPlayer === 1) this.adjustAngle(-2.5);
        });
        this.input.keyboard.on(`keydown-${PLAYER1_CONTROLS.down}`, () => {
            if (this.currentPlayer === 1) this.adjustAngle(2.5);
        });
        this.input.keyboard.on(`keydown-${PLAYER1_CONTROLS.launch}`, () => {
            if (this.currentPlayer === 1 && this.bird && !this.bird.isLaunched && !this.isCharging) {
                this.isCharging = true;
                this.launchPower = MIN_POWER;
            }
        });
        this.input.keyboard.on(`keyup-${PLAYER1_CONTROLS.launch}`, () => {
            if (this.currentPlayer === 1 && this.isCharging) {
                this.isCharging = false;
                this.launchBird();
            }
        });

        // Player 2 listeners
        this.input.keyboard.on(`keydown-${PLAYER2_CONTROLS.up}`, () => {
            if (this.currentPlayer === 2) this.adjustAngle(-2.5);
        });
        this.input.keyboard.on(`keydown-${PLAYER2_CONTROLS.down}`, () => {
            if (this.currentPlayer === 2) this.adjustAngle(2.5);
        });
        this.input.keyboard.on(`keydown-${PLAYER2_CONTROLS.launch}`, () => {
            if (this.currentPlayer === 2 && this.bird && !this.bird.isLaunched && !this.isCharging) {
                this.isCharging = true;
                this.launchPower = MIN_POWER;
            }
        });
        this.input.keyboard.on(`keyup-${PLAYER2_CONTROLS.launch}`, () => {
            if (this.currentPlayer === 2 && this.isCharging) {
                this.isCharging = false;
                this.launchBird();
            }
        });
    }

    adjustAngle(amount) {
        if (this.bird && !this.bird.isLaunched) {
            this.slingshotAngle = Phaser.Math.Clamp(this.slingshotAngle + amount, MIN_ANGLE, MAX_ANGLE);
            this.updateAimLine();
        }
    }

    updatePowerMeterDisplay() {
        const meterWidth = 100;
        const meterHeight = 20;
        const x = this.slingshotPosition.x - meterWidth / 2;
        const y = this.slingshotPosition.y + 50;

        this.powerMeter.clear();
        this.powerMeter.fillStyle(0x000000, 0.5);
        this.powerMeter.fillRect(x, y, meterWidth, meterHeight);

        this.powerMeterBar.clear();
        const powerRatio = (this.launchPower - MIN_POWER) / (MAX_POWER - MIN_POWER);
        this.powerMeterBar.fillStyle(this.currentPlayer === 1 ? 0x00ff00 : 0xffff00, 1); // Color based on player
        this.powerMeterBar.fillRect(x, y, meterWidth * powerRatio, meterHeight);
    }

    launchBird() {
        if (this.bird && !this.bird.isLaunched) {
            this.bird.isLaunched = true;
            this.bird.setIgnoreGravity(false);

            const angleRad = Phaser.Math.DegToRad(this.slingshotAngle);
            const velocityX = this.launchPower * Math.cos(angleRad);
            const velocityY = this.launchPower * Math.sin(angleRad);

            this.bird.setVelocity(velocityX / 40, velocityY / 40);
            this.aimLine.clear();

            console.log(`Player ${this.currentPlayer} launched bird. Power: ${this.launchPower.toFixed(2)}, Angle: ${this.slingshotAngle.toFixed(2)}`);
            // Bird will now fly, collision detection will handle landing or miss.
        }
    }

    // --- Grid Logic ---
    initGrid() {
        this.gridColumns = 7;
        this.gridRows = 6;
        this.cellWidth = 50;
        this.cellHeight = 50;
        this.gridData = [];
        for (let r = 0; r < this.gridRows; r++) {
            this.gridData[r] = Array(this.gridColumns).fill(0); // 0 for empty, 1 for P1, 2 for P2
        }

        // Visual grid properties (already in drawGridPlaceholder, but store them)
        const { width, height } = this.scale;
        this.gridDisplayX = width * 0.7;
        this.gridDisplayY = height / 2;
        this.gridDisplayWidth = this.gridColumns * this.cellWidth;
        this.gridDisplayHeight = this.gridRows * this.cellHeight;

        // Create column sensors (invisible Matter bodies at the top of each column)
        this.columnSensors = [];
        for (let c = 0; c < this.gridColumns; c++) {
            const sensorX = (this.gridDisplayX - this.gridDisplayWidth / 2) + (c * this.cellWidth) + (this.cellWidth / 2);
            const sensorY = this.gridDisplayY - this.gridDisplayHeight / 2 - this.cellHeight / 2; // Slightly above the grid
            const sensor = this.matter.add.rectangle(sensorX, sensorY, this.cellWidth * 0.9, this.cellHeight, {
                isStatic: true,
                isSensor: true, // Doesn't cause physical collision, just triggers events
                label: `columnSensor_${c}`
            });
            this.columnSensors.push(sensor);
        }

        // Group for static grid pieces
        this.gridPieces = this.add.group();
    }

    setupCollisionHandling() {
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;

                let birdBody, otherBody;
                if (bodyA.label === 'bird' && bodyA.gameObject) {
                    birdBody = bodyA;
                    otherBody = bodyB;
                } else if (bodyB.label === 'bird' && bodyB.gameObject) {
                    birdBody = bodyB;
                    otherBody = bodyA;
                } else {
                    return; // Neither is a bird or bird's gameObject is null
                }

                const currentBird = birdBody.gameObject;
                if (!currentBird || currentBird.hasLanded) return;

                // Handle column sensor collision
                if (otherBody.label && otherBody.label.startsWith('columnSensor_')) {
                    const column = parseInt(otherBody.label.split('_')[1]);
                    // If it was a ghost bird, it becomes solid upon entering the column slot.
                    if (currentBird.isGhost) {
                        currentBird.isGhost = false;
                        currentBird.setSensor(false); // Make it solid
                        currentBird.setAlpha(1.0);
                        console.log("Ghost bird became solid entering column slot.");
                        // Important: Re-evaluate collision for this now solid bird with the sensor if needed,
                        // or ensure handleBirdEntersColumn correctly processes it.
                        // For simplicity, we assume the sensor event itself is enough.
                    }
                    this.handleBirdEntersColumn(column);
                }
                // Handle obstacle collision for Ghost Bird
                else if (otherBody.label === 'obstacle' && currentBird.isGhost) {
                    console.log("Ghost Bird passed through an obstacle!");
                    currentBird.isGhost = false; // Consume ghost power
                    currentBird.setSensor(false); // Becomes solid for future collisions
                    currentBird.setAlpha(1.0);    // Visual feedback: becomes solid

                    // To truly pass *through*, the collision should be ignored for this frame.
                    // Since the bird was a sensor, it already passed through.
                    // Now it's made non-sensor, it will collide with the *next* thing.
                    // No need to explicitly ignore pair.isActive here if bird was already sensor.
                }
                // Note: Normal bird vs obstacle is handled by default physics (non-sensor bird hitting static obstacle)
            });
        });
    }


    handleBirdEntersColumn(column) {
        if (this.bird.hasLanded) return; // Already processed

        console.log(`Bird entered column ${column}`);
        let landingRow = -1;
        for (let r = this.gridRows - 1; r >= 0; r--) {
            if (this.gridData[r][column] === 0) {
                landingRow = r;
                break;
            }
        }

        if (landingRow !== -1) {
            this.bird.hasLanded = true;
            this.placePieceInGrid(column, landingRow, this.currentPlayer);
            if (this.bird && this.bird.active) this.bird.destroy(); // Remove the physics bird

            const winningLine = this.checkWin(this.currentPlayer);
            if (winningLine) {
                console.log(`Player ${this.currentPlayer} wins!`);
                // Highlight winningLine on GameOverScene (pass data)
                this.scene.start('GameOverScene', {
                    winner: `Player ${this.currentPlayer}`,
                    winningLine: winningLine,
                    // scores: this.scores // Implement score tracking later
                });
                return; // End turn processing
            }
            if (this.checkDraw()) {
                console.log("It's a draw!");
                this.scene.start('GameOverScene', { winner: 'Draw' });
                return; // End turn processing
            }
            this.switchTurn();
        } else {
            console.log(`Column ${column} is full! Turn forfeited.`);
            this.bird.hasLanded = true; // Mark as processed to prevent multiple entries
            this.bird.destroy(); // Remove the physics bird
            this.switchTurn();
        }
    }

    placePieceInGrid(column, row, player) {
        this.gridData[row][column] = player;

        const pieceX = (this.gridDisplayX - this.gridDisplayWidth / 2) + (column * this.cellWidth) + (this.cellWidth / 2);
        const pieceY = (this.gridDisplayY - this.gridDisplayHeight / 2) + (row * this.cellHeight) + (this.cellHeight / 2);
        const pieceColor = player === 1 ? 0xff0000 : 0xffff00; // Red for P1, Yellow for P2

        const gridPiece = this.add.circle(pieceX, pieceY, this.cellWidth / 2 * 0.8, pieceColor);
        this.gridPieces.add(gridPiece); // Add to a group for easy management if needed

        console.log(`Player ${player} placed piece at [${row}, ${column}]`);

        // Add "clink" sound effect here: // this.sound.play('sfx_clink');
        // Add particle effects here: // this.particles.emitParticleAt(pieceX, pieceY);
        this.cameras.main.shake(100, 0.005); // Game Feel: Screen shake (duration, intensity)
    }


    // Override create to include grid initialization
    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#add8e6');
        this.matter.world.setBounds(0, 0, width, height);

        this.slingshotPosition = { x: width * 0.15, y: height * 0.70 };

        this.turnText = this.add.text(width / 2, 30, "Player 1's Turn (Red)", {
            fontSize: '24px', fontFamily: 'Arial', color: '#ff0000', align: 'center'
        }).setOrigin(0.5);
        this.scoreText = this.add.text(width - 150, 30, "P1: 0 | P2: 0", {
            fontSize: '20px', fontFamily: 'Arial', color: '#000000',
        }).setOrigin(0.5);

        this.initGrid(); // Initialize grid data and sensors
        this.drawGridPlaceholder(width, height); // Still draw the visual grid
        this.drawSlingshotPlaceholder(width, height);

        this.aimLine = this.add.graphics({ lineStyle: { width: 2, color: 0xff0000 } });
        this.powerMeter = this.add.graphics();
        this.powerMeterBar = this.add.graphics();
        this.updatePowerMeterDisplay();

        this.matter.add.image(width * 0.45, height * 0.6, 'obstacle', null, { isStatic: true, label: 'obstacle' }).setScale(0.5);
        this.matter.add.image(width * 0.5, height * 0.4, 'obstacle', null, { isStatic: true, label: 'obstacle' }).setScale(0.4);

        this.prepareBird();
        this.setupInputHandlers();
        this.setupCollisionHandling(); // Setup collision for grid sensors

        console.log("GameScene created with grid logic and P1 launch setup.");
        // SDK call for level/game start
        // if (window.CrazyGames && window.CrazyGames.SDK) {
        //     window.CrazyGames.SDK.gameplayStart();
        //     console.log("SDK: gameplayStart called.");
        // } else {
        //     console.log("Placeholder: SDK gameplayStart would be called here.");
        // }
    }


    update(time, delta) {
        if (this.isCharging) {
            this.launchPower += POWER_INCREMENT_SPEED * (delta / 1000);
            if (this.launchPower > MAX_POWER) {
                this.launchPower = MAX_POWER;
            }
            this.updatePowerMeterDisplay();
            this.updateAimLine();
        }

        if (this.bird && this.bird.isLaunched && !this.bird.hasLanded) {
            if (this.bird.y > this.scale.height + this.bird.displayHeight ||
                this.bird.x < -this.bird.displayWidth ||
                this.bird.x > this.scale.width + this.bird.displayWidth) {

                if (!this.bird.hasLanded) { // Ensure it hasn't already landed in a column
                    console.log("Bird out of bounds or missed. Turn forfeited.");
                    this.bird.hasLanded = true; // Mark as processed
                    if (this.bird && this.bird.active) this.bird.destroy(); // Ensure bird is active before destroying
                    this.switchTurn();
                }
            }
        }
    }

    switchTurn() {
        this.isCharging = false;
        this.playerTurnCount++; // Increment for power-up tracking

        this.time.delayedCall(100, () => {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

            if (this.playerTurnCount % 5 === 0 && this.playerTurnCount > 0) {
                this.isGhostBirdTurn = true;
                console.log(`Player ${this.currentPlayer} gets a GHOST BIRD next turn!`);
            } else {
                this.isGhostBirdTurn = false;
            }

            console.log(`Switching turn to Player ${this.currentPlayer}. Total turns: ${this.playerTurnCount}`);

            const turnMessage = `Player ${this.currentPlayer}'s Turn (${this.currentPlayer === 1 ? 'Red' : 'Yellow'})${this.isGhostBirdTurn ? ' (Ghost Bird!)' : ''}`;
            const turnColor = this.currentPlayer === 1 ? '#ff0000' : '#E6B800'; // A good yellow for text
            this.turnText.setText(turnMessage);
            this.turnText.setColor(turnColor);

            this.slingshotAngle = -75; // Reset angle for next player
            this.launchPower = MIN_POWER; // Reset power for next player
            this.updatePowerMeterDisplay(); // Update power meter color and clear bar

            this.prepareBird(); // Prepare bird for the new current player
        });
    }

    checkWin(player) {
        // Check horizontal
        for (let r = 0; r < this.gridRows; r++) {
            for (let c = 0; c <= this.gridColumns - 4; c++) {
                if (this.gridData[r][c] === player &&
                    this.gridData[r][c + 1] === player &&
                    this.gridData[r][c + 2] === player &&
                    this.gridData[r][c + 3] === player) {
                    return [ // Return coordinates of winning pieces
                        {row: r, col: c}, {row: r, col: c+1},
                        {row: r, col: c+2}, {row: r, col: c+3}
                    ];
                }
            }
        }

        // Check vertical
        for (let c = 0; c < this.gridColumns; c++) {
            for (let r = 0; r <= this.gridRows - 4; r++) {
                if (this.gridData[r][c] === player &&
                    this.gridData[r + 1][c] === player &&
                    this.gridData[r + 2][c] === player &&
                    this.gridData[r + 3][c] === player) {
                    return [
                        {row: r, col: c}, {row: r+1, col: c},
                        {row: r+2, col: c}, {row: r+3, col: c}
                    ];
                }
            }
        }

        // Check diagonal (down-right)
        for (let r = 0; r <= this.gridRows - 4; r++) {
            for (let c = 0; c <= this.gridColumns - 4; c++) {
                if (this.gridData[r][c] === player &&
                    this.gridData[r + 1][c + 1] === player &&
                    this.gridData[r + 2][c + 2] === player &&
                    this.gridData[r + 3][c + 3] === player) {
                    return [
                        {row: r, col: c}, {row: r+1, col: c+1},
                        {row: r+2, col: c+2}, {row: r+3, col: c+3}
                    ];
                }
            }
        }

        // Check diagonal (up-right / down-left)
        for (let r = 3; r < this.gridRows; r++) { // Start from row 3 (0-indexed)
            for (let c = 0; c <= this.gridColumns - 4; c++) {
                if (this.gridData[r][c] === player &&
                    this.gridData[r - 1][c + 1] === player &&
                    this.gridData[r - 2][c + 2] === player &&
                    this.gridData[r - 3][c + 3] === player) {
                    return [
                        {row: r, col: c}, {row: r-1, col: c+1},
                        {row: r-2, col: c+2}, {row: r-3, col: c+3}
                    ];
                }
            }
        }

        return null; // No win detected
    }

    checkDraw() {
        for (let r = 0; r < this.gridRows; r++) {
            for (let c = 0; c < this.gridColumns; c++) {
                if (this.gridData[r][c] === 0) {
                    return false; // Found an empty cell, not a draw
                }
            }
        }
        return true; // All cells are filled, it's a draw
    }
}
