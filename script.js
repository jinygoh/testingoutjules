document.addEventListener('DOMContentLoaded', () => {
    const randomPaletteBtn = document.getElementById('randomPaletteBtn');
    const paletteDisplay = document.getElementById('paletteDisplay');
    const NUM_COLORS_PER_PALETTE = 5; // Generate 5 colors per palette

    // Function to generate a random hex color
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

    // Function to display a palette in the DOM
    function displayPalette(colors) {
        // Clear previous palette(s) in the main display area if generating a single one
        // If we want to keep adding palettes, this line would be removed.
        // For now, let's replace the content with the new palette.
        paletteDisplay.innerHTML = ''; // Clear existing palettes

        const paletteContainer = document.createElement('div');
        paletteContainer.className = 'palette';
        // Optional: Add a title to each palette if we generate multiple
        // const paletteTitle = document.createElement('h2');
        // paletteTitle.textContent = 'New Palette';
        // paletteContainer.appendChild(paletteTitle);

        colors.forEach(color => {
            const swatchContainer = document.createElement('div');
            swatchContainer.className = 'color-swatch-container';

            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = `Copy ${color}`; // Tooltip for copying

            const hexCode = document.createElement('p');
            hexCode.className = 'hex-code';
            hexCode.textContent = color;
            hexCode.title = `Copy ${color}`; // Tooltip for copying

            // Event listener for copying hex code
            const copyColor = async () => {
                try {
                    await navigator.clipboard.writeText(color);
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

    // Event listener for the button
    randomPaletteBtn.addEventListener('click', () => {
        const newPalette = generatePalette();
        displayPalette(newPalette);
    });

    // Generate and display an initial palette on page load
    displayPalette(generatePalette());
});
