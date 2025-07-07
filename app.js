/**
 * @file app.js
 * Main application entry point for Aura.
 * Orchestrates the initialization and interaction of various modules including UI,
 * audio, music generation, and visuals. Handles core application state and
 * user interaction logic (play, pause, skip).
 */

import * as Audio from './audio.js';
import * as Music from './music.js';
import * as Visuals from './visuals.js';
import * as UI from './ui.js';

console.log("Aura app.js loaded");

// Global state
let audioContext;
let isPlaying = false;
let currentSeed = null;

// DOM Elements
// const playPauseButton = document.getElementById('play-pause-button'); // Managed by UI.js
// const skipButton = document.getElementById('skip-button'); // Managed by UI.js
const visualsCanvas = document.getElementById('visuals-canvas');

// Initialization function
function init() {
    console.log("Aura initializing...");

    // Initialize UI and set up callbacks
    UI.init({
        onPlayPause: handleTogglePlayPause,
        onSkip: handleSkipRequest
    });

    // Handle initial seed from URL or generate a new one
    const initialSeedFromUrl = UI.getSeedFromUrl();
    if (initialSeedFromUrl) {
        currentSeed = initialSeedFromUrl;
    } else {
        currentSeed = Music.generateNewSeed();
        UI.updateUrlWithSeed(currentSeed);
    }

    currentSongParameters = Music.getSongParameters(currentSeed);
    UI.updateInfoDisplay(currentSongParameters);

    // Initialize Visuals
    if (visualsCanvas && typeof THREE !== 'undefined') {
        Visuals.init(visualsCanvas);
    } else {
        if (!visualsCanvas) console.error("Visuals canvas not found!");
        if (typeof THREE === 'undefined') console.error("Three.js not loaded, visuals disabled.");
    }

    console.log("Aura initialized. Current seed:", currentSeed);
}

// --- Main Control Logic ---

function handleTogglePlayPause() {
    if (!audioContext) {
        console.log("First play attempt, initializing AudioContext...");
        audioContext = Audio.initAudioContext();
        if (audioContext) {
            console.log("AudioContext initialized by user gesture.");
            // TODO: Add a real impulse response file to the project and update this path.
            // For now, this will likely fail to load a real IR, but the ConvolverNode is ready.
            Audio.loadImpulseResponse('assets/impulse-responses/default_hall.wav');
        } else {
            console.error("Failed to initialize AudioContext. Playback disabled.");
            // UI.showError("Could not initialize audio."); // Example error message
            return;
        }
    }

    isPlaying = !isPlaying;
    UI.setPlayPauseButtonState(isPlaying);

    if (isPlaying) {
        console.log("Playback started/resumed for seed:", currentSeed);
        Audio.resumePlayback(); // Resumes if suspended, good for first play too
        Audio.startPlayback(currentSongParameters); // Pass full params
        Visuals.start();
        // TODO: Start the actual music generation and scheduling based on currentSongParameters
    } else {
        console.log("Playback paused.");
        Audio.pausePlayback();
        Visuals.pause();
    }
}

function handleSkipRequest() {
    console.log("Skip requested.");

    // Generate new seed and parameters
    currentSeed = Music.generateNewSeed();
    currentSongParameters = Music.getSongParameters(currentSeed);

    // Update UI
    UI.updateUrlWithSeed(currentSeed);
    UI.updateInfoDisplay(currentSongParameters);

    console.log("New song parameters generated for seed:", currentSeed);

    if (isPlaying) {
        console.log("Skipping to new song (playback active).");
        Audio.stopPlayback(); // Stop current song fully
        Audio.startPlayback(currentSongParameters); // Start new one
    } else {
        console.log("Skipping to new song (playback paused). Track prepared.");
        // If paused, just update the upcoming track details
        Audio.prepareTrack(currentSongParameters);
    }
    // Visuals might also need a reset or specific transition for a skip
    // Visuals.resetForNewSong(currentSongParameters); // Example
}

// --- Visuals Update Loop ---
let visualUpdateId = null;

function startVisualUpdateLoop() {
    if (visualUpdateId !== null) return; // Already running

    function updateVisuals() {
        if (!isPlaying) { // Stop loop if paused
            stopVisualUpdateLoop();
            return;
        }
        const audioData = Audio.getAudioAnalysisData();
        if (audioData) {
            Visuals.updateAudioFeatures(audioData);
        }
        visualUpdateId = requestAnimationFrame(updateVisuals);
    }
    visualUpdateId = requestAnimationFrame(updateVisuals);
    console.log("Visual update loop started.");
}

function stopVisualUpdateLoop() {
    if (visualUpdateId !== null) {
        cancelAnimationFrame(visualUpdateId);
        visualUpdateId = null;
        console.log("Visual update loop stopped.");
    }
}

// Modify handleTogglePlayPause to start/stop this loop
function handleTogglePlayPause() {
    if (!audioContext) {
        console.log("First play attempt, initializing AudioContext...");
        audioContext = Audio.initAudioContext();
        if (audioContext) {
            console.log("AudioContext initialized by user gesture.");
            // TODO: Add a real impulse response file to the project and update this path.
            // For now, this will likely fail to load a real IR, but the ConvolverNode is ready.
            Audio.loadImpulseResponse('assets/impulse-responses/default_hall.wav');
        } else {
            console.error("Failed to initialize AudioContext. Playback disabled.");
            return;
        }
    }

    isPlaying = !isPlaying;
    UI.setPlayPauseButtonState(isPlaying);

    if (isPlaying) {
        console.log("Playback started/resumed for seed:", currentSeed);
        Audio.resumePlayback();
        Audio.startPlayback(currentSongParameters);
        Visuals.start(); // Starts Three.js render loop
        startVisualUpdateLoop(); // Starts loop for sending audio data to visuals
    } else {
        console.log("Playback paused.");
        Audio.pausePlayback();
        Visuals.pause(); // Pauses Three.js render loop
        stopVisualUpdateLoop(); // Stops sending audio data
    }
}


// Start the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Placeholder for module exports if app.js itself becomes a module (not typical for main entry)
// export { };
