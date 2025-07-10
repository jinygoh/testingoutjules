/**
 * Endless Psychedelic Pixel Worlds
 * Main application script for procedural generation and rendering.
 */
console.log("Endless Psychedelic Pixel Worlds - Initializing...");

// --- Core Rendering Parameters ---
const RENDER_WIDTH = 320;    // Internal resolution width for the pixel art generation
const RENDER_HEIGHT = 240;   // Internal resolution height for the pixel art generation
const PIXEL_SCALE = 3;       // Factor by which the low-res canvas is scaled up for display

// --- Canvas Setup ---
const displayCanvas = document.getElementById('displayCanvas'); // The main canvas element visible in HTML
const displayCtx = displayCanvas.getContext('2d');      // 2D context for the visible (scaled-up) display canvas

// Set the actual size of the display canvas based on render dimensions and scale factor
displayCanvas.width = RENDER_WIDTH * PIXEL_SCALE;
displayCanvas.height = RENDER_HEIGHT * PIXEL_SCALE;

// Disable image smoothing on the display canvas to maintain crisp, sharp pixels when scaling up
displayCtx.imageSmoothingEnabled = false;
// Apply vendor prefixes for imageSmoothingEnabled for broader browser compatibility
['mozImageSmoothingEnabled', 'webkitImageSmoothingEnabled', 'msImageSmoothingEnabled'].forEach(prefix => {
    if (displayCtx[prefix] !== undefined) {
        displayCtx[prefix] = false;
    }
});

// Create an off-screen canvas for all low-resolution rendering operations.
// This is where the actual pixel art is drawn before being scaled to the display canvas.
const renderCanvas = document.createElement('canvas');
renderCanvas.width = RENDER_WIDTH;
renderCanvas.height = RENDER_HEIGHT;
const ctx = renderCanvas.getContext('2d'); // This is the primary drawing context for all procedural generation

// --- Global State & Time Management ---
let masterTime = 0; // Continuous global time in seconds, increments each frame. Drives animations and evolutions.
let sceneTime = 0;  // Time in seconds for the current major scene. Resets on major scene changes.
let lastTimestamp = 0; // Timestamp of the last animation frame, used for deltaTime calculation.
let lastMajorSceneChangeTime = 0; // Timestamp of the last major scene change.
const MAJOR_SCENE_EVOLUTION_INTERVAL = 120; // Duration in seconds for each major scene "set" (e.g., 2 minutes).

// --- Main Animation Loop ---
/**
 * The core animation loop, called by requestAnimationFrame.
 * Updates time, triggers scene changes, and calls the main render function.
 * @param {DOMHighResTimeStamp} timestamp - Current time provided by requestAnimationFrame.
 */
function animationLoop(timestamp) {
    if (lastTimestamp === 0) lastTimestamp = timestamp; // Initialize lastTimestamp on the first frame.
    const deltaTime = (timestamp - lastTimestamp) / 1000; // Calculate time elapsed since last frame, in seconds.
    lastTimestamp = timestamp;

    masterTime += deltaTime; // Increment global time.
    sceneTime += deltaTime;  // Increment current scene time.

    // Check if it's time for a major scene evolution.
    if (masterTime - lastMajorSceneChangeTime > MAJOR_SCENE_EVOLUTION_INTERVAL) {
        triggerMajorSceneChange();
    }

    // Placeholder for future global update logic (e.g., complex entity interactions).
    // updateGlobalLogic(deltaTime, masterTime, sceneTime);

    // Render the current state of the world.
    render(deltaTime); // Pass deltaTime for frame-rate independent physics/movement.

    // Request the next animation frame to continue the loop.
    requestAnimationFrame(animationLoop);
}

// Placeholder for potential global update logic
// function updateGlobalLogic(dt, mt, st) { /* ... */ }

/**
 * Main rendering function. Clears the canvas and draws all scene elements in order.
 * @param {number} deltaTime - Time since the last frame in seconds.
 */
function render(deltaTime) {
    // Clear the low-resolution render canvas. This is important if not all layers are opaque.
    ctx.fillStyle = '#000000'; // Base background color, can be overridden by sky.
    ctx.fillRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);

    // Define scroll speeds for different layers
    const skyScrollX = masterTime * (TERRAIN_SCROLL_SPEED * 0.1); // Sky scrolls very slowly
    const mainSceneScrollX = masterTime * TERRAIN_SCROLL_SPEED;
    // FOREGROUND_PARALLAX_FACTOR will be defined later, e.g., 1.5 or 2.0
    // const foregroundScrollX = masterTime * (TERRAIN_SCROLL_SPEED * FOREGROUND_PARALLAX_FACTOR);


    // Layer 1: Deep Sky & Stars
    drawPsychedelicSky(skyScrollX, deltaTime);
    drawStars(skyScrollX, deltaTime); // Draw stars on top of the psychedelic sky

    // Layer 2: Celestial Bodies (Planets)
    // Planets have their own x,y world coordinates and speeds, not strictly tied to a layer's scroll speed here.
    // Their apparent movement is relative to the camera (which is effectively what TERRAIN_SCROLL_SPEED simulates for landscape).
    drawPlanets(deltaTime);

    // Layer 3: Main Scene (Landscape, Flora, Fauna on landscape, Boulders on landscape)
    drawLandscape(mainSceneScrollX);
    drawFlora(mainSceneScrollX);
    drawBoulders(mainSceneScrollX, deltaTime);
    drawFauna(mainSceneScrollX, deltaTime);

    // Layer 4: Foreground Parallax Layer (Entities here scroll faster)
    const foregroundScrollX = masterTime * (TERRAIN_SCROLL_SPEED * FOREGROUND_PARALLAX_FACTOR);
    drawForeground(foregroundScrollX, deltaTime);

    // Final step: Draw the composed low-res renderCanvas to the displayCanvas, scaled up
    displayCtx.drawImage(
        renderCanvas, // Source image: our low-res canvas.
        0, 0, RENDER_WIDTH, RENDER_HEIGHT,         // Source rectangle (entire low-res canvas).
        0, 0, displayCanvas.width, displayCanvas.height // Destination rectangle (entire display canvas, scaled).
    );
}

// --- Sky Rendering ---
const SKY_NOISE_SCALE_X = 0.01;     // Controls the horizontal scale of sky noise patterns.
const SKY_NOISE_SCALE_Y = 0.02;     // Controls the vertical scale of sky noise patterns.
const SKY_TIME_SCALE = 0.05;        // Controls how fast the sky noise evolves/animates over time.
const SKY_ROTATION_SPEED = 0.02;    // Controls how fast the sky noise field rotates.

// Sky color palette, evolves over time and contrasts with landscape
let skyPalette = {
    baseHue: Utils.randomInt(0, 360),
    hueSpread: 100,
    saturationMin: 60,
    saturationMax: 90,
    lightnessMin: 15,
    lightnessMax: 40, // Skys are generally darker
    lastEvolveTime: 0,
    evolveInterval: 22 // seconds, slightly different from others
};

/** Evolves the sky color palette, attempting to contrast with the landscape. */
function evolveSkyPalette(forceContrast = false) {
    if (forceContrast && landscapePalette) { // Ensure landscapePalette is defined
        skyPalette.baseHue = (landscapePalette.baseHue + Utils.randomInt(150, 210)) % 360; // Opposite hue
    } else {
        skyPalette.baseHue = (skyPalette.baseHue + Utils.randomInt(20, 50)) % 360; // Gradual shift
    }
    skyPalette.hueSpread = Utils.randomInt(80, 150);
    skyPalette.saturationMin = Utils.randomInt(50, 70);
    skyPalette.saturationMax = Utils.randomInt(80, 100);
    skyPalette.lightnessMin = Utils.randomInt(10, 25);
    skyPalette.lightnessMax = Utils.randomInt(30, 50);
    skyPalette.lastEvolveTime = masterTime;
    console.log("Sky palette evolved. New base hue:", skyPalette.baseHue);
}


/**
 * Draws a dynamic, psychedelic sky using Perlin noise.
 * The noise field is animated and rotated over time to create a swirling effect.
 * Colors are mapped from noise values using HSL, also evolving with time.
 * @param {number} skyScrollX - The current horizontal scroll offset for the sky layer.
 * @param {number} deltaTime - Time since last frame (not directly used here but good practice for consistency).
 */
function drawPsychedelicSky(skyScrollX, deltaTime) {
    // Evolve sky palette periodically for gradual shifts within a major scene
    if (masterTime - skyPalette.lastEvolveTime > skyPalette.evolveInterval) {
        evolveSkyPalette(false); // false means don't force contrast, just normal evolution
    }

    for (let y = 0; y < RENDER_HEIGHT; y++) {
        for (let x = 0; x < RENDER_WIDTH; x++) {
            // Apply a slow rotation to noise coordinates for a swirling effect.
            const angle = masterTime * SKY_ROTATION_SPEED;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            // Center coordinates for rotation around the canvas center.
            const centeredX = x - RENDER_WIDTH / 2;
            const centeredY = y - RENDER_HEIGHT / 2;
            const rotatedX = centeredX * cosA - centeredY * sinA;
            const rotatedY = centeredX * sinA + centeredY * cosA;

            // Sample 3D Perlin noise (rotated x, rotated y + time-based y-scroll, time-based z-evolution).
            const noiseVal = PerlinNoise.noise(
                (rotatedX + RENDER_WIDTH / 2) * SKY_NOISE_SCALE_X, // Add back center offset before scaling.
                (rotatedY + RENDER_HEIGHT / 2) * SKY_NOISE_SCALE_Y + masterTime * SKY_TIME_SCALE,
                masterTime * SKY_TIME_SCALE * 0.5 // Slower evolution in the "z-dimension" of noise.
            );

            // Normalize noise from approx [-0.7, 0.7] to [0, 1].
            const normalizedNoise = Utils.clamp((noiseVal + 0.7) / 1.4, 0, 1);

            // Map normalized noise to psychedelic HSL color values using skyPalette.
            const hue = (skyPalette.baseHue + (normalizedNoise - 0.5) * skyPalette.hueSpread + masterTime * 5) % 360;
            const saturation = Utils.lerp(skyPalette.saturationMin, skyPalette.saturationMax, normalizedNoise);
            const lightness = Utils.lerp(skyPalette.lightnessMin, skyPalette.lightnessMax, normalizedNoise);

            ctx.fillStyle = Utils.hslToRgbString(hue, Utils.clamp(saturation,0,100), Utils.clamp(lightness,0,100));
            ctx.fillRect(x, y, 1, 1); // Draw the sky pixel.
        }
    }
}

// --- Stars Layer ---
let stars = [];
const NUM_STARS = 150;
const STAR_TWINKLE_SPEED = 0.5;
const STAR_PARALLAX_FACTOR = 0.05; // Very slow parallax for distant stars

function initializeStars() {
    stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
        stars.push({
            x: Math.random(), // Normalized 0-1
            y: Math.random(), // Normalized 0-1
            size: Utils.randomFloat(0.5, 1.5), // Pixel size
            brightness: Utils.randomFloat(0.3, 1.0),
            twinklePhase: Utils.randomFloat(0, Math.PI * 2),
            hue: Utils.randomInt(200, 300), // Bluish, yellowish, whitish
            saturation: Utils.randomInt(10, 40)
        });
    }
    console.log(`${NUM_STARS} stars initialized.`);
}

function drawStars(skyScrollX, deltaTime) {
    if (stars.length === 0) initializeStars(); // Initialize on first call

    stars.forEach(star => {
        // Calculate screen position with very subtle parallax
        const parallaxX = star.x * RENDER_WIDTH - skyScrollX * STAR_PARALLAX_FACTOR;
        const screenX = Math.floor(parallaxX % RENDER_WIDTH); // Wrap around
        const screenY = Math.floor(star.y * RENDER_HEIGHT);

        if (screenX < 0 || screenX >= RENDER_WIDTH || screenY < 0 || screenY >= RENDER_HEIGHT) {
            // Allow wrapping for X, but Y should mostly stay on screen
            // This logic might need refinement if stars can truly go off-screen and respawn
        }

        const twinkle = (Math.sin(masterTime * STAR_TWINKLE_SPEED + star.twinklePhase) + 1) / 2; // 0 to 1
        const currentBrightness = star.brightness * Utils.lerp(0.4, 1.0, twinkle); // Min brightness for twinkle slightly higher
        const currentSize = star.size * Utils.lerp(0.6, 1.0, twinkle);

        if (currentBrightness < 0.25) return; // Increased minimum brightness to draw

        ctx.fillStyle = Utils.hslToRgbString(
            star.hue,
            star.saturation,
            Utils.clamp(currentBrightness * 100, 50, 100) // Make stars generally brighter (higher lightness)
        );

        const s = Math.max(1, Math.floor(currentSize)); // Ensure at least 1 pixel
        if (s === 1) {
            ctx.fillRect(screenX, screenY, 1, 1);
        } else {
            // Draw slightly larger stars as small squares
            ctx.fillRect(screenX - Math.floor(s/2), screenY - Math.floor(s/2), s, s);
        }
    });
}


// --- Celestial Bodies (Planets) ---
const MAX_PLANETS = 3;              // Maximum number of planets visible at once.
let planets = [];                   // Array to store active planet objects.
const PLANET_MIN_SIZE = 10;         // Minimum radius of a planet.
const PLANET_MAX_SIZE = 40;         // Maximum radius of a planet.
const PLANET_TEXTURE_SCALE = 0.05;  // Scale of Perlin noise for planet surface textures.
const PLANET_ROTATION_SPEED_FACTOR = 0.1; // Base factor for planet rotation speed, adjusted by size.
const PLANET_SPAWN_CHANCE = 0.015;   // Increased from 0.01: Chance per frame to spawn a new planet if count is below MAX_PLANETS.

/**
 * Generates properties for a new procedural planet.
 * @returns {object} A planet object with randomized properties.
 */
function generatePlanetProps() {
    const size = Utils.randomInt(PLANET_MIN_SIZE, PLANET_MAX_SIZE);
    return {
        id: masterTime + Math.random(), // Simple unique ID.
        x: 0, // Initial X position, will be set when spawned to be off-screen.
        y: Utils.randomFloat(RENDER_HEIGHT * 0.1, RENDER_HEIGHT * 0.5), // Spawn in the upper part of the sky.
        size: size,
        baseHue: Utils.randomInt(0, 360), // Base color hue for the planet.
        textureSeedX: Utils.randomFloat(0, 1000), // Seed for Perlin noise texture generation.
        textureSeedY: Utils.randomFloat(0, 1000), // Seed for Perlin noise texture generation.
        xSpeed: Utils.randomFloat(2, 10) * (Utils.randomInt(0,1) === 0 ? 1 : -1), // Horizontal speed and direction.
        ySpeed: Utils.randomFloat(-1, 1), // Slight vertical drift.
        rotation: 0, // Current rotation angle.
        rotationSpeed: (PLANET_MAX_SIZE / size) * PLANET_ROTATION_SPEED_FACTOR * (Utils.randomInt(0,1) === 0 ? 1 : -1) // Rotation speed (smaller planets can spin faster).
    };
}

/**
 * Updates, draws, and manages spawning/despawning of planets.
 * @param {number} deltaTime - Time since the last frame in seconds.
 */
function drawPlanets(deltaTime) {
    const dt = deltaTime; // Use passed deltaTime.

    // Update and draw existing planets.
    for (let i = planets.length - 1; i >= 0; i--) {
        const p = planets[i];

        // Update planet position and rotation.
        p.x += p.xSpeed * dt;
        p.y += p.ySpeed * dt;
        p.rotation += p.rotationSpeed * dt;

        // Despawn planet if it moves too far off-screen.
        if (p.x + p.size < -PLANET_MAX_SIZE * 2 || p.x - p.size > RENDER_WIDTH + PLANET_MAX_SIZE * 2) {
            planets.splice(i, 1);
            continue;
        }

        // Draw planet surface pixel by pixel within its circular boundary.
        const halfSize = p.size / 2;
        const startX = Math.floor(p.x - halfSize);
        const startY = Math.floor(p.y - halfSize);
        const endX = Math.ceil(p.x + halfSize);
        const endY = Math.ceil(p.y + halfSize);

        for (let tx = startX; tx < endX; tx++) {
            for (let ty = startY; ty < endY; ty++) {
                // Skip pixels outside render canvas.
                if (tx < 0 || tx >= RENDER_WIDTH || ty < 0 || ty >= RENDER_HEIGHT) continue;

                const distSq = (tx - p.x) * (tx - p.x) + (ty - p.y) * (ty - p.y);
                if (distSq <= halfSize * halfSize) { // Check if pixel is within the planet's circle.
                    // Calculate texture coordinates, applying rotation.
                    const dx = tx - p.x;
                    const dy = ty - p.y;
                    const angle = p.rotation;
                    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
                    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

                    // Generate noise for texture, evolving slowly over time.
                    const noiseVal = PerlinNoise.noise(
                        p.textureSeedX + rotatedX * PLANET_TEXTURE_SCALE,
                        p.textureSeedY + rotatedY * PLANET_TEXTURE_SCALE,
                        masterTime * 0.02 // Slow evolution of texture.
                    );
                    let normalizedNoise = Utils.clamp((noiseVal + 0.7) / 1.4, 0, 1); // Normalize to 0-1.

                    // Increase texture contrast.
                    const contrastNoise = Math.pow(normalizedNoise, 1.8);

                    // Determine pixel color based on planet's baseHue and contrasted noise.
                    const hue = (p.baseHue + contrastNoise * 80 - 40) % 360;
                    const saturation = Utils.clamp(50 + contrastNoise * 50, 40, 100);
                    const lightness = Utils.clamp(30 + contrastNoise * 50, 20, 80);

                    ctx.fillStyle = Utils.hslToRgbString(hue, saturation, lightness);
                    ctx.fillRect(tx, ty, 1, 1); // Draw planet surface pixel.
                }
            }
        }
    }

    // Attempt to spawn new planets.
    if (planets.length < MAX_PLANETS && Math.random() < PLANET_SPAWN_CHANCE) {
         const newPlanet = generatePlanetProps();
         // Ensure new planet starts off-screen to fly into view.
         if (newPlanet.xSpeed > 0) newPlanet.x = -PLANET_MAX_SIZE; // Start from left if moving right.
         else newPlanet.x = RENDER_WIDTH + PLANET_MAX_SIZE;     // Start from right if moving left.
         newPlanet.y = Utils.randomFloat(RENDER_HEIGHT * 0.1, RENDER_HEIGHT * 0.4); // Re-randomize Y for entry.
        planets.push(newPlanet);
    }
}

// --- Landscape Generation ---
const TERRAIN_SCROLL_SPEED = 5;             // Horizontal scroll speed of the terrain (units per second related to masterTime).
const TERRAIN_NOISE_SCALE_X = 0.02;         // Scale for base horizontal terrain noise.
const TERRAIN_NOISE_SCALE_Y_DETAIL = 0.08;  // Scale for finer detail/distortion noise on terrain.
const TERRAIN_HEIGHT_BASE = RENDER_HEIGHT * 0.7; // Average y-coordinate for the ground level.
const TERRAIN_HEIGHT_VARIATION = RENDER_HEIGHT * 0.25; // Maximum height variation of terrain from its base.

// Landscape color palette, evolves over time.
let landscapePalette = { // This will also be used by river for now, with modifications
    baseHue: Utils.randomInt(0, 360),
    hueSpread: 90,          // Range of hues around the baseHue.
    saturation: 70,
    lightnessMin: 20,
    lightnessMax: 50,
    lastEvolveTime: 0,      // Time of last palette evolution.
    evolveInterval: 20      // Interval in seconds to evolve the palette.
};

/** Evolves the landscape's color palette. */
function evolveLandscapePalette() {
    landscapePalette.baseHue = (landscapePalette.baseHue + Utils.randomInt(30, 90)) % 360;
    landscapePalette.hueSpread = Utils.randomInt(60, 120);
    landscapePalette.saturation = Utils.randomInt(60, 90);
    landscapePalette.lightnessMin = Utils.randomInt(15, 30);
    landscapePalette.lightnessMax = Utils.randomInt(40, 60);
    landscapePalette.lastEvolveTime = masterTime;
    console.log("Landscape palette evolved. New base hue:", landscapePalette.baseHue);
}

// --- River Parameters ---
const RIVER_NOISE_SCALE = 0.008;    // Controls the waviness of the river path.
const RIVER_WIDTH_MAX = 15;         // Max width of the river in pixels.
const RIVER_WIDTH_MIN = 5;          // Min width of the river.
const RIVER_CENTER_Y_BASE = RENDER_HEIGHT * 0.75; // Average Y position of river centerline.
const RIVER_CENTER_Y_VARIATION = RENDER_HEIGHT * 0.1; // How much river centerline can move up/down.
const RIVER_BED_DEPTH = 8;         // How much deeper the riverbed is than surrounding terrain surface.
let currentRiverWidth = Utils.randomInt(RIVER_WIDTH_MIN, RIVER_WIDTH_MAX);
let riverPathSeed = Utils.randomFloat(0,1000); // Changes with major scene change

/**
 * Draws the scrolling, procedurally generated landscape, including a river.
 * @param {number} currentScrollX - The current horizontal scroll offset for this layer.
 */
function drawLandscape(currentScrollX) {
    // Evolve landscape palette periodically.
    if (masterTime - landscapePalette.lastEvolveTime > landscapePalette.evolveInterval) {
        evolveLandscapePalette();
    }

    // Iterate over each vertical column of the render canvas.
    for (let x = 0; x < RENDER_WIDTH; x++) {
        const worldX = x + currentScrollX; // World x-coordinate for noise sampling.

        // --- Terrain Shape Calculation ---
        const noiseXForShape = worldX * TERRAIN_NOISE_SCALE_X;
        let baseNoise = PerlinNoise.noise(noiseXForShape, 10.5);
        let detailNoise = PerlinNoise.noise(
            noiseXForShape * 2.5,
            worldX * TERRAIN_NOISE_SCALE_Y_DETAIL + 50.2,
            masterTime * 0.1
        );
        let combinedTerrainNoise = baseNoise + detailNoise * 0.35;
        combinedTerrainNoise = Utils.clamp((combinedTerrainNoise + 0.7) / 1.4, 0, 1);
        const terrainSurfaceY = Math.floor(TERRAIN_HEIGHT_BASE - combinedTerrainNoise * TERRAIN_HEIGHT_VARIATION);

        // --- River Path & Bed Calculation ---
        const riverCenterYNoise = PerlinNoise.noise(worldX * RIVER_NOISE_SCALE, riverPathSeed + masterTime * 0.01); // Slowly evolving river path
        let riverCenterY = RIVER_CENTER_Y_BASE + riverCenterYNoise * RIVER_CENTER_Y_VARIATION;
        // Ensure river is generally below average terrain height to be visible
        riverCenterY = Math.max(riverCenterY, terrainSurfaceY + currentRiverWidth * 0.3);
        riverCenterY = Math.min(riverCenterY, RENDER_HEIGHT - currentRiverWidth);


        const halfRiverWidth = currentRiverWidth / 2;
        const riverTopEdge = riverCenterY - halfRiverWidth;
        const riverBottomEdge = riverCenterY + halfRiverWidth;
        // Riverbed is deeper than the calculated terrain surface at that X, but within river bounds
        const riverBedFinalY = Math.max(terrainSurfaceY + RIVER_BED_DEPTH, riverTopEdge);


        // --- Pixel Rendering Loop (for column x) ---
        for (let y = 0; y < RENDER_HEIGHT; y++) {
            // Skip pixels above the calculated terrain surface for this column
            if (y < terrainSurfaceY && y < riverTopEdge) { // Also check against riverTopEdge if river is higher than terrain
                continue;
            }

            // Check if current pixel (x,y) is part of the river
            const isRiverPixel = (y >= riverTopEdge && y <= riverBottomEdge && y >= riverBedFinalY);

            if (isRiverPixel) {
                // --- River Pixel Rendering ---
                const riverDepthFactor = Utils.clamp(Utils.mapRange(y, riverBedFinalY, riverBottomEdge, 1, 0.2), 0.2, 1); // Darker at bottom
                const riverSurfaceNoise = PerlinNoise.noise(worldX * 0.15 + masterTime * 0.3, y * 0.1 + masterTime * 0.2); // Animated surface
                const normalizedRiverNoise = Utils.clamp((riverSurfaceNoise + 0.7) / 1.4, 0, 1);

                const riverHue = (landscapePalette.baseHue + 180 + Utils.lerp(-20, 20, normalizedRiverNoise)) % 360;
                const riverSaturation = Utils.clamp(landscapePalette.saturation * 0.9 + Utils.lerp(-10, 10, normalizedRiverNoise), 50, 90);
                const riverLightness = Utils.clamp( (skyPalette.lightnessMin + skyPalette.lightnessMax)/2 * riverDepthFactor + Utils.lerp(-5, 5, normalizedRiverNoise), 10, 45);


                ctx.fillStyle = Utils.hslToRgbString(riverHue, riverSaturation, riverLightness);
                ctx.fillRect(x, y, 1, 1);
            } else if (y >= terrainSurfaceY) {
                // --- Terrain Pixel Rendering (not river) ---
                const depthFactor = Utils.mapRange(y, terrainSurfaceY, RENDER_HEIGHT, 0, 1);
                const colorNoiseVal = PerlinNoise.noise(worldX * 0.05, y * 0.05, masterTime * 0.03);
                const normalizedColorNoise = Utils.clamp((colorNoiseVal + 0.7) / 1.4, 0, 1);

                const hue = (landscapePalette.baseHue +
                             (normalizedColorNoise - 0.5) * landscapePalette.hueSpread +
                             depthFactor * 20) % 360;
                const saturation = landscapePalette.saturation;
                let lightness = Utils.lerp(landscapePalette.lightnessMax, landscapePalette.lightnessMin, depthFactor * 0.8 + normalizedColorNoise * 0.2);

                const hazeFactor = Utils.clamp(Utils.mapRange(y, RENDER_HEIGHT * 0.8, RENDER_HEIGHT, 0, 0.6), 0, 0.6);
                const atmosphericHue = (landscapePalette.baseHue + 180) % 360;
                const atmosphericSaturation = landscapePalette.saturation * 0.5;
                const atmosphericLightness = landscapePalette.lightnessMin * 0.8;

                const finalHue = Utils.lerp(hue, atmosphericHue, hazeFactor);
                const finalSaturation = Utils.lerp(saturation, atmosphericSaturation, hazeFactor);
                lightness = Utils.lerp(lightness, atmosphericLightness, hazeFactor * 1.5);

                ctx.fillStyle = Utils.hslToRgbString(finalHue, finalSaturation, Utils.clamp(lightness, 5, 85));
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

// --- Alien Plant Generation (Flora) ---
let flora = [];                     // Array to store active plant objects.
const MAX_FLORA = 50;               // Maximum number of plants on screen.
const FLORA_SPAWN_CHANCE = 0.03;    // Increased from 0.02: Chance per frame to spawn a new plant if below max.
const PLANT_OFFSCREEN_BUFFER = 50;  // Buffer distance off-screen before despawning plants.

// Defines different types of plants that can be generated.
const PLANT_TYPES = {
    TALL_SPIRE: 'TALL_SPIRE',
    GLOW_ORB_STALK: 'GLOW_ORB_STALK',
    CRYSTAL_CLUSTER: 'CRYSTAL_CLUSTER',
    FLAT_CAP_MUSHROOM: 'FLAT_CAP_MUSHROOM',
    TENDRIL_PLANT: 'TENDRIL_PLANT'
};

// Flora color palette, evolves over time.
let floraPalette = {
    baseHue: Utils.randomInt(0,360),
    hueSpread: 60,
    saturation: 80,
    lightnessMin: 40,
    lightnessMax: 70,
    lastEvolveTime: 0,
    evolveInterval: 15 // seconds
};

/** Evolves the flora color palette. */
function evolveFloraPalette() {
    floraPalette.baseHue = (floraPalette.baseHue + Utils.randomInt(20, 70)) % 360;
    floraPalette.hueSpread = Utils.randomInt(40, 90);
    floraPalette.saturation = Utils.randomInt(70, 95);
    floraPalette.lastEvolveTime = masterTime;
    console.log("Flora palette evolved. New base hue:", floraPalette.baseHue);
}

/**
 * Calculates the terrain height at a specific world x-coordinate.
 * This is crucial for placing flora correctly on the scrolling landscape.
 * @param {number} worldX - The world x-coordinate.
 * @returns {number} The y-coordinate of the terrain surface at worldX.
 */
function getTerrainHeightAt(worldX, scrollXForNoiseConsistency) {
    // Replicates terrain height calculation from drawLandscape.
    // scrollXForNoiseConsistency is passed to ensure that the detail noise which uses masterTime
    // is consistent with the current view of the landscape if that's desired.
    // However, for placing static objects, masterTime in detailNoise is fine.
    const noiseXForShape = worldX * TERRAIN_NOISE_SCALE_X;
    let baseNoise = PerlinNoise.noise(noiseXForShape, 10.5); // Base shape, doesn't need masterTime sync for placement

    // Detail noise for terrain surface - this is what makes it dynamic.
    // When placing an object, we want its height based on the *current* appearance of this detail.
    let detailNoise = PerlinNoise.noise(
        noiseXForShape * 2.5,
        worldX * TERRAIN_NOISE_SCALE_Y_DETAIL + 50.2,
        masterTime * 0.1 // Use current masterTime to get current state of evolving detail
    );
    let combinedNoise = baseNoise + detailNoise * 0.35;
    combinedNoise = Utils.clamp((combinedNoise + 0.7) / 1.4, 0, 1);
    return TERRAIN_HEIGHT_BASE - combinedNoise * TERRAIN_HEIGHT_VARIATION;
}

/**
 * Spawns a new alien plant for the main landscape layer.
 * @param {number} mainSceneScrollX - The current scroll offset of the main scene.
*/
function spawnPlant(mainSceneScrollX) {
    // Attempt to spawn plants just off-screen to the right.
    const screenXForSpawn = RENDER_WIDTH + PLANT_OFFSCREEN_BUFFER / 2;
    // Calculate the worldX where the plant should be placed.
    const worldX = screenXForSpawn + mainSceneScrollX;

    const terrainSurfaceY = getTerrainHeightAt(worldX, mainSceneScrollX);

    // Avoid spawning plants too low or too high on sharp peaks.
    if (terrainSurfaceY > RENDER_HEIGHT - 10 || terrainSurfaceY < RENDER_HEIGHT * 0.40) { // Keep this threshold
         return null;
    }

    // Check for steep slopes/peaks to prevent floating
    const slopeCheckOffset = 3; // Check 3 pixels to the left/right
    const heightLeft = getTerrainHeightAt(worldX - slopeCheckOffset, mainSceneScrollX);
    const heightRight = getTerrainHeightAt(worldX + slopeCheckOffset, mainSceneScrollX);
    const maxSlopeDifference = 5; // Max allowed height difference to consider it "spawnable"

    if (Math.abs(terrainSurfaceY - heightLeft) > maxSlopeDifference ||
        Math.abs(terrainSurfaceY - heightRight) > maxSlopeDifference) {
        return null; // Too steep or on a sharp peak
    }

    // Check if this location is river, if so, don't spawn (or spawn aquatic type later)
    const riverCenterYNoise = PerlinNoise.noise(worldX * RIVER_NOISE_SCALE, riverPathSeed + masterTime * 0.01);
    let riverCenterY = RIVER_CENTER_Y_BASE + riverCenterYNoise * RIVER_CENTER_Y_VARIATION;
    riverCenterY = Math.max(riverCenterY, terrainSurfaceY + currentRiverWidth * 0.3);
    riverCenterY = Math.min(riverCenterY, RENDER_HEIGHT - currentRiverWidth);
    const halfRiverWidth = currentRiverWidth / 2;
    const riverTopEdge = riverCenterY - halfRiverWidth;
    // const riverBottomEdge = riverCenterY + halfRiverWidth; // Not strictly needed for spawn check against surface
    const riverBedFinalY = Math.max(terrainSurfaceY + RIVER_BED_DEPTH, riverTopEdge);


    // If the terrain surface itself IS the riverbed/water surface at this X.
    // This means the plant would spawn *in* the water.
    if (terrainSurfaceY >= riverTopEdge && terrainSurfaceY <= riverBedFinalY + halfRiverWidth*2) { // Check if terrainY is within river bounds
         // Added halfRiverWidth*2 to riverBedFinalY to give some leeway for river banks
        return null; // Don't spawn normal plants in river
    }


    const plantTypeKeys = Object.keys(PLANT_TYPES);
    const type = Utils.randomElement(plantTypeKeys);

    const plant = {
        id: masterTime + Math.random(),
        type: type,
        worldX: worldX,
        y: terrainSurfaceY, // Base y-position on the terrain surface.
        size: Utils.randomFloat(5, 15),
        hue: (floraPalette.baseHue + Utils.randomFloat(-floraPalette.hueSpread/2, floraPalette.hueSpread/2)) % 360,
        createdAt: masterTime
    };
    plant.y -= plant.size; // Adjust so plant base is at terrainSurfaceY.

    return plant;
}

/**
 * Updates, draws, and manages spawning/despawning of flora on a given layer.
 * @param {number} currentScrollX - The current horizontal scroll offset for this layer.
 */
function drawFlora(currentScrollX) {
    // Evolve flora color palette periodically.
    if (masterTime - floraPalette.lastEvolveTime > floraPalette.evolveInterval) {
        evolveFloraPalette();
    }

    // Attempt to spawn new plants (using the main scene's scroll for placement reference).
    if (flora.length < MAX_FLORA && Math.random() < FLORA_SPAWN_CHANCE) {
        // For now, all flora spawns relative to main scene scroll.
        // This might need adjustment if flora is on layers with different scroll speeds,
        // or have separate spawnPlantForLayerX functions.
        const newPlant = spawnPlant(currentScrollX);
        if (newPlant) flora.push(newPlant);
    }

    // Update and draw existing plants.
    for (let i = flora.length - 1; i >= 0; i--) {
        const p = flora[i];
        // Calculate plant's current on-screen x-coordinate based on the layer's scroll.
        const screenX = Math.floor(p.worldX - currentScrollX);

        // Despawn if scrolled too far off-screen to the left.
        if (screenX < -PLANT_OFFSCREEN_BUFFER) {
            flora.splice(i, 1);
            continue;
        }

        // Don't draw if currently off-screen to the right (will scroll into view).
        if (screenX > RENDER_WIDTH + PLANT_OFFSCREEN_BUFFER) {
            continue;
        }

        // Evolve plant's hue based on its age.
        const age = masterTime - p.createdAt;
        const dynamicHue = (p.hue + age * 5) % 360;

        // Call the appropriate drawing function based on plant type.
        switch (p.type) {
            case PLANT_TYPES.TALL_SPIRE:
                drawTallSpire(p, screenX, dynamicHue);
                break;
            case PLANT_TYPES.GLOW_ORB_STALK:
                drawGlowOrbStalk(p, screenX, dynamicHue);
                break;
            case PLANT_TYPES.CRYSTAL_CLUSTER:
                drawCrystalCluster(p, screenX, dynamicHue);
                break;
            case PLANT_TYPES.FLAT_CAP_MUSHROOM:
                drawFlatCapMushroom(p, screenX, dynamicHue);
                break;
            case PLANT_TYPES.TENDRIL_PLANT:
                drawTendrilPlant(p, screenX, dynamicHue);
                break;
            default: // Fallback for unknown types.
                ctx.fillStyle = Utils.hslToRgbString(dynamicHue, floraPalette.saturation, Utils.randomElement([50,60]));
                ctx.fillRect(screenX - Math.floor(p.size/4), Math.floor(p.y - p.size), Math.floor(p.size/2), Math.floor(p.size));
        }
    }
}

// --- Individual Plant Drawing Functions ---

function drawFlatCapMushroom(plant, screenX, hue) {
    const stalkHeight = plant.size * Utils.randomFloat(0.8, 1.2);
    const stalkWidth = Math.max(2, Math.floor(plant.size / 3));
    const capRadius = plant.size * Utils.randomFloat(1.0, 1.8); // Wider cap
    const capThickness = Math.max(2, plant.size * 0.2);
    const screenY = Math.floor(plant.y + plant.size); // Base of stalk

    // Stalk
    const stalkL = Utils.clamp(floraPalette.lightnessMin + 10, 30, 60);
    ctx.fillStyle = Utils.hslToRgbString((hue + 10) % 360, floraPalette.saturation - 15, stalkL);
    ctx.fillRect(Math.floor(screenX - stalkWidth / 2), Math.floor(screenY - stalkHeight), stalkWidth, Math.floor(stalkHeight));

    // Cap (draw as a squashed ellipse / wide rectangle)
    const capY = Math.floor(screenY - stalkHeight - capThickness / 2);
    const capL = Utils.clamp(floraPalette.lightnessMax - 10, 40, 70);
    ctx.fillStyle = Utils.hslToRgbString(hue, floraPalette.saturation, capL);

    // Pixel-by-pixel for cap for rounded edges, or just a wide rect for simpler pixel art
    const capStartX = Math.floor(screenX - capRadius);
    const capEndX = Math.floor(screenX + capRadius);
    for (let cx = capStartX; cx < capEndX; cx++) {
        // Optional: slight curve to cap, for now simple rectangle
        for (let cy = Math.floor(capY - capThickness/2); cy < Math.floor(capY + capThickness/2); cy++) {
             if (cx >=0 && cx < RENDER_WIDTH && cy >=0 && cy < RENDER_HEIGHT) {
                // Add some noise for spots/texture on cap
                const spotNoise = PerlinNoise.noise(cx * 0.1 + plant.id, cy * 0.1 + plant.id, masterTime * 0.1);
                let spotL = capL;
                if (spotNoise > 0.3) { // Threshold for spots
                    spotL = capL + Utils.randomFloat(10, 20) * (spotNoise - 0.3);
                }
                ctx.fillStyle = Utils.hslToRgbString(hue, floraPalette.saturation, Utils.clamp(spotL, 30, 85));
                ctx.fillRect(cx, cy, 1, 1);
            }
        }
    }
}

function drawTendrilPlant(plant, screenX, hue) {
    const numTendrils = Utils.randomInt(3, 6);
    const tendrilMaxLength = plant.size * Utils.randomFloat(2.0, 4.0);
    const baseScreenY = Math.floor(plant.y + plant.size * 0.7); // Base slightly above ground for root point

    for (let i = 0; i < numTendrils; i++) {
        const angle = (i / numTendrils) * (Math.PI * 2) + plant.id + masterTime * 0.1 * (i % 2 === 0 ? 1 : -1); // Base angle + slow rotation
        const currentMaxLength = tendrilMaxLength * Utils.mapRange(Math.sin(masterTime * 1.5 + plant.id + i * 0.8), -1, 1, 0.7, 1.0); // Pulsating length

        let lastX = screenX;
        let lastY = baseScreenY;

        for (let seg = 0; seg < currentMaxLength; seg += 2) { // Draw segments
            const segmentAngle = angle + Math.sin(seg * 0.1 + masterTime * 2 + i) * 0.5; // Wavy tendrils
            const nextX = lastX + Math.cos(segmentAngle) * 2;
            const nextY = lastY + Math.sin(segmentAngle) * 2;

            const L = Utils.lerp(floraPalette.lightnessMax, floraPalette.lightnessMin, seg / currentMaxLength);
            ctx.fillStyle = Utils.hslToRgbString((hue + seg * 2) % 360, floraPalette.saturation, Utils.clamp(L, 20, 80));

            // Simple line of pixels (could be improved with Bresenham)
            if (Math.floor(nextX) >= 0 && Math.floor(nextX) < RENDER_WIDTH && Math.floor(nextY) >= 0 && Math.floor(nextY) < RENDER_HEIGHT) {
                 ctx.fillRect(Math.floor(nextX), Math.floor(nextY), 1, 1);
            }
            if (Math.floor(lastX) >= 0 && Math.floor(lastX) < RENDER_WIDTH && Math.floor(lastY) >= 0 && Math.floor(lastY) < RENDER_HEIGHT) {
                 ctx.fillRect(Math.floor(lastX), Math.floor(lastY), 1, 1); // ensure connection
            }
            lastX = nextX;
            lastY = nextY;
            if (seg > currentMaxLength * 0.3 && Math.random() < 0.05) break; // Occasionally shorten a tendril
        }
    }
}


/** Draws a TALL_SPIRE plant type with pulsating size and color. */
function drawTallSpire(plant, screenX, hue) {
    const pulseFactor = (Math.sin(masterTime * 2.5 + plant.id) + 1) / 2; // 0 to 1 pulsation.
    const baseWidth = Math.max(1, Math.floor(plant.size / 3 + pulseFactor * 2 - 1)); // Width pulsates.
    const height = Math.floor(plant.size * Utils.mapRange(pulseFactor, 0, 1, 1.4, 2.8)); // Height also pulses.
    const screenY = Math.floor(plant.y + plant.size); // Adjust screenY because plant.y was set to top

    for (let i = 0; i < height; i++) { // Draw from base upwards.
        const currentWidth = Math.max(1, Math.floor(baseWidth * ((height - i) / height))); // Tapering width.
        const yPos = screenY - i;
        if (yPos < 0 || yPos >= RENDER_HEIGHT || screenX - Math.floor(currentWidth/2) >= RENDER_WIDTH || screenX + Math.ceil(currentWidth/2) < 0) continue;

        const L = Utils.clamp(floraPalette.lightnessMin + ((height - i) / height) * (floraPalette.lightnessMax - floraPalette.lightnessMin) + Utils.randomInt(-5,5) + pulseFactor*5, 10, 90);
        ctx.fillStyle = Utils.hslToRgbString(hue, floraPalette.saturation, L);
        ctx.fillRect(screenX - Math.floor(currentWidth / 2), yPos, currentWidth, 1);
    }
}

/** Draws a GLOW_ORB_STALK plant type with a bobbing, pulsating orb. */
function drawGlowOrbStalk(plant, screenX, hue) {
    const stalkHeight = Math.floor(plant.size * 1.2);
    const stalkWidth = Math.max(1, Math.floor(plant.size / 4));
    const orbRadius = Math.floor(plant.size / 1.5);
    const screenY = Math.floor(plant.y + plant.size); // Base of the stalk is at plant.y + plant.size

    // Draw stalk.
    ctx.fillStyle = Utils.hslToRgbString((hue + 20) % 360, floraPalette.saturation - 20, floraPalette.lightnessMin + 10);
    ctx.fillRect(screenX - Math.floor(stalkWidth/2), screenY - stalkHeight, stalkWidth, stalkHeight);

    // Orb properties.
    const orbX = screenX;
    const orbY = screenY - stalkHeight - orbRadius + Math.sin(masterTime * 2 + plant.id) * 2; // Gentle bobbing.

    const pulse = (Math.sin(masterTime * 3 + plant.id * 0.5) + 1) / 2; // 0 to 1 pulsation.
    const orbLightness = floraPalette.lightnessMax - 10 + pulse * 20;
    const orbSaturation = floraPalette.saturation + pulse * 10;

    // Draw orb pixel by pixel for a round pixel art look.
    const currentOrbRadius = Math.max(1, Math.floor(orbRadius));
    for (let dx = -currentOrbRadius; dx <= currentOrbRadius; dx++) {
        for (let dy = -currentOrbRadius; dy <= currentOrbRadius; dy++) {
            if (dx*dx + dy*dy <= currentOrbRadius*currentOrbRadius) { // Check if inside circle.
                const px = Math.floor(orbX + dx);
                const py = Math.floor(orbY + dy);
                if (px >=0 && px < RENDER_WIDTH && py >=0 && py < RENDER_HEIGHT) {
                     ctx.fillStyle = Utils.hslToRgbString(hue, Utils.clamp(orbSaturation, 70, 100), Utils.clamp(orbLightness, 40,95));
                     ctx.fillRect(px, py, 1, 1);
                }
            }
        }
    }
}

/** Draws a CRYSTAL_CLUSTER plant type with multiple pulsating crystals. */
function drawCrystalCluster(plant, screenX, hue) {
    const numCrystals = Utils.randomInt(3, 7);
    const clusterRadius = plant.size * 0.8;
    const baseScreenY = Math.floor(plant.y + plant.size); // Base of the cluster

    for (let i = 0; i < numCrystals; i++) {
        const angle = (i / numCrystals) * Math.PI * 2 + plant.id; // Vary angle per crystal.
        const dist = Utils.randomFloat(0, clusterRadius);
        const cX = screenX + Math.cos(angle) * dist;
        // Crystals sit on the ground, y is baseScreenY adjusted by sine to spread them a bit vertically too.
        const cY = baseScreenY - Math.abs(Math.sin(angle) * dist * 0.3);

        const pulse = (Math.sin(masterTime * 2.2 + plant.id + i * 0.5) + 1) / 2; // 0 to 1, varies per crystal.
        const crystalWidth = Math.max(1, Math.floor(plant.size / Utils.mapRange(pulse,0,1,1.8,3.5)));
        const crystalHeight = Math.floor(plant.size * Utils.mapRange(pulse,0,1,0.4,1.3));

        const L = Utils.lerp(floraPalette.lightnessMin, floraPalette.lightnessMax, pulse * 0.7 + 0.1); // Lightness also pulses.

        ctx.fillStyle = Utils.hslToRgbString((hue + i*10)%360, floraPalette.saturation, Utils.clamp(L,15,85));
        ctx.fillRect(Math.floor(cX - crystalWidth/2), Math.floor(cY-crystalHeight), crystalWidth, crystalHeight);
    }
}


// --- Alien Animal Generation (Fauna) ---
let faunaList = [];                 // Array to store active animal objects.
const MAX_FAUNA = 10;               // Maximum number of animals on screen.
const FAUNA_SPAWN_CHANCE = 0.008;   // Increased from 0.005: Chance per frame to spawn new fauna.
const FAUNA_OFFSCREEN_BUFFER = 100; // Buffer distance off-screen before despawning animals.

// Defines different types of animals that can be generated.
const FAUNA_TYPES = {
    FLOATER: 'FLOATER',
    BIRD_FLOCKER: 'BIRD_FLOCKER',
    CRAWLER: 'CRAWLER',
};

// Fauna color palette, evolves over time.
let faunaPalette = {
    baseHue: Utils.randomInt(0,360),
    hueSpread: 40,
    saturation: 75,
    lightnessMin: 50,
    lightnessMax: 80,
    lastEvolveTime: 0,
    evolveInterval: 25 // seconds
};

/** Evolves the fauna color palette. */
function evolveFaunaPalette() {
    faunaPalette.baseHue = (faunaPalette.baseHue + Utils.randomInt(40, 100)) % 360;
    faunaPalette.hueSpread = Utils.randomInt(30, 70);
    faunaPalette.saturation = Utils.randomInt(65, 90);
    faunaPalette.lastEvolveTime = masterTime;
    console.log("Fauna palette evolved. New base hue:", faunaPalette.baseHue);
}

/**
 * Spawns a new alien animal.
 * @param {number} currentLayerScrollX - The scroll offset of the layer this animal will belong to.
 *                                      Used to determine initial worldX for off-screen spawning.
 */
function spawnFauna(currentLayerScrollX) {
    const type = Utils.randomElement(Object.keys(FAUNA_TYPES)); // Currently only FLOATER.
    let animal = {
        id: masterTime + Math.random(), // Unique ID.
        type: type,
        worldX: 0, // Initial world x-position, set based on spawn side and layer scroll.
        y: 0,      // Initial y-position, set based on type.
        size: Utils.randomFloat(4, 12), // Base size of the animal.
        hue: (faunaPalette.baseHue + Utils.randomFloat(-faunaPalette.hueSpread/2, faunaPalette.hueSpread/2)) % 360,
        createdAt: masterTime,  // Timestamp of creation.
        vx: 0,                  // Horizontal velocity relative to its layer's movement.
        vy: 0,                  // Vertical velocity.
        targetY: 0,             // Target y-position for floaters.
        phaseOffset: Utils.randomFloat(0, Math.PI * 2) // Offset for movement patterns.
    };

    // Determine spawn side (left or right, off-screen) relative to the specified layer's scroll.
    const spawnFromLeft = Utils.randomInt(0,1) === 0;

    if (spawnFromLeft) {
        animal.worldX = -FAUNA_OFFSCREEN_BUFFER / 2 + currentLayerScrollX; // Start left relative to layer.
        animal.vx = Utils.randomFloat(5, 15); // Animal's own movement speed.
    } else {
        animal.worldX = RENDER_WIDTH + FAUNA_OFFSCREEN_BUFFER / 2 + currentLayerScrollX; // Start right.
        animal.vx = Utils.randomFloat(-15, -5);
    }

    // Type-specific spawning properties.
    if (animal.type === FAUNA_TYPES.FLOATER) {
        animal.y = Utils.randomFloat(RENDER_HEIGHT * 0.1, RENDER_HEIGHT * 0.6); // Sky area for floaters
        animal.targetY = animal.y;
        animal.vy = Utils.randomFloat(-5, 5);
    } else if (animal.type === FAUNA_TYPES.BIRD_FLOCKER) {
        animal.size = Utils.randomFloat(3, 6); // Birds are smaller
        animal.y = Utils.randomFloat(RENDER_HEIGHT * 0.05, RENDER_HEIGHT * 0.4); // Higher in sky
        animal.targetY = animal.y; // Will use for slight altitude changes
        // Birds generally fly faster horizontally
        if (animal.vx > 0) animal.vx = Utils.randomFloat(20, 40);
        else animal.vx = Utils.randomFloat(-40, -20);
        animal.vy = Utils.randomFloat(-3, 3); // Slower vertical changes
        animal.wingPhase = Utils.randomFloat(0, Math.PI * 2);
        animal.maxSpeed = Utils.randomFloat(20, 35); // Adjusted bird speed
        animal.maxForce = Utils.randomFloat(0.2, 0.6);
        animal.perceptionRadius = Utils.randomFloat(25, 50);
    } else if (animal.type === FAUNA_TYPES.CRAWLER) {
        animal.size = Utils.randomFloat(2, 4); // Segment size
        animal.numSegments = Utils.randomInt(5, 10);
        animal.segmentSpacing = animal.size * 0.8;
        animal.segments = []; // Array to store [x,y] for each segment relative to animal.worldX, animal.y
        animal.y = getTerrainHeightAt(animal.worldX, currentLayerScrollX); // Place on terrain

        // Check if valid spawn location (not in river or too steep/high)
        if (animal.y > RENDER_HEIGHT - 5 || animal.y < RENDER_HEIGHT * 0.40) return null;

        const slopeCheckOffset = 2;
        const heightLeft = getTerrainHeightAt(animal.worldX - slopeCheckOffset, currentLayerScrollX);
        const heightRight = getTerrainHeightAt(animal.worldX + slopeCheckOffset, currentLayerScrollX);
        if (Math.abs(animal.y - heightLeft) > 4 || Math.abs(animal.y - heightRight) > 4) return null;

        const riverCenterYNoise = PerlinNoise.noise(animal.worldX * RIVER_NOISE_SCALE, riverPathSeed + masterTime * 0.01);
        let riverCenterY = RIVER_CENTER_Y_BASE + riverCenterYNoise * RIVER_CENTER_Y_VARIATION;
        riverCenterY = Math.max(riverCenterY, animal.y + currentRiverWidth * 0.3);
        riverCenterY = Math.min(riverCenterY, RENDER_HEIGHT - currentRiverWidth);
        const halfRiverWidth = currentRiverWidth / 2;
        const riverTopEdge = riverCenterY - halfRiverWidth;
        const riverBedFinalY = Math.max(animal.y + RIVER_BED_DEPTH, riverTopEdge);
        if (animal.y >= riverTopEdge && animal.y <= riverBedFinalY + halfRiverWidth*2) return null;

        for (let i = 0; i < animal.numSegments; i++) {
            animal.segments.push({ x: -i * animal.segmentSpacing, y: 0 }); // Initial straight line behind head
        }
        animal.vx = Utils.randomFloat(5, 15) * (spawnFromLeft ? 1 : -1); // Crawlers are slower
        animal.phaseOffset = Utils.randomFloat(0, Math.PI * 2); // For body undulation
    }

    return animal;
}

/**
 * Updates, draws, and manages spawning/despawning of fauna on a given layer.
 * @param {number} currentScrollX - The current horizontal scroll offset for this layer.
 * @param {number} deltaTime - Time since the last frame in seconds.
*/
function drawFauna(currentScrollX, deltaTime) {
    // Evolve fauna color palette periodically.
    if (masterTime - faunaPalette.lastEvolveTime > faunaPalette.evolveInterval) {
        evolveFaunaPalette();
    }

    const dt = deltaTime; // Use passed deltaTime for movement.

    // Attempt to spawn new fauna, using the layer's scroll for placement reference.
    if (faunaList.length < MAX_FAUNA && Math.random() < FAUNA_SPAWN_CHANCE) {
        // For now, all fauna spawns relative to this layer's scroll.
        // This might need adjustment if fauna can be on layers with different scroll speeds,
        // or have separate spawnFaunaForLayerX functions.
        const newAnimal = spawnFauna(currentScrollX);
        if (newAnimal) faunaList.push(newAnimal);
    }

    // Update and draw existing animals.
    for (let i = faunaList.length - 1; i >= 0; i--) {
        const animal = faunaList[i];
        // Calculate animal's current on-screen x-coordinate based on the layer's scroll.
        const screenX = Math.floor(animal.worldX - currentScrollX);

        // Update animal movement based on its type.
        // animal.worldX is its absolute position; its perceived movement is due to its own vx
        // AND the layer scrolling. vx is relative to the layer.
        animal.worldX += animal.vx * dt;

        if (animal.type === FAUNA_TYPES.FLOATER) {
            // Bobbing motion (visual, not strictly physics-based on dt for the sine wave).
            animal.y += Math.sin(masterTime * 2 + animal.phaseOffset) * 0.2 * (animal.size / 8);
            animal.y += animal.vy * dt; // Vertical drift based on dt.

            // Update targetY for vertical movement.
            if (Math.abs(animal.y - animal.targetY) < 1 || Math.random() < 0.01) { // Reached target or random change.
                animal.targetY = Utils.randomFloat(RENDER_HEIGHT * 0.1, RENDER_HEIGHT * 0.6); // New target in sky.
                animal.vy = Utils.randomFloat(-5, 5) * (animal.size / 8); // New vertical speed, scaled by size.
            }
            // Basic boundary keeping for floaters.
            if (animal.y < RENDER_HEIGHT * 0.05 && animal.vy < 0) animal.vy *= -0.5; // Bounce from top.
            if (animal.y > RENDER_HEIGHT * 0.65 && animal.vy > 0) animal.vy *= -0.5; // Bounce from pseudo-bottom.
        } else if (animal.type === FAUNA_TYPES.BIRD_FLOCKER) {
            // Simple flight pattern: fly towards horizontal edge, slight vertical wave
            // animal.y += Math.sin(masterTime * 3 + animal.phaseOffset) * 0.1 * (animal.size / 4); // Gentle vertical wave
            // animal.y += animal.vy * dt;

            // // Change vertical direction occasionally or if near top/bottom of their band
            // if (Math.random() < 0.005 ||
            //     (animal.y < RENDER_HEIGHT * 0.05 && animal.vy < 0) ||
            //     (animal.y > RENDER_HEIGHT * 0.4 && animal.vy > 0)) {
            //     animal.vy = Utils.randomFloat(-3, 3);
            // }
            // animal.wingPhase += animal.vx > 0 ? dt * 20 : dt * -20; // Faster flapping for faster birds, direction matters

            // --- Flocking Behavior ---
            let separation = new Utils.Vec2(0, 0);
            let alignment = new Utils.Vec2(0, 0);
            let cohesion = new Utils.Vec2(0, 0);
            let perceivedCount = 0;

            faunaList.forEach(other => {
                if (other !== animal && other.type === FAUNA_TYPES.BIRD_FLOCKER) {
                    const otherScreenX = Math.floor(other.worldX - currentScrollX);
                    const dSq = (screenX - otherScreenX)*(screenX - otherScreenX) + (animal.y - other.y)*(animal.y - other.y);

                    if (dSq > 0 && dSq < animal.perceptionRadius * animal.perceptionRadius) {
                        // Separation
                        let diff = new Utils.Vec2(screenX - otherScreenX, animal.y - other.y);
                        diff = diff.normalize();
                        diff = diff.multiply(1 / Math.sqrt(dSq)); // Weight by distance (closer = stronger separation)
                        separation = separation.add(diff);

                        // Alignment
                        alignment = alignment.add(new Utils.Vec2(other.vx, other.vy));

                        // Cohesion
                        cohesion = cohesion.add(new Utils.Vec2(otherScreenX, other.y)); // Use screen positions for cohesion center

                        perceivedCount++;
                    }
                }
            });

            let steeringForce = new Utils.Vec2(0,0);

            if (perceivedCount > 0) {
                // Average and normalize alignment
                alignment = alignment.multiply(1 / perceivedCount);
                alignment = alignment.normalize().multiply(animal.maxSpeed); // Steer towards average velocity
                let steerAlignment = alignment.subtract(new Utils.Vec2(animal.vx, animal.vy));
                if (steerAlignment.magnitude() > animal.maxForce) {
                    steerAlignment = steerAlignment.normalize().multiply(animal.maxForce);
                }
                steeringForce = steeringForce.add(steerAlignment.multiply(1.0)); // Alignment weight

                // Average and normalize cohesion
                cohesion = cohesion.multiply(1 / perceivedCount); // Center of mass of perceived flockmates
                let desiredCohesion = new Utils.Vec2(cohesion.x - screenX, cohesion.y - animal.y); // Vector from current to CoM
                desiredCohesion = desiredCohesion.normalize().multiply(animal.maxSpeed);
                let steerCohesion = desiredCohesion.subtract(new Utils.Vec2(animal.vx, animal.vy));
                if (steerCohesion.magnitude() > animal.maxForce) {
                    steerCohesion = steerCohesion.normalize().multiply(animal.maxForce);
                }
                steeringForce = steeringForce.add(steerCohesion.multiply(0.8)); // Cohesion weight

                // Average and normalize separation
                separation = separation.multiply(1 / perceivedCount); // Average separation vector
                // No need to steer if already separated enough, but here we always apply some force.
                // separation = separation.normalize().multiply(animal.maxSpeed); // This might be too strong
                // let steerSeparation = separation.subtract(new Utils.Vec2(animal.vx, animal.vy));
                if (separation.magnitude() > 0) { // only apply if there's a separation vector
                    separation = separation.normalize().multiply(animal.maxSpeed);
                }
                let steerSeparation = separation; // separation is already a desired velocity *away*
                 if (steerSeparation.magnitude() > animal.maxForce) {
                    steerSeparation = steerSeparation.normalize().multiply(animal.maxForce);
                }
                steeringForce = steeringForce.add(steerSeparation.multiply(1.5)); // Separation weight (often highest)
            }

            // Add a general wandering/target force (e.g., fly towards edge of screen)
            let targetForce = new Utils.Vec2(animal.vx > 0 ? 1 : -1, 0); // Maintain general direction
            targetForce = targetForce.normalize().multiply(animal.maxSpeed * 0.2); // Weaker force
             if (targetForce.magnitude() > animal.maxForce * 0.5) {
                targetForce = targetForce.normalize().multiply(animal.maxForce * 0.5);
            }
            steeringForce = steeringForce.add(targetForce);


            // Apply steering force to velocity
            animal.vx += steeringForce.x * dt; // These are accelerations effectively
            animal.vy += steeringForce.y * dt;

            // Limit speed
            const speed = Math.sqrt(animal.vx*animal.vx + animal.vy*animal.vy);
            if (speed > animal.maxSpeed) {
                animal.vx = (animal.vx / speed) * animal.maxSpeed;
                animal.vy = (animal.vy / speed) * animal.maxSpeed;
            }

            // Update position with new velocity (worldX already updated, now y)
            animal.y += animal.vy * dt;

            // Boundary keeping
            if (animal.y < RENDER_HEIGHT * 0.05 && animal.vy < 0) { animal.vy *= -0.5; animal.y = RENDER_HEIGHT * 0.05; }
            if (animal.y > RENDER_HEIGHT * 0.5 && animal.vy > 0) { animal.vy *= -0.5; animal.y = RENDER_HEIGHT * 0.5; } // Birds stay in upper half

            animal.wingPhase += speed * dt * 0.5; // Flapping speed based on actual speed
        }
        // TODO: Add CRAWLER movement logic (stick to terrain).
            animal.wingPhase += speed * dt * 0.5; // Flapping speed based on actual speed
        } else if (animal.type === FAUNA_TYPES.CRAWLER) {
            const headWorldX = animal.worldX;
            const headWorldY = getTerrainHeightAt(headWorldX, currentScrollX) + Math.sin(masterTime * 10 + animal.phaseOffset) * animal.size * 0.3; // Undulation for head

            // Update head position (animal.y is the head's y)
            animal.y = headWorldY;

            // Segments follow the segment in front (or head)
            let leaderX = headWorldX;
            let leaderY = headWorldY;

            for (let i = 0; i < animal.numSegments; i++) {
                const segment = animal.segments[i];
                const dx = leaderX - segment.x;
                const dy = leaderY - segment.y;
                const currentDist = Math.sqrt(dx * dx + dy * dy);
                const angleToLeader = Math.atan2(dy, dx);

                if (currentDist > animal.segmentSpacing) {
                    segment.x = leaderX - Math.cos(angleToLeader) * animal.segmentSpacing;
                    segment.y = leaderY - Math.sin(angleToLeader) * animal.segmentSpacing;
                }
                // Ensure segment y is on terrain + its own undulation
                segment.y = getTerrainHeightAt(segment.x, currentScrollX) +
                            Math.sin(masterTime * 10 + animal.phaseOffset + (i + 1) * 0.5) * animal.size * 0.3;

                leaderX = segment.x;
                leaderY = segment.y;
            }

             // Turn around if hitting edge or invalid terrain (based on head's next position)
            const nextHeadWorldX = animal.worldX + animal.vx * dt * 5; // Check a bit ahead for the head
            const nextHeadTerrainY = getTerrainHeightAt(nextHeadWorldX, currentScrollX);

            let turnAround = false;
            if (nextHeadTerrainY > RENDER_HEIGHT - animal.size || nextHeadTerrainY < RENDER_HEIGHT * 0.38) {
                turnAround = true; // Hit very low or very high terrain
            }
            if ((screenX < animal.size && animal.vx < 0) || (screenX > RENDER_WIDTH - animal.size && animal.vx > 0)) {
                turnAround = true; // Hitting screen edges
            }
            // Additional check: if next step is in a river, also turn around
            const riverCenterYNoise = PerlinNoise.noise(nextHeadWorldX * RIVER_NOISE_SCALE, riverPathSeed + masterTime * 0.01);
            let riverCenterY = RIVER_CENTER_Y_BASE + riverCenterYNoise * RIVER_CENTER_Y_VARIATION;
            const terrainAtNext = getTerrainHeightAt(nextHeadWorldX, currentScrollX); // Use original terrain height for river check
            riverCenterY = Math.max(riverCenterY, terrainAtNext + currentRiverWidth * 0.3);
            riverCenterY = Math.min(riverCenterY, RENDER_HEIGHT - currentRiverWidth);
            const halfRiverWidth = currentRiverWidth / 2;
            const riverTopEdge = riverCenterY - halfRiverWidth;
            const riverBedFinalY = Math.max(terrainAtNext + RIVER_BED_DEPTH, riverTopEdge);

            if (nextHeadTerrainY >= riverTopEdge && nextHeadTerrainY <= riverBedFinalY + halfRiverWidth*2) {
                 turnAround = true; // Entering a river
            }


            if (turnAround) {
                 animal.vx *= -1;
                 // Optional: Snap segments to new direction quickly (can look a bit abrupt)
                 // leaderX = animal.worldX; // Head's current position
                 // leaderY = animal.y;
                 // for (let i = 0; i < animal.numSegments; i++) {
                 //    animal.segments[i].x = leaderX - (i + 1) * animal.segmentSpacing * (animal.vx > 0 ? 1 : -1);
                 //    animal.segments[i].y = getTerrainHeightAt(animal.segments[i].x, currentScrollX) + Math.sin(masterTime * 10 + animal.phaseOffset + (i + 1) * 0.5) * animal.size * 0.3;
                 //    leaderX = animal.segments[i].x;
                 //    leaderY = animal.segments[i].y;
                 // }
            }
        }

        // Despawn if far off-screen.
        if (screenX < -FAUNA_OFFSCREEN_BUFFER || screenX > RENDER_WIDTH + FAUNA_OFFSCREEN_BUFFER) {
            faunaList.splice(i, 1);
            continue;
        }

        // Don't draw if currently off-screen but still active (e.g., about to scroll in).
        if (screenX + animal.size < 0 || screenX - animal.size > RENDER_WIDTH) {
            continue;
        }

        // Evolve animal's hue based on age.
        const age = masterTime - animal.createdAt;
        const dynamicHue = (animal.hue + age * 3) % 360;

        // Call appropriate drawing function based on type.
        switch (animal.type) {
            case FAUNA_TYPES.FLOATER:
                drawFloater(animal, screenX, dynamicHue);
                break;
            case FAUNA_TYPES.BIRD_FLOCKER:
                drawBirdFlockerShape(animal, screenX, dynamicHue);
                break;
            case FAUNA_TYPES.CRAWLER:
                drawCrawlerShape(animal, currentScrollX, dynamicHue); // Pass currentScrollX for segment drawing
                break;
        }
    }
}

// --- Individual Fauna Drawing Functions ---

function drawCrawlerShape(crawler, currentScrollX, hue) {
    const segmentSize = Math.max(1, Math.floor(crawler.size));
    for (let i = 0; i < crawler.numSegments; i++) {
        const segment = crawler.segments[i];
        const segScreenX = Math.floor(segment.x - currentScrollX);
        const segScreenY = Math.floor(segment.y);

        if (segScreenX + segmentSize < 0 || segScreenX - segmentSize > RENDER_WIDTH ||
            segScreenY + segmentSize < 0 || segScreenY - segmentSize > RENDER_HEIGHT) {
            continue;
        }

        const L = Utils.lerp(faunaPalette.lightnessMin, faunaPalette.lightnessMax, (i / crawler.numSegments) * 0.5 + 0.25 + Math.sin(masterTime * 5 + i*0.5 + crawler.phaseOffset)*0.1);
        const S = faunaPalette.saturation;
        ctx.fillStyle = Utils.hslToRgbString((hue + i * 5) % 360, S, Utils.clamp(L, 30, 80) );

        // Draw segment as a circle
        ctx.beginPath();
        ctx.arc(segScreenX, segScreenY, segmentSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

/** Draws a Bird Flocker shape. Simple V-shape with animated wings. */
function drawBirdFlockerShape(bird, screenX, hue) {
    const bodyBaseSize = Math.max(2, Math.floor(bird.size / 1.5)); // Make body a bit more prominent
    const wingLength = bird.size * 1.2; // Slightly longer wings
    const wingAngle = Math.PI / 5 + Math.sin(bird.wingPhase) * (Math.PI / 10); // Adjust angles for better V

    const L = Utils.clamp(faunaPalette.lightnessMin + 20, 50, 80); // Brighter birds
    const S = faunaPalette.saturation;
    ctx.fillStyle = Utils.hslToRgbString(hue, S, L);

    // Body (a small square)
    const bodyX = Math.floor(screenX - bodyBaseSize / 2);
    const bodyY = Math.floor(bird.y - bodyBaseSize / 2);
    ctx.fillRect(bodyX, bodyY, bodyBaseSize, bodyBaseSize);

    // Wings - two lines or thin rectangles
    // Wing 1
    const wing1X = screenX + Math.cos(wingAngle) * wingLength;
    const wing1Y = bird.y - Math.sin(wingAngle) * wingLength;
    // Wing 2
    const wing2X = screenX - Math.cos(wingAngle) * wingLength;
    const wing2Y = bird.y - Math.sin(wingAngle) * wingLength;

    // Draw wings as single pixels for small birds, or short lines
    // For simplicity, drawing a line of pixels using fillRect
    // This is a simplified line drawing. A proper Bresenham or similar would be better for thicker lines.
    const drawLine = (x1, y1, x2, y2) => {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;
        let lx = Math.floor(x1);
        let ly = Math.floor(y1);
        let lx2 = Math.floor(x2);
        let ly2 = Math.floor(y2);

        while(true) {
            if (lx >= 0 && lx < RENDER_WIDTH && ly >= 0 && ly < RENDER_HEIGHT) {
                ctx.fillRect(lx, ly, 1, 1);
            }
            if ((lx === lx2) && (ly === ly2)) break;
            let e2 = 2*err;
            if (e2 > -dy) { err -= dy; lx += sx; }
            if (e2 < dx) { err += dx; ly += sy; }
        }
    };

    // Determine wing "tip" based on direction of flight for a V shape
    // For simplicity, wingtips will be calculated relative to body center (screenX, bird.y)

    // Wing 1 Tip
    const w1tx = Math.floor(screenX + Math.cos(wingAngle) * wingLength * (bird.vx > 0 ? 0.7 : -0.7));
    const w1ty = Math.floor(bird.y - Math.sin(wingAngle) * wingLength * 0.7);
    if (w1tx >=0 && w1tx < RENDER_WIDTH && w1ty >=0 && w1ty < RENDER_HEIGHT) {
        ctx.fillRect(w1tx, w1ty, Math.max(1, Math.floor(bodyBaseSize/2)), Math.max(1, Math.floor(bodyBaseSize/2))); // Small square for wingtip
    }

    // Wing 2 Tip (other side, similar logic but mirrored/adjusted angle)
    // A simple approach is to use the opposite cosine for x, same sine for y if body is symmetrical
    const w2tx = Math.floor(screenX - Math.cos(wingAngle) * wingLength * (bird.vx > 0 ? 0.7 : -0.7));
    const w2ty = Math.floor(bird.y - Math.sin(wingAngle) * wingLength * 0.7);
     if (w2tx >=0 && w2tx < RENDER_WIDTH && w2ty >=0 && w2ty < RENDER_HEIGHT) {
        ctx.fillRect(w2tx, w2ty, Math.max(1, Math.floor(bodyBaseSize/2)), Math.max(1, Math.floor(bodyBaseSize/2)));
    }
}


/** Draws a FLOATER animal type, composed of multiple pulsating, undulating circular parts. */
function drawFloater(animal, screenX, hue) {
    const bodyParts = 3; // Number of circles forming the floater.
    const mainRadius = animal.size / 2;

    for (let i = 0; i < bodyParts; i++) {
        const bodyPulse = (Math.sin(masterTime * 3.0 + animal.id + i * 0.7) + 1) / 2; // 0 to 1 pulsation.
        const partRadius = mainRadius * Utils.mapRange(bodyPulse, 0, 1, 0.5, 0.9); // Radius pulsates.

        // Offset for each part, also pulsating for more organic movement.
        const offsetX = (i - (bodyParts - 1) / 2) * mainRadius * 0.6 * Utils.mapRange(bodyPulse,0,1,0.8,1.2) +
                        Math.sin(masterTime * 1.2 + animal.phaseOffset + i) * (2 + bodyPulse * 2); // Active undulation.
        const offsetY = Math.cos(masterTime * 1.5 + animal.phaseOffset + i + bodyPulse * 0.5) * mainRadius * 0.3;

        const partX = Math.floor(screenX + offsetX);
        const partY = Math.floor(animal.y + offsetY);

        // Color pulsation for each part.
        const colorPulse = (Math.sin(masterTime * 4 + animal.id * 0.3 + i) + 1) / 2;
        const L = Utils.clamp(faunaPalette.lightnessMin + colorPulse * 20, faunaPalette.lightnessMin, faunaPalette.lightnessMax + 10);
        const S = Utils.clamp(faunaPalette.saturation + colorPulse * 10, faunaPalette.saturation -10, 95);

        // Draw part pixel by pixel for a round pixel art appearance.
        const currentPartRadius = Math.max(1, Math.floor(partRadius));
        for (let dx = -currentPartRadius; dx <= currentPartRadius; dx++) {
            for (let dy = -currentPartRadius; dy <= currentPartRadius; dy++) {
                if (dx*dx + dy*dy <= currentPartRadius*currentPartRadius) { // Check if inside circle.
                    const px = partX + dx;
                    const py = partY + dy;
                    if (px >=0 && px < RENDER_WIDTH && py >=0 && py < RENDER_HEIGHT) { // Boundary check.
                         ctx.fillStyle = Utils.hslToRgbString((hue + i*10)%360, S, L);
                         ctx.fillRect(px, py, 1, 1);
                    }
                }
            }
        }
    }
}

// --- Boulder Generation (Main Landscape) ---
let boulders = [];
const MAX_BOULDERS = 25;
const BOULDER_SPAWN_CHANCE = 0.02; // Increased from 0.015
const BOULDER_OFFSCREEN_BUFFER = 60;
const BOULDER_MIN_SIZE = 4; // Diameter-ish
const BOULDER_MAX_SIZE = 12;

function spawnBoulder(mainSceneScrollX) {
    const screenXForSpawn = RENDER_WIDTH + BOULDER_OFFSCREEN_BUFFER / 2;
    const worldX = screenXForSpawn + mainSceneScrollX;

    const terrainSurfaceY = getTerrainHeightAt(worldX, mainSceneScrollX);
    // Avoid spawning boulders too low or too high on sharp peaks for main landscape.
    if (terrainSurfaceY > RENDER_HEIGHT - 5 || terrainSurfaceY < RENDER_HEIGHT * 0.40) {
        return null;
    }

    // Check for steep slopes/peaks to prevent floating
    const slopeCheckOffset = 3;
    const heightLeft = getTerrainHeightAt(worldX - slopeCheckOffset, mainSceneScrollX);
    const heightRight = getTerrainHeightAt(worldX + slopeCheckOffset, mainSceneScrollX);
    const maxSlopeDifference = 6; // Boulders might tolerate slightly steeper slopes than plants

    if (Math.abs(terrainSurfaceY - heightLeft) > maxSlopeDifference ||
        Math.abs(terrainSurfaceY - heightRight) > maxSlopeDifference) {
        return null;
    }

    // Avoid spawning in river (similar check to plants)
    const riverCenterYNoise = PerlinNoise.noise(worldX * RIVER_NOISE_SCALE, riverPathSeed + masterTime * 0.01);
    let riverCenterY = RIVER_CENTER_Y_BASE + riverCenterYNoise * RIVER_CENTER_Y_VARIATION;
    riverCenterY = Math.max(riverCenterY, terrainSurfaceY + currentRiverWidth * 0.3);
    riverCenterY = Math.min(riverCenterY, RENDER_HEIGHT - currentRiverWidth);
    const halfRiverWidth = currentRiverWidth / 2;
    const riverTopEdge = riverCenterY - halfRiverWidth;
    const riverBedFinalY = Math.max(terrainSurfaceY + RIVER_BED_DEPTH, riverTopEdge);
    if (terrainSurfaceY >= riverTopEdge && terrainSurfaceY <= riverBedFinalY + halfRiverWidth * 2) {
        return null;
    }

    const size = Utils.randomFloat(BOULDER_MIN_SIZE, BOULDER_MAX_SIZE);
    const boulderData = { // Create the main object first
        id: masterTime + Math.random(),
        worldX: worldX,
        y: terrainSurfaceY, // Base of boulder sits on terrain
        size: size, // Overall size indicator
        width: size * Utils.randomFloat(0.8, 1.2),
        height: size * Utils.randomFloat(0.6, 1.0),
        hueSeed: Utils.randomFloat(0, 360),
        shapeSeed: Utils.randomFloat(0, 1000),
        createdAt: masterTime,
        subBoulders: [] // Array to hold parameters for smaller attached boulders
    };

    // Chance to add sub-boulders for more irregular shapes
    if (Math.random() < 0.5) { // 50% chance for sub-boulders
        const numSub = Utils.randomInt(1, 2);
        for (let i = 0; i < numSub; i++) {
            const subSizeFactor = Utils.randomFloat(0.3, 0.6);
            boulderData.subBoulders.push({
                offsetX: (Math.random() - 0.5) * boulderData.width * 0.5,
                offsetY: (Math.random() - 0.5) * boulderData.height * 0.2,
                width: boulderData.size * subSizeFactor * Utils.randomFloat(0.7, 1.3),
                height: boulderData.size * subSizeFactor * Utils.randomFloat(0.7, 1.3),
                shapeSeed: boulderData.shapeSeed + (i + 1) * 101
            });
        }
    }
    return boulderData;
}

function drawSingleBoulderComponent(centerX, componentBaseY, width, height, shapeSeed, baseHue, baseSaturation, baseLightness) {
    // componentBaseY is the y-coordinate of the bottom of this component.
    // We draw from componentBaseY - height up to componentBaseY.
    const startDrawX = Math.floor(centerX - width / 2);
    const endDrawX = Math.ceil(centerX + width / 2);
    const componentTopY = Math.floor(componentBaseY - height);
    const componentBottomY = Math.ceil(componentBaseY);

    for (let px = startDrawX; px < endDrawX; px++) {
        for (let py = componentTopY; py < componentBottomY; py++) {
            if (px < 0 || px >= RENDER_WIDTH || py < 0 || py >= RENDER_HEIGHT) continue;

            const dx = (px - centerX) / (width / 2);
            const dy = (py - (componentBaseY - height / 2)) / (height / 2); // distance from component's own center
            const dist = dx * dx + dy * dy;

            const shapeNoise = PerlinNoise.noise(px * 0.1 + shapeSeed, py * 0.1 + shapeSeed);
            // Increased noise influence for weirder shapes: 0.5 (was 0.4)
            if (dist < 0.7 + shapeNoise * 0.6) {
                const textureNoise = PerlinNoise.noise(px * 0.2 + shapeSeed + 100, py * 0.2 + shapeSeed + 100, masterTime * 0.05);
                // Wider lightness variation for texture
                const L = Utils.clamp(baseLightness + (textureNoise * 30 - 15), 5, 60);
                ctx.fillStyle = Utils.hslToRgbString(baseHue, baseSaturation, L);
                ctx.fillRect(px, py, 1, 1);
            }
        }
    }
}

function drawBoulderShape(b, screenX) {
    const mainBoulderCenterX = Math.floor(screenX);

    const baseBoulderHue = (landscapePalette.baseHue + b.hueSeed) % 360;
    // Even more desaturated, and bit darker overall for boulders
    const baseBoulderSaturation = landscapePalette.saturation * Utils.randomFloat(0.01, 0.15);
    const baseBoulderLightness = landscapePalette.lightnessMin * Utils.randomFloat(0.6, 1.0);

    // Draw main boulder component
    // b.y is the base of the main boulder component.
    drawSingleBoulderComponent(mainBoulderCenterX, b.y, b.width, b.height, b.shapeSeed, baseBoulderHue, baseBoulderSaturation, baseBoulderLightness);

    // Draw sub-boulders
    b.subBoulders.forEach(sub => {
        const subCenterX = mainBoulderCenterX + sub.offsetX;
        // Sub-boulders are also grounded relative to the main boulder's base (b.y), then apply their Y offset.
        // A positive sub.offsetY means it's slightly lower (further down on screen) than main boulder's base if desired,
        // or higher if negative. For boulders, usually want them at or slightly above main base.
        const subBaseY = b.y + sub.offsetY;
        drawSingleBoulderComponent(subCenterX, subBaseY, sub.width, sub.height, sub.shapeSeed, baseBoulderHue, baseBoulderSaturation, baseBoulderLightness * 0.9); // Slightly darker
    });
}


function drawBoulders(currentScrollX, deltaTime) {
    // Spawning
    if (boulders.length < MAX_BOULDERS && Math.random() < BOULDER_SPAWN_CHANCE) {
        const newBoulder = spawnBoulder(currentScrollX);
        if (newBoulder) boulders.push(newBoulder);
    }

    // Update and Draw
    for (let i = boulders.length - 1; i >= 0; i--) {
        const b = boulders[i];
        const screenX = Math.floor(b.worldX - currentScrollX);

        if (screenX < -BOULDER_OFFSCREEN_BUFFER || screenX > RENDER_WIDTH + BOULDER_OFFSCREEN_BUFFER) {
            boulders.splice(i, 1);
            continue;
        }
        if (screenX + b.size < 0 || screenX - b.size > RENDER_WIDTH) { // Check using generic size for rough culling
            continue;
        }
        drawBoulderShape(b, screenX);
    }
}


// --- Scene Evolution ---
/** Triggers a major change in the scene's generative parameters and clears existing entities. */
function triggerMajorSceneChange() {
    console.log(`MAJOR SCENE CHANGE triggered at masterTime: ${masterTime.toFixed(2)}`);

    // 1. Re-seed Perlin Noise: This fundamentally alters all subsequent noise-based generation.
    const newSeed = Date.now();
    PerlinNoise.seed(newSeed);
    console.log("PerlinNoise re-seeded with:", newSeed);

    // 1b. Re-initialize stars for the new scene
    initializeStars();

    // 2. Force immediate evolution of all color palettes for a new visual scheme.
    evolveLandscapePalette();
    evolveSkyPalette(true); // Evolve sky palette to contrast with new landscape palette
    evolveFloraPalette();
    evolveFaunaPalette();
    // Note: These functions already update their internal `lastEvolveTime`.

    // 3. Clear existing dynamic entities (planets, flora, fauna).
    // This allows new entities, fitting the new noise seed and palettes, to populate the world.
    planets = [];
    flora = [];
    faunaList = [];
    boulders = [];
    fgFlora = [];
    fgBoulders = []; // Clear foreground boulders
    // fgFauna = []; // TODO: Clear foreground fauna when implemented
    console.log("Dynamic entities (planets, flora, fauna, main boulders, fgFlora, fgBoulders) cleared.");

    // 4. Reset sceneTime and update the timestamp of the last major change.
    sceneTime = 0;
    lastMajorSceneChangeTime = masterTime;

    // 5. Optional future enhancement: Adjust core generation parameters for more variety between scenes
    // (e.g., terrain height variation, planet sizes, entity spawn rates).
    // This would require these parameters to be variables rather than constants.
    // Example: landscapePalette.evolveInterval = Utils.randomInt(15, 30); // Change how fast palette evolves in new scene

    // Reset river parameters for the new scene
    currentRiverWidth = Utils.randomInt(RIVER_WIDTH_MIN, RIVER_WIDTH_MAX);
    riverPathSeed = Utils.randomFloat(0,1000);
    console.log("River parameters reset. New width:", currentRiverWidth);

    console.log("--- New scene set initialized ---");
}

// --- Foreground Parallax Layer ---
const FOREGROUND_PARALLAX_FACTOR = 1.1; // Further reduced (was 1.2, 1.4, originally 1.75)
let fgFlora = []; // Array for foreground flora
// let fgFauna = []; // TODO: For foreground fauna
let fgBoulders = []; // Array for foreground boulders

const MAX_FG_FLORA = 15;
const FG_FLORA_SPAWN_CHANCE = 0.04; // Increased from 0.03
const FG_PLANT_OFFSCREEN_BUFFER = 100; // Larger buffer as they move faster

const MAX_FG_BOULDERS = 5;
const FG_BOULDER_SPAWN_CHANCE = 0.012; // Increased from 0.008


// Spawning for foreground elements will be simpler, often near bottom of screen
function spawnFgPlant(currentFgScrollX) {
    const screenXForSpawn = RENDER_WIDTH + FG_PLANT_OFFSCREEN_BUFFER / 2;
    const worldX = screenXForSpawn + currentFgScrollX;

    // Foreground plants are just near the bottom edge
    const terrainY = RENDER_HEIGHT - Utils.randomFloat(5, 30);

    const plantTypeKeys = Object.keys(PLANT_TYPES); // Can reuse existing plant types
    const type = Utils.randomElement(plantTypeKeys);

    const plant = {
        id: masterTime + Math.random() + 0.1, // Add offset to ID to avoid collision with main flora
        type: type,
        worldX: worldX,
        y: terrainY,
        size: Utils.randomFloat(15, 30), // Larger than main flora
        hue: (floraPalette.baseHue + Utils.randomFloat(-floraPalette.hueSpread, floraPalette.hueSpread)) % 360,
        createdAt: masterTime,
        isForeground: true
    };
    plant.y -= plant.size;
    return plant;
}

function drawFgFlora(currentFgScrollX) {
    // Evolve flora palette (already done in main drawFlora, but could have separate fgPalette)
    // if (masterTime - floraPalette.lastEvolveTime > floraPalette.evolveInterval) {
    //     evolveFloraPalette(); // Or a dedicated fgFloraPalette.evolve()
    // }

    if (fgFlora.length < MAX_FG_FLORA && Math.random() < FG_FLORA_SPAWN_CHANCE) {
        const newPlant = spawnFgPlant(currentFgScrollX);
        if (newPlant) fgFlora.push(newPlant);
    }

    for (let i = fgFlora.length - 1; i >= 0; i--) {
        const p = fgFlora[i];
        const screenX = Math.floor(p.worldX - currentFgScrollX);

        if (screenX < -FG_PLANT_OFFSCREEN_BUFFER) {
            fgFlora.splice(i, 1);
            continue;
        }
        if (screenX > RENDER_WIDTH + FG_PLANT_OFFSCREEN_BUFFER) {
            continue;
        }

        const age = masterTime - p.createdAt;
        const dynamicHue = (p.hue + age * 5) % 360;

        // Reuse existing plant drawing functions
        // They might need slight adjustments if foreground plants have unique visual properties
        // or we can pass an 'isForeground' flag to them.
        const originalSize = p.size;
        p.size *= 1.5; // Make foreground plants appear larger

        switch (p.type) {
            case PLANT_TYPES.TALL_SPIRE:
                drawTallSpire(p, screenX, dynamicHue);
                break;
            case PLANT_TYPES.GLOW_ORB_STALK:
                drawGlowOrbStalk(p, screenX, dynamicHue);
                break;
            case PLANT_TYPES.CRYSTAL_CLUSTER:
                drawCrystalCluster(p, screenX, dynamicHue);
                break;
            default:
                ctx.fillStyle = Utils.hslToRgbString(dynamicHue, floraPalette.saturation, Utils.randomElement([60,70]));
                ctx.fillRect(screenX - Math.floor(p.size/3), Math.floor(p.y - p.size), Math.floor(p.size/1.5), Math.floor(p.size));
        }
        p.size = originalSize; // Reset size if it was temporarily changed for drawing
    }
}


// TODO: spawnFgBoulder, drawFgBoulders (similar to fgFlora)

function drawForeground(foregroundScrollX, deltaTime) {
    // Draw foreground elements here, e.g.:
    drawFgFlora(foregroundScrollX);
    drawFgBoulders(foregroundScrollX, deltaTime);
    // drawFgFauna(foregroundScrollX, deltaTime);
}


// --- Foreground Boulder Specifics ---
function spawnFgBoulder(currentFgScrollX) {
    const screenXForSpawn = RENDER_WIDTH + BOULDER_OFFSCREEN_BUFFER / 2; // Use main boulder buffer for now
    const worldX = screenXForSpawn + currentFgScrollX;

    const yPos = RENDER_HEIGHT - Utils.randomFloat(2, 15); // Near bottom edge

    const size = Utils.randomFloat(BOULDER_MAX_SIZE * 0.8, BOULDER_MAX_SIZE * 1.8); // Larger than typical main boulders
    return {
        id: masterTime + Math.random() + 0.2, // ID offset
        worldX: worldX,
        y: yPos,
        size: size,
        width: size * Utils.randomFloat(0.7, 1.3),
        height: size * Utils.randomFloat(0.5, 1.1),
        hueSeed: Utils.randomFloat(0, 360),
        shapeSeed: Utils.randomFloat(1000, 2000), // Different shape seed range
        createdAt: masterTime,
        isForeground: true
    };
}

function drawFgBoulders(currentFgScrollX, deltaTime) {
    if (fgBoulders.length < MAX_FG_BOULDERS && Math.random() < FG_BOULDER_SPAWN_CHANCE) {
        const newBoulder = spawnFgBoulder(currentFgScrollX);
        if (newBoulder) fgBoulders.push(newBoulder);
    }

    for (let i = fgBoulders.length - 1; i >= 0; i--) {
        const b = fgBoulders[i];
        const screenX = Math.floor(b.worldX - currentFgScrollX);

        if (screenX < -BOULDER_OFFSCREEN_BUFFER*1.5 || screenX > RENDER_WIDTH + BOULDER_OFFSCREEN_BUFFER*1.5) { // Wider buffer due to size/speed
            fgBoulders.splice(i, 1);
            continue;
        }
        if (screenX + b.width < 0 || screenX - b.width > RENDER_WIDTH) {
            continue;
        }

        // Temporarily increase effective size for drawing if needed, or pass flag to drawBoulderShape
        // For now, drawBoulderShape uses b.width and b.height which are already larger for FG boulders
        drawBoulderShape(b, screenX);
    }
}


// --- Start Application ---
console.log(`Internal Resolution: ${RENDER_WIDTH}x${RENDER_HEIGHT}`);
console.log(`Display Resolution: ${displayCanvas.width}x${displayCanvas.height}`);
// Initialize lastTimestamp to the current time before starting the loop for accurate first deltaTime.
lastTimestamp = performance.now();
requestAnimationFrame(animationLoop); // Start the main animation loop.
