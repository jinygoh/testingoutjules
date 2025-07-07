/**
 * @file ui.js
 * Handles all direct DOM manipulation, UI event handling, and information display
 * for the Aura application. It aims to keep DOM interactions separate from the main
 * application logic in app.js.
 * Responsibilities:
 * - Initializing UI elements and attaching event listeners (Play/Pause, Skip).
 * - Updating the display of song parameters (Key, BPM, Seed).
 * - Managing the URL hash for seed sharing and retrieval.
 * - Providing callbacks to app.js for UI actions.
 */

console.log("ui.js loaded");

let playPauseButton, skipButton, songKeyDisplay, songBpmDisplay, songSeedDisplay;

// Callback functions to be set by app.js or main controller
let onPlayPauseClickCallback = () => console.warn("onPlayPauseClickCallback not set");
let onSkipClickCallback = () => console.warn("onSkipClickCallback not set");

/**
 * Initializes the UI module by caching DOM elements and setting up listeners.
 * @param {object} callbacks - Object containing callback functions for UI events.
 *                             Expected: { onPlayPause: func, onSkip: func }
 */
export function init(callbacks) {
    playPauseButton = document.getElementById('play-pause-button');
    skipButton = document.getElementById('skip-button');
    songKeyDisplay = document.getElementById('song-key');
    songBpmDisplay = document.getElementById('song-bpm');
    songSeedDisplay = document.getElementById('song-seed');

    if (!playPauseButton || !skipButton || !songKeyDisplay || !songBpmDisplay || !songSeedDisplay) {
        console.error("One or more UI elements not found in the DOM.");
        return;
    }

    if (callbacks && typeof callbacks.onPlayPause === 'function') {
        onPlayPauseClickCallback = callbacks.onPlayPause;
    }
    if (callbacks && typeof callbacks.onSkip === 'function') {
        onSkipClickCallback = callbacks.onSkip;
    }

    playPauseButton.addEventListener('click', () => {
        onPlayPauseClickCallback();
    });

    skipButton.addEventListener('click', () => {
        onSkipClickCallback();
    });

    console.log("UI initialized and event listeners attached.");
}

/**
 * Updates the text of the Play/Pause button.
 * @param {boolean} isPlaying - True if music is currently playing.
 */
export function setPlayPauseButtonState(isPlaying) {
    if (playPauseButton) {
        playPauseButton.textContent = isPlaying ? 'Pause' : 'Play';
    }
}

/**
 * Updates the displayed song information.
 * @param {object} params - Object containing song parameters.
 *                          Expected: { key: string, scaleName: string, tempo: number, seed: string }
 */
export function updateInfoDisplay(params) {
    if (params) {
        if (songKeyDisplay && params.key && params.scaleName) {
            songKeyDisplay.textContent = `Key: ${params.key} ${params.scaleName}`;
        }
        if (songBpmDisplay && params.tempo) {
            songBpmDisplay.textContent = `BPM: ${params.tempo}`;
        }
        if (songSeedDisplay && params.seed) {
            songSeedDisplay.textContent = `Seed: ${params.seed}`;
        }
    } else {
        // Clear display if no params
        if (songKeyDisplay) songKeyDisplay.textContent = 'Key: -';
        if (songBpmDisplay) songBpmDisplay.textContent = 'BPM: -';
        if (songSeedDisplay) songSeedDisplay.textContent = 'Seed: -';
    }
}

/**
 * Updates the URL hash with the current song's seed.
 * @param {string} seed - The seed string to add to the URL.
 */
export function updateUrlWithSeed(seed) {
    if (typeof seed === 'string' && seed.length > 0) {
        window.location.hash = `seed=${seed}`;
    } else if (seed === null || seed === undefined || seed === '') {
        // If seed is cleared, remove it from hash or go to root.
        // For simplicity, just removing the hash or setting to '#'
        if (window.location.hash !== '') {
            window.history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    }
}

/**
 * Retrieves the seed from the URL hash if present.
 * @returns {string|null} The seed string or null if not found.
 */
export function getSeedFromUrl() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#seed=')) {
        return hash.substring(6);
    }
    return null;
}

// Example of how app.js might use this:
/*
import * as UI from './ui.js';

function handlePlayPause() {
    // app logic for play/pause
    const isNowPlaying = // ... get current play state ...
    UI.setPlayPauseButtonState(isNowPlaying);
}

function handleSkip() {
    // app logic for skip
    const newSongParams = // ... generate new song parameters ...
    UI.updateInfoDisplay(newSongParams);
    UI.updateUrlWithSeed(newSongParams.seed);
}

document.addEventListener('DOMContentLoaded', () => {
    UI.init({
        onPlayPause: handlePlayPause,
        onSkip: handleSkip
    });
    const initialSeed = UI.getSeedFromUrl();
    // ... use initialSeed ...
    const initialParams = // ... get/generate params for initialSeed or new seed ...
    UI.updateInfoDisplay(initialParams);
    if(initialParams.seed) UI.updateUrlWithSeed(initialParams.seed);
});
*/
