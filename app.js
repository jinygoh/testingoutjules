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
    // Order of rendering is important for layering:
    // 1. Sky (background)
    // 2. Planets (celestial bodies in the sky)
    // 3. Landscape (terrain, potentially obscuring parts of planets)
    // 4. Flora (plants on the landscape)
    // 5. Fauna (animals, on top of landscape and flora)

    drawPsychedelicSky(); // Sky animation is driven by masterTime within its noise calculations.
    drawPlanets(deltaTime); // Pass deltaTime for planet movement.
    drawLandscape();      // Landscape scrolling and evolution driven by masterTime.
    drawFlora();          // Flora placement and evolution driven by masterTime.
    drawFauna(deltaTime);   // Pass deltaTime for fauna movement.

    // Copy the fully rendered low-resolution scene from renderCanvas to displayCanvas, scaling it up.
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

/**
 * Draws a dynamic, psychedelic sky using Perlin noise.
 * The noise field is animated and rotated over time to create a swirling effect.
 * Colors are mapped from noise values using HSL, also evolving with time.
 */
function drawPsychedelicSky() {
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

            // Map normalized noise to psychedelic HSL color values.
            const hue = (normalizedNoise * 120 + masterTime * 10) % 360; // Hue shifts with noise and time.
            const saturation = Utils.clamp(70 + (normalizedNoise - 0.5) * 60, 60, 100); // Saturation varies with noise.
            const lightness = Utils.clamp(40 + (normalizedNoise - 0.5) * 40, 20, 60);  // Lightness varies with noise.

            ctx.fillStyle = Utils.hslToRgbString(hue, saturation, lightness);
            ctx.fillRect(x, y, 1, 1); // Draw the sky pixel.
        }
    }
}

// --- Celestial Bodies (Planets) ---
const MAX_PLANETS = 3;              // Maximum number of planets visible at once.
let planets = [];                   // Array to store active planet objects.
const PLANET_MIN_SIZE = 10;         // Minimum radius of a planet.
const PLANET_MAX_SIZE = 40;         // Maximum radius of a planet.
const PLANET_TEXTURE_SCALE = 0.05;  // Scale of Perlin noise for planet surface textures.
const PLANET_ROTATION_SPEED_FACTOR = 0.1; // Base factor for planet rotation speed, adjusted by size.
const PLANET_SPAWN_CHANCE = 0.01;   // Chance per frame to spawn a new planet if count is below MAX_PLANETS.

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
let landscapePalette = {
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

/** Draws the scrolling, procedurally generated landscape. */
function drawLandscape() {
    // Evolve landscape palette periodically.
    if (masterTime - landscapePalette.lastEvolveTime > landscapePalette.evolveInterval) {
        evolveLandscapePalette();
    }

    const scrolledTimeX = masterTime * TERRAIN_SCROLL_SPEED; // Current scroll offset.

    // Iterate over each vertical column of the render canvas.
    for (let x = 0; x < RENDER_WIDTH; x++) {
        const currentWorldX = x + scrolledTimeX; // World x-coordinate for noise sampling.

        // Base terrain height from Perlin noise.
        const noiseXForShape = currentWorldX * TERRAIN_NOISE_SCALE_X;
        let baseNoise = PerlinNoise.noise(noiseXForShape, 10.5); // Use a fixed y-offset for consistent noise slice.

        // Add detail/distortion noise that evolves over time.
        let detailNoise = PerlinNoise.noise(
            noiseXForShape * 2.5, // Faster frequency for detail.
            currentWorldX * TERRAIN_NOISE_SCALE_Y_DETAIL + 50.2, // Different y-offset for detail noise.
            masterTime * 0.1 // Slowly evolving detail pattern.
        );

        // Combine noise layers and normalize.
        let combinedNoise = baseNoise + detailNoise * 0.35; // Modulate influence of detail noise.
        combinedNoise = Utils.clamp((combinedNoise + 0.7) / 1.4, 0, 1); // Normalize roughly to 0-1.

        const terrainHeight = TERRAIN_HEIGHT_BASE - combinedNoise * TERRAIN_HEIGHT_VARIATION;

        // Draw terrain from its surface down to the bottom of the canvas.
        for (let y = Math.floor(terrainHeight); y < RENDER_HEIGHT; y++) {
            if (y < 0) continue; // Skip pixels above the canvas.

            // Color variation based on depth and local noise.
            const depthFactor = Utils.mapRange(y, terrainHeight, RENDER_HEIGHT, 0, 1); // 0 at surface, 1 at max depth.
            const colorNoiseVal = PerlinNoise.noise(
                currentWorldX * 0.05, // Slower noise for broad color patches.
                y * 0.05,
                masterTime * 0.03 // Slowly evolving color patterns.
            );
            const normalizedColorNoise = Utils.clamp((colorNoiseVal + 0.7) / 1.4, 0, 1);

            // Determine HSL values for the terrain pixel.
            const hue = (landscapePalette.baseHue +
                         (normalizedColorNoise - 0.5) * landscapePalette.hueSpread +
                         depthFactor * 20 // Hue shifts slightly with depth.
                        ) % 360;
            const saturation = landscapePalette.saturation;
            let lightness = Utils.lerp(landscapePalette.lightnessMax, landscapePalette.lightnessMin, depthFactor * 0.8 + normalizedColorNoise * 0.2);

            // Apply atmospheric haze effect, blending towards a hazy color for deeper/further terrain.
            const hazeFactor = Utils.clamp(Utils.mapRange(y, RENDER_HEIGHT * 0.8, RENDER_HEIGHT, 0, 0.6), 0, 0.6);
            const atmosphericHue = (landscapePalette.baseHue + 180) % 360; // Opposite or complementary hue for haze.
            const atmosphericSaturation = landscapePalette.saturation * 0.5;
            const atmosphericLightness = landscapePalette.lightnessMin * 0.8;

            const finalHue = Utils.lerp(hue, atmosphericHue, hazeFactor);
            const finalSaturation = Utils.lerp(saturation, atmosphericSaturation, hazeFactor);
            lightness = Utils.lerp(lightness, atmosphericLightness, hazeFactor * 1.5); // Stronger lightness blend for haze.

            ctx.fillStyle = Utils.hslToRgbString(finalHue, finalSaturation, Utils.clamp(lightness, 5, 85));
            ctx.fillRect(x, y, 1, 1); // Draw terrain pixel.
        }
    }
}

// --- Alien Plant Generation (Flora) ---
let flora = [];                     // Array to store active plant objects.
const MAX_FLORA = 50;               // Maximum number of plants on screen.
const FLORA_SPAWN_CHANCE = 0.02;    // Chance per frame to spawn a new plant if below max.
const PLANT_OFFSCREEN_BUFFER = 50;  // Buffer distance off-screen before despawning plants.

// Defines different types of plants that can be generated.
const PLANT_TYPES = {
    TALL_SPIRE: 'TALL_SPIRE',
    GLOW_ORB_STALK: 'GLOW_ORB_STALK',
    CRYSTAL_CLUSTER: 'CRYSTAL_CLUSTER'
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
function getTerrainHeightAt(worldX) {
    // Replicates terrain height calculation from drawLandscape.
    const noiseXForShape = worldX * TERRAIN_NOISE_SCALE_X;
    let baseNoise = PerlinNoise.noise(noiseXForShape, 10.5);
    let detailNoise = PerlinNoise.noise(
        noiseXForShape * 2.5,
        worldX * TERRAIN_NOISE_SCALE_Y_DETAIL + 50.2,
        masterTime * 0.1 // Use current masterTime for consistency with visible terrain.
    );
    let combinedNoise = baseNoise + detailNoise * 0.35;
    combinedNoise = Utils.clamp((combinedNoise + 0.7) / 1.4, 0, 1);
    return TERRAIN_HEIGHT_BASE - combinedNoise * TERRAIN_HEIGHT_VARIATION;
}

/** Spawns a new alien plant with randomized properties. */
function spawnPlant() {
    // Attempt to spawn plants just off-screen to the right.
    const screenXForSpawn = RENDER_WIDTH + PLANT_OFFSCREEN_BUFFER / 2;
    const currentScrollOffset = masterTime * TERRAIN_SCROLL_SPEED;
    const worldX = screenXForSpawn + currentScrollOffset; // Plant's absolute position in the world.

    const terrainY = getTerrainHeightAt(worldX);
    // Avoid spawning plants too low (e.g., if terrain is near bottom of screen).
    if (terrainY > RENDER_HEIGHT - 10) return null;

    const plantTypeKeys = Object.keys(PLANT_TYPES);
    const type = Utils.randomElement(plantTypeKeys); // Randomly select a plant type.

    const plant = {
        id: masterTime + Math.random(), // Unique ID.
        type: type,
        worldX: worldX,         // Store its absolute world x-position.
        y: terrainY,            // Base y-position on the terrain surface.
        size: Utils.randomFloat(5, 15), // Base size for the plant.
        hue: (floraPalette.baseHue + Utils.randomFloat(-floraPalette.hueSpread/2, floraPalette.hueSpread/2)) % 360,
        createdAt: masterTime   // Timestamp of creation for age-based effects.
    };
    // Default y adjustment: plant's base is at terrainY, height extends upwards.
    plant.y -= plant.size;

    return plant;
}

/** Updates, draws, and manages spawning/despawning of flora. */
function drawFlora() {
    // Evolve flora color palette periodically.
    if (masterTime - floraPalette.lastEvolveTime > floraPalette.evolveInterval) {
        evolveFloraPalette();
    }

    const currentScrollOffset = masterTime * TERRAIN_SCROLL_SPEED;

    // Attempt to spawn new plants.
    if (flora.length < MAX_FLORA && Math.random() < FLORA_SPAWN_CHANCE) {
        const newPlant = spawnPlant();
        if (newPlant) flora.push(newPlant);
    }

    // Update and draw existing plants.
    for (let i = flora.length - 1; i >= 0; i--) {
        const p = flora[i];
        // Calculate plant's current on-screen x-coordinate.
        const screenX = Math.floor(p.worldX - currentScrollOffset);

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
            default: // Fallback for unknown types.
                ctx.fillStyle = Utils.hslToRgbString(dynamicHue, floraPalette.saturation, Utils.randomElement([50,60]));
                ctx.fillRect(screenX - Math.floor(p.size/4), Math.floor(p.y - p.size), Math.floor(p.size/2), Math.floor(p.size));
        }
    }
}

// --- Individual Plant Drawing Functions ---
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
const FAUNA_SPAWN_CHANCE = 0.005;   // Chance per frame to spawn new fauna if below max (lower than plants).
const FAUNA_OFFSCREEN_BUFFER = 100; // Buffer distance off-screen before despawning animals.

// Defines different types of animals that can be generated.
const FAUNA_TYPES = {
    FLOATER: 'FLOATER',
    // CRAWLER: 'CRAWLER', // To be implemented in future.
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

/** Spawns a new alien animal with randomized properties. */
function spawnFauna() {
    const type = Utils.randomElement(Object.keys(FAUNA_TYPES)); // Currently only FLOATER.
    let animal = {
        id: masterTime + Math.random(), // Unique ID.
        type: type,
        worldX: 0, // Initial world x-position, set based on spawn side.
        y: 0,      // Initial y-position, set based on type.
        size: Utils.randomFloat(4, 12), // Base size of the animal.
        hue: (faunaPalette.baseHue + Utils.randomFloat(-faunaPalette.hueSpread/2, faunaPalette.hueSpread/2)) % 360,
        createdAt: masterTime,  // Timestamp of creation.
        vx: 0,                  // Horizontal velocity.
        vy: 0,                  // Vertical velocity.
        targetY: 0,             // Target y-position for floaters.
        phaseOffset: Utils.randomFloat(0, Math.PI * 2) // Offset for movement patterns.
    };

    // Determine spawn side (left or right, off-screen).
    const spawnFromLeft = Utils.randomInt(0,1) === 0;
    const currentScrollOffset = masterTime * TERRAIN_SCROLL_SPEED;

    if (spawnFromLeft) {
        animal.worldX = -FAUNA_OFFSCREEN_BUFFER / 2 + currentScrollOffset; // Start left, move right.
        animal.vx = Utils.randomFloat(5, 15);
    } else {
        animal.worldX = RENDER_WIDTH + FAUNA_OFFSCREEN_BUFFER / 2 + currentScrollOffset; // Start right, move left.
        animal.vx = Utils.randomFloat(-15, -5);
    }

    // Type-specific spawning properties.
    if (animal.type === FAUNA_TYPES.FLOATER) {
        animal.y = Utils.randomFloat(RENDER_HEIGHT * 0.1, RENDER_HEIGHT * 0.6); // Spawn in sky area.
        animal.targetY = animal.y;
        animal.vy = Utils.randomFloat(-5, 5); // Initial vertical velocity.
    }
    // TODO: Add CRAWLER specific spawning logic (e.g., place on terrain).

    return animal;
}

/** Updates, draws, and manages spawning/despawning of fauna.
 *  @param {number} deltaTime - Time since the last frame in seconds.
*/
function drawFauna(deltaTime) {
    // Evolve fauna color palette periodically.
    if (masterTime - faunaPalette.lastEvolveTime > faunaPalette.evolveInterval) {
        evolveFaunaPalette();
    }

    const currentScrollOffset = masterTime * TERRAIN_SCROLL_SPEED;
    const dt = deltaTime; // Use passed deltaTime for movement.

    // Attempt to spawn new fauna.
    if (faunaList.length < MAX_FAUNA && Math.random() < FAUNA_SPAWN_CHANCE) {
        const newAnimal = spawnFauna();
        if (newAnimal) faunaList.push(newAnimal);
    }

    // Update and draw existing animals.
    for (let i = faunaList.length - 1; i >= 0; i--) {
        const animal = faunaList[i];
        const screenX = Math.floor(animal.worldX - currentScrollOffset); // Current on-screen x.

        // Update animal movement based on its type.
        animal.worldX += animal.vx * dt; // Horizontal movement.

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
        }
        // TODO: Add CRAWLER movement logic (stick to terrain).

        // Despawn if too far off-screen.
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
            // case FAUNA_TYPES.CRAWLER:
            //     drawCrawler(animal, screenX, dynamicHue);
            //     break;
        }
    }
}

// --- Individual Fauna Drawing Functions ---
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

// --- Scene Evolution ---
/** Triggers a major change in the scene's generative parameters and clears existing entities. */
function triggerMajorSceneChange() {
    console.log(`MAJOR SCENE CHANGE triggered at masterTime: ${masterTime.toFixed(2)}`);

    // 1. Re-seed Perlin Noise: This fundamentally alters all subsequent noise-based generation.
    const newSeed = Date.now();
    PerlinNoise.seed(newSeed);
    console.log("PerlinNoise re-seeded with:", newSeed);

    // 2. Force immediate evolution of all color palettes for a new visual scheme.
    evolveLandscapePalette();
    evolveFloraPalette();
    evolveFaunaPalette();
    // Note: These functions already update their internal `lastEvolveTime`.

    // 3. Clear existing dynamic entities (planets, flora, fauna).
    // This allows new entities, fitting the new noise seed and palettes, to populate the world.
    planets = [];
    flora = [];
    faunaList = [];
    console.log("Dynamic entities (planets, flora, fauna) cleared.");

    // 4. Reset sceneTime and update the timestamp of the last major change.
    sceneTime = 0;
    lastMajorSceneChangeTime = masterTime;

    // 5. Optional future enhancement: Adjust core generation parameters for more variety between scenes
    // (e.g., terrain height variation, planet sizes, entity spawn rates).
    // This would require these parameters to be variables rather than constants.
    // Example: landscapePalette.evolveInterval = Utils.randomInt(15, 30); // Change how fast palette evolves in new scene
    console.log("--- New scene set initialized ---");
}


// --- Start Application ---
console.log(`Internal Resolution: ${RENDER_WIDTH}x${RENDER_HEIGHT}`);
console.log(`Display Resolution: ${displayCanvas.width}x${displayCanvas.height}`);
// Initialize lastTimestamp to the current time before starting the loop for accurate first deltaTime.
lastTimestamp = performance.now();
requestAnimationFrame(animationLoop); // Start the main animation loop.
