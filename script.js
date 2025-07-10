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

    const NUM_COLORS_PER_PALETTE = 5; // Default for random, might be different for harmonies

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

    // Interactive Harmony Generator Button
    function handleGenerateHarmony() {
        const baseColor = baseColorInput.value;
        const harmonyRule = harmonyRuleSelect.value;
        const selectedRuleText = harmonyRuleSelect.options[harmonyRuleSelect.selectedIndex].text;

        const harmonyPalette = generateHarmonyPalette(baseColor, harmonyRule);
        if (harmonyPalette) {
            displayPalette(harmonyPalette, `${selectedRuleText} Harmony`);
        }
        // If harmonyPalette is null, an alert was already shown by generateHarmonyPalette
    }

    generateHarmonyBtn.addEventListener('click', handleGenerateHarmony);

    // --- Initial Setup ---
    function initializeApp() {
        // Display an initial random palette
        // const initialRandomPalette = generatePalette();
        // displayPalette(initialRandomPalette, "Random Palette");

        // Or, display an initial harmony palette based on default inputs
        handleGenerateHarmony();
    }

    initializeApp();
});
