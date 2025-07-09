/**
 * Utility functions for the procedural generator.
 */
const Utils = {
    /**
     * Generates a random floating-point number between min (inclusive) and max (exclusive).
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @returns {number} A random float.
     */
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Generates a random integer between min (inclusive) and max (inclusive).
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @returns {number} A random integer.
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Picks a random element from an array.
     * @param {Array<any>} arr - The array to pick from.
     * @returns {any} A random element from the array, or undefined if the array is empty.
     */
    randomElement: function(arr) {
        if (!arr || arr.length === 0) return undefined;
        return arr[this.randomInt(0, arr.length - 1)];
    },

    /**
     * Clamps a value between a minimum and maximum.
     * @param {number} value - The value to clamp.
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @returns {number} The clamped value.
     */
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Maps a value from one range to another.
     * @param {number} value - The value to map.
     * @param {number} inMin - The minimum of the input range.
     * @param {number} inMax - The maximum of the input range.
     * @param {number} outMin - The minimum of the output range.
     * @param {number} outMax - The maximum of the output range.
     * @returns {number} The mapped value.
     */
    mapRange: function(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    /**
     * Converts HSL (Hue, Saturation, Lightness) color values to an RGB string.
     * @param {number} h - Hue (0-360).
     * @param {number} s - Saturation (0-100).
     * @param {number} l - Lightness (0-100).
     * @returns {string} RGB color string e.g., "rgb(r,g,b)".
     */
    hslToRgbString: function(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

        const r = Math.round(255 * f(0));
        const g = Math.round(255 * f(8));
        const b = Math.round(255 * f(4));
        return `rgb(${r},${g},${b})`;
    },

    /**
     * Linearly interpolates between two values.
     * @param {number} a - Start value.
     * @param {number} b - End value.
     * @param {number} t - Interpolation factor (0.0 to 1.0).
     * @returns {number} The interpolated value.
     */
    lerp: function(a, b, t) {
        return a * (1 - t) + b * t;
    },

    /**
     * Simple 2D vector object with basic operations.
     */
    Vec2: function(x = 0, y = 0) {
        this.x = x;
        this.y = y;

        this.add = function(other) {
            return new Utils.Vec2(this.x + other.x, this.y + other.y);
        };
        this.subtract = function(other) {
            return new Utils.Vec2(this.x - other.x, this.y - other.y);
        };
        this.multiply = function(scalar) {
            return new Utils.Vec2(this.x * scalar, this.y * scalar);
        };
        this.magnitude = function() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        };
        this.normalize = function() {
            const mag = this.magnitude();
            if (mag === 0) return new Utils.Vec2(0,0);
            return new Utils.Vec2(this.x / mag, this.y / mag);
        };
        this.clone = function() {
            return new Utils.Vec2(this.x, this.y);
        };
    }
};

console.log("Utils module loaded.");
