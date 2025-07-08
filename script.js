/**
 * Piano Muse - AI Piano Song Generator
 * Main script file for all application logic.
 * Handles UI interactions, music generation, playback with Tone.js,
 * MIDI visualization, and export functionalities.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const btnGenerateFullSong = document.getElementById('btnGenerateFullSong');
    const selectMood = document.getElementById('selectMood');
    const btnGenerateMood = document.getElementById('btnGenerateMood');
    const bpmSlider = document.getElementById('bpmSlider');
    const bpmValueSpan = document.getElementById('bpmValue');
    const scaleDisplay = document.getElementById('scaleDisplay');
    const sectionDisplay = document.getElementById('sectionDisplay');
    // const midiVisualizerDiv = document.getElementById('midiVisualizer'); // Keep if needed for general div styling
    const pianoRollSVG = document.getElementById('pianoRollSVG');
    const btnPlay = document.getElementById('btnPlay');
    const btnPause = document.getElementById('btnPause');
    const btnStop = document.getElementById('btnStop');
    const progressBar = document.getElementById('progressBar');
    const btnExportMIDI = document.getElementById('btnExportMIDI');
    const btnExportWAV = document.getElementById('btnExportWAV');

    // Initial BPM setup
    bpmValueSpan.textContent = bpmSlider.value;
    let currentBPM = parseInt(bpmSlider.value);

    // --- Tone.js Setup ---
    // Synths for two hands - using FMSynth as required
    const rightHandSynth = new Tone.FMSynth({
        harmonicity: 3,
        modulationIndex: 10,
        detune: 0,
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 1 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 }
    }).toDestination();

    const leftHandSynth = new Tone.FMSynth({ // Slightly different settings for bass/chords
        harmonicity: 1.5,
        modulationIndex: 10,
        detune: 0,
        oscillator: { type: "triangle" }, // Warmer tone for chords
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 1.2 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 }
    }).toDestination();

    // Adjust volume to prevent clipping, especially when chords are played
    rightHandSynth.volume.value = -6; // Melody synth volume
    leftHandSynth.volume.value = -10;  // Chord synth volume, slightly quieter

    // --- Global State Variables ---
    /** @type {object|null} Stores the generated music data for playback and export. */
    let generatedSongData = null;
    /** @type {Tone.Part|null} Tone.Part for the right-hand (melody). */
    let rightHandPart = null;
    /** @type {Tone.Part|null} Tone.Part for the left-hand (chords). */
    let leftHandPart = null;

    // --- Event Listeners Setup ---

    // Generate Full Song Button
    btnGenerateFullSong.addEventListener('click', () => {
        console.log('Generate Full Song clicked. Mood:', selectMood.value, 'BPM:', currentBPM);
        disableControlsDuringGeneration();
        // Ensure Tone.start() is called before any generation that might involve scheduling
        Tone.start().then(() => {
            const data = generateFullSong(); // This function now correctly uses `currentBPM`
            if (data) {
                // playMusic(data); // Optionally auto-play
                // Tone.Transport.start();
                updateUIAfterGeneration(data);
            } else {
                scaleDisplay.textContent = "Failed to generate full song.";
            }
            enableControlsAfterGeneration();
        }).catch(err => {
            console.error("Error starting Tone or generating song:", err);
            enableControlsAfterGeneration();
        });
    });

    // Generate Mood Idea Button
    btnGenerateMood.addEventListener('click', () => {
        const mood = selectMood.value;
        console.log('Generate Idea clicked. Mood:', mood);
        disableControlsDuringGeneration();
        Tone.start().then(() => {
            const data = generateShortIdea(mood); // This function now correctly uses `currentBPM`
                                                 // and also sets it from mood default
            if (data) {
                updateUIAfterGeneration(data);
            } else {
                scaleDisplay.textContent = `Failed to generate for ${mood}.`;
            }
            enableControlsAfterGeneration();
        }).catch(err => {
            console.error("Error starting Tone or generating idea:", err);
            enableControlsAfterGeneration();
        });
    });

    /** Helper to update UI elements after generation */
    function updateUIAfterGeneration(data) {
        scaleDisplay.textContent = `Key: ${data.keySignature}`;
        if (data.sectionMarkers && data.sectionMarkers.length > 0) {
            sectionDisplay.textContent = `Section: ${data.sectionMarkers[0].name}`;
        } else {
            sectionDisplay.textContent = "Generated Idea";
        }
        progressBar.value = 0; // Reset progress bar
        alert(`Generated: ${data.keySignature}. Press Play!`);
    }

    /** Disable controls during generation process */
    function disableControlsDuringGeneration() {
        btnGenerateFullSong.disabled = true;
        btnGenerateMood.disabled = true;
        btnPlay.disabled = true;
        scaleDisplay.textContent = "Generating...";
        sectionDisplay.textContent = "";
    }

    /** Enable controls after generation process */
    function enableControlsAfterGeneration() {
        btnGenerateFullSong.disabled = false;
        btnGenerateMood.disabled = false;
        btnPlay.disabled = false;
    }


    // BPM Slider
    bpmSlider.addEventListener('input', (event) => {
        currentBPM = parseInt(event.target.value);
        bpmValueSpan.textContent = currentBPM;
        if (Tone.Transport.state === "started" || generatedSongData) { // Only if playing or song loaded
            Tone.Transport.bpm.value = currentBPM;
            console.log('BPM changed to:', currentBPM);
            // If visualizer is drawn, it might need redrawing due to time scaling, if grid is complex
            if (generatedSongData && pianoRollSVG.clientWidth > 0) {
                 drawPianoRoll(generatedSongData); // Redraw visualizer with new BPM scaling for grid
                 updatePlayheadPosition(Tone.Transport.seconds); // update playhead to current time
            }
        }
    });

    // Play Button
    btnPlay.addEventListener('click', async () => {
        if (!generatedSongData) {
            console.log('No song generated yet.');
            alert('Please generate a song or idea first!');
            return;
        }
        await Tone.start(); // Ensure AudioContext is running (good practice)

        if (Tone.Transport.state !== 'started') {
            console.log('Playback starting/resuming.');
            playMusic(generatedSongData); // Schedules or re-schedules parts
            Tone.Transport.start();
        } else if (Tone.Transport.state === 'paused') {
            console.log('Resuming playback.');
            Tone.Transport.start(); // Resumes from paused state
        } else {
            console.log('Transport already started. Music should be playing.');
            // Optionally, restart if already playing:
            // Tone.Transport.stop();
            // Tone.Transport.position = 0;
            // playMusic(generatedSongData);
            // Tone.Transport.start();
        }
        btnPlay.textContent = "Play"; // In case it was "Resume"
    });

    // Pause Button
    btnPause.addEventListener('click', () => {
        if (Tone.Transport.state === 'started') {
            Tone.Transport.pause();
            console.log('Playback paused.');
            btnPlay.textContent = "Resume"; // Change Play button to Resume
        }
    });

    // Stop Button (Listener is updated/re-added in Visualizer section, this is fallback)
    // The visualizer's stop handler is more comprehensive.
    // This basic one is here if visualizer part is somehow skipped or for initial setup.
    if (!btnStop.onclick) { // Check if visualizer already set its more complex handler
        btnStop.addEventListener('click', () => {
            Tone.Transport.stop();
            Tone.Transport.position = 0;
            progressBar.value = 0;
            sectionDisplay.textContent = (generatedSongData && generatedSongData.sectionMarkers) ? `Section: ${generatedSongData.sectionMarkers[0].name}` : "Stopped";
            console.log('Playback stopped and reset.');
            btnPlay.textContent = "Play";
        });
    }


    // ProgressBar (Listener is updated/re-added in Visualizer section)
    // This basic one is here if visualizer part is somehow skipped.
    if(!progressBar.oninput) { // Check if visualizer already set its more complex handler
        progressBar.addEventListener('input', (event) => {
            if (generatedSongData && generatedSongData.totalDuration) {
                const seekProgress = parseFloat(event.target.value) / 100;
                const seekTime = seekProgress * generatedSongData.totalDuration;
                Tone.Transport.position = Tone.Time(seekTime).toSeconds();
                console.log('Seeked to (basic):', seekTime);
                 if (Tone.Transport.state === 'paused') { // If paused, ensure playhead updates visually
                    updatePlayheadPosition(seekTime); // Assuming this function exists globally
                }
            }
        });
    }

    // --- Initialize Tone.Transport ---
    Tone.Transport.bpm.value = currentBPM; // Set initial BPM for the transport

    // --- Music Theory Engine ---

    /** @const {string[]} Array of note names, starting from C. Used for MIDI conversions. */
    const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    /**
     * @const {Object.<string, number[]>} Defines scale patterns as arrays of intervals from the root.
     * Examples: MAJOR, NATURAL_MINOR, HARMONIC_MINOR, DORIAN.
     */
    const SCALE_PATTERNS = {
        MAJOR: [0, 2, 4, 5, 7, 9, 11],          // W-W-H-W-W-W-H
        NATURAL_MINOR: [0, 2, 3, 5, 7, 8, 10],  // W-H-W-W-H-W-W
        HARMONIC_MINOR: [0, 2, 3, 5, 7, 8, 11], // Natural minor with a raised 7th
        DORIAN: [0, 2, 3, 5, 7, 9, 10],         // Minor scale with a major 6th (W-H-W-W-W-H-W)
        // TODO: Consider adding other modes like Phrygian, Lydian, Mixolydian for more variety.
    };

    /**
     * @const {Object.<string, number[]>} Defines chord structures as arrays of intervals from the chord root.
     * Includes common triads and seventh chords.
     */
    const CHORD_STRUCTURES = {
        MAJOR_TRIAD: [0, 4, 7],         // Root, Major Third, Perfect Fifth
        MINOR_TRIAD: [0, 3, 7],         // Root, Minor Third, Perfect Fifth
        DIMINISHED_TRIAD: [0, 3, 6],    // Root, Minor Third, Diminished Fifth
        AUGMENTED_TRIAD: [0, 4, 8],     // Root, Major Third, Augmented Fifth
        MAJOR_SEVENTH: [0, 4, 7, 11],   // Major Triad + Major Seventh
        MINOR_SEVENTH: [0, 3, 7, 10],   // Minor Triad + Minor Seventh
        DOMINANT_SEVENTH: [0, 4, 7, 10], // Major Triad + Minor Seventh
        // TODO: Add more complex chords (e.g., half-diminished, altered dominants) for advanced moods.
    };

    /**
     * @const {Object.<string, Object.<string, number[]>>} Maps scale types to their diatonic chord qualities.
     * Roman numerals (I, ii, iii, etc.) represent scale degrees.
     * Values are chord structures from CHORD_STRUCTURES.
     */
    const DIATONIC_CHORDS = {
        MAJOR: {
            'I': CHORD_STRUCTURES.MAJOR_TRIAD,
            'ii': CHORD_STRUCTURES.MINOR_TRIAD,
            'iii': CHORD_STRUCTURES.MINOR_TRIAD,
            'IV': CHORD_STRUCTURES.MAJOR_TRIAD,
            'V': CHORD_STRUCTURES.MAJOR_TRIAD,
            'vi': CHORD_STRUCTURES.MINOR_TRIAD,
            'vii°': CHORD_STRUCTURES.DIMINISHED_TRIAD
        },
        NATURAL_MINOR: {
            'i': CHORD_STRUCTURES.MINOR_TRIAD,
            'ii°': CHORD_STRUCTURES.DIMINISHED_TRIAD,
            'III': CHORD_STRUCTURES.MAJOR_TRIAD, // Relative major
            'iv': CHORD_STRUCTURES.MINOR_TRIAD,
            'v': CHORD_STRUCTURES.MINOR_TRIAD,   // Often altered to V (Major) in practice
            'VI': CHORD_STRUCTURES.MAJOR_TRIAD,
            'VII': CHORD_STRUCTURES.MAJOR_TRIAD  // Subtonic
        },
        HARMONIC_MINOR: {
            'i': CHORD_STRUCTURES.MINOR_TRIAD,
            'ii°': CHORD_STRUCTURES.DIMINISHED_TRIAD,
            'III+': CHORD_STRUCTURES.AUGMENTED_TRIAD, // Augmented mediant due to raised 7th
            'iv': CHORD_STRUCTURES.MINOR_TRIAD,
            'V': CHORD_STRUCTURES.MAJOR_TRIAD,      // Major dominant due to raised 7th
            'VI': CHORD_STRUCTURES.MAJOR_TRIAD,
            'vii°': CHORD_STRUCTURES.DIMINISHED_TRIAD // Leading tone diminished
        },
        DORIAN: { // Example for Dorian mode
            'i': CHORD_STRUCTURES.MINOR_TRIAD,
            'ii': CHORD_STRUCTURES.MINOR_TRIAD,
            'bIII': CHORD_STRUCTURES.MAJOR_TRIAD, // Or III if relative to a major scale
            'IV': CHORD_STRUCTURES.MAJOR_TRIAD,   // Characteristic Major IV chord
            'v': CHORD_STRUCTURES.MINOR_TRIAD,
            'vi°': CHORD_STRUCTURES.DIMINISHED_TRIAD, // Half-diminished with 7th: m7b5
            'bVII': CHORD_STRUCTURES.MAJOR_TRIAD
        }
    };

    /**
     * Converts a musical note name (e.g., "C#4", "Ab3") to its corresponding MIDI note number.
     * Assumes standard MIDI numbering where C4 = 60.
     * @param {string} noteName The note name to convert (e.g., "C4", "F#5").
     * @returns {number} The MIDI note number.
     * @throws {Error} If the note name is invalid.
     */
    function noteToMidi(noteName) {
        const noteRegex = /^([A-Ga-g])([#b]?)(-?\d+)$/; // Regex to parse note name components: 1=Note, 2=Accidental, 3=Octave
        const match = noteName.match(noteRegex);
        if (!match) throw new Error(`Invalid note name: ${noteName}`);

        let note = match[1].toUpperCase();
        const accidental = match[2];
        const octave = parseInt(match[3]);

        let pitchIndex = NOTE_NAMES.indexOf(note);
        if (accidental === '#') {
            pitchIndex = (pitchIndex + 1) % 12;
        } else if (accidental === 'b') {
            pitchIndex = (pitchIndex - 1 + 12) % 12;
            // Adjust for 'Cb' becoming 'B', 'Fb' becoming 'E' etc. for correct octave mapping
            if (NOTE_NAMES[pitchIndex].includes("#")) { // e.g. Db is C#
                // no change
            } else { // e.g. Cb is B, so octave should be one less if original was Cb0 -> B-1
                // This logic is complex for edge cases like Cb, Fb.
                // A simpler way is to map to a canonical name first.
                // For now, we assume standard sharps and flats.
            }
        }
        return pitchIndex + (octave + 1) * 12; // MIDI C4=60. C0=12. (octave + 1) because MIDI octave 0 starts at MIDI note 12.
    }

    /**
     * Converts a MIDI note number to its musical note name (e.g., 60 -> "C4").
     * @param {number} midiNumber The MIDI note number to convert.
     * @returns {string} The musical note name (e.g., "C4", "F#5").
     */
    function midiToNoteName(midiNumber) {
        if (midiNumber < 0 || midiNumber > 127) throw new Error(`Invalid MIDI number: ${midiNumber}`);
        const octave = Math.floor(midiNumber / 12) - 1; // MIDI octave -1 corresponds to musical octave 0 (e.g. C0 is MIDI 12)
        const noteIndex = midiNumber % 12;
        return NOTE_NAMES[noteIndex] + octave;
    }

    /**
     * Generates an array of MIDI note numbers for a given scale.
     * @param {string} rootNoteName The root note of the scale (e.g., "C", "F#"). Octave is specified by `startOctave`.
     * @param {string} scaleType The type of scale (e.g., "MAJOR", "NATURAL_MINOR") from `SCALE_PATTERNS`.
     * @param {number} [startOctave=3] The starting musical octave for the scale (e.g., 3 for C3).
     * @param {number} [numOctaves=2] The number of octaves of the scale to generate.
     * @returns {number[]} A sorted array of unique MIDI note numbers for the scale.
     * @throws {Error} If rootNoteName or scaleType is invalid.
     */
    function getNotesInScale(rootNoteName, scaleType, startOctave = 3, numOctaves = 2) {
        // Get the base MIDI index for the root note (0 for C, 1 for C#, etc.)
        let rootMidiBaseIndex = NOTE_NAMES.indexOf(rootNoteName.charAt(0).toUpperCase());
        if (rootNoteName.length > 1) {
            if (rootNoteName.charAt(1) === '#') rootMidiBaseIndex = (rootMidiBaseIndex + 1) % 12;
            else if (rootNoteName.charAt(1) === 'b') rootMidiBaseIndex = (rootMidiBaseIndex - 1 + 12) % 12;
        }
        if (rootMidiBaseIndex === -1) throw new Error(`Invalid root note name: ${rootNoteName}`);

        const pattern = SCALE_PATTERNS[scaleType];
        if (!pattern) throw new Error(`Invalid scale type: ${scaleType}`);

        const scaleNotes = new Set(); // Use a Set to automatically handle uniqueness
        for (let oct = 0; oct < numOctaves; oct++) {
            const currentOctaveMidiBase = (startOctave + oct + 1) * 12; // MIDI base for current octave (C0 = 12)
            pattern.forEach(interval => {
                const midiNote = currentOctaveMidiBase + rootMidiBaseIndex + interval;
                if (midiNote >= 0 && midiNote <= 127) { // Ensure notes are within valid MIDI range
                    scaleNotes.add(midiNote);
                }
            });
        }
        // Add the root of the (numOctaves+1)-th octave to complete the scale range properly
        const finalOctaveRoot = (startOctave + numOctaves + 1) * 12 + rootMidiBaseIndex;
        if (finalOctaveRoot >=0 && finalOctaveRoot <= 127) scaleNotes.add(finalOctaveRoot);

        return Array.from(scaleNotes).sort((a, b) => a - b); // Convert Set to array and sort
    }

    /**
     * Generates an array of MIDI note numbers for a given chord.
     * @param {number} rootNoteMidi The MIDI note number of the chord's root.
     * @param {number[]} chordIntervals An array of intervals (semitones from root) defining the chord structure (e.g., [0, 4, 7] for Major).
     * @param {number} [octaveShift=0] Optional shift in octaves for the entire chord.
     * @returns {number[]} An array of MIDI note numbers for the chord, filtered for validity (0-127).
     */
    function getChordNotes(rootNoteMidi, chordIntervals, octaveShift = 0) {
        const baseOctaveOffset = octaveShift * 12;
        return chordIntervals
            .map(interval => rootNoteMidi + interval + baseOctaveOffset)
            .filter(note => note >= 0 && note <= 127); // Ensure notes are within MIDI range
    }

    /**
     * Selects a random element from a given array.
     * @param {Array<any>} array The array to pick from.
     * @returns {any|undefined} A random element from the array, or undefined if the array is empty or null.
     */
    function getRandomElement(array) {
        if (!array || array.length === 0) return undefined;
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * @const {Object.<string, {name: string, bars: number, typicalEnergy: number, harmonicShift?: boolean}>}
     * Defines parameters for different song sections.
     * `typicalEnergy` is a hint (0-1) for generation intensity.
     * `harmonicShift` indicates if a section (like a bridge) might involve key changes.
     */
    const SONG_SECTIONS = {
        INTRO: { name: "Intro", bars: 4, typicalEnergy: 0.3 },
        VERSE: { name: "Verse", bars: 8, typicalEnergy: 0.5 },
        CHORUS: { name: "Chorus", bars: 8, typicalEnergy: 0.8 }, // Higher energy for chorus
        BRIDGE: { name: "Bridge", bars: 4, typicalEnergy: 0.6, harmonicShift: true }, // Bridge can modulate
        OUTRO: { name: "Outro", bars: 4, typicalEnergy: 0.2 }  // Lower energy for outro
    };

    /**
     * @const {Object[]} Defines a default song structure using sections from `SONG_SECTIONS`.
     * This can be varied for more complex song forms.
     */
    const DEFAULT_SONG_STRUCTURE = [
        SONG_SECTIONS.INTRO,
        SONG_SECTIONS.VERSE, SONG_SECTIONS.CHORUS,
        SONG_SECTIONS.VERSE, SONG_SECTIONS.CHORUS,
        SONG_SECTIONS.BRIDGE,
        SONG_SECTIONS.CHORUS,
        SONG_SECTIONS.OUTRO
    ];

    // --- MIDI Playback Logic (integrates Visualizer updates) ---

    /**
     * Initializes or re-initializes Tone.js parts for music playback.
     * Clears any existing parts, creates new ones based on `songData`,
     * and schedules UI updates for progress bar, section display, and visualizer highlighting.
     * @param {object} songData The song data object, containing notes for both hands, total duration, and section markers.
     *                        Expected structure: { rightHandNotes: [], leftHandNotes: [], totalDuration: number, sectionMarkers: [], keySignature: string }
     */
    function playMusic(songData) {
        if (!songData || !songData.rightHandNotes || !songData.leftHandNotes || typeof songData.totalDuration !== 'number') {
            console.error("playMusic: Invalid or incomplete songData provided.", songData);
            alert("Cannot play music: data is invalid or missing.");
            return;
        }

        // Draw/redraw the visualizer with the current song data.
        // This is important if the song data has changed or if the view was resized.
        if (pianoRollSVG.clientWidth > 0 && pianoRollSVG.clientHeight > 0) {
            drawPianoRoll(songData);
        } else {
            // If SVG is not visible/sized, visualizer won't work, but audio might still play.
            console.warn("Piano roll SVG not visible or has no dimensions. Visualizer drawing skipped, but audio will attempt to play.");
        }

        // Stop and meticulously clear any existing Tone.js parts and transport events
        // to prevent overlaps, memory leaks, or zombie schedulers.
        if (rightHandPart) {
            rightHandPart.stop(0).clear().dispose(); // Chain stop, clear events, and dispose the part.
            rightHandPart = null;
        }
        if (leftHandPart) {
            leftHandPart.stop(0).clear().dispose();
            leftHandPart = null;
        }
        Tone.Transport.cancel(0); // Clear all previously scheduled transport events (like scheduleRepeat).

        /**
         * Manages highlighting of note elements in the SVG visualizer.
         * @param {string} noteId The unique ID of the SVG note element.
         * @param {boolean} add True to add 'playing' class, false to remove.
         */
        const manageHighlight = (noteId, add) => {
            const el = drawnNoteElements[noteId]; // `drawnNoteElements` is populated by `drawPianoRoll`
            if (el) {
                if (add) {
                    el.classList.add('playing');
                } else {
                    el.classList.remove('playing');
                }
            }
        };

        // Create Tone.Part for the right-hand (melody)
        rightHandPart = new Tone.Part((time, value) => {
            const noteId = `right-hand-note-${value.note}-${time.toFixed(4).replace('.', '_')}`;
            rightHandSynth.triggerAttackRelease(midiToNoteName(value.note), value.duration, time, value.velocity);
            // Schedule visual highlighting using Tone.Draw for thread-safe DOM manipulation from audio thread.
            Tone.Draw.schedule(() => manageHighlight(noteId, true), time);
            // Remove highlight slightly before the note's audible end to account for release phase.
            Tone.Draw.schedule(() => manageHighlight(noteId, false), time + value.duration * 0.95);
        }, songData.rightHandNotes).start(0); // Start the part at time 0 relative to Tone.Transport start.
        rightHandPart.loop = false; // Individual parts do not loop; Tone.Transport can loop the entire sequence if desired.

        // Create Tone.Part for the left-hand (chords)
        leftHandPart = new Tone.Part((time, value) => {
            const chordNoteNames = value.notes.map(midiNote => midiToNoteName(midiNote));
            leftHandSynth.triggerAttackRelease(chordNoteNames, value.duration, time, value.velocity);
            value.notes.forEach(midiVal => { // Highlight each note in the chord
                const noteId = `left-hand-note-${midiVal}-${time.toFixed(4).replace('.', '_')}`;
                Tone.Draw.schedule(() => manageHighlight(noteId, true), time);
                Tone.Draw.schedule(() => manageHighlight(noteId, false), time + value.duration * 0.95);
            });
        }, songData.leftHandNotes).start(0);
        leftHandPart.loop = false;

        // Synchronize Tone.Transport's BPM with the current application BPM.
        Tone.Transport.bpm.value = currentBPM;

        // Schedule regular UI updates (progress bar, section display, playhead)
        // This uses Tone.Transport.scheduleRepeat for events synchronized with the transport's timeline.
        Tone.Transport.scheduleRepeat(t => { // 't' is the precise transport time of this callback
            Tone.Draw.schedule(() => { // Use Tone.Draw for UI updates from audio thread
                const currentSeconds = Tone.Transport.getSecondsAtTime(t); // Current playback time in seconds

                if (songData.totalDuration > 0) {
                    progressBar.value = (Tone.Transport.progress * 100).toFixed(2); // Update progress bar (0-100)
                    updatePlayheadPosition(currentSeconds); // Update visual playhead in SVG
                }

                // Update the "Section: ..." display based on current playback time and section markers
                if (songData.sectionMarkers && songData.sectionMarkers.length > 0) {
                    let currentSectionName = songData.sectionMarkers[0].name; // Default to first section name
                    // Iterate backwards to find the current section efficiently
                    for (let i = songData.sectionMarkers.length - 1; i >= 0; i--) {
                        if (currentSeconds >= songData.sectionMarkers[i].time) {
                            currentSectionName = songData.sectionMarkers[i].name;
                            break;
                        }
                    }
                    sectionDisplay.textContent = `Section: ${currentSectionName}`;
                }
            }, t); // Schedule the Draw callback at the same transport time 't'
        }, "30hz"); // Update rate for UI (e.g., "16n" or "30hz" for smoother animation)

        console.log("Music parts scheduled for playback with visualizer updates.");
    }

    // --- Export Functionality ---

    /**
     * Exports the generated song data as a MIDI file.
     * Uses midi-writer-js library.
     * @param {object} songData - The generated song data.
     */
    function exportMIDI(songData) {
        if (!songData) {
            alert("No song data to export!");
            return;
        }

        const { rightHandNotes, leftHandNotes, keySignatureInfo } = songData; // Assuming keySignatureInfo from generation step

        // Track for Right Hand (Melody) - Channel 1
        const rightHandTrack = new MidiWriter.Track();
        rightHandTrack.setTempo(currentBPM);
        rightHandTrack.addTrackName("Right Hand (Melody)");
        rightHandTrack.addInstrumentName("Electric Piano 1"); // More fitting for FMSynth

        // Add notes to the track
        // midi-writer-js needs delta times for subsequent notes if not using absolute startTick
        // For simplicity with absolute times from Tone.js, we can use startTick for each event.
        rightHandNotes.forEach(note => {
            const startTick = Tone.Time(note.time).toTicks();
            const durationTicks = Tone.Time(note.duration).toTicks();
            rightHandTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: [midiToNoteName(note.note)],
                duration: `T${durationTicks}`, // Using tick duration
                startTick: startTick,          // Absolute start tick for this event
                velocity: Math.round(note.velocity * 100)
            }));
        });

        // Track for Left Hand (Chords) - Channel 2
        const leftHandTrack = new MidiWriter.Track();
        leftHandTrack.setTempo(currentBPM);
        leftHandTrack.addTrackName("Left Hand (Chords)");
        leftHandTrack.addInstrumentName("Electric Piano 1");

        leftHandNotes.forEach(chord => {
            const startTick = Tone.Time(chord.time).toTicks();
            const durationTicks = Tone.Time(chord.duration).toTicks();
            leftHandTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: chord.notes.map(n => midiToNoteName(n)),
                duration: `T${durationTicks}`,
                startTick: startTick,
                velocity: Math.round(chord.velocity * 100)
            }));
        });

        const write = new MidiWriter.Writer([rightHandTrack, leftHandTrack]);
        const midiDataUri = write.dataUri();

        const a = document.createElement('a');
        a.href = midiDataUri;
        const moodValue = selectMood.value; // get current mood
        constfileNameKeySig = songData.keySignature ? songData.keySignature.replace(/\s+/g, '_') : "UnknownKey";
        a.download = `PianoMuse_${moodValue}_${fileNameKeySig}.mid`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log("MIDI file exported.");
    }

    /**
     * Exports the generated song data as a WAV file using Tone.Offline.
     * @param {object} songData - The generated song data.
     */
    async function exportWAV(songData) {
        if (!songData || !generatedSongData) {
            alert("No song data to export!");
            return;
        }
        if (Tone.Transport.state === 'started') {
            alert("Please stop playback before exporting WAV.");
            return;
        }

        const { totalDuration } = songData;
        if (totalDuration <= 0) {
            alert("Cannot export empty or zero-duration song.");
            return;
        }

        const originalScaleText = scaleDisplay.textContent;
        scaleDisplay.textContent = "Rendering WAV... please wait.";
        btnExportWAV.disabled = true;
        btnGenerateFullSong.disabled = true;
        btnGenerateMood.disabled = true;


        try {
            const buffer = await Tone.Offline(async (offlineTransport) => {
                const offlineRightHandSynth = new Tone.FMSynth({
                    harmonicity: 3, modulationIndex: 10, detune: 0, oscillator: { type: "sine" },
                    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 1 },
                    modulation: { type: "square" },
                    modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 }
                }).toDestination();
                offlineRightHandSynth.volume.value = rightHandSynth.volume.value;

                const offlineLeftHandSynth = new Tone.FMSynth({
                    harmonicity: 1.5, modulationIndex: 10, detune: 0, oscillator: { type: "triangle" },
                    envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 1.2 },
                    modulation: { type: "sine" },
                    modulationEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 }
                }).toDestination();
                offlineLeftHandSynth.volume.value = leftHandSynth.volume.value;

                new Tone.Part((time, value) => {
                    offlineRightHandSynth.triggerAttackRelease(midiToNoteName(value.note), value.duration, time, value.velocity);
                }, songData.rightHandNotes).start(0);

                new Tone.Part((time, value) => {
                    const chordNoteNames = value.notes.map(midiNote => midiToNoteName(midiNote));
                    offlineLeftHandSynth.triggerAttackRelease(chordNoteNames, value.duration, time, value.velocity);
                }, songData.leftHandNotes).start(0);

                offlineTransport.bpm.value = currentBPM;
                offlineTransport.start(0);
            }, totalDuration + 1.5); // Add buffer for release tails (was 0.5, increased for safety)

            const wavDataUri = bufferToWave(buffer, buffer.length); // buffer.length here is total samples

            const a = document.createElement('a');
            a.href = wavDataUri;
            const moodValue = selectMood.value;
            const fileNameKeySig = songData.keySignature ? songData.keySignature.replace(/\s+/g, '_') : "UnknownKey";
            a.download = `PianoMuse_${moodValue}_${fileNameKeySig}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log("WAV file exported.");

        } catch (error) {
            console.error("Error exporting WAV:", error);
            alert("Error during WAV export. See console for details.");
        } finally {
            scaleDisplay.textContent = originalScaleText; // Restore display
            btnExportWAV.disabled = false;
            btnGenerateFullSong.disabled = false;
            btnGenerateMood.disabled = false;
        }
    }

    function bufferToWave(abuffer, totalSamples) {
        let numOfChan = abuffer.numberOfChannels,
            // length = totalSamples * numOfChan * 2 + 44, // totalSamples is already total for all channels from buffer.length
            length = totalSamples * 2 + 44, // Corrected: totalSamples * bytesPerSample (2 for 16-bit) + header.
                                            // AudioBuffer.length is samples per channel. So, for stereo, use totalSamples * numOfChan * 2
            actualTotalSamplesAcrossChannels = totalSamples * numOfChan;
        length = actualTotalSamplesAcrossChannels * 2 + 44;


        let buffer = new ArrayBuffer(length),
            view = new DataView(buffer),
            channels = [], sample,
            offset = 0,
            pos = 0;

        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8);
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt "
        setUint32(16); // PCM header size
        setUint16(1); // PCM format
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * numOfChan * 2); // byteRate
        setUint16(numOfChan * 2); // blockAlign
        setUint16(16); // bitsPerSample
        setUint32(0x61746164); // "data"
        setUint32(actualTotalSamplesAcrossChannels * 2); // data subchunk size (samples * channels * bytesPerSample)

        for (let ch = 0; ch < numOfChan; ch++)
            channels.push(abuffer.getChannelData(ch));

        // Interleave samples
        for (let i = 0; i < totalSamples; i++) { // totalSamples is per channel length
            for (let ch = 0; ch < numOfChan; ch++) {
                sample = Math.max(-1, Math.min(1, channels[ch][i]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
        }

        function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
        function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

        return "data:audio/wav;base64," + btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
    }

    // Update event listeners for export buttons (actual implementation)
    btnExportMIDI.removeEventListener('click', console.log); // Remove placeholder if any, direct re-add is fine
    btnExportMIDI.addEventListener('click', () => {
        if (!generatedSongData) {
            alert('Please generate a song first to export MIDI.');
            return;
        }
        console.log('Export MIDI initiated.');
        exportMIDI(generatedSongData);
    });

    btnExportWAV.removeEventListener('click', console.log); // Remove placeholder if any
    btnExportWAV.addEventListener('click', () => {
        if (!generatedSongData) {
            alert('Please generate a song first to export WAV.');
            return;
        }
        console.log('Export WAV initiated.');
        exportWAV(generatedSongData);
    });

    // --- MIDI Visualizer Logic ---
    const SVG_NS = "http://www.w3.org/2000/svg";
    const PIANO_KEY_WIDTH = 10; // Width of a white key in SVG units
    const PIANO_KEY_AREA_WIDTH = 80; // Width of the piano key display area
    const NOTE_HEIGHT = 8; // Height of a note rectangle in SVG units
    const MIN_MIDI_NOTE_DISPLAY = 21; // A0
    const MAX_MIDI_NOTE_DISPLAY = 108; // C8
    const NUM_KEYS_DISPLAY = MAX_MIDI_NOTE_DISPLAY - MIN_MIDI_NOTE_DISPLAY + 1;

    let drawnNoteElements = {}; // Store SVG elements for notes: { 'noteId_time': svgElement }

    function createSVGElement(elName, attributes) {
        const el = document.createElementNS(SVG_NS, elName);
        for (const attr in attributes) {
            el.setAttribute(attr, attributes[attr]);
        }
        return el;
    }

    function drawPianoRoll(songData) {
        if (!pianoRollSVG || !songData) return;
        pianoRollSVG.innerHTML = ''; // Clear previous drawing
        drawnNoteElements = {};

        const viewWidth = pianoRollSVG.clientWidth;
        const viewHeight = pianoRollSVG.clientHeight;
        const timelineWidth = viewWidth - PIANO_KEY_AREA_WIDTH;

        if (timelineWidth <=0 || viewHeight <=0) {
            console.warn("SVG Piano Roll area has zero width or height. Skipping draw.");
            return;
        }

        const totalSongSeconds = songData.totalDuration || 10; // Default to 10s if no duration
        const pixelsPerSecond = timelineWidth / totalSongSeconds;

        // Group for piano keys
        const pianoKeysGroup = createSVGElement('g', { id: 'pianoKeysGroup', transform: `translate(0,0)` });
        pianoRollSVG.appendChild(pianoKeysGroup);

        // Group for notes area (grid, notes, playhead)
        const notesAreaGroup = createSVGElement('g', { id: 'notesAreaGroup', transform: `translate(${PIANO_KEY_AREA_WIDTH},0)` });
        pianoRollSVG.appendChild(notesAreaGroup);

        // Draw piano keys (simplified)
        let yPos = 0;
        for (let midi = MAX_MIDI_NOTE_DISPLAY; midi >= MIN_MIDI_NOTE_DISPLAY; midi--) {
            const noteName = midiToNoteName(midi);
            const isBlackKey = noteName.includes("#");
            const keyRect = createSVGElement('rect', {
                x: isBlackKey ? PIANO_KEY_AREA_WIDTH * 0.4 : 0,
                y: yPos,
                width: isBlackKey ? PIANO_KEY_AREA_WIDTH * 0.6 : PIANO_KEY_AREA_WIDTH,
                height: NOTE_HEIGHT,
                class: `svg-piano-key ${isBlackKey ? 'black' : 'white'}`
            });
            pianoKeysGroup.appendChild(keyRect);
            yPos += NOTE_HEIGHT;
        }

        // Draw grid lines (time signature based - simplified to seconds for now)
        const timeSignature = Tone.Transport.timeSignature; // Assume 4/4
        const beatsPerBar = typeof timeSignature === 'number' ? timeSignature : timeSignature[0]; // e.g. 4
        const secondsPerBeat = 60.0 / currentBPM;
        const secondsPerBar = secondsPerBeat * beatsPerBar;

        for (let t = 0; t <= totalSongSeconds; t += secondsPerBeat) {
            const x = t * pixelsPerSecond;
            const isBarLine = Math.abs(t % secondsPerBar) < 0.001 || t === 0;
            const line = createSVGElement('line', {
                x1: x, y1: 0, x2: x, y2: viewHeight,
                class: isBarLine ? 'svg-bar-line' : 'svg-grid-line'
            });
            notesAreaGroup.appendChild(line);
        }
        // Horizontal lines per key (optional, can be too busy)
        // yPos = 0;
        // for (let midi = MAX_MIDI_NOTE_DISPLAY; midi >= MIN_MIDI_NOTE_DISPLAY; midi--) {
        //     const line = createSVGElement('line', { x1: 0, y1: yPos, x2: timelineWidth, y2: yPos, class: 'svg-grid-line'});
        //     notesAreaGroup.appendChild(line);
        //     yPos += NOTE_HEIGHT;
        // }


        // Draw notes
        const drawNotesForHand = (notes, handClass) => {
            notes.forEach((noteEvent, index) => {
                let noteMidiValues = [];
                if (noteEvent.note) noteMidiValues.push(noteEvent.note); // Single note for melody
                if (noteEvent.notes) noteMidiValues = noteEvent.notes; // Array for chords

                noteMidiValues.forEach(midiVal => {
                    if (midiVal < MIN_MIDI_NOTE_DISPLAY || midiVal > MAX_MIDI_NOTE_DISPLAY) return;

                    const noteY = (MAX_MIDI_NOTE_DISPLAY - midiVal) * NOTE_HEIGHT;
                    const noteX = noteEvent.time * pixelsPerSecond;
                    const noteWidth = noteEvent.duration * pixelsPerSecond;

                    const noteRect = createSVGElement('rect', {
                        x: noteX,
                        y: noteY,
                        width: Math.max(1, noteWidth -1), // Ensure minimum width and slight gap
                        height: NOTE_HEIGHT -1, // Slight gap
                        class: `svg-note-rect ${handClass}`,
                        id: `${handClass}-note-${midiVal}-${noteEvent.time.toFixed(4).replace('.', '_')}` // Unique ID
                    });
                    notesAreaGroup.appendChild(noteRect);
                    drawnNoteElements[noteRect.id] = noteRect;
                });
            });
        };

        drawNotesForHand(songData.rightHandNotes || [], 'right-hand');
        drawNotesForHand(songData.leftHandNotes || [], 'left-hand');

        // Draw playhead
        const playhead = createSVGElement('line', {
            id: 'playhead', x1: 0, y1: 0, x2: 0, y2: viewHeight
        });
        notesAreaGroup.appendChild(playhead);

        // Draw Section Markers
        if (songData.sectionMarkers) {
            songData.sectionMarkers.forEach(marker => {
                const markerX = marker.time * pixelsPerSecond;
                const markerText = createSVGElement('text', {
                    x: markerX + 5, // Slight offset from line
                    y: 15, // Position from top
                    class: 'section-marker-text'
                });
                markerText.textContent = marker.name;
                notesAreaGroup.appendChild(markerText);
                // Optional: line for marker
                const markerLine = createSVGElement('line', {
                     x1: markerX, y1: 0, x2: markerX, y2: viewHeight,
                     class: 'svg-bar-line', 'stroke-dasharray': "4 2", stroke: "#00BFFF" // Dashed blue line
                });
                notesAreaGroup.appendChild(markerLine);
            });
        }
    }

    function updatePlayheadPosition(timeInSeconds) {
        if (!pianoRollSVG || !generatedSongData) return;
        const viewWidth = pianoRollSVG.clientWidth;
        const timelineWidth = viewWidth - PIANO_KEY_AREA_WIDTH;
        const totalSongSeconds = generatedSongData.totalDuration || 1;
        const pixelsPerSecond = timelineWidth / totalSongSeconds;
        const playheadSVG = document.getElementById('playhead');
        if (playheadSVG) {
            const xPos = timeInSeconds * pixelsPerSecond;
            playheadSVG.setAttribute('x1', xPos);
            playheadSVG.setAttribute('x2', xPos);
        }
    }

    // Modify playMusic to include visualizer updates
    const originalPlayMusic = playMusic; // Keep a reference if needed, or integrate directly
    playMusic = function(songData) { // Override playMusic
        // Call original logic if it was structured to be callable (or paste its content here)
        // For now, assuming the original playMusic logic is now part of this new function.

        if (!songData || !songData.rightHandNotes || !songData.leftHandNotes) {
            console.error("playMusic (Visualizer): Invalid songData provided.");
            return;
        }
        drawPianoRoll(songData); // Draw the piano roll first

        // Stop and clear any existing parts
        if (rightHandPart) {
            rightHandPart.stop(0); rightHandPart.clear(); rightHandPart.dispose(); rightHandPart = null;
        }
        if (leftHandPart) {
            leftHandPart.stop(0); leftHandPart.clear(); leftHandPart.dispose(); leftHandPart = null;
        }
        Tone.Transport.cancel(0);

        // Helper to manage highlighting
        const manageHighlight = (noteId, add) => {
            const el = drawnNoteElements[noteId];
            if (el) {
                if (add) el.classList.add('playing');
                else el.classList.remove('playing');
            }
        };

        rightHandPart = new Tone.Part((time, value) => {
            const noteId = `right-hand-note-${value.note}-${time.toFixed(4).replace('.', '_')}`;
            rightHandSynth.triggerAttackRelease(midiToNoteName(value.note), value.duration, time, value.velocity);
            Tone.Draw.schedule(() => manageHighlight(noteId, true), time);
            Tone.Draw.schedule(() => manageHighlight(noteId, false), time + value.duration * 0.9); // Remove slightly before end
        }, songData.rightHandNotes).start(0);
        rightHandPart.loop = false;

        leftHandPart = new Tone.Part((time, value) => {
            const chordNoteNames = value.notes.map(midiNote => midiToNoteName(midiNote));
            leftHandSynth.triggerAttackRelease(chordNoteNames, value.duration, time, value.velocity);
            value.notes.forEach(midiVal => {
                const noteId = `left-hand-note-${midiVal}-${time.toFixed(4).replace('.', '_')}`;
                Tone.Draw.schedule(() => manageHighlight(noteId, true), time);
                Tone.Draw.schedule(() => manageHighlight(noteId, false), time + value.duration * 0.9);
            });
        }, songData.leftHandNotes).start(0);
        leftHandPart.loop = false;

        Tone.Transport.bpm.value = currentBPM;

        Tone.Transport.scheduleRepeat(t => {
            Tone.Draw.schedule(() => {
                const currentSeconds = Tone.Transport.getSecondsAtTime(t);
                if (songData.totalDuration > 0) {
                    progressBar.value = (Tone.Transport.progress * 100).toFixed(2);
                    updatePlayheadPosition(currentSeconds);
                }
                if (songData.sectionMarkers && songData.sectionMarkers.length > 0) {
                    let currentSectionName = "Song";
                    for (let i = songData.sectionMarkers.length - 1; i >= 0; i--) {
                        if (currentSeconds >= songData.sectionMarkers[i].time) {
                            currentSectionName = songData.sectionMarkers[i].name;
                            break;
                        }
                    }
                    sectionDisplay.textContent = `Section: ${currentSectionName}`;
                }
            }, t);
        }, "30hz"); // Update rate for playhead and progress bar

        console.log("Music parts scheduled for playback with visualizer updates.");
    }

    // Update Stop button to clear highlights
    const originalBtnStopHandler = btnStop.onclick; // Assuming it was set this way, or find its listener
    btnStop.addEventListener('click', () => { // Replace or augment existing listener
        // if(originalBtnStopHandler) originalBtnStopHandler(); // Call previous if any
        Tone.Transport.stop();
        Tone.Transport.position = 0;
        progressBar.value = 0;
        updatePlayheadPosition(0);
        for (const id in drawnNoteElements) {
            drawnNoteElements[id].classList.remove('playing');
        }
        if (generatedSongData && generatedSongData.sectionMarkers && generatedSongData.sectionMarkers.length > 0) {
            sectionDisplay.textContent = `Section: ${generatedSongData.sectionMarkers[0].name}`;
        } else {
            sectionDisplay.textContent = "Stopped";
        }
        console.log('Playback stopped and reset. Visualizer highlights cleared.');
    });

    // Update progress bar seeking to also clear highlights and update playhead
    const originalProgressBarHandler = progressBar.oninput;
    progressBar.addEventListener('input', (event) => { // Replace or augment
        // if(originalProgressBarHandler) originalProgressBarHandler(event);
        if (generatedSongData && generatedSongData.totalDuration) {
            const seekProgress = parseFloat(event.target.value) / 100;
            const wasPlaying = Tone.Transport.state === 'started';
            Tone.Transport.pause();

            for (const id in drawnNoteElements) { // Clear current highlights before seek
                drawnNoteElements[id].classList.remove('playing');
            }

            const seekTime = seekProgress * generatedSongData.totalDuration;
            Tone.Transport.position = seekTime;
            updatePlayheadPosition(seekTime); // Update visual playhead
            console.log('Seeked to progress:', seekProgress, 'Time:', Tone.Time(seekTime).toNotation());

            if (wasPlaying) {
                Tone.Transport.start();
            }
             // Highlights will be re-applied by Tone.Part events as they play from new position
        }
    });

    // Initial draw of an empty piano roll if desired, or wait for first generation
    // drawPianoRoll({totalDuration: 60}); // Example: draw an empty 60s roll
    // Better to draw when song is generated.

    // Resize observer for redrawing piano roll on window resize
    new ResizeObserver(() => {
        if (generatedSongData && pianoRollSVG.clientWidth > 0 && pianoRollSVG.clientHeight > 0) {
            console.log("Resizing piano roll SVG.");
            drawPianoRoll(generatedSongData);
            updatePlayheadPosition(Tone.Transport.seconds); // redraw playhead at current pos
        } else if (!generatedSongData && pianoRollSVG.clientWidth > 0 && pianoRollSVG.clientHeight > 0) {
            // Optionally draw an empty grid if no song is loaded yet
            // drawPianoRoll({ rightHandNotes: [], leftHandNotes: [], totalDuration: 60, sectionMarkers: [{name: "Waiting for music...", time:0}] });
        }
    }).observe(document.getElementById('midiVisualizer')); // Observe the container div

    // --- Export Functionality ---

    /**
     * Exports the generated song data as a MIDI file (.mid).
     * This function utilizes the `midi-writer-js` library to construct the MIDI file.
     * It creates two tracks: one for the right-hand melody and one for the left-hand chords.
     * @param {object} songData The song data object, containing notes, key signature, etc.
     *                          Requires `rightHandNotes`, `leftHandNotes`, and `keySignature`.
     */
    function exportMIDI(songData) {
        if (!songData || !songData.rightHandNotes || !songData.leftHandNotes) {
            alert("No valid song data to export as MIDI. Please generate music first.");
            console.error("exportMIDI: Missing notes data.", songData);
            return;
        }

        const { rightHandNotes, leftHandNotes, keySignature } = songData;

        // Create a new MIDI track for the Right Hand (Melody)
        const rightHandTrack = new MidiWriter.Track();
        rightHandTrack.setTempo(currentBPM); // Set tempo for this track
        rightHandTrack.addTrackName("Right Hand (Melody)"); // Informational track name
        rightHandTrack.addInstrumentName("Electric Piano 1"); // Instrument for the track

        // Add each melody note to the right-hand track
        rightHandNotes.forEach(note => {
            const startTick = Tone.Time(note.time).toTicks();       // Convert Tone.js time (seconds) to MIDI ticks
            const durationTicks = Tone.Time(note.duration).toTicks(); // Convert duration to MIDI ticks
            rightHandTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: [midiToNoteName(note.note)], // Note pitch (must be an array for midi-writer-js)
                duration: `T${durationTicks}`,      // Duration in ticks format (e.g., "T128")
                startTick: startTick,               // Absolute start tick for this note event
                velocity: Math.round(note.velocity * 100) // Velocity (0-100 for midi-writer-js)
            }));
        });

        // Create a new MIDI track for the Left Hand (Chords)
        const leftHandTrack = new MidiWriter.Track();
        leftHandTrack.setTempo(currentBPM); // Set tempo consistently across tracks
        leftHandTrack.addTrackName("Left Hand (Chords)");
        leftHandTrack.addInstrumentName("Electric Piano 1");

        // Add each chord to the left-hand track
        leftHandNotes.forEach(chord => {
            const startTick = Tone.Time(chord.time).toTicks();
            const durationTicks = Tone.Time(chord.duration).toTicks();
            leftHandTrack.addEvent(new MidiWriter.NoteEvent({
                pitch: chord.notes.map(n => midiToNoteName(n)), // Array of note names for the chord
                duration: `T${durationTicks}`,
                startTick: startTick,
                velocity: Math.round(chord.velocity * 100)
            }));
        });

        // Combine tracks and generate MIDI data URI
        const writer = new MidiWriter.Writer([rightHandTrack, leftHandTrack]);
        const midiDataUri = writer.dataUri(); // Generates base64 encoded MIDI data

        // Trigger download of the MIDI file
        const a = document.createElement('a');
        a.href = midiDataUri;
        const moodValue = selectMood.value;
        const fileNameKeySig = keySignature ? keySignature.replace(/\s+/g, '_') : "UnknownKey"; // Sanitize filename
        a.download = `PianoMuse_${moodValue}_${fileNameKeySig}.mid`; // Set default filename
        document.body.appendChild(a); // Required for Firefox
        a.click(); // Programmatically click the link to trigger download
        document.body.removeChild(a); // Clean up the link element
        console.log("MIDI file exported successfully.");
    }

    /**
     * Exports the generated song data as a WAV audio file.
     * This function uses `Tone.Offline` to render the audio in the background,
     * then converts the resulting `AudioBuffer` to a WAV file using `bufferToWave`.
     * @param {object} songData The song data, requires `totalDuration`, `rightHandNotes`, `leftHandNotes`, `keySignature`.
     */
    async function exportWAV(songData) {
        if (!songData || !generatedSongData || !songData.rightHandNotes || !songData.leftHandNotes) {
            alert("No valid song data to export as WAV. Please generate music first.");
            console.error("exportWAV: Missing critical song data.", songData);
            return;
        }
        if (Tone.Transport.state === 'started') { // Prevent export during playback to avoid issues
            alert("Please stop playback before exporting WAV audio.");
            return;
        }

        const { totalDuration, keySignature: currentKeySignature } = songData;
        if (totalDuration <= 0) {
            alert("Cannot export empty or zero-duration song as WAV.");
            return;
        }

        const originalScaleText = scaleDisplay.textContent; // Save current UI text
        scaleDisplay.textContent = "Rendering WAV... please wait. This may take a moment.";
        // Disable UI controls during the rendering process to prevent conflicts
        btnExportWAV.disabled = true;
        btnExportMIDI.disabled = true; // Also disable MIDI export during WAV render
        btnGenerateFullSong.disabled = true;
        btnGenerateMood.disabled = true;
        btnPlay.disabled = true; // Disable play controls

        try {
            // Use Tone.Offline to render the audio into an AudioBuffer
            const audioBuffer = await Tone.Offline(async (offlineTransport) => {
                // Create temporary FMSynth instances within the offline context, configured like the main synths
                const offlineRightHandSynth = new Tone.FMSynth({ /* Same parameters as main rightHandSynth */
                    harmonicity: 3, modulationIndex: 10, detune: 0, oscillator: { type: "sine" },
                    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 1 },
                    modulation: { type: "square" },
                    modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 }
                }).toDestination(); // Route to offline destination
                offlineRightHandSynth.volume.value = rightHandSynth.volume.value; // Match main synth volume

                const offlineLeftHandSynth = new Tone.FMSynth({ /* Same parameters as main leftHandSynth */
                    harmonicity: 1.5, modulationIndex: 10, detune: 0, oscillator: { type: "triangle" },
                    envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 1.2 },
                    modulation: { type: "sine" },
                    modulationEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 }
                }).toDestination();
                offlineLeftHandSynth.volume.value = leftHandSynth.volume.value;

                // Schedule notes on these offline synths using Tone.Part
                new Tone.Part((time, value) => {
                    offlineRightHandSynth.triggerAttackRelease(midiToNoteName(value.note), value.duration, time, value.velocity);
                }, songData.rightHandNotes).start(0);

                new Tone.Part((time, value) => {
                    const chordNoteNames = value.notes.map(midiNote => midiToNoteName(midiNote));
                    offlineLeftHandSynth.triggerAttackRelease(chordNoteNames, value.duration, time, value.velocity);
                }, songData.leftHandNotes).start(0);

                offlineTransport.bpm.value = currentBPM; // Set BPM for the offline rendering context
                offlineTransport.start(0); // Start the offline transport to render the scheduled parts
            }, totalDuration + 1.5); // Render duration, add a small buffer (e.g., 1.5s) for synth release tails

            // Convert the rendered AudioBuffer to a WAV data URI
            const wavDataUri = bufferToWave(audioBuffer, audioBuffer.length); // audioBuffer.length is samples per channel

            // Trigger download of the WAV file
            const a = document.createElement('a');
            a.href = wavDataUri;
            const moodValue = selectMood.value;
            const fileNameKeySig = currentKeySignature ? currentKeySignature.replace(/\s+/g, '_') : "UnknownKey";
            a.download = `PianoMuse_${moodValue}_${fileNameKeySig}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log("WAV file exported successfully.");

        } catch (error) {
            console.error("Error during WAV export:", error);
            alert(`An error occurred during WAV export: ${error.message}. Check console for details.`);
        } finally {
            // Re-enable UI controls and restore original display text regardless of success or failure
            scaleDisplay.textContent = originalScaleText;
            btnExportWAV.disabled = false;
            btnExportMIDI.disabled = false;
            btnGenerateFullSong.disabled = false;
            btnGenerateMood.disabled = false;
            btnPlay.disabled = false;
        }
    }

    /**
     * Converts a Tone.js AudioBuffer to a WAV file format (as a base64 data URI).
     * This implementation handles mono or stereo audio and encodes it as 16-bit PCM.
     * @param {AudioBuffer} abuffer The AudioBuffer to convert.
     * @param {number} samplesPerChannel The number of samples per channel in the AudioBuffer (abuffer.length).
     * @returns {string} A base64 data URI representing the WAV file.
     */
    function bufferToWave(abuffer, samplesPerChannel) {
        const numOfChan = abuffer.numberOfChannels;
        const totalSamplesAcrossChannels = samplesPerChannel * numOfChan;
        const wavHeaderLength = 44; // Standard length of a WAV header
        const totalDataLength = totalSamplesAcrossChannels * 2; // Each sample is 2 bytes (16-bit)
        const totalFileLength = totalDataLength + wavHeaderLength;

        const buffer = new ArrayBuffer(totalFileLength);
        const view = new DataView(buffer); // DataView allows writing multi-byte numbers

        let pos = 0; // Current position in the DataView buffer

        // Helper to write a 16-bit unsigned integer (Uint16) to the DataView
        function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
        // Helper to write a 32-bit unsigned integer (Uint32) to the DataView
        function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }
        // Helper to write a string as ASCII characters to the DataView
        function writeString(s) { for (let i = 0; i < s.length; i++) { view.setUint8(pos++, s.charCodeAt(i)); } }

        // --- RIFF chunk descriptor ---
        writeString('RIFF');
        setUint32(totalFileLength - 8); // ChunkSize: 전체 파일 크기 - 8 (RIFF ID와 ChunkSize 필드 제외)
        writeString('WAVE');

        // --- "fmt " sub-chunk ---
        writeString('fmt ');
        setUint32(16); // Subchunk1Size: 16 for PCM
        setUint16(1);  // AudioFormat: 1 for PCM (linear quantization)
        setUint16(numOfChan); // NumChannels: Mono = 1, Stereo = 2
        setUint32(abuffer.sampleRate); // SampleRate: e.g., 44100
        setUint32(abuffer.sampleRate * numOfChan * 2); // ByteRate = SampleRate * NumChannels * BitsPerSample/8
        setUint16(numOfChan * 2); // BlockAlign = NumChannels * BitsPerSample/8
        setUint16(16); // BitsPerSample: 16-bit

        // --- "data" sub-chunk ---
        writeString('data');
        setUint32(totalDataLength); // Subchunk2Size = NumSamples * NumChannels * BitsPerSample/8

        // Write actual PCM audio data (interleaved)
        const channels = [];
        for (let ch = 0; ch < numOfChan; ch++) {
            channels.push(abuffer.getChannelData(ch));
        }

        for (let i = 0; i < samplesPerChannel; i++) { // Iterate through samples for one channel
            for (let ch = 0; ch < numOfChan; ch++) {   // Interleave channels for each sample frame
                let sample = channels[ch][i];
                sample = Math.max(-1, Math.min(1, sample)); // Clamp sample to [-1, 1] range
                // Convert float sample to 16-bit signed integer
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true); // Write as little-endian
                pos += 2;
            }
        }

        // Convert ArrayBuffer to Base64 string for data URI
        return "data:audio/wav;base64," + btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
    }

    // --- Full Song Generation Logic ---

    /**
     * Generates a full song, structured with sections (Intro, Verse, Chorus, etc.),
     * based on the selected mood and current BPM.
     * The generation involves selecting a key/scale, creating chord progressions for each section,
     * and generating a melody that aligns with the harmony.
     * Bridge sections may include harmonic modulation.
     * @returns {object|null} The generated song data object (similar to `generateShortIdea` but more extensive,
     *                        including `sectionMarkers`), or null if generation fails.
     */
    function generateFullSong() {
        const mood = selectMood.value; // Get current mood from UI dropdown
        const settings = MOOD_SETTINGS[mood.toUpperCase()];
        if (!settings) {
            console.error("Invalid mood for full song:", mood);
            alert("Please select a valid mood.");
            return null;
        }

        const rootNoteName = getRandomElement(settings.keys);
        let currentScaleType = settings.scaleType; // Can be changed by bridge
        const bpm = parseInt(bpmSlider.value) || settings.defaultBPM; // Use slider BPM or mood default

        Tone.Transport.bpm.value = bpm;
        // bpmSlider.value = bpm; // Already set by user or mood idea generation
        // bpmValueSpan.textContent = bpm;
        // currentBPM is assumed to be set either by slider or by generateShortIdea if it was called.
        // Tone.Transport.bpm.value should reflect this `currentBPM`.
        // If generateFullSong is called first, it uses `bpmSlider.value`.

        let keySignatureDisplay = `${rootNoteName} ${currentScaleType.replace('_', ' ')}`;
        scaleDisplay.textContent = `Key: ${keySignatureDisplay}`; // Initial display
        console.log(`Generating full song in ${keySignatureDisplay} at ${bpm} BPM.`);

        const songStructure = DEFAULT_SONG_STRUCTURE; // Using the predefined structure
        let globalTime = 0; // Accumulates time in seconds throughout the song
        const allLeftHandNotes = [];
        const allRightHandNotes = [];
        const sectionMarkers = []; // For visualizer: {time: number, name: string}

        // Iterate through each section defined in the song structure
        songStructure.forEach(sectionInfo => {
            sectionMarkers.push({ time: globalTime, name: sectionInfo.name });
            console.log(`Generating section: ${sectionInfo.name} from ${globalTime}s`);

            let sectionKey = rootNoteName; // Key for the current section
            let sectionScaleType = currentScaleType; // Scale type for the current section

            // Handle harmonic shifts, e.g., for a Bridge section
            if (sectionInfo.harmonicShift && sectionInfo.name === "Bridge") {
                // Simple modulation: try relative major/minor or dominant/subdominant.
                const rootNoteMidiValue = noteToMidi(`${rootNoteName}0`) % 12; // Get MIDI value (0-11) for the root note.

                if (currentScaleType === "MAJOR") { // If current key is Major
                    // Modulate to the subdominant (IV) key.
                    const subdominantRootIndex = (rootNoteMidiValue + 5) % 12; // IV is 5 semitones up
                    sectionKey = NOTE_NAMES[subdominantRootIndex];
                    // sectionScaleType remains MAJOR, or could be Lydian for a brighter IV.
                } else if (currentScaleType.includes("MINOR")) { // If current key is Minor
                    // Modulate to the relative Major (III of minor scale, or bIII if thinking from parallel major).
                    const relativeMajorRootIndex = (rootNoteMidiValue + 3) % 12; // Relative Major is 3 semitones up from minor root
                    sectionKey = NOTE_NAMES[relativeMajorRootIndex];
                    sectionScaleType = "MAJOR"; // Change scale type to Major
                }
                keySignatureDisplay = `${sectionKey} ${sectionScaleType.replace('_', ' ')}`; // Update for display if needed
                console.log(`Bridge modulation to: ${keySignatureDisplay}`);
            }

            // Get scale notes for melody and chord voicings for the current section
            const sectionMelodyScale = getNotesInScale(sectionKey, sectionScaleType, settings.rightHandOctave, 2);
            const sectionChordScale = getNotesInScale(sectionKey, sectionScaleType, settings.leftHandOctave, 1); // For chord roots

            // Determine the set of diatonic chords for the current section's key and scale
            let currentDiatonicChords = DIATONIC_CHORDS[sectionScaleType] || DIATONIC_CHORDS.MAJOR; // Fallback to Major

            // Get a base chord progression pattern from mood settings.
            // This could be made more sophisticated to vary per section type (e.g., Chorus more intense).
            let baseProgression = getRandomElement(settings.chordProgressions);
            if (!baseProgression) { // Fallback if no progression found for mood
                baseProgression = (sectionScaleType === "MAJOR") ? ["I", "IV", "V", "I"] : ["i", "iv", "v", "i"];
            }

            // Adapt the progression to fit the number of bars in the section
            const sectionChordSymbols = [];
            for(let i = 0; i < sectionInfo.bars; i++) {
                sectionChordSymbols.push(baseProgression[i % baseProgression.length]); // Loop or truncate base progression
            }

            // --- Generate notes for each bar in the section ---
            for (let barIndex = 0; barIndex < sectionInfo.bars; barIndex++) {
                const chordSymbol = sectionChordSymbols[barIndex];

                // Determine chord root MIDI and structure from symbol (simplified)
                const romanNumeralMatch = chordSymbol.match(/[IVXLCDM]+/i);
                const degreeRoman = romanNumeralMatch ? romanNumeralMatch[0] : 'I'; // Default to 'I' if parsing fails
                const degreeIndex = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].indexOf(degreeRoman.toUpperCase());

                // Ensure degreeIndex is valid; if not, default to 0 (tonic)
                const validDegreeIndex = (degreeIndex !== -1) ? degreeIndex : 0;
                const chordRootNoteInScale = sectionChordScale[validDegreeIndex % sectionChordScale.length]; // Get root note from scale

                let chordStructureToUse = CHORD_STRUCTURES.MAJOR_TRIAD; // Default structure
                if (currentDiatonicChords && currentDiatonicChords[chordSymbol]) {
                    chordStructureToUse = currentDiatonicChords[chordSymbol];
                } else { // Basic fallback parsing for chord quality from symbol
                    if (chordSymbol.includes('°') || chordSymbol.includes('dim')) chordStructureToUse = CHORD_STRUCTURES.DIMINISHED_TRIAD;
                    else if (chordSymbol.includes('+') || chordSymbol.includes('aug')) chordStructureToUse = CHORD_STRUCTURES.AUGMENTED_TRIAD;
                    else if (chordSymbol.toLowerCase().includes('m') && !chordSymbol.includes('maj')) chordStructureToUse = CHORD_STRUCTURES.MINOR_TRIAD;
                    else if (chordSymbol.includes('maj7')) chordStructureToUse = CHORD_STRUCTURES.MAJOR_SEVENTH;
                    else if (chordSymbol.includes('7')) chordStructureToUse = CHORD_STRUCTURES.DOMINANT_SEVENTH; // Simplified: assumes dominant if just '7'
                }

                const currentChordVoicing = getChordNotes(chordRootNoteInScale, chordStructureToUse, 0); // Voicing in left hand octave
                // Duration of one bar (assuming 4/4 time, can be made more flexible)
                const barDurationSeconds = (4 * 60) / bpm; // (beatsPerBar * 60) / BPM

                // Add Left Hand (Chords)
                if (currentChordVoicing.length > 0) {
                    allLeftHandNotes.push({
                        time: globalTime, // Start time of the chord
                        notes: currentChordVoicing, // Array of MIDI notes for the chord
                        duration: barDurationSeconds * 0.95, // Sustain chord for most of the bar
                        velocity: 0.5 + (sectionInfo.typicalEnergy * 0.2) // Velocity influenced by section's energy
                    });
                }

                // Add Right Hand (Melody) - more complex than short idea
                const notesPerBarMelody = Math.floor(2 + Math.random() * 3); // Generate 2, 3, or 4 melody notes per bar
                let melodyNoteTimeOffset = 0;
                for (let n = 0; n < notesPerBarMelody; n++) {
                    const melodyNoteDuration = barDurationSeconds / notesPerBarMelody;
                    let melodyNoteMidi;

                    // Melody note selection: 60% chance from current chord tones (octave higher), 40% from scale tones
                    if (Math.random() < 0.6 && currentChordVoicing.length > 0) {
                        melodyNoteMidi = getRandomElement(currentChordVoicing.map(note => note + 12)); // Pick from chord, transpose up one octave
                         // Ensure chosen note is within the typical melody range for the section
                        if (melodyNoteMidi < sectionMelodyScale[0] || melodyNoteMidi > sectionMelodyScale[sectionMelodyScale.length -1]) {
                           melodyNoteMidi = getRandomElement(sectionMelodyScale); // Fallback to scale note if out of range
                        }
                    } else {
                        melodyNoteMidi = getRandomElement(sectionMelodyScale); // Pick from section's scale
                    }

                    if (typeof melodyNoteMidi === 'number') { // Check if a valid note was selected
                        allRightHandNotes.push({
                            time: globalTime + melodyNoteTimeOffset, // Stagger notes within the bar
                            note: melodyNoteMidi,
                            duration: melodyNoteDuration * (0.7 + Math.random() * 0.25), // Vary articulation slightly
                            velocity: Math.min(1.0, 0.6 + (sectionInfo.typicalEnergy * 0.3) + (Math.random() * 0.2 - 0.1)) // Vary velocity, cap at 1.0
                        });
                    }
                    melodyNoteTimeOffset += melodyNoteDuration;
                }
                globalTime += barDurationSeconds; // Advance global time by one bar
            } // End of bar loop

            // After a bridge modulation, usually revert to the original key for subsequent sections.
            // More complex structures might stay in the new key or modulate further.
            if (sectionInfo.name === "Bridge" && sectionInfo.harmonicShift) {
                console.log(`--- End of Bridge. Key was ${sectionKey} ${sectionScaleType}. Reverting for next section if applicable. ---`);
                // For this implementation, the key/scale automatically reverts at the start of the next non-bridge section
                // because `sectionKey` and `sectionScaleType` are re-initialized from `rootNoteName` and `currentScaleType`
                // unless it's a bridge.
            }
        }); // End of songStructure.forEach section loop

        // Final song data package
        generatedSongData = {
            rightHandNotes: allRightHandNotes,
            leftHandNotes: allLeftHandNotes,
            keySignature: `${rootNoteName} ${currentScaleType.replace('_', ' ')}`, // Main key of the song
            totalDuration: globalTime,
            sectionMarkers: sectionMarkers,
            bpm: bpm // Store the BPM used for this generation
        };

        console.log("Full song generated successfully:", generatedSongData);
        // UI update is handled by the calling event listener via updateUIAfterGeneration()
        return generatedSongData;
    }
    // Note: The btnGenerateFullSong event listener already calls disable/enable controls and updateUIAfterGeneration.

    // --- Mood-Based Generation Logic ---

    /**
     * @const {Object.<string, object>} Configuration settings for different musical moods.
     * Each mood defines:
     * - `keys`: Array of suitable root notes.
     * - `scaleType`: The primary scale type (e.g., "MAJOR", "NATURAL_MINOR").
     * - `defaultBPM`: A typical tempo for the mood.
     * - `chordProgressions`: Array of common chord progression patterns (using Roman numerals).
     * - `leftHandOctave`, `rightHandOctave`: Suggested starting octaves for accompaniment and melody.
     * - `rhythmDensity` (0-1): Hint for how many notes to generate rhythmically. Higher is denser.
     * - `melodicLeapiness` (0-1): Hint for melodic contour. Higher means more leaps.
     */
    const MOOD_SETTINGS = {
        HAPPY: {
            keys: ["C", "G", "D", "A", "E", "F", "Bb"],
            scaleType: "MAJOR",
            defaultBPM: 120,
            chordProgressions: [ ["I", "IV", "V", "I"], ["I", "V", "vi", "IV"], ["I", "vi", "ii", "V"] ],
            leftHandOctave: 3, rightHandOctave: 4, rhythmDensity: 0.7, melodicLeapiness: 0.3
        },
        SAD: {
            keys: ["A", "E", "B", "F#", "C#", "D", "G"], // Relative minor keys
            scaleType: "NATURAL_MINOR",
            defaultBPM: 70,
            chordProgressions: [ ["i", "vi", "iv", "v"], ["i", "iv", "v", "i"], ["i", "III", "VII", "VI"] ],
            leftHandOctave: 2, rightHandOctave: 4, rhythmDensity: 0.4, melodicLeapiness: 0.2
        },
        EPIC: {
            keys: ["C", "G", "D", "F", "Bb", "A", "E"], // Can be major or minor, often minor
            scaleType: "HARMONIC_MINOR", // Harmonic minor for drama, or Major with powerful chords
            defaultBPM: 100,
            chordProgressions: [ ["i", "VI", "III", "VII"], ["i", "iv", "V", "i"], ["I", "V", "vi", "IV"] ],
            leftHandOctave: 2, rightHandOctave: 5, rhythmDensity: 0.8, melodicLeapiness: 0.6
        },
        CALM: {
            keys: ["C", "F", "G", "D", "Bb"],
            scaleType: "MAJOR", // Lydian can also be very calm/dreamy: TODO add Lydian
            defaultBPM: 60,
            chordProgressions: [ ["I", "IV", "I", "IV"], ["Imaj7", "IVmaj7"], ["ii7", "V7", "Imaj7"] ],
            leftHandOctave: 3, rightHandOctave: 4, rhythmDensity: 0.3, melodicLeapiness: 0.1
        },
        MYSTERIOUS: {
            keys: ["C", "F", "G", "D", "A"], // Often minor or modal
            scaleType: "DORIAN", // Dorian, Harmonic Minor, or even diminished/whole-tone fragments
            defaultBPM: 80,
            chordProgressions: [ ["i", "iv", "bII", "V"], ["i", "ii°", "V7", "i"], ["Im(maj7)", "iv7", "bVImaj7", "Vaug"] ],
            leftHandOctave: 3, rightHandOctave: 4, rhythmDensity: 0.5, melodicLeapiness: 0.4
        }
    };

    /**
     * Generates a short musical idea (typically 2-4 bars) based on the selected mood.
     * This function sets the BPM, key, and scale according to the mood's predefined settings,
     * then creates a simple chord progression and a corresponding melody.
     * The generated data is stored in `generatedSongData`.
     * @param {string} mood The selected mood (e.g., "HAPPY", "SAD"), corresponding to a key in `MOOD_SETTINGS`.
     * @returns {object|null} The generated song data object
     *          (including `rightHandNotes`, `leftHandNotes`, `keySignature`, `totalDuration`, `bpm`),
     *          or null if generation fails (e.g., invalid mood).
     */
    function generateShortIdea(mood) {
        const settings = MOOD_SETTINGS[mood.toUpperCase()]; // Ensure mood key is uppercase
        if (!settings) {
            console.error("generateShortIdea: Invalid mood provided - ", mood);
            alert(`Mood "${mood}" is not recognized. Please select a valid mood.`);
            return null;
        }

        const rootNoteName = getRandomElement(settings.keys);
        const scaleType = settings.scaleType;
        const ideaBPM = settings.defaultBPM; // Use mood's default BPM for short ideas

        // Update global BPM and UI to reflect the mood's default for this idea
        currentBPM = ideaBPM;
        Tone.Transport.bpm.value = currentBPM;
        bpmSlider.value = currentBPM;
        bpmValueSpan.textContent = currentBPM;

        const keySignatureText = `${rootNoteName} ${scaleType.replace('_', ' ')}`;
        console.log(`Generating short idea in ${keySignatureText} at ${currentBPM} BPM.`);

        // Get notes for melody and chord voicings based on the selected key, scale, and octave settings
        const melodyScaleNotes = getNotesInScale(rootNoteName, scaleType, settings.rightHandOctave, 2);
        const chordRootScaleNotes = getNotesInScale(rootNoteName, scaleType, settings.leftHandOctave, 1); // For chord roots

        const chosenProgressionSymbols = getRandomElement(settings.chordProgressions);
        if (!chosenProgressionSymbols) {
            console.error("generateShortIdea: No chord progressions found for mood - ", mood);
            return null; // Should not happen if MOOD_SETTINGS is correct
        }

        const numBars = chosenProgressionSymbols.length; // Typically 2 or 4 bars for an idea
        const beatsPerBar = 4; // Assume 4/4 time for simplicity

        let currentTimeMarker = 0; // Time marker in seconds for placing notes
        const generatedLeftHandNotes = [];
        const generatedRightHandNotes = [];

        const currentDiatonicSet = DIATONIC_CHORDS[scaleType] || DIATONIC_CHORDS.MAJOR; // Fallback

        // Generate notes for each chord in the progression
        for (let i = 0; i < chosenProgressionSymbols.length; i++) {
            const chordSymbol = chosenProgressionSymbols[i];

            // Determine chord root and structure (simplified parsing)
            const romanMatch = chordSymbol.match(/[IVXLCDM]+/i);
            const degreeRoman = romanMatch ? romanMatch[0].toUpperCase() : 'I';
            const degreeNum = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].indexOf(degreeRoman);
            const chordRootMidi = chordRootScaleNotes[degreeNum !== -1 ? degreeNum : 0 % chordRootScaleNotes.length];

            let chordStructure = currentDiatonicSet[chordSymbol] || // Prefer diatonic definition
                                 (chordSymbol.includes('°') ? CHORD_STRUCTURES.DIMINISHED_TRIAD :
                                  chordSymbol.includes('+') ? CHORD_STRUCTURES.AUGMENTED_TRIAD :
                                  chordSymbol.toLowerCase().includes('m') && !chordSymbol.includes('maj7') ? CHORD_STRUCTURES.MINOR_TRIAD :
                                  chordSymbol.includes('maj7') ? CHORD_STRUCTURES.MAJOR_SEVENTH :
                                  chordSymbol.includes('7') ? CHORD_STRUCTURES.DOMINANT_SEVENTH :
                                  CHORD_STRUCTURES.MAJOR_TRIAD); // Fallback

            const chordVoicing = getChordNotes(chordRootMidi, chordStructure, 0);
            const barDurationSecs = (beatsPerBar * 60) / currentBPM;

            // Add Left Hand (Chord)
            if (chordVoicing.length > 0) {
                generatedLeftHandNotes.push({
                    time: currentTimeMarker,
                    notes: chordVoicing,
                    duration: barDurationSecs * 0.9, // Slightly detached articulation
                    velocity: 0.6
                });
            }

            // Add Right Hand (Simple Melody) - 1 or 2 notes per bar for an idea
            const melodyNotesThisBar = Math.random() < settings.rhythmDensity ? 2 : 1;
            for (let j = 0; j < melodyNotesThisBar; j++) {
                let melodyNote;
                // 70% chance to pick a note from the current chord (octave higher), else from scale
                if (Math.random() < 0.7 && chordVoicing.length > 0) {
                    melodyNote = getRandomElement(chordVoicing.map(n => n + 12)); // Transpose chord tone up
                    // Ensure note is within typical melody range, fallback to scale note if not
                    if (!melodyNote || melodyNote < melodyScaleNotes[0] || melodyNote > melodyScaleNotes[melodyScaleNotes.length - 1]) {
                        melodyNote = getRandomElement(melodyScaleNotes);
                    }
                } else {
                    melodyNote = getRandomElement(melodyScaleNotes);
                }

                if (typeof melodyNote === 'number') { // Check if valid note was selected
                     generatedRightHandNotes.push({
                        time: currentTimeMarker + (j * barDurationSecs / melodyNotesThisBar),
                        note: melodyNote,
                        duration: (barDurationSecs / melodyNotesThisBar) * 0.85, // Slightly detached
                        velocity: 0.7 + Math.random() * 0.2 // Vary velocity slightly
                    });
                }
            }
            currentTimeMarker += barDurationSecs; // Advance time to the next bar
        }

        // Store the generated music data globally
        generatedSongData = {
            rightHandNotes: generatedRightHandNotes,
            leftHandNotes: generatedLeftHandNotes,
            keySignature: keySignatureText,
            totalDuration: currentTimeMarker, // Total duration in seconds
            bpm: currentBPM, // Include BPM in song data for reference
            // Short ideas don't have complex section markers like full songs
            sectionMarkers: [{ name: `${mood} Idea`, time: 0 }]
        };
        console.log("Short idea generated:", generatedSongData);
        return generatedSongData;
    }
    // Note: The btnGenerateMood event listener already calls disable/enable controls and updateUIAfterGeneration.

    console.log('Piano Muse initialized. UI and Music Engine ready.');
});
