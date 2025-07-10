# Random Color Palette Generator

This is a simple backendless web application that allows users to generate random color palettes. It's designed for front-end developers, website designers, or anyone who needs quick color inspiration.

## Features

*   **Visual Color Picker**:
    *   **Hue Wheel**: Select the base hue by clicking or dragging on a visual color wheel.
    *   **Saturation/Lightness (S/L) Picker**: Adjust the saturation and lightness of the selected hue on a separate picker square.
    *   Markers on both pickers indicate the current selection.
*   **Interactive Harmony Generator**:
    *   The color selected via the visual picker (or by typing into the Hex input field) serves as the base for harmony calculations.
    *   **Hex Input Sync**: The Hex input field is synchronized with the visual picker and can also be used to set the base color.
    *   Select a color harmony rule (Analogous, Monochromatic, Split Complement, Triad, Tetrad, Complement, Shades) from a dropdown.
    *   The palette automatically updates as the base color or harmony rule changes.
    *   **Harmony Indicators**: The Hue Wheel displays small indicators for the hues of the other colors in the currently generated harmony palette.
*   **Random Palette Generation**: Click the "Random Palette" button to instantly generate a new palette of 5 random colors.
*   **Visual Swatches**: Colors are displayed as clear visual swatches for all generated palettes.
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
    *   Visual color picker implementation (Hue wheel, S/L picker using HTML5 Canvas).
    *   Event handling for interactive color selection on canvas.
    *   Synchronization between visual picker and Hex input field.
    *   Interactive harmony palette generation (using TinyColor.js).
    *   Drawing of harmony indicators on the hue wheel.
    *   DOM manipulation for displaying palettes.
    *   Copy-to-clipboard functionality.

## Inspiration

This project draws inspiration from websites like:

*   [Adobe Color](https://color.adobe.com/create/color-wheel)
*   [ColorHunt](https://colorhunt.co/)

While simpler in its current form, it aims to provide a quick and easy tool for color discovery.

## Future Enhancements (Ideas)

*   Allow users to specify the number of colors per palette for both random and harmony generators.
*   More advanced color harmony options or fine-tuning adjustments (e.g., angle/distance for analogous, specific brightness/saturation steps for monochromatic).
*   Refine visual appearance and responsiveness of the color pickers.
*   Touch event optimization for smoother interaction on mobile devices for the canvas pickers.
*   Save/load/share palettes (e.g., using local storage or URL parameters).
*   Display color information in other formats (RGB, HSL).
*   Accessibility improvements (e.g., WCAG contrast checks for generated palettes).
*   Dark mode.
*   Ability to manually adjust individual colors within a generated palette.
*   Undo/redo functionality.
