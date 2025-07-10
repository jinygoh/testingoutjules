import tinycolor from 'https://esm.sh/tinycolor2';

document.addEventListener('DOMContentLoaded', () => {
    // Existing selectors
    const randomPaletteBtn = document.getElementById('randomPaletteBtn');
    const paletteDisplay = document.getElementById('paletteDisplay');
    const paletteDisplayTitle = document.getElementById('paletteDisplayTitle');

    // New selectors for interactive generator
    const baseColorInput = document.getElementById('baseColorInput');
    const harmonyRuleSelect = document.getElementById('harmonyRuleSelect');
    const generateHarmonyBtn = document.getElementById('generateHarmonyBtn');

    // Canvas elements for Color Wheel
    const hueWheelCanvas = document.getElementById('hueWheelCanvas');
    const slPickerCanvas = document.getElementById('slPickerCanvas');
    const hueWheelCtx = hueWheelCanvas.getContext('2d');
    const slPickerCtx = slPickerCanvas.getContext('2d');

    const NUM_COLORS_PER_PALETTE = 5; // Default for random, might be different for harmonies

    // --- State for Color Picker ---
    let currentHue = 0; // 0-360
    let currentSaturation = 1; // 0-1 (for HSL)
    let currentLightness = 0.5; // 0-1 (for HSL)
    let isDraggingHue = false;
    let isDraggingSL = false;
    // Note: TinyColor uses S and L in range 0-1 for HSL objects

    // --- Canvas Drawing Utilities & Logic ---
    const HUE_WHEEL_RADIUS = hueWheelCanvas.width / 2;
    const HUE_MARKER_RADIUS = 8;
    const SL_MARKER_RADIUS = 6;
    const HARMONY_INDICATOR_RADIUS = 4; // Smaller radius for harmony indicators

    // Modified drawHueWheel to accept harmony colors
    function drawHueWheel(harmonyPaletteColors = []) {
        hueWheelCtx.clearRect(0, 0, hueWheelCanvas.width, hueWheelCanvas.height);
        const centerX = hueWheelCanvas.width / 2;
        const centerY = hueWheelCanvas.height / 2;
        const radius = HUE_WHEEL_RADIUS * 0.85;
        const bandThickness = HUE_WHEEL_RADIUS * 0.15 * 2;

        for (let angle = 0; angle < 360; angle += 1) {
            const startAngle = (angle - 1) * Math.PI / 180; // Angle in radians
            const endAngle = angle * Math.PI / 180;
            hueWheelCtx.beginPath();
            hueWheelCtx.arc(centerX, centerY, radius, startAngle, endAngle);
            hueWheelCtx.lineWidth = bandThickness;
            hueWheelCtx.strokeStyle = `hsl(${angle}, 100%, 50%)`;
            hueWheelCtx.stroke();
        }

        // Draw the hue marker
        const markerAngle = currentHue * Math.PI / 180;
        const markerX = centerX + Math.cos(markerAngle) * radius;
        const markerY = centerY + Math.sin(markerAngle) * radius;

        hueWheelCtx.beginPath();
        hueWheelCtx.arc(markerX, markerY, HUE_MARKER_RADIUS, 0, 2 * Math.PI);
        hueWheelCtx.fillStyle = 'white';
        hueWheelCtx.fill();
        hueWheelCtx.strokeStyle = '#333';
        hueWheelCtx.lineWidth = 2;
        hueWheelCtx.stroke();

        // Draw harmony color indicators
        if (harmonyPaletteColors && harmonyPaletteColors.length > 0) {
            const baseColorHex = tinycolor({h: currentHue, s: currentSaturation, l: currentLightness}).toHexString();
            harmonyPaletteColors.forEach(hexColor => {
                if (hexColor.toLowerCase() === baseColorHex.toLowerCase()) return; // Don't draw indicator for base color

                const color = tinycolor(hexColor);
                if (color.isValid()) {
                    const hsl = color.toHsl();
                    const harmonyAngleRad = hsl.h * Math.PI / 180;
                    const hX = centerX + Math.cos(harmonyAngleRad) * radius;
                    const hY = centerY + Math.sin(harmonyAngleRad) * radius;

                    hueWheelCtx.beginPath();
                    hueWheelCtx.arc(hX, hY, HARMONY_INDICATOR_RADIUS, 0, 2 * Math.PI);
                    // Style for harmony indicators (e.g., smaller, different border)
                    hueWheelCtx.fillStyle = hsl.l > 0.5 ? '#333' : '#fff'; // Ensure visibility
                    hueWheelCtx.fill();
                    hueWheelCtx.strokeStyle = hsl.l > 0.5 ? '#fff' : '#333';
                    hueWheelCtx.lineWidth = 1;
                    hueWheelCtx.stroke();
                }
            });
        }
    }

    function drawSLPicker() {
        slPickerCtx.clearRect(0, 0, slPickerCanvas.width, slPickerCanvas.height);
        const width = slPickerCanvas.width;
        const height = slPickerCanvas.height;

        // Fill with base hue (fully saturated, 50% lightness)
        slPickerCtx.fillStyle = `hsl(${currentHue}, 100%, 50%)`;
        slPickerCtx.fillRect(0, 0, width, height);

        // Saturation gradient (white to transparent)
        const satGradient = slPickerCtx.createLinearGradient(0, 0, width, 0);
        satGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        satGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        slPickerCtx.fillStyle = satGradient;
        slPickerCtx.fillRect(0, 0, width, height);

        // Lightness gradient (black to transparent)
        const lightGradient = slPickerCtx.createLinearGradient(0, 0, 0, height);
        lightGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        lightGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        slPickerCtx.fillStyle = lightGradient;
        slPickerCtx.fillRect(0, 0, width, height);

        // Draw the S/L marker
        const markerX = currentSaturation * width;
        const markerY = (1 - currentLightness) * height; // Lightness is 1 at top, 0 at bottom

        slPickerCtx.beginPath();
        slPickerCtx.arc(markerX, markerY, SL_MARKER_RADIUS, 0, 2 * Math.PI);
        // Determine marker color based on lightness for visibility
        const markerFillColor = currentLightness > 0.5 ? 'black' : 'white';
        slPickerCtx.fillStyle = markerFillColor;
        slPickerCtx.fill();
        slPickerCtx.strokeStyle = currentLightness > 0.5 ? 'white' : 'black';
        slPickerCtx.lineWidth = 1.5;
        slPickerCtx.stroke();
    }

    // --- Existing Random Palette Functions ---
    function getRandomHexColor() {
        let hexColor = '#';
        const hexChars = '0123456789ABCDEF';
        for (let i = 0; i < 6; i++) {
            hexColor += hexChars[Math.floor(Math.random() * 16)];
        }
        return hexColor;
    }

    // Function to generate a palette (an array of hex colors)
    function generatePalette() {
        const colors = [];
        for (let i = 0; i < NUM_COLORS_PER_PALETTE; i++) {
            colors.push(getRandomHexColor());
        }
        return colors;
    }

    // --- Interactive Harmony Palette Functions ---

    function generateHarmonyPalette(baseColorValue, harmonyRule) {
        const base = tinycolor(baseColorValue);
        if (!base.isValid()) {
            alert("Invalid base color provided. Please enter a valid hex code (e.g., #3498db or 3498db).");
            return null;
        }

        let harmonyColors = [];

        switch (harmonyRule) {
            case 'analogous':
                // TinyColor's analogous returns more than 5 by default, let's take the base and 4 others.
                harmonyColors = base.analogous(NUM_COLORS_PER_PALETTE + 1).map(tc => tc.toHexString()); // +1 to include base, then slice
                harmonyColors = [base.toHexString(), ...harmonyColors.slice(1, NUM_COLORS_PER_PALETTE)]; // Ensure base is first and limit
                break;
            case 'monochromatic':
                harmonyColors = base.monochromatic(NUM_COLORS_PER_PALETTE).map(tc => tc.toHexString());
                break;
            case 'splitcomplement':
                // Returns base + 2 others. We might want more to make a palette of 5.
                // Let's get the base, the two split complements, and then generate 2 shades/tints for variety.
                const splitComps = base.splitcomplement().map(tc => tc.toHexString()); // [base, c1, c2]
                harmonyColors = [splitComps[0]]; // Base
                harmonyColors.push(splitComps[1]); // Split Comp 1
                harmonyColors.push(tinycolor(splitComps[1]).lighten(15).toHexString()); // Lighter version of Split Comp 1
                harmonyColors.push(splitComps[2]); // Split Comp 2
                harmonyColors.push(tinycolor(splitComps[2]).darken(15).toHexString()); // Darker version of Split Comp 2
                harmonyColors = harmonyColors.slice(0, NUM_COLORS_PER_PALETTE);
                break;
            case 'triad':
                harmonyColors = base.triad().map(tc => tc.toHexString()); // [base, c1, c2]
                // To get to 5, let's add a lighter version of c1 and a darker of c2
                if (harmonyColors.length < NUM_COLORS_PER_PALETTE && harmonyColors.length > 1) {
                    harmonyColors.push(tinycolor(harmonyColors[1]).lighten(20).toHexString());
                }
                if (harmonyColors.length < NUM_COLORS_PER_PALETTE && harmonyColors.length > 2) {
                    harmonyColors.push(tinycolor(harmonyColors[2]).darken(20).toHexString());
                }
                harmonyColors = harmonyColors.slice(0, NUM_COLORS_PER_PALETTE);
                break;
            case 'tetrad':
                harmonyColors = base.tetrad().map(tc => tc.toHexString()); // [base, c1, c2, c3]
                // Add a lighter version of the base if we need a 5th
                if (harmonyColors.length < NUM_COLORS_PER_PALETTE) {
                    harmonyColors.push(tinycolor(harmonyColors[0]).lighten(20).toHexString());
                }
                harmonyColors = harmonyColors.slice(0, NUM_COLORS_PER_PALETTE);
                break;
            case 'complement':
                const complementColor = base.complement().toHexString();
                // Create a palette: base, a tint of base, the complement, a tint of complement, and a mid-tone or analogous to base
                harmonyColors = [
                    base.toHexString(),
                    base.clone().lighten(20).toHexString(),
                    complementColor,
                    tinycolor(complementColor).lighten(20).toHexString(),
                    base.clone().spin(30).desaturate(10).toHexString() // An analogous accent
                ].slice(0, NUM_COLORS_PER_PALETTE);
                break;
            case 'shades':
                // TinyColor doesn't have a direct "shades" function. We'll create 5 shades.
                harmonyColors = [
                    base.clone().darken(30).toHexString(),
                    base.clone().darken(15).toHexString(),
                    base.toHexString(), // Base color
                    base.clone().lighten(15).toHexString(),
                    base.clone().lighten(30).toHexString()
                ].slice(0, NUM_COLORS_PER_PALETTE);
                // Ensure they are somewhat distinct, especially if base is very light/dark
                // This simple generation might produce very similar colors if base is near white/black.
                break;
            default:
                harmonyColors = [base.toHexString()];
        }
        return harmonyColors.map(color => tinycolor(color).toHexString()); // Ensure all are valid hex strings
    }


    // --- Generic Display Palette Function (Modified) ---
    function displayPalette(colors, title = "Color Palette") {
        paletteDisplay.innerHTML = ''; // Clear existing palettes
        paletteDisplayTitle.textContent = title;

        if (!colors || colors.length === 0) {
            const message = document.createElement('p');
            message.textContent = 'No colors to display or invalid input for harmony.';
            paletteDisplay.appendChild(message);
            return;
        }

        const paletteContainer = document.createElement('div');
        paletteContainer.className = 'palette';

        colors.forEach(colorString => {
            const tcColor = tinycolor(colorString); // Use tinycolor to ensure validity for styling
            if (!tcColor.isValid()) {
                console.warn(`Invalid color string encountered: ${colorString}`);
                return; // Skip invalid colors
            }
            const hex = tcColor.toHexString(); // Get a clean hex string

            const swatchContainer = document.createElement('div');
            swatchContainer.className = 'color-swatch-container';

            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = hex; // Use the cleaned hex string
            swatch.title = `Copy ${hex}`; // Tooltip for copying

            const hexCode = document.createElement('p');
            hexCode.className = 'hex-code';
            hexCode.textContent = hex; // Use the cleaned hex string
            hexCode.title = `Copy ${hex}`; // Tooltip for copying

            // Event listener for copying hex code
            const copyColor = async () => {
                try {
                    await navigator.clipboard.writeText(hex); // Use the cleaned hex string
                    // Optional: Show a temporary "Copied!" message
                    const originalText = hexCode.textContent;
                    hexCode.textContent = 'Copied!';
                    swatch.style.borderColor = '#5cb85c'; // Indicate success
                    setTimeout(() => {
                        hexCode.textContent = originalText;
                        swatch.style.borderColor = '#ccc';
                    }, 1000);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                    // Fallback for older browsers or if permission denied
                    alert(`Failed to copy. You can manually copy: ${color}`);
                }
            };

            swatch.addEventListener('click', copyColor);
            hexCode.addEventListener('click', copyColor);

            swatchContainer.appendChild(swatch);
            swatchContainer.appendChild(hexCode);
            paletteContainer.appendChild(swatchContainer);
        });
        paletteDisplay.appendChild(paletteContainer);
    }

    // --- Event Listeners ---

    // Random Palette Button
    randomPaletteBtn.addEventListener('click', () => {
        const newGeneratedPalette = generatePalette(); // Renamed to avoid conflict
        displayPalette(newGeneratedPalette, "Random Palette");
    });

    // Interactive Harmony Generator Button (now mostly for explicit generation if needed, or rule changes)
    function handleGenerateHarmony() {
        // Update baseColorInput from current HSL state first
        const colorFromPicker = tinycolor({ h: currentHue, s: currentSaturation, l: currentLightness });
        baseColorInput.value = colorFromPicker.toHexString();

        const baseColor = baseColorInput.value; // Use the (potentially updated) hex value
        const harmonyRule = harmonyRuleSelect.value;
        const selectedRuleText = harmonyRuleSelect.options[harmonyRuleSelect.selectedIndex].text;

        const harmonyPalette = generateHarmonyPalette(baseColor, harmonyRule);
        if (harmonyPalette) {
            displayPalette(harmonyPalette, `${selectedRuleText} Harmony`);
        }
        return harmonyPalette; // Return the generated palette
    }

    generateHarmonyBtn.addEventListener('click', handleGenerateHarmony);
    // Also trigger harmony generation when the rule changes
    harmonyRuleSelect.addEventListener('change', handleGenerateHarmony);

    // Sync hex input to picker
    baseColorInput.addEventListener('input', () => {
        const color = tinycolor(baseColorInput.value);
        if (color.isValid()) {
            const hsl = color.toHsl();
            currentHue = hsl.h;
            currentSaturation = hsl.s;
            currentLightness = hsl.l;
            // No need to call updateColorFromPicker() if we also have a button,
            // to avoid double updates if user types and then clicks "Generate".
            // However, for live update as they type (without needing button):
            updateColorFromPicker();
        }
    });


    // --- Canvas Event Handling ---

    function updateColorFromPicker() {
        const currentPalette = handleGenerateHarmony(); // Update the palette display and get current palette
        drawHueWheel(currentPalette); // Redraw hue wheel with harmony indicators
        drawSLPicker(); // Redraw SL picker
    }

    // Hue Wheel Events
    hueWheelCanvas.addEventListener('mousedown', (e) => {
        isDraggingHue = true;
        const rect = hueWheelCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = hueWheelCanvas.width / 2;
        const centerY = hueWheelCanvas.height / 2;

        const angleRad = Math.atan2(y - centerY, x - centerX);
        let angleDeg = angleRad * 180 / Math.PI;
        if (angleDeg < 0) angleDeg += 360;
        currentHue = angleDeg;
        updateColorFromPicker();
    });

    hueWheelCanvas.addEventListener('mousemove', (e) => {
        if (isDraggingHue) {
            const rect = hueWheelCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = hueWheelCanvas.width / 2;
            const centerY = hueWheelCanvas.height / 2;

            const angleRad = Math.atan2(y - centerY, x - centerX);
            let angleDeg = angleRad * 180 / Math.PI;
            if (angleDeg < 0) angleDeg += 360;
            currentHue = angleDeg;
            updateColorFromPicker();
        }
    });

    // SL Picker Events
    slPickerCanvas.addEventListener('mousedown', (e) => {
        isDraggingSL = true;
        const rect = slPickerCanvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        currentSaturation = Math.max(0, Math.min(1, x / slPickerCanvas.width));
        currentLightness = 1 - Math.max(0, Math.min(1, y / slPickerCanvas.height)); // y is inverted
        updateColorFromPicker();
    });

    slPickerCanvas.addEventListener('mousemove', (e) => {
        if (isDraggingSL) {
            const rect = slPickerCanvas.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            currentSaturation = Math.max(0, Math.min(1, x / slPickerCanvas.width));
            currentLightness = 1 - Math.max(0, Math.min(1, y / slPickerCanvas.height)); // y is inverted
            updateColorFromPicker();
        }
    });

    // Global mouseup listener to stop dragging
    document.addEventListener('mouseup', () => {
        isDraggingHue = false;
        isDraggingSL = false;
    });


    // --- Initial Setup ---
    function initializeApp() {
        // Initial color based on default hex input for consistency at start
        const initialColor = tinycolor(baseColorInput.value);
        if (initialColor.isValid()) {
            const hsl = initialColor.toHsl();
            currentHue = hsl.h;
            currentSaturation = hsl.s;
            currentLightness = hsl.l;
        }

        const initialPalette = handleGenerateHarmony(); // Generate and display palette, get it back
        drawHueWheel(initialPalette); // Draw wheel with indicators for initial palette
        drawSLPicker();
        // handleGenerateHarmony() was already called and displayed the palette.
    }

    initializeApp();
});
