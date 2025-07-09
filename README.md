# Endless Psychedelic Pixel Worlds

This is a backendless web application that procedurally generates an endless, evolving psychedelic alien world in a pixel art style. The application continuously morphs its visuals, presenting ever-changing surreal landscapes, skies, celestial bodies, flora, and fauna.

## Features

*   **Pixel Art Rendering:** Visuals are rendered at a low internal resolution (320x240) and then scaled up with nearest-neighbor interpolation to preserve crisp pixels.
*   **Dynamic Psychedelic Sky:**
    *   Generated using animated and rotating Perlin noise.
    *   Colors evolve over time, creating aurora-like or nebula-like effects.
*   **Procedural Celestial Bodies (Planets):**
    *   Planets of varying sizes and colors are generated.
    *   Surfaces have evolving, rotating procedural textures derived from Perlin noise.
    *   Planets move across the sky, spawn, and despawn dynamically.
*   **Surreal Scrolling Landscape:**
    *   Endless horizontal scrolling terrain.
    *   Terrain shape generated using multiple layers of Perlin noise, creating bizarre and unpredictable forms.
    *   Features an evolving psychedelic color palette.
    *   Atmospheric haze effect for depth and surrealism.
*   **Alien Flora (Plants):**
    *   Several types of alien plants (e.g., Tall Spires, Glow Orb Stalks, Crystal Clusters) are procedurally generated and placed on the landscape.
    *   Plants have their own evolving color palette.
    *   Many plant types feature subtle animations like size pulsation or bobbing.
*   **Alien Fauna (Animals):**
    *   Simple "Floater" type creatures are generated.
    *   Floaters move through the sky with a bobbing, undulating motion.
    *   Fauna has its own evolving color palette and pulsating visual effects.
*   **Scene Evolution Engine:**
    *   **Gradual Evolution:** Colors, textures, and positions of elements change continuously.
    *   **Major Scene Transitions:** Approximately every 2 minutes, the entire world undergoes a significant transformation:
        *   Perlin noise is re-seeded, fundamentally changing all generated patterns.
        *   Color palettes for sky, landscape, flora, and fauna are newly evolved.
        *   Existing planets, plants, and animals are cleared, making way for new entities fitting the new "biome."
*   **Minimal Dependencies:** Runs entirely in the browser using vanilla JavaScript, HTML, and CSS. Uses self-contained `noise.js` (Perlin noise) and `utils.js` (helpers).

## How to Run

1.  Clone or download the repository.
2.  Open the `index.html` file in a modern web browser that supports HTML5 Canvas and JavaScript ES6 (e.g., Chrome, Firefox, Edge, Safari).

## Code Structure

*   `index.html`: The main HTML file that sets up the canvas and includes the JavaScript files in the correct order.
*   `app.js`: Contains the main application logic, including:
    *   Canvas setup and scaling for pixel art.
    *   The main animation loop (`animationLoop`) and rendering pipeline (`render`).
    *   Time management (`masterTime`, `sceneTime`, `deltaTime`).
    *   All procedural generation modules:
        *   `drawPsychedelicSky()`
        *   `drawPlanets()`, `generatePlanetProps()`
        *   `drawLandscape()`, `evolveLandscapePalette()`, `getTerrainHeightAt()`
        *   `drawFlora()`, `spawnPlant()`, `evolveFloraPalette()`, individual plant type drawing functions.
        *   `drawFauna()`, `spawnFauna()`, `evolveFaunaPalette()`, individual fauna type drawing functions.
    *   Scene evolution logic (`triggerMajorSceneChange()`).
*   `noise.js`: A self-contained Perlin noise implementation. It's seeded on load and re-seeded during major scene changes.
*   `utils.js`: A collection of helper functions for randomization, math operations, color conversions (HSL to RGB), and a simple Vec2 class.
*   Embedded `<style>` in `index.html`: Basic CSS for page layout and canvas display.

## Implementation Notes

*   **Backendless & No External Libraries:** The project is entirely client-side and self-contained.
*   **Procedural Generation:** Leverages Perlin noise extensively for generating organic and unpredictable patterns. Randomness is used for variety in sizes, colors, speeds, and spawning.
*   **Evolving Aesthetics:** Color palettes for different world elements (landscape, flora, fauna) evolve independently and also shift during major scene transitions, contributing to the psychedelic and ever-changing feel.
*   **Performance:** While not heavily optimized, the low rendering resolution helps maintain reasonable performance for the complexity involved.

This project aims to create a continuously surprising and visually rich procedurally generated world.
