# Endless Psychedelic Pixel Worlds V2

This is a backendless web application that procedurally generates an endless, evolving psychedelic alien world in a pixel art style. The application continuously morphs its visuals, presenting ever-changing surreal landscapes, skies, celestial bodies, flora, fauna, and atmospheric effects. This version builds upon a previous iteration by adding more complex environmental features and layering.

## Core Features

*   **Pixel Art Rendering:** Visuals are rendered at a low internal resolution (default 320x240) and then scaled up with nearest-neighbor interpolation to preserve crisp pixels.
*   **Dynamic Psychedelic Sky:**
    *   Generated using animated and rotating Perlin noise for a swirling, aurora/nebula-like effect.
    *   Features an evolving color palette that aims to contrast with the landscape palette.
    *   Includes a layer of twinkling stars with subtle parallax.
*   **Procedural Celestial Bodies (Planets):**
    *   Planets of varying sizes and colors are generated.
    *   Surfaces have evolving, rotating procedural textures derived from Perlin noise with enhanced contrast.
    *   Planets move across the sky, spawn, and despawn dynamically.
*   **Surreal Scrolling Landscape:**
    *   Endless horizontal scrolling terrain.
    *   Terrain shape generated using multiple layers of Perlin noise, creating bizarre and unpredictable forms.
    *   Features an evolving psychedelic color palette.
    *   Includes procedurally generated rivers that carve through the terrain, with their own distinct appearance and animated surface.
    *   Atmospheric haze effect for depth and surrealism on the main landscape.
*   **Procedural Flora:**
    *   Several types of alien plants (e.g., Tall Spires, Glow Orb Stalks, Crystal Clusters) are procedurally generated.
    *   Plants have their own evolving color palette and feature subtle animations like size pulsation or bobbing.
    *   Spawn on the main landscape (avoiding rivers) and on the foreground parallax layer.
*   **Procedural Fauna:**
    *   **Floaters:** Abstract, multi-part creatures that drift and bob in the mid-sky.
    *   **Alien Birds (Flockers):** Simple bird-like creatures that fly across the sky with flapping wing animations (currently independent, no advanced flocking AI).
    *   Fauna has its own evolving color palette and pulsating/undulating visual effects.
*   **Procedural Boulders:**
    *   Irregularly shaped boulders with procedural textures spawn on the main landscape (avoiding rivers) and on the foreground parallax layer.
    *   Their colors are derived from a desaturated version of the landscape palette.
*   **Layered Parallax Scrolling:**
    *   **Sky Layer:** Slowest scroll for distant sky elements and stars.
    *   **Main Scene Layer:** Contains the primary landscape, rivers, and most flora/fauna, scrolling at a standard speed.
    *   **Foreground Parallax Layer:** Scrolls faster than the main scene, populated with larger versions of some flora and boulders, creating a strong sense of depth.
*   **Scene Evolution Engine:**
    *   **Gradual Evolution:** Colors, textures, and positions of elements change continuously via `masterTime` and individual entity logic. Palettes for sky, landscape, flora, and fauna evolve on their own intervals.
    *   **Major Scene Transitions:** Approximately every 2 minutes (configurable), the entire world undergoes a significant transformation:
        *   Perlin noise is re-seeded, fundamentally changing all generated patterns.
        *   Color palettes are forcefully evolved (sky palette aims to contrast new landscape palette).
        *   River parameters (width, path seed) are reset.
        *   Starfield is re-initialized.
        *   Existing dynamic entities (planets, flora, fauna, boulders on all layers) are cleared, making way for new entities fitting the new "biome."

## How to Run

1.  Clone or download the repository.
2.  Open the `index.html` file in a modern web browser that supports HTML5 Canvas and JavaScript ES6 (e.g., Chrome, Firefox, Edge, Safari).

## Code Structure

*   `index.html`: The main HTML file; sets up the canvas and includes JavaScript files in the correct order.
*   `app.js`: Contains the primary application logic:
    *   Canvas setup, scaling, and main animation loop (`animationLoop`).
    *   Time management (`masterTime`, `sceneTime`, `deltaTime`).
    *   Rendering pipeline (`render`) orchestrating different layers and scroll speeds.
    *   All procedural generation modules and their drawing functions for:
        *   Sky (`drawPsychedelicSky`), Stars (`drawStars`, `initializeStars`).
        *   Planets (`drawPlanets`, `generatePlanetProps`).
        *   Landscape (`drawLandscape`), including River generation logic.
        *   Flora (`drawFlora`, `spawnPlant`, individual plant type renderers like `drawTallSpire`).
        *   Fauna (`drawFauna`, `spawnFauna`, individual fauna type renderers like `drawFloater`, `drawBirdFlockerShape`).
        *   Boulders (`drawBoulders`, `spawnBoulder`, `drawBoulderShape`).
        *   Foreground Layer (`drawForeground`, `drawFgFlora`, `spawnFgPlant`, `drawFgBoulders`, `spawnFgBoulder`).
    *   Palette evolution for each category (`evolveSkyPalette`, `evolveLandscapePalette`, etc.).
    *   Scene evolution logic (`triggerMajorSceneChange`).
*   `noise.js`: A self-contained Perlin noise implementation. Seeded on load and re-seeded during major scene changes.
*   `utils.js`: Helper functions for randomization, math operations, color conversions (HSL to RGB), and a simple Vec2 class.
*   Embedded `<style>` in `index.html`: Basic CSS for page layout.

## Implementation Notes

*   **Backendless & Self-Contained:** Runs entirely client-side. No external libraries beyond `noise.js` and `utils.js`.
*   **Layering and Parallax:** The rendering is structured to draw distinct layers (sky, main scene, foreground) at different effective scroll speeds to create depth.
*   **World Coordinates:** Most dynamic entities (plants, animals, boulders) store their primary horizontal position as `worldX`. Their on-screen position (`screenX`) is then calculated based on `worldX` minus the current scroll offset of their respective layer.
*   **Continuous Evolution:** The use of `masterTime` in many noise functions and animation calculations ensures that the world is always subtly (or significantly) changing.

This project is an exploration of procedural content generation, aiming for a visually rich, ever-changing, and psychedelic experience.
