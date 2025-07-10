# Random Color Palette Generator

This is a simple backendless web application that allows users to generate random color palettes. It's designed for front-end developers, website designers, or anyone who needs quick color inspiration.

## Features

*   **Random Palette Generation**: Click the "Random Palette" button to instantly generate a new palette of 5 random colors.
*   **Interactive Harmony Generator**:
    *   Enter a base color in Hex format (e.g., `#3498db` or `3498db`).
    *   Select a color harmony rule (Analogous, Monochromatic, Split Complement, Triad, Tetrad, Complement, Shades).
    *   Click "Generate Harmony" to see the calculated palette.
    *   An initial harmony palette is also displayed on page load based on default values.
*   **Visual Swatches**: Colors are displayed as clear visual swatches for both types of generation.
*   **Hex Codes**: The hexadecimal code for each color is displayed below its swatch.
*   **Copy to Clipboard**: Click on any color swatch or its hex code to copy the hex code to your clipboard. Visual feedback is provided upon successful copy.
*   **Responsive Design**: The layout adjusts for different screen sizes.
*   **Lightweight**: Built with vanilla HTML, CSS, and JavaScript, using the [TinyColor](https://github.com/bgrins/TinyColor) library (via CDN) for advanced color manipulations and harmony calculations.

## How to Run

1.  Clone this repository or download the files (`index.html`, `style.css`, `script.js`).
2.  Open the `index.html` file in any modern web browser.

That's it! You can start generating color palettes immediately.

## Project Structure

*   `index.html`: The main HTML file containing the structure of the web page.
*   `style.css`: The CSS file for styling the application.
*   `script.js`: The JavaScript file containing all logic:
    *   Random color and palette generation.
    *   Interactive harmony palette generation (using TinyColor.js).
    *   DOM manipulation for displaying palettes.
    *   Copy-to-clipboard functionality.

## Inspiration

This project draws inspiration from websites like:

*   [Adobe Color](https://color.adobe.com/create/color-wheel)
*   [ColorHunt](https://colorhunt.co/)

While simpler in its current form, it aims to provide a quick and easy tool for color discovery.

## Future Enhancements (Ideas)

*   Allow users to specify the number of colors per palette for both random and harmony generators.
*   **Graphical Color Wheel Picker**: Implement a visual color wheel (e.g., using HTML Canvas or an SVG-based solution) for selecting the base color, similar to Adobe Color.
*   More advanced color harmony options or adjustments.
*   Save/load/share palettes (e.g., using local storage or URL parameters).
*   Display color information in other formats (RGB, HSL).
*   Accessibility improvements (e.g., WCAG contrast checks for generated palettes).
*   Dark mode.
*   Ability to manually adjust individual colors within a generated palette.
*   Undo/redo functionality.
