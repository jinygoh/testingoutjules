# Aura - Generative Ambient Music & Visuals Player: Agent Guidelines

## 1. Project Overview

**Goal:** Aura is a client-side web application that generates and plays endless, non-repeating ambient music tracks accompanied by synchronized, procedural visuals. The experience is designed to be relaxing, dreamy, psychedelic, and surreal, with a minimalist UI for deep immersion.

**Core User Features:**
*   Endless, seamlessly crossfading music stream.
*   Play/Pause and Skip controls.
*   Full-screen, music-synchronized procedural visuals.
*   Minimalist, dark-themed UI.
*   Seed-based generation for shareable and reproducible songs.

## 2. Core Architecture & Technology

*   **Core Logic:** Vanilla JavaScript (ES6+ Modules). No frontend frameworks (React, Vue, Angular). Direct DOM manipulation.
*   **Audio Engine:** Web Audio API is mandatory for all synthesis, scheduling, effects, and mixing.
*   **Visuals Engine:** WebGL (via Three.js) with a strong emphasis on custom GLSL shaders.
*   **Styling:** Standard CSS.
*   **Modularity:** The application is broken down into modules:
    *   `app.js`: Main application controller, orchestrates other modules.
    *   `audio.js`: Web Audio API setup, instrument synthesis (placeholders), scheduling, mixing, mastering.
    *   `music.js`: Generative logic for musical parameters (seed, key, scale, tempo, chords, rhythm, structure).
    *   `visuals.js`: Three.js setup, WebGL rendering, GLSL shader management, audio-reactivity.
    *   `ui.js`: DOM interaction, UI element updates, URL management for seeds.

## 3. Music Generation System (`music.js`, `audio.js`)

*   **Reproducibility:** All song generation is based on a string seed, processed by a simple LCG pseudo-random number generator in `music.js`.
*   **Song Parameters:** `music.js`'s `getSongParameters(seed)` is the entry point for generating:
    *   Key & Scale: Dreamy scales like Lydian, Dorian, Natural Minor are preferred.
    *   Tempo: Very slow (40-65 BPM).
    *   Chord Progression: 4 or 8 extended chords (Maj7, min7, min9, add9), designed to be meandering. Roots are MIDI notes.
    *   Rhythmic DNA: General guidelines for pulse, syncopation, and density.
    *   Song Structure: Sections like Intro, Build, Peak, Drift, Outro, each with defined bar length and intensity.
*   **Instrumentation (`audio.js` - primarily placeholders currently):**
    *   Pads: Lush, slow attack/release, filtered, detuned oscillators. Subtle reverb.
    *   Sub Bass: Pure sine wave, root of chord, dry.
    *   Arpeggio: Soft waveform, randomized velocity, ping-pong delay, heavy reverb.
    *   Lead Melody: Sparse, ethereal sine wave with vibrato, generous reverb.
    *   Tonal Percussion/Bells: Triangle wave pluck, fast decay, drenched in reverb.
    *   Atmospheric Texture: Filtered pink/brown noise, low volume, dry.
*   **Scheduling (`audio.js`):** A `setTimeout`-based loop looks ahead to queue audio events. It handles musical time, chord changes, and section transitions.
*   **Mixing & Mastering (`audio.js`):**
    *   Master reverb bus using `ConvolverNode` (IR needs to be provided).
    *   Mastering chain: Multi-band Compressor (currently a single DynamicsCompressor) -> Limiter.

**Workflow for Adding/Modifying Instruments:**
1.  Define synthesis logic in a `create<InstrumentName>(params)` function in `audio.js`.
2.  The function should return an object representing the instrument, including its main output node and any control inputs (e.g., a gain node for envelope control).
3.  Connect the instrument's output to `mainGainNode` (for dry signal) and/or `reverbNode` (for wet signal) via gain nodes to control send levels, respecting the reverb strategy.
4.  Integrate the instrument into the `scheduler` in `audio.js`:
    *   Initialize it in `startPlayback` and store in `activeInstruments`.
    *   Add logic within the `while (nextNoteTime < ...)` loop to decide when and what notes the instrument should play based on `currentSongParameters` (chord, section, rhythmicDNA, etc.).
    *   Use `AudioParam` methods for precise scheduling of notes and parameter changes.
    *   Ensure it's properly stopped/disconnected in `stopPlayback`.

## 4. Visual Generation System (`visuals.js`)

*   **Engine:** Three.js.
*   **Audio Reactivity:** `audio.js` provides an `AnalyserNode`. `app.js` polls this and sends features (amplitude, band energies) to `Visuals.updateAudioFeatures()`.
*   **Shaders:** Custom GLSL fragment shaders are key. Uniforms like `uTime`, `uResolution`, `uAmplitude`, `uLowEnergy`, `uMidEnergy`, `uHighEnergy` are available and updated.
*   **Current State:** A basic audio-reactive placeholder shader is implemented.
*   **Color Palette:** Future goal: derive from song key/mode.

**Workflow for Adding/Modifying Visuals:**
1.  Write new GLSL shaders (vertex and fragment).
2.  In `visuals.js`, create a new `THREE.ShaderMaterial` with these shaders and necessary uniforms.
3.  Add logic to switch to or incorporate this new material into the scene.
4.  Ensure new uniforms are updated in the `render()` loop, potentially using more detailed data from `audioFeatures` or `currentSongParameters`.

## 5. General Development Notes

*   **Modularity:** Respect the separation of concerns between modules.
*   **Clarity:** Write clear, commented code. Vanilla JS can become complex if not well-organized.
*   **Error Handling:** Basic error handling is in place; enhance as needed.
*   **Performance:** Be mindful of performance, especially in the audio scheduling loop and WebGL rendering loop. Offload heavy computations if possible (e.g., Web Workers for scheduler as a future optimization).
*   **Console Logs:** Use descriptive console logs for debugging. Remove or reduce excessive logging for "production" builds/tests.

## 6. Key TODOs / Future Enhancements (High-Level)

*   **Implement full instrument synthesis** in `audio.js`.
*   **Load actual Impulse Response** for reverb.
*   **Refine audio scheduler** for more complex rhythms and precise pause/resume.
*   **Develop advanced GLSL shaders** for the target visual aesthetic.
*   **Implement dynamic color palettes** for visuals based on music.
*   **Consider a Web Worker for the audio scheduler** for improved performance isolation.
*   **Implement seamless crossfading** between songs (advanced).

---
*This AGENTS.md provides a snapshot. Refer to code comments and the project spec for finer details.*
