/**
 * @file music.js
 * Manages the generative music logic for the Aura application.
 * Responsibilities include:
 * - Generating reproducible song parameters based on a seed (key, scale, tempo, chords, rhythm, structure).
 * - Defining musical constants (scales, keys, chord qualities).
 * - Implementing a pseudo-random number generator (PRNG) for deterministic generation.
 * - Providing utility functions for music theory calculations (e.g., note to MIDI, MIDI to frequency).
 * The core output is a `SongParameters` object that drives the audio generation and scheduling.
 */

console.log("music.js loaded");

// --- Constants ---
const SCALES = {
    // "Dreamy" scales
    LYDIAN: [0, 2, 4, 6, 7, 9, 11], // Major scale with a #4
    DORIAN: [0, 2, 3, 5, 7, 9, 10], // Minor scale with a major 6th
    NATURAL_MINOR: [0, 2, 3, 5, 7, 8, 10],
    // Other potentially dreamy scales
    AEOLIAN: [0, 2, 3, 5, 7, 8, 10], // Same as Natural Minor
    MIXOLYDIAN_FLAT6: [0, 2, 4, 5, 7, 8, 10], // Mixolydian with b6, can sound dreamy/mysterious
    // PENTATONIC_MINOR: [0, 3, 5, 7, 10] // Simple, can be dreamy
};

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const TEMPO_RANGE = { min: 40, max: 65 }; // BPM

// Chord types (extensions for "dreamy" quality)
// Roman numerals represent scale degrees.
// Functions will map these to actual notes based on key and scale.
const CHORD_QUALITIES = {
    MAJOR_7: [0, 4, 7, 11], // Root, M3, P5, M7
    MINOR_7: [0, 3, 7, 10], // Root, m3, P5, m7
    DOMINANT_7: [0, 4, 7, 10], // Root, M3, P5, m7 (Use sparingly, can be too strong)
    MINOR_9: [0, 3, 7, 10, 14], // Root, m3, P5, m7, M9
    MAJOR_9: [0, 4, 7, 11, 14], // Root, M3, P5, M7, M9
    ADD_9: [0, 4, 7, 14],       // Major triad + M9 (no 7th)
    MINOR_ADD_9: [0, 3, 7, 14], // Minor triad + M9 (no 7th)
    LYDIAN_AUGMENTED_MAJ7: [0, 4, 8, 11], // R, M3, Aug5, M7 (#5, common in Lydian)
};

// Song structure sections
const SONG_SECTIONS = ['Intro', 'Build', 'Peak', 'Drift', 'Outro'];

// --- Pseudo-Random Number Generator (PRNG) ---
// A simple PRNG for reproducible results based on a seed.
// Uses a Linear Congruential Generator (LCG) - basic but sufficient for this.
let currentSeedValue = 0;

function lcgRandom() {
    // Parameters from Numerical Recipes
    const a = 1664525;
    const c = 1013904223;
    const m = 2**32; // 2^32
    currentSeedValue = (a * currentSeedValue + c) % m;
    return currentSeedValue / m;
}

function setSeed(seedString) {
    let hash = 0;
    if (typeof seedString !== 'string' || seedString.length === 0) {
        // If no seed or empty seed, use current time for a "random" start
        currentSeedValue = Date.now() % 2**32;
        return currentSeedValue.toString(16); // Return the generated seed
    }
    for (let i = 0; i < seedString.length; i++) {
        const char = seedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    currentSeedValue = Math.abs(hash); // Ensure positive seed value for LCG
    return seedString;
}

// --- Generative Functions ---

/**
 * Generates a new random seed string (hexadecimal).
 * This doesn't use the LCG, just provides a new starting point.
 */
export function generateNewSeed() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16);
}

/**
 * Generates all global song parameters based on a seed.
 * @param {string} seed - The seed string.
 * @returns {object} An object containing all generated song parameters.
 */
export function getSongParameters(seed) {
    const actualSeed = setSeed(seed); // Initialize PRNG with the seed

    const selectedKeyName = KEYS[Math.floor(lcgRandom() * KEYS.length)];
    const scaleNames = Object.keys(SCALES);
    const selectedScaleName = scaleNames[Math.floor(lcgRandom() * scaleNames.length)];
    const selectedScale = SCALES[selectedScaleName];

    const tempo = Math.floor(lcgRandom() * (TEMPO_RANGE.max - TEMPO_RANGE.min + 1)) + TEMPO_RANGE.min;

    // Chord Progression Generation
    const progressionLength = lcgRandom() < 0.6 ? 4 : 8; // Favor 4-chord loops slightly more or equally
    const chordProgression = generateChordProgression(selectedKeyName, selectedScale, progressionLength);

    // Rhythmic DNA Generation
    const rhythmicDNA = generateRhythmicDNA();

    // Song Structure Generation
    const songStructure = generateSongStructure();

    return {
        seed: actualSeed,
        key: selectedKeyName, // e.g. "C"
        scaleName: selectedScaleName, // e.g. "LYDIAN"
        scale: selectedScale, // Array of intervals e.g. [0, 2, 4, 6, 7, 9, 11]
        tempo: tempo,
        chordProgression: chordProgression, // Array of chord objects
        rhythmicDNA: rhythmicDNA, // Object describing rhythmic tendencies
        songStructure: songStructure // Array of section objects
    };
}

/**
 * Generates the song's hierarchical structure with section details.
 * @returns {Array<object>} An array of objects, each describing a song section.
 */
function generateSongStructure() {
    const baseSectionOrder = ['Intro', 'Build', 'Peak', 'Drift', 'Outro'];
    const structure = [];

    // Define typical characteristics for each section type
    const sectionBlueprints = {
        'Intro':   { minBars: 4, maxBars: 8,  intensityTarget: 0.2, variation: 0.1 },
        'Build':   { minBars: 8, maxBars: 16, intensityTarget: 0.5, variation: 0.2 },
        'Peak':    { minBars: 8, maxBars: 16, intensityTarget: 0.8, variation: 0.15 },
        'Drift':   { minBars: 8, maxBars: 16, intensityTarget: 0.4, variation: 0.2 },
        'Outro':   { minBars: 4, maxBars: 12, intensityTarget: 0.1, variation: 0.1 }
    };

    for (const sectionName of baseSectionOrder) {
        const blueprint = sectionBlueprints[sectionName];
        if (blueprint) {
            const durationBars = Math.floor(lcgRandom() * (blueprint.maxBars - blueprint.minBars + 1)) + blueprint.minBars;
            const intensity = Math.max(0, Math.min(1, blueprint.intensityTarget + (lcgRandom() * 2 - 1) * blueprint.variation));

            structure.push({
                name: sectionName,
                durationBars: durationBars,
                intensity: parseFloat(intensity.toFixed(2)) // Keep it tidy
            });
        }
    }
    // Future enhancements:
    // - Allow sections to be repeated or omitted based on PRNG.
    // - Vary the order slightly.
    // - Ensure total song length is within a reasonable range.
    return structure;
}


/**
 * Generates a chord progression.
 * @param {string} keyRootNoteName - The root note name of the key (e.g., "C", "F#").
 * @param {Array<number>} scaleIntervals - Array of intervals for the scale (e.g., [0, 2, 4, 5, 7, 9, 11]).
 * @param {number} length - The number of chords in the progression (e.g., 4 or 8).
 * @returns {Array<object>} An array of chord objects.
 */
function generateChordProgression(keyRootNoteName, scaleIntervals, length) {
    const progression = [];
    // Preferred scale degrees for dreamy, meandering progressions (0-indexed: I, ii, iii, IV, V, vi, vii)
    // Example: I, IV, vi, ii or I, bVII, IV, I (bVII needs care depending on scale)
    const preferredDegreesPatterns = [
        [0, 3, 5, 1], // I-IV-vi-ii
        [0, 5, 2, 4], // I-vi-iii-V (soften V)
        [0, 3, 0, 5], // I-IV-I-vi
        [1, 3, 5, 0], // ii-IV-vi-I (gentle start)
    ];
    // Try to get bVII if scale allows (e.g. Mixolydian, Dorian, Natural Minor often have a bVII character)
    // A bVII is 10 semitones above the root.
    // A bIII is 3 semitones above the root (for minor keys) or 4 for major with borrowed chord.

    const baseOctave = 3; // Starting octave for chord roots, can be adjusted

    const chosenPattern = preferredDegreesPatterns[Math.floor(lcgRandom() * preferredDegreesPatterns.length)];
    const availableChordQualities = [
        'MAJOR_7', 'MINOR_7', 'MAJOR_9', 'MINOR_9', 'ADD_9', 'MINOR_ADD_9'
    ];
    // Lydian chords can often be Maj7#11 or Maj9#11. For simplicity, stick to CHORD_QUALITIES.

    // Get the MIDI note number for the key's root (e.g., C3, D3 etc.)
    const keyRootMidi = noteNameToMidi(`${keyRootNoteName}${baseOctave}`);

    for (let i = 0; i < length; i++) {
        const degreeIndex = chosenPattern[i % chosenPattern.length]; // Use selected pattern

        // Get the scale degree (interval from the key root)
        // Ensure degreeIndex is within bounds of scaleIntervals (e.g. for vii or if scale has < 7 notes)
        const safeDegreeIndex = degreeIndex % scaleIntervals.length;
        const rootIntervalFromKeyRoot = scaleIntervals[safeDegreeIndex];

        const chordRootMidi = keyRootMidi + rootIntervalFromKeyRoot;

        // Convert MIDI note number back to note name and octave for storage (optional, but good for readability)
        // This requires a midiToNoteName function (inverse of noteNameToMidi) - complex, skip for now, store MIDI.
        // Or, more simply, store the scaleDegree and let instrument resolve to actual notes.

        const qualityName = availableChordQualities[Math.floor(lcgRandom() * availableChordQualities.length)];

        // Soften V chords if they appear on a dominant position (degree 4 if 0-indexed)
        let finalQuality = qualityName;
        if (safeDegreeIndex === 4) { // If it's the V degree
            if (qualityName.includes('DOMINANT')) { // Unlikely with current list but good check
                finalQuality = 'MAJOR_7'; // Change V7 to Vmaj7
            }
            // Could also prefer min7 on V for a Vm (subversive, common in some pop/ambient)
        }


        progression.push({
            scaleDegreeIndex: safeDegreeIndex, // 0 for I, 1 for ii, etc.
            rootNoteMidi: chordRootMidi, // MIDI note number of the chord's root for the base octave
            qualityName: finalQuality,
            // keyContext: keyRootNoteName, // Store for easier debugging/interpretation
            // scaleContext: scaleIntervals, // Store for easier debugging/interpretation
        });
    }
    return progression;
}

/**
 * Generates a rhythmic DNA profile for the song.
 * This provides general guidelines for how instruments should behave rhythmically.
 * @returns {object} An object describing rhythmic tendencies.
 */
function generateRhythmicDNA() {
    const basePulses = ['whole', 'half', 'quarter_dotted']; // Favoring longer durations
    const syncopationLevels = ['none', 'low', 'medium_gentle'];
    const densityLevels = ['sparse', 'medium_sparse', 'medium'];

    return {
        basePulse: basePulses[Math.floor(lcgRandom() * basePulses.length)],
        syncopation: syncopationLevels[Math.floor(lcgRandom() * syncopationLevels.length)],
        density: densityLevels[Math.floor(lcgRandom() * densityLevels.length)],
        // Example: prefer whole notes, low syncopation, sparse density.
    };
}

// --- Music Theory Utilities (to be expanded) ---

// --- Music Theory Utilities (to be expanded) ---

/**
 * Converts a note name (e.g., 'C4') to a MIDI note number.
 * @param {string} noteName - e.g., "C#4", "Fb5".
 * @returns {number} MIDI note number.
 */
export function noteNameToMidi(noteName) {
    const noteParts = noteName.match(/([A-Ga-g])([#b]?)([0-9])/);
    if (!noteParts) throw new Error(`Invalid note name: ${noteName}`);

    const letter = noteParts[1].toUpperCase();
    const accidental = noteParts[2];
    const octave = parseInt(noteParts[3], 10);

    const noteValues = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let midi = noteValues[letter];

    if (accidental === '#') midi++;
    if (accidental === 'b') midi--;

    return midi + (octave + 1) * 12; // MIDI C4 is 60. C0 is 12.
}

/**
 * Converts a MIDI note number to a frequency (Hz).
 * @param {number} midiNote - MIDI note number.
 * @returns {number} Frequency in Hz.
 */
export function midiToFrequency(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}


/**
 * Get notes for a specific chord in a given key and scale.
 * (This is a complex function and will be a placeholder for now)
 * @param {string} rootNoteName - e.g., "C"
 * @param {number} rootOctave - e.g., 3 for C3
 * @param {Array<number>} scaleIntervals - e.g., SCALES.LYDIAN
 * @param {string} chordQualityName - e.g., "MINOR_7" from CHORD_QUALITIES
 * @returns {Array<number>} Array of MIDI note numbers for the chord.
 */
export function getChordNotes(rootNoteName, rootOctave, scaleIntervals, chordQualityName) {
    // 1. Determine the MIDI value of the chord's root note.
    //    The rootNoteName is the KEY of the song (e.g. 'C').
    //    The chord's actual root within the scale needs to be determined first.
    //    (e.g. if key is C, and chord is 'ii', then root is D)
    //    This part is simplified for now.

    // 2. Get the intervals for the chord quality. (e.g., [0, 3, 7, 10] for min7)
    // const qualityIntervals = CHORD_QUALITIES[chordQualityName];
    // if (!qualityIntervals) throw new Error(`Unknown chord quality: ${chordQualityName}`);

    // 3. Calculate absolute MIDI notes.
    //    This is a placeholder. True chord generation needs to respect the scale.
    //    A simple approach: take root, add quality intervals.
    //    A complex approach: map chord degrees (I, ii, iii) to scale degrees, then build chord.

    console.warn(`getChordNotes is a placeholder. Key: ${rootNoteName}, Scale: ${scaleIntervals}, Quality: ${chordQualityName}`);
    // Placeholder: return root + quality intervals, e.g. for Cmin7 starting at C3 (MIDI 48)
    // C3=48, Eb3=51, G3=55, Bb3=58
    // return [48, 51, 55, 58];
    return [];
}


// Example Usage (for testing in console if needed):
// const initialSeed = generateNewSeed();
// console.log("Initial Seed:", initialSeed);
// const params = getSongParameters(initialSeed);
// console.log("Song Parameters:", params);

// const paramsFromFixedSeed = getSongParameters("mycoolseed123");
// console.log("Song Parameters from 'mycoolseed123':", paramsFromFixedSeed);
// const paramsFromFixedSeed2 = getSongParameters("mycoolseed123"); // Should be identical
// console.log("Song Parameters from 'mycoolseed123' (again):", paramsFromFixedSeed2);

// console.log("C4 MIDI:", noteNameToMidi("C4")); // 60
// console.log("A4 MIDI:", noteNameToMidi("A4")); // 69
// console.log("A4 Freq:", midiToFrequency(69)); // 440
// console.log("C4 Freq:", midiToFrequency(60)); // ~261.63
