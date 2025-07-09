console.log("Procedural Pixel Art Generator Initialized");

// --- Core Rendering Parameters ---
const RENDER_WIDTH = 320;    // Internal resolution width for pixel art
const RENDER_HEIGHT = 240;   // Internal resolution height for pixel art
const PIXEL_SCALE = 3;       // How much to scale up the low-res canvas for display

// --- Canvas Setup ---
const displayCanvas = document.getElementById('mainCanvas'); // The main canvas element in HTML
const displayCtx = displayCanvas.getContext('2d');      // Context for the visible display canvas

// Set the actual size of the display canvas based on render dimensions and scale
displayCanvas.width = RENDER_WIDTH * PIXEL_SCALE;
displayCanvas.height = RENDER_HEIGHT * PIXEL_SCALE;

// Disable image smoothing on the display canvas to maintain crisp pixels when scaling up
displayCtx.imageSmoothingEnabled = false;
// Apply vendor prefixes for broader compatibility
['mozImageSmoothingEnabled', 'webkitImageSmoothingEnabled', 'msImageSmoothingEnabled'].forEach(prefix => {
    if (displayCtx[prefix] !== undefined) {
        displayCtx[prefix] = false;
    }
});

// Create an off-screen canvas for low-resolution rendering
// All drawing operations happen on this canvas first.
const renderCanvas = document.createElement('canvas');
renderCanvas.width = RENDER_WIDTH;
renderCanvas.height = RENDER_HEIGHT;
const ctx = renderCanvas.getContext('2d'); // This is the primary drawing context for procedural generation

// --- Global State & Configuration ---
// --- Generation Mode ---
let currentMode = 'fractal'; // Current active mode: 'fractal' or 'landscape'
let time = 0; // Global time variable, primarily for animations like landscape scrolling

// --- Mandelbrot Set Parameters ---
const MAX_ITERATIONS = 50; // Iterations for Mandelbrot calculation. Higher = more detail, slower.
let panX = -0.5; // Initial X-coordinate in the complex plane for Mandelbrot view center
let panY = 0;    // Initial Y-coordinate in the complex plane for Mandelbrot view center
let zoom = 1.0;  // Initial zoom level for Mandelbrot

/**
 * Draws the Mandelbrot set onto the renderCanvas.
 * Colors pixels based on how quickly they escape the iteration threshold.
 */
function drawMandelbrot() {
    for (let x = 0; x < RENDER_WIDTH; x++) { // Iterate over each pixel column
        for (let y = 0; y < RENDER_HEIGHT; y++) { // Iterate over each pixel row
            // Map pixel coordinates (x, y) to complex numbers (real, imag)
            // The transformation centers the view, scales it to typical Mandelbrot dimensions,
            // applies zoom, and then applies panning.
            let real = (x - RENDER_WIDTH / 2) * (2.5 / RENDER_WIDTH) / zoom + panX;
            let imag = (y - RENDER_HEIGHT / 2) * (2.0 / RENDER_HEIGHT) / zoom + panY;

            const constReal = real; // c_real for z = z^2 + c
            const constImag = imag; // c_imag for z = z^2 + c

            let n = 0; // Iteration count
            // Mandelbrot iteration loop
            while (n < MAX_ITERATIONS) {
                const rr = real * real; // real part squared
                const ii = imag * imag; // imaginary part squared
                // Check if the point has "escaped" (magnitude squared > 4)
                if (rr + ii > 4) {
                    break; // Escaped
                }
                // Calculate next z: z_next = z^2 + c
                // real_next = real^2 - imag^2 + constReal
                // imag_next = 2 * real * imag + constImag
                const twoRI = 2 * real * imag;
                real = rr - ii + constReal;
                imag = twoRI + constImag;
                n++; // Increment iteration count
            }

            // Color the pixel based on iteration count
            if (n === MAX_ITERATIONS) {
                ctx.fillStyle = '#000'; // Point is likely in the set (black)
            } else {
                // Point escaped; color based on how quickly (n)
                // Using HSV for psychedelic coloring effect
                const hue = (Math.sqrt(n / MAX_ITERATIONS) * 360 * 2) % 360; // Hue cycles, sqrt for smoother gradient
                const saturation = 0.8; // Strong saturation
                const value = 0.9;    // Bright colors

                // HSV to RGB conversion
                let r_rgb, g_rgb, b_rgb; // Use different var names to avoid conflict if 'r,g,b' are used elsewhere
                const i_hsv = Math.floor(hue / 60);
                const f_hsv = hue / 60 - i_hsv;
                const p_hsv = value * (1 - saturation);
                const q_hsv = value * (1 - f_hsv * saturation);
                const t_hsv = value * (1 - (1 - f_hsv) * saturation);
                switch (i_hsv % 6) {
                    case 0: r_rgb = value; g_rgb = t_hsv; b_rgb = p_hsv; break;
                    case 1: r_rgb = q_hsv; g_rgb = value; b_rgb = p_hsv; break;
                    case 2: r_rgb = p_hsv; g_rgb = value; b_rgb = t_hsv; break;
                    case 3: r_rgb = p_hsv; g_rgb = q_hsv; b_rgb = value; break;
                    case 4: r_rgb = t_hsv; g_rgb = p_hsv; b_rgb = value; break;
                    case 5: r_rgb = value; g_rgb = p_hsv; b_rgb = q_hsv; break;
                }
                ctx.fillStyle = `rgb(${Math.floor(r_rgb*255)},${Math.floor(g_rgb*255)},${Math.floor(b_rgb*255)})`;
            }
            ctx.fillRect(x, y, 1, 1); // Draw the calculated pixel
        }
    }
}

// --- Mandelbrot Interaction: Zoom and Pan ---
// Handles mouse wheel events for zooming into/out of the fractal.
displayCanvas.addEventListener('wheel', (event) => {
    event.preventDefault(); // Prevent default page scroll behavior
    if (currentMode !== 'fractal') return; // Only allow interaction if in fractal mode

    const rect = displayCanvas.getBoundingClientRect(); // Get canvas position for accurate mouse coords
    // Convert mouse screen coordinates to *render canvas pixel coordinates*
    const mouseX_render = (event.clientX - rect.left) / PIXEL_SCALE;
    const mouseY_render = (event.clientY - rect.top) / PIXEL_SCALE;

    // Convert mouse render canvas coords to complex plane coords *before* applying the zoom
    const mouseRealBeforeZoom = (mouseX_render - RENDER_WIDTH / 2) * (2.5 / RENDER_WIDTH) / zoom + panX;
    const mouseImagBeforeZoom = (mouseY_render - RENDER_HEIGHT / 2) * (2.0 / RENDER_HEIGHT) / zoom + panY;

    // Apply zoom
    if (event.deltaY < 0) { // Scrolling up / wheel forward
        zoom *= 1.1; // Zoom in
    } else { // Scrolling down / wheel backward
        zoom /= 1.1; // Zoom out
    }

    // To keep the point under the mouse stationary after zoom, we adjust panX and panY.
    // Calculate where the mouse pointer would be in complex coords *after* the zoom, if pan didn't change:
    const mouseRealAfterZoomNoPanAdjust = (mouseX_render - RENDER_WIDTH / 2) * (2.5 / RENDER_WIDTH) / zoom + panX;
    const mouseImagAfterZoomNoPanAdjust = (mouseY_render - RENDER_HEIGHT / 2) * (2.0 / RENDER_HEIGHT) / zoom + panY;

    // The difference is how much we need to shift panX and panY
    panX += mouseRealBeforeZoom - mouseRealAfterZoomNoPanAdjust;
    panY += mouseImagBeforeZoom - mouseImagAfterZoomNoPanAdjust;
});

let isPanning = false; // Flag to track if mouse button is down for panning
let lastPanScreenX, lastPanScreenY; // Store last mouse screen coordinates for calculating delta for panning

// Handles mouse button down events for starting a pan operation.
displayCanvas.addEventListener('mousedown', (event) => {
    if (event.button === 0 && currentMode === 'fractal') { // Left mouse button and in fractal mode
        isPanning = true;
        lastPanScreenX = event.clientX; // Record initial mouse position (screen coordinates)
        lastPanScreenY = event.clientY;
    }
});

// Handles mouse movement events for panning the fractal view.
displayCanvas.addEventListener('mousemove', (event) => {
    if (isPanning && currentMode === 'fractal') { // If dragging and in fractal mode
        const dx_screen = event.clientX - lastPanScreenX; // Change in mouse X (screen pixels)
        const dy_screen = event.clientY - lastPanScreenY; // Change in mouse Y (screen pixels)

        // Convert screen pixel delta to complex plane delta
        // complexUnitsPerPixelX/Y: how many units in the complex plane one render pixel corresponds to
        const complexUnitsPerPixelX = (2.5 / RENDER_WIDTH) / zoom;
        const complexUnitsPerPixelY = (2.0 / RENDER_HEIGHT) / zoom;

        // Adjust panX and panY.
        // (dx_screen / PIXEL_SCALE) converts screen delta to render canvas pixel delta.
        panX -= (dx_screen / PIXEL_SCALE) * complexUnitsPerPixelX;
        panY -= (dy_screen / PIXEL_SCALE) * complexUnitsPerPixelY;

        // Update last mouse position for next movement calculation
        lastPanScreenX = event.clientX;
        lastPanScreenY = event.clientY;
    }
});

// Handles mouse button up events for ending a pan operation.
displayCanvas.addEventListener('mouseup', () => {
    if (currentMode === 'fractal') isPanning = false; // Stop panning when mouse button is released
});

// Handles mouse leaving the canvas area, also ends panning.
displayCanvas.addEventListener('mouseleave', () => {
    if (currentMode === 'fractal') isPanning = false;
});


// --- Main Animation Loop ---
let animationFrameId = null; // Stores ID for requestAnimationFrame, can be used to cancel
/**
 * The main game loop, called repeatedly by requestAnimationFrame.
 * Handles clearing, drawing the current scene, and updating UI.
 * @param {DOMHighResTimeStamp} timestamp - Provided by requestAnimationFrame, can be used for time-based animations.
 */
function controlledGameLoop(timestamp) {
    // 1. Clear the low-resolution render canvas
    ctx.fillStyle = '#111'; // Default background for areas not covered by active generation
    ctx.fillRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);

    // 2. Call the appropriate drawing function based on the current mode
    if (currentMode === 'fractal') {
        drawMandelbrot();
    } else if (currentMode === 'landscape') {
        drawLandscape();
    }

    time += 0.01; // Increment global time (e.g., for landscape scrolling animation)

    // 3. Draw the low-res renderCanvas to the displayCanvas, scaled up
    displayCtx.drawImage(
        renderCanvas, // Source image: our low-res canvas
        0, 0, RENDER_WIDTH, RENDER_HEIGHT,         // Source rectangle (full low-res canvas)
        0, 0, displayCanvas.width, displayCanvas.height // Destination rectangle (full display canvas, scaled)
    );

    // 4. Draw UI elements (text overlays) on top of the scaled image
    drawUI();

    // 5. Request the next frame to continue the loop
    animationFrameId = requestAnimationFrame(controlledGameLoop);
}

/**
 * Draws UI text (mode info, controls) onto the displayCanvas.
 * This text is drawn at full resolution, not pixelated like the main scene.
 */
function drawUI() {
    displayCtx.font = "14px Arial"; // Font for UI text
    displayCtx.fillStyle = "rgba(255, 255, 255, 0.8)"; // Semi-transparent white for readability
    displayCtx.textAlign = "left"; // Align text to the left

    displayCtx.fillText(`Mode: ${currentMode.toUpperCase()} (Press 'M' to switch)`, 10, 20);

    if (currentMode === 'fractal') {
        displayCtx.fillText("Scroll to Zoom, Drag to Pan", 10, 40);
    } else if (currentMode === 'landscape') {
        displayCtx.fillText("Endlessly scrolling landscape...", 10, 40);
    }
    // Future UI elements for other features can be added here
}

// --- Initial Setup Call ---
controlledGameLoop(); // Start the main animation loop


// --- Landscape Generation Parameters & Logic ---
const TERRAIN_HEIGHT_SCALE = 60;  // Maximum height variation for hills in pixels.
const TERRAIN_ROUGHNESS = 0.03;   // Controls the "frequency" or "zoom level" of Perlin noise for terrain.
                                  // Lower values = smoother, wider features. Higher = more jagged, frequent features.
const SKY_COLOR_TOP = [80, 120, 200];    // RGB color for the top of the sky gradient.
const SKY_COLOR_BOTTOM = [150, 180, 220]; // RGB color for the bottom of the sky gradient.
const SUN_COLOR = [255, 255, 200];        // RGB color for the sun.

// Defines a pixel art color palette for the terrain.
// Each object has a `threshold` (for normalized Perlin noise, 0-1) and a `color` (RGB array).
// The terrain will use the color of the highest threshold band that `effectiveNoiseForColor` falls into.
const TERRAIN_COLORS = [
    { threshold: 0.85, color: [90, 130, 50] },  // Brightest green, for peaks
    { threshold: 0.70, color: [70, 100, 40] },  // Mid-tone green
    { threshold: 0.55, color: [50, 80, 30] },   // Darker green
    { threshold: 0.0,  color: [40, 60, 20] }    // Darkest green, for valleys or base areas
];
// Sort thresholds from highest to lowest for easier processing in the `drawLandscape` loop.
TERRAIN_COLORS.sort((a, b) => b.threshold - a.threshold);

/**
 * Draws a procedurally generated landscape onto the renderCanvas.
 * Features a gradient sky, a sun, and Perlin noise-based terrain with color banding.
 */
function drawLandscape() {
    // 1. Draw sky gradient
    // Iterates from top to bottom of the canvas, drawing a thin horizontal line for each row.
    for (let y = 0; y < RENDER_HEIGHT; y++) {
        const ratio = y / RENDER_HEIGHT; // Normalized y position (0 at top, 1 at bottom)
        // Interpolate between SKY_COLOR_TOP and SKY_COLOR_BOTTOM based on ratio
        const r_sky = Math.floor(SKY_COLOR_TOP[0] * (1 - ratio) + SKY_COLOR_BOTTOM[0] * ratio);
        const g_sky = Math.floor(SKY_COLOR_TOP[1] * (1 - ratio) + SKY_COLOR_BOTTOM[1] * ratio);
        const b_sky = Math.floor(SKY_COLOR_TOP[2] * (1 - ratio) + SKY_COLOR_BOTTOM[2] * ratio);
        ctx.fillStyle = `rgb(${r_sky},${g_sky},${b_sky})`;
        ctx.fillRect(0, y, RENDER_WIDTH, 1); // Draw the 1-pixel high line
    }

    // 2. Draw sun
    const sunX = RENDER_WIDTH * 0.7; // Sun's X position (70% across the width)
    const sunY = RENDER_HEIGHT * 0.2; // Sun's Y position (20% from the top)
    const sunRadius = RENDER_WIDTH * 0.08; // Sun's radius, relative to render width
    ctx.fillStyle = `rgb(${SUN_COLOR[0]}, ${SUN_COLOR[1]}, ${SUN_COLOR[2]})`;
    ctx.beginPath(); // Start new path for the circle
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2); // Define arc (full circle)
    ctx.fill(); // Fill the circle

    // 3. Draw terrain using Perlin noise and color banding
    // Iterates across each column of the render canvas.
    for (let x = 0; x < RENDER_WIDTH; x++) {
        // Generate Perlin noise value for this x-coordinate.
        // `x * TERRAIN_ROUGHNESS` scales the input to Perlin noise, affecting feature size.
        // `+ time` makes the landscape scroll horizontally, creating an "endless" effect.
        // `0.5` is an arbitrary y-offset in the 2D noise space to get a varied line.
        const noiseVal = PerlinNoise.noise(x * TERRAIN_ROUGHNESS + time, 0.5);
        const normalizedNoise = (noiseVal + 1) / 2; // Map Perlin noise from [-1, 1] range to [0, 1]

        const terrainBaseLine = RENDER_HEIGHT * 0.55; // Average height of the ground.
        // Calculate the actual height of the terrain at this x position.
        const currentTerrainHeight = terrainBaseLine + (normalizedNoise * TERRAIN_HEIGHT_SCALE);
        const startY = Math.floor(currentTerrainHeight); // Integer Y pixel where terrain surface starts for this column.

        // Fill downwards from the terrain surface (startY) to the bottom of the canvas.
        for (let y_terrain = startY; y_terrain < RENDER_HEIGHT; y_terrain++) {
            // Determine color based on the height of this specific terrain column (normalizedNoise)
            // and also how far down the slope this y-pixel is (yRatioRelativeToPeak).
            const yRatioRelativeToPeak = (y_terrain - startY) / (RENDER_HEIGHT - startY); // 0 at peak, ~1 at bottom
            // `effectiveNoiseForColor` uses the column's peak noise, slightly darkened for pixels further down its slope.
            // This adds a subtle shading effect within the color bands, making peaks slightly brighter than their bases.
            const effectiveNoiseForColor = normalizedNoise * (1 - yRatioRelativeToPeak * 0.3);

            let r_terrain, g_terrain, b_terrain; // Variables for the chosen terrain color
            // Find the correct color band from TERRAIN_COLORS based on effectiveNoiseForColor.
            for (const band of TERRAIN_COLORS) {
                if (effectiveNoiseForColor >= band.threshold) {
                    [r_terrain, g_terrain, b_terrain] = band.color; // Destructure color array
                    break; // Found the appropriate band, use its color
                }
            }
            // Fallback color if no threshold was met (shouldn't happen if a 0.0 threshold is defined).
            if (r_terrain === undefined) [r_terrain,g_terrain,b_terrain] = TERRAIN_COLORS[TERRAIN_COLORS.length-1].color;

            ctx.fillStyle = `rgb(${r_terrain},${g_terrain},${b_terrain})`;
            ctx.fillRect(x, y_terrain, 1, 1); // Draw a single terrain pixel
        }
    }
}


// --- UI Interaction: Mode Switching ---
// Handles keyboard events for switching between generation modes.
window.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') { // Check for 'M' or 'm' key press
        if (currentMode === 'fractal') {
            currentMode = 'landscape';
            console.log("Switched to Landscape Mode");
        } else {
            currentMode = 'fractal';
            console.log("Switched to Fractal Mode");
            // Optional: Could reset fractal pan/zoom here if desired upon switching back to fractal mode.
            // e.g., panX = -0.5; panY = 0; zoom = 1.0;
        }
        // The main loop will pick up the new `currentMode` on its next iteration.
    }
});

// Optional: Handle window resizing if a responsive design is desired.
// For the current setup, canvas size is fixed by PIXEL_SCALE and RENDER_WIDTH/HEIGHT.
window.addEventListener('resize', () => {
    // Example: To re-center the canvas if the window is larger than the canvas.
    // This ensures the canvas remains centered in the browser window.
    // const { innerWidth, innerHeight } = window;
    // displayCanvas.style.position = 'absolute'; // Ensure canvas can be positioned
    // displayCanvas.style.left = `${Math.max(0, (innerWidth - displayCanvas.width) / 2)}px`;
    // displayCanvas.style.top = `${Math.max(0, (innerHeight - displayCanvas.height) / 2)}px`;
});

// Initial console logs for user information when the script loads.
console.log(`Render canvas (internal): ${RENDER_WIDTH}x${RENDER_HEIGHT}`);
console.log(`Display canvas (scaled): ${displayCanvas.width}x${displayCanvas.height}`);
console.log("App initialized. Press 'M' to switch modes.");
console.log("In Fractal mode: Use mouse wheel to zoom, click and drag to pan.");
