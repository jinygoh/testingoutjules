# Endless Psychedelic Pixel Worlds V3

This is a backendless web application that procedurally generates an endless, evolving psychedelic alien world in a pixel art style. The application continuously morphs its visuals, presenting ever-changing surreal landscapes, skies, celestial bodies, flora, fauna, and atmospheric effects. This version includes rivers, boulders, more entity variety, basic flocking AI for birds, and refined placement logic.

## Core Features

*   **Pixel Art Rendering:** Visuals are rendered at a low internal resolution (default 320x240) and then scaled up with nearest-neighbor interpolation to preserve crisp pixels.
*   **Dynamic Psychedelic Sky:**
    *   Generated using animated and rotating Perlin noise for a swirling, aurora/nebula-like effect.
    *   Features an evolving color palette that aims to contrast with the landscape palette, especially after major scene changes.
    *   Includes a layer of twinkling stars with subtle parallax, drawn on top of the psychedelic sky effects.
*   **Procedural Celestial Bodies (Planets):**
    *   Planets of varying sizes and colors are generated.
    *   Surfaces have evolving, rotating procedural textures derived from Perlin noise with enhanced contrast.
    *   Planets move across the sky, spawn, and despawn dynamically.
*   **Surreal Scrolling Landscape:**
    *   Endless horizontal scrolling terrain.
    *   Terrain shape generated using multiple layers of Perlin noise, creating bizarre and unpredictable forms.
    *   Features an evolving psychedelic color palette.
    *   Includes procedurally generated rivers that carve through the terrain, with their own distinct appearance and animated surface. River paths and widths change with major scene evolutions.
    *   Atmospheric haze effect for depth and surrealism on the main landscape.
*   **Procedural Flora:**
    *   Diverse alien plants of several types (e.g., Tall Spires, Glow Orb Stalks, Crystal Clusters, Flat Cap Mushrooms, Tendril Plants) are procedurally generated.
    *   Plants have their own evolving color palette and feature subtle animations like size pulsation or bobbing.
    *   Spawn on the main landscape, with logic to avoid rivers and very steep/isolated peaks for more natural placement.
    *   Also spawn on the foreground parallax layer.
*   **Procedural Fauna:**
    *   **Floaters:** Abstract, multi-part creatures that drift and bob in the mid-sky.
    *   **Alien Birds (Flockers):** Bird-like creatures that fly in the sky with flapping wing animations. They exhibit basic flocking behaviors (separation, alignment, cohesion) with other nearby birds.
    *   **Crawlers:** Multi-segmented creatures that move along the terrain surface, their bodies undulating and conforming to the contours.
    *   Fauna has its own evolving color palette and animated visual effects.
*   **Procedural Boulders:**
    *   Irregularly shaped boulders, often composite/clustered, with procedural textures.
    *   Spawn on the main landscape (avoiding rivers/steep peaks) and on the foreground parallax layer.
    *   Their colors are derived from a desaturated version of the landscape palette.
*   **Layered Parallax Scrolling:**
    *   **Sky Layer:** Slowest scroll for distant sky elements and stars.
    *   **Main Scene Layer:** Contains the primary landscape, rivers, and most flora/fauna/boulders, scrolling at a standard speed.
    *   **Foreground Parallax Layer:** Scrolls faster than the main scene (current factor ~1.1x), populated with larger versions of some flora and boulders, creating a enhanced sense of depth.
*   **Scene Evolution Engine:**
    *   **Gradual Evolution:** Colors, textures, and positions of elements change continuously via `masterTime` and individual entity logic. Palettes for sky, landscape, flora, and fauna evolve on their own intervals.
    *   **Major Scene Transitions:** Approximately every 2 minutes (configurable `MAJOR_SCENE_EVOLUTION_INTERVAL`), the entire world undergoes a significant transformation:
        *   Perlin noise is re-seeded.
        *   Color palettes are forcefully evolved.
        *   Starfield, river parameters, and all dynamic entities are cleared and re-initialized.
*   **Increased Entity Density:** Spawn rates for most entities have been increased for a more populated world.

## How to Run

1.  Clone or download the repository.
2.  Open the `index.html` file in a modern web browser that supports HTML5 Canvas and JavaScript ES6 (e.g., Chrome, Firefox, Edge, Safari).

## Code Structure

*   `index.html`: Main HTML file; sets up canvas, includes JavaScript files.
*   `app.js`: Core application logic:
    *   Canvas setup, scaling, main animation loop (`animationLoop`), rendering pipeline (`render`).
    *   Time management (`masterTime`, `sceneTime`, `deltaTime`).
    *   Procedural generation modules for Sky, Stars, Planets, Landscape (including Rivers), Flora, Fauna (Floaters, Birds with flocking, Crawlers), Boulders.
    *   Separate generation and drawing functions for main scene and foreground parallax elements.
    *   Palette evolution and Major Scene Change logic.
*   `noise.js`: Self-contained Perlin noise implementation.
*   `utils.js`: Helper functions (randomization, math, color conversion, Vec2).
*   Embedded `<style>` in `index.html`: Basic CSS.

## Implementation Notes

*   **Entity Placement:** Spawning logic for ground-based entities (flora, boulders, crawlers) on the main landscape includes checks to avoid rivers and overly steep/isolated peaks for more natural grounding.
*   **Performance:** While many elements are generative and animated, the low rendering resolution (320x240) is key to maintaining performance. Flocking AI is currently O(N^2) with respect to number of birds, but `MAX_FAUNA` keeps N small.

This project is an ongoing exploration of procedural content generation, aiming for a continuously surprising, visually rich, and psychedelic experience.
