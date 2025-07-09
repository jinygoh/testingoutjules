/**
 * PerlinNoise module for generating 1D, 2D, or 3D Perlin noise.
 * This is a self-contained implementation, adapted from various public domain sources,
 * notably Ken Perlin's original algorithm and subsequent improvements.
 * It uses a fixed permutation table by default but can be seeded.
 */
const PerlinNoise = (() => {
    // Permutation table `p`. This is doubled (0-511) to avoid modulo operations later.
    // It's initialized with a fixed set of shuffled numbers (0-255).
    // For different noise patterns on each run, this table should be re-shuffled using `seed()`.
    const p = new Uint8Array(512);
    const permutation = [ 151,160,137,91,90,15, // This is a specific permutation by Ken Perlin.
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ];
    // Initialize the permutation table `p` by duplicating the `permutation` array.
    for (let i=0; i < 256 ; i++) p[i] = p[i+256] = permutation[i];

    /**
     * Fade function as defined by Ken Perlin.
     * It eases coordinate values so that they will ease towards integral values,
     * this ends up smoothing the final output.
     * f(t) = 6t^5 - 15t^4 + 10t^3
     * @param {number} t - Input value, typically between 0 and 1.
     * @returns {number} - Faded value.
     */
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

    /**
     * Linear interpolation.
     * @param {number} t - The interpolation factor, typically between 0 and 1.
     * @param {number} a - The start value.
     * @param {number} b - The end value.
     * @returns {number} - Interpolated value.
     */
    function lerp(t, a, b) { return a + t * (b - a); }

    /**
     * Calculates the dot product of a randomly selected gradient vector and the 8 location vectors.
     * @param {number} hash - A hash value derived from the permutation table, used to select a gradient vector.
     * @param {number} x - The x-coordinate relative to the grid cell.
     * @param {number} y - The y-coordinate relative to the grid cell.
     * @param {number} z - The z-coordinate relative to the grid cell.
     * @returns {number} - The dot product.
     */
    function grad(hash, x, y, z) {
        const h = hash & 15;      // Take the lower 4 bits of the hash to get 16 possible gradients
        const u = h < 8 ? x : y;  // If h<8, u is x, else y
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : z); // If h<4, v is y, else if h is 12 or 14, v is x, else v is z
        // Apply gradient based on the h value
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    // The public interface for PerlinNoise module
    return {
        /**
         * Generates Perlin noise value for the given 3D coordinates.
         * If y or z are not provided, they default to 0, allowing for 1D or 2D noise generation.
         * @param {number} x - The x-coordinate.
         * @param {number} [y=0] - The y-coordinate.
         * @param {number} [z=0] - The z-coordinate.
         * @returns {number} - Perlin noise value, typically in the range [-1, 1].
         */
        noise: function(x, y = 0, z = 0) {
            // Find unit cube that contains the point.
            const X = Math.floor(x) & 255; // Integer part of x, masked to 0-255
            const Y = Math.floor(y) & 255; // Integer part of y, masked to 0-255
            const Z = Math.floor(z) & 255; // Integer part of z, masked to 0-255

            // Find relative x,y,z of point in cube.
            x -= Math.floor(x); // Fractional part of x
            y -= Math.floor(y); // Fractional part of y
            z -= Math.floor(z); // Fractional part of z

            // Compute fade curves for each of x,y,z.
            const u = fade(x);
            const v = fade(y);
            const w = fade(z);

            // Hash coordinates of the 8 cube corners
            const A = p[X] + Y;
            const AA = p[A] + Z;
            const AB = p[A + 1] + Z;
            const B = p[X + 1] + Y;
            const BA = p[B] + Z;
            const BB = p[B + 1] + Z;

            // Add blended results from 8 corners of the cube
            // This is done by a series of linear interpolations (lerp).
            return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),      // Top-front-left corner of the cube
                                         grad(p[BA], x - 1, y, z)),   // Top-front-right
                                 lerp(u, grad(p[AB], x, y - 1, z),   // Top-back-left
                                         grad(p[BB], x - 1, y - 1, z))),// Top-back-right
                         lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1),// Bottom-front-left
                                         grad(p[BA + 1], x - 1, y, z - 1)),// Bottom-front-right
                                 lerp(u, grad(p[AB + 1], x, y - 1, z - 1),// Bottom-back-left
                                         grad(p[BB + 1], x - 1, y - 1, z - 1))));// Bottom-back-right
        },

        /**
         * Seeds the permutation table with a new random shuffle.
         * This allows for generating different noise patterns.
         * @param {number} seedValue - The seed to use for shuffling.
         */
        seed: function(seedValue) {
            // Create a new permutation array [0, 1, ..., 255]
            const customPermutation = Array.from({length: 256}, (_, i) => i);

            // Simple Linear Congruential Generator (LCG) for pseudo-random numbers
            // This is used to shuffle the customPermutation array.
            let currentSeed = seedValue;
            function random() {
                // Parameters for LCG (values from Numerical Recipes)
                currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
                return currentSeed / 4294967296; // Normalize to [0, 1)
            }

            // Fisher-Yates shuffle algorithm
            for (let i = customPermutation.length - 1; i > 0; i--) {
                const j = Math.floor(random() * (i + 1));
                // Swap elements
                [customPermutation[i], customPermutation[j]] = [customPermutation[j], customPermutation[i]];
            }

            // Update the main permutation table `p` with the newly shuffled values.
            for (let i=0; i < 256 ; i++) p[i] = p[i+256] = customPermutation[i];
        }
    };
})();

// Example of how to use the seed function:
// PerlinNoise.seed(Date.now()); // Seed with current time for varied results each run
// PerlinNoise.seed(12345);    // Seed with a fixed number for reproducible noise
