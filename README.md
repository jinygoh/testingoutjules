# Procedural Pixel Art Generator

This is a backendless web application that procedurally generates endless visuals in a pixel art style. It currently features two modes:
1.  **Fractal Mode:** Displays an interactive Mandelbrot set with psychedelic coloring.
2.  **Landscape Mode:** Displays an endlessly scrolling procedurally generated landscape with a pixel art aesthetic.

## Features

*   **Pixel Art Rendering:** Visuals are rendered at a low internal resolution (320x240) and then scaled up with nearest-neighbor interpolation to preserve crisp pixels.
*   **Mandelbrot Fractal:**
    *   Interactive pan (click and drag) and zoom (mouse wheel).
    *   Psychedelic coloring based on iteration counts using an HSV-to-RGB conversion.
*   **Procedural Landscape:**
    *   Endless horizontal scrolling.
    *   Terrain generated using Perlin noise.
    *   Banded color shading for a distinct pixel art style.
    *   Simple gradient sky and a sun.
*   **Mode Switching:** Press the 'M' key to toggle between Fractal and Landscape modes.
*   **Minimal Dependencies:** Runs entirely in the browser using vanilla JavaScript, HTML, and CSS. No external libraries beyond the provided `noise.js` for Perlin noise.

## How to Run

1.  Clone or download the repository.
2.  Open the `index.html` file in a modern web browser that supports HTML5 Canvas and JavaScript ES6.

## Code Structure

*   `index.html`: The main HTML file that sets up the canvas and includes the JavaScript files.
*   `app.js`: Contains the main application logic, including:
    *   Canvas setup and scaling for pixel art.
    *   The main rendering loop (`controlledGameLoop`).
    *   Mandelbrot set generation (`drawMandelbrot`) and interaction handlers.
    *   Landscape generation (`drawLandscape`).
    *   UI drawing (`drawUI`) for on-screen text.
    *   Mode switching logic.
*   `noise.js`: A self-contained Perlin noise implementation used for landscape generation.
*   `style` (in `index.html`): Basic CSS for page layout and canvas display.

## Future Development Ideas (Not Yet Implemented)

*   Generation of pixel art animals and plants.
*   More complex sky features (clouds, stars, aurorae).
*   Procedurally generated planets or space scenes.
*   More varied and surreal color palettes and themes.
*   User controls for generation parameters (e.g., colors, terrain roughness, fractal iterations).
*   Sound effects or ambient music.
*   Additional fractal types (Julia sets, etc.).
*   Performance optimizations for more complex scenes (e.g., Web Workers).

## Implementation Choices

*   **No React:** As per the initial requirement, the project uses vanilla JavaScript.
*   **Free Imports:** All code is self-contained or uses the provided `noise.js`. No external libraries are fetched.
*   **Backendless:** Runs entirely client-side in the browser.

This project serves as a foundation for exploring procedural content generation techniques.
