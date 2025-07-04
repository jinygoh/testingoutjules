// app.js
/**
 * ChordFlow: A Modern Chord Progression Generator
 * Main application logic for generating, visualizing, and playing chord progressions.
 * Uses Tone.js for audio and music theory, Tonal.js for music theory utilities,
 * and midi-writer-js for MIDI export.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Global Constants & Variables ---

    /** @const {Array<string>} NOTE_NAMES - Array of note names for key selection. */
    const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    /**
     * @const {Object<string, string>} SCALES_MODES - Mapping of display names for scales/modes
     * to Tonal.js compatible scale type names.
     */
    const SCALES_MODES = {
        "Major (Ionian)": "major",
        "Natural Minor (Aeolian)": "minor", // Tonal.js also accepts 'aeolian'
        "Harmonic Minor": "harmonic minor",
        "Dorian": "dorian"
    };

    const DEFAULT_TEMPO = 120; // Default BPM
    const MIN_TEMPO = 60;      // Minimum BPM for tempo slider
    const MAX_TEMPO = 180;     // Maximum BPM for tempo slider

    // --- Application State Variables ---
    /** @type {Array<Object>} currentProgression - Stores the current 4-bar chord progression.
     * Each object: { name: string, notes: Array<string>, time: string, duration: string } */
    let currentProgression = [];
    /** @type {Tone.PolySynth} synth - Tone.js PolySynth instance for playing chords. */
    let synth;
    /** @type {Tone.Part} part - Tone.js Part instance for scheduling the progression. */
    let part;
    /** @type {boolean} isPlaying - Flag to track playback state. */
    let isPlaying = false;
    /** @type {string} currentKey - Currently selected root note. */
    let currentKey = NOTE_NAMES[0];
    /** @type {string} currentScale - Currently selected scale type (Tonal.js compatible name). */
    let currentScale = SCALES_MODES["Major (Ionian)"];
    /** @type {number} currentTempo - Currently selected tempo in BPM. */
    let currentTempo = DEFAULT_TEMPO;
    /** @type {boolean} loopEnabled - Flag for enabling/disabling loop playback. */
    let loopEnabled = true;

    // --- DOM Element References ---
    // Control Panel Elements
    const randomizeAllBtn = document.getElementById('randomize-all-btn');
    const keySelect = document.getElementById('key-select');
    const scaleSelect = document.getElementById('scale-select');
    const tempoSlider = document.getElementById('tempo-slider');
    const tempoValueSpan = document.getElementById('tempo-value');
    const generateBtn = document.getElementById('generate-btn');

    // Playback & Export Elements
    const playPauseBtn = document.getElementById('play-pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const loopCheckbox = document.getElementById('loop-checkbox');
    const exportMidiBtn = document.getElementById('export-midi-btn');
    const exportWavBtn = document.getElementById('export-wav-btn');

    // Chord Name Display Elements
    const chordNameSpans = [
        document.getElementById('chord-name-bar-1'),
        document.getElementById('chord-name-bar-2'),
        document.getElementById('chord-name-bar-3'),
        document.getElementById('chord-name-bar-4')
    ];

    // Canvas Elements and Contexts
    const pianoRollCanvas = document.getElementById('piano-roll-canvas');
    const sideKeyboardCanvas = document.getElementById('side-keyboard-canvas');
    /** @type {CanvasRenderingContext2D} pianoRollCtx - 2D rendering context for the piano roll. */
    let pianoRollCtx;
    /** @type {CanvasRenderingContext2D} sideKeyboardCtx - 2D rendering context for the side keyboard. */
    let sideKeyboardCtx;

    // --- Canvas Drawing Constants & Variables ---
    const OCTAVE_COUNT = 3; // Number of octaves to display on piano roll & side keyboard
    const LOWEST_NOTE_NAME = 'C3'; // Lowest note to display
    /** @type {string} HIGHEST_NOTE_NAME - Calculated highest note based on LOWEST_NOTE_NAME and OCTAVE_COUNT. */
    let HIGHEST_NOTE_NAME;
    /** @type {number} TOTAL_PITCHES_DISPLAYED - Total number of unique semitones displayed. */
    let TOTAL_PITCHES_DISPLAYED;

    // Dimensions calculated in setupCanvases() based on canvas size and pitch range
    /** @type {number} keyHeightPianoRoll - Visual height of one key/pitch lane. */
    let keyHeightPianoRoll;
    /** @type {number} barWidth - Visual width of one bar on the piano roll. */
    let barWidth;
    /** @type {number} beatWidth - Visual width of one beat on the piano roll. */
    let beatWidth;

    // State for visual feedback during playback and interaction
    /** @type {Object<string, boolean>} currentlyPlayingNotes - Tracks notes for highlighting (e.g., { 'C4': true }). */
    let currentlyPlayingNotes = {};
    /** @type {HTMLElement} tooltipElement - DOM element for the note hover tooltip. */
    let tooltipElement;
    /** @type {number} animationFrameId - ID for the requestAnimationFrame loop, used for cancelling. */
    let animationFrameId;


    // --- Initialization Functions ---
    /**
     * Main initialization function, called on DOMContentLoaded.
     * Sets up core components like Tone.js, dropdowns, event listeners.
     * Defers canvas setup and initial progression generation to `postInitSetup`.
     */
    function init() {
        pianoRollCtx = pianoRollCanvas.getContext('2d');
        sideKeyboardCtx = sideKeyboardCanvas.getContext('2d');
        console.log("ChordFlow: Initializing core components...");

        setupToneJS();
        populateDropdowns();
        setupEventListeners();

        updateTempoDisplay(DEFAULT_TEMPO);
        loopCheckbox.checked = loopEnabled; // Set initial state of loop checkbox

        console.log("ChordFlow: Core initialization complete. Canvas and initial content setup pending.");
    }

    /**
     * Performs setup tasks that depend on the DOM being fully loaded and styled,
     * such as canvas sizing and initial content generation.
     * Also sets up window resize handling for responsive canvas.
     */
    function postInitSetup() {
        console.log("ChordFlow: Starting post-init setup (canvases, initial progression)...");
        setupCanvases(); // Setup canvas sizes based on current viewport/styles
        randomizeAll();   // Generate an initial progression and draw it.

        // Add resize listener to adjust canvases if window size changes
        window.addEventListener('resize', () => {
            console.log("ChordFlow: Window resized, re-calculating canvas dimensions.");
            setupCanvases(); // Recalculate canvas dimensions
            drawAll();       // Redraw everything with new dimensions
        });
        console.log("ChordFlow: Post-init setup complete.");
    }

    /**
     * Initializes the Tone.js PolySynth instance used for audio playback.
     */
    function setupToneJS() {
        synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "fmsine" }, // A pleasant, clear synth sound
            envelope: {
                attack: 0.02, // Quick attack
                decay: 0.1,
                sustain: 0.3, // Moderate sustain for chord clarity
                release: 1    // Allow notes to ring out a bit
            },
            volume: -10 // Initial volume adjustment (in dB)
        }).toDestination(); // Connect synth to master output
        console.log("Tone.js PolySynth initialized.");
    }

    /**
     * Populates the Key and Scale/Mode dropdown menus with options.
     */
    function populateDropdowns() {
        NOTE_NAMES.forEach(note => {
            const option = document.createElement('option');
            option.value = note;
            option.textContent = note;
            keySelect.appendChild(option);
        });
        keySelect.value = currentKey;

        for (const displayName in SCALES_MODES) {
            const option = document.createElement('option');
            option.value = SCALES_MODES[displayName]; // Store Tonal.js compatible name
            option.textContent = displayName; // Show user-friendly name
            scaleSelect.appendChild(option);
        }
        scaleSelect.value = currentScale;
        console.log("Key and Scale dropdowns populated.");
    }

    /**
     * Sets up all necessary event listeners for UI controls (buttons, sliders, dropdowns).
     */
    function setupEventListeners() {
        randomizeAllBtn.addEventListener('click', randomizeAll);
        keySelect.addEventListener('change', (e) => currentKey = e.target.value);
        scaleSelect.addEventListener('change', (e) => currentScale = e.target.value);

        tempoSlider.addEventListener('input', (e) => {
            currentTempo = parseInt(e.target.value);
            updateTempoDisplay(currentTempo);
            Tone.Transport.bpm.value = currentTempo; // Instantly update Tone.js tempo
        });

        generateBtn.addEventListener('click', () => {
            if (isPlaying) stopPlayback(); // Stop if playing, before generating new
            generateProgressionAndPlay();
        });

        playPauseBtn.addEventListener('click', togglePlayback);
        stopBtn.addEventListener('click', stopPlayback);
        loopCheckbox.addEventListener('change', (e) => {
            loopEnabled = e.target.checked;
            if (part) part.loop = loopEnabled; // Update Tone.Part loop status
            Tone.Transport.loop = loopEnabled; // Update master transport loop status
        });

        exportMidiBtn.addEventListener('click', exportMIDI);
        exportWavBtn.addEventListener('click', exportWAV);

        console.log("UI Event listeners registered.");
    }

    // --- UI Update Functions ---
    /**
     * Updates the tempo value display (the number next to the slider).
     * @param {number} value - The current tempo value in BPM.
     */
    function updateTempoDisplay(value) {
        tempoValueSpan.textContent = value;
    }

    // --- Core Logic Functions ---
    /**
     * Randomizes Key, Scale, and Tempo, updates UI elements to reflect these changes,
     * and then generates and displays/schedules a new chord progression.
     */
    function randomizeAll() {
        console.log("Randomizing all parameters...");
        currentKey = NOTE_NAMES[Math.floor(Math.random() * NOTE_NAMES.length)];
        keySelect.value = currentKey;

        const scaleDisplayNames = Object.keys(SCALES_MODES);
        const randomScaleDisplayName = scaleDisplayNames[Math.floor(Math.random() * scaleDisplayNames.length)];
        currentScale = SCALES_MODES[randomScaleDisplayName];
        scaleSelect.value = currentScale;

        currentTempo = Math.floor(Math.random() * (MAX_TEMPO - MIN_TEMPO + 1)) + MIN_TEMPO;
        tempoSlider.value = currentTempo;
        updateTempoDisplay(currentTempo);
        Tone.Transport.bpm.value = currentTempo;

        console.log(`Randomized to: Key=${currentKey}, Scale=${currentScale}, Tempo=${currentTempo} BPM`);

        if (isPlaying) stopPlayback();
        generateProgressionAndPlay();
    }

    /**
     * Orchestrates the full process of generating a new chord progression:
     * 1. Calls `generateProgression()` for the music theory logic.
     * 2. Updates the displayed chord names.
     * 3. If playback was active, stops it.
     * 4. Schedules the new progression for audio playback using `scheduleProgressionAudio()`.
     * 5. Redraws all canvas elements using `drawAll()`.
     */
    function generateProgressionAndPlay() {
        console.log(`Generating new progression. Key: ${currentKey}, Scale: ${currentScale}, Tempo: ${currentTempo} BPM`);
        currentProgression = generateProgression(); // Core music theory logic
        updateChordNameDisplay(currentProgression);

        if (isPlaying || Tone.Transport.state === "started") {
            stopPlayback(); // Resets transport and visuals
        }
        scheduleProgressionAudio(currentProgression); // Prepare audio for the new progression
        drawAll(); // Update visuals for the new progression

        console.log("New progression generated, scheduled, and visuals updated.");
    }

    // --- Music Theory & Progression Generation ---
    /**
     * Retrieves an array of diatonic chord names for a given key and scale using Tonal.js.
     * Includes robust fallbacks if Tonal.js encounters issues or returns unexpected data.
     * @param {string} key - The root note of the scale (e.g., "C", "F#").
     * @param {string} scaleName - The Tonal.js compatible scale name (e.g., "major", "dorian").
     * @param {number} [octave=3] - The base octave for Tonal.js calculations (can affect specific chord voicings if not simplified later).
     * @returns {Array<string>} An array of 7 diatonic chord names (e.g., ["Cmaj", "Dm", "Em", ...]).
     */
    function getScaleChords(key, scaleName, octave = 3) {
        const scaleSignature = `${key}${octave} ${scaleName}`; // e.g., "C3 major"
        let diatonicChords = [];
        try {
            diatonicChords = Tonal.Scale.chords(scaleSignature);
        } catch (e) {
            console.error(`Tonal.Scale.chords failed for "${scaleSignature}":`, e);
            // Attempt fallback based on common scale names if direct lookup failed
            const simpleScaleName = scaleName.toLowerCase();
            if (simpleScaleName.includes("major") || simpleScaleName.includes("ionian")) {
                diatonicChords = Tonal.Scale.chords(`${key}${octave} major`);
            } else if (simpleScaleName.includes("minor") || simpleScaleName.includes("aeolian")) {
                diatonicChords = Tonal.Scale.chords(`${key}${octave} minor`);
            } else { // More generic fallback: get scale notes and try to detect triads
                 const scaleNotes = Tonal.Scale.get(scaleSignature).notes;
                 if (scaleNotes && scaleNotes.length >= 7) {
                    diatonicChords = Tonal.Scale.degrees(scaleSignature).map((degreeRoot, i) => {
                        const triadNotes = [scaleNotes[i % scaleNotes.length], scaleNotes[(i+2) % scaleNotes.length], scaleNotes[(i+4) % scaleNotes.length]];
                        return Tonal.Chord.detect(triadNotes)[0] || `${degreeRoot}M`; // Default to Major if detection fails
                    }).slice(0,7); // Ensure only 7 diatonic chords
                 }
            }
        }

        // Final fallback if diatonicChords array is still insufficient (e.g., less than 7 chords)
        if (!diatonicChords || diatonicChords.length < 7) {
            console.warn(`Tonal.Scale.chords provided insufficient chords for "${scaleSignature}". Using manual scale degree fallback.`);
            const root = Tonal.Note.simplify(key);
            const isMajScale = scaleName.toLowerCase().includes("major") || scaleName.toLowerCase().includes("ionian");
            const intervals = Tonal.Scale.get(isMajScale ? "major" : "minor").intervals; // Major or Natural Minor intervals

            diatonicChords = intervals.map(interval => {
                const chordRoot = Tonal.transpose(root, interval);
                if (isMajScale) { // Typical Major scale chord qualities
                    if (["1P", "4P", "5P"].includes(interval)) return `${chordRoot}maj`;
                    if (["2M", "3M", "6M"].includes(interval)) return `${chordRoot}min`;
                    if (["7M"].includes(interval)) return `${chordRoot}dim`;
                } else { // Typical Natural Minor scale chord qualities
                    if (["1P", "4P", "5P"].includes(interval)) return `${chordRoot}min`;
                    if (["2M"].includes(interval)) return `${chordRoot}dim`; // ii°
                    if (["3M", "6M", "7m"].includes(interval)) return `${chordRoot}maj`; // bIII, bVI, bVII
                }
                return `${chordRoot}maj`; // Broad fallback
            }).slice(0,7);
        }

        // Simplify chord names (e.g., "Cmaj7" to "Cmaj") for display consistency.
        // Tonal.Chord.get(chordName).aliases[0] often provides a simpler common name.
        return diatonicChords.map(name => {
            const chordInfo = Tonal.Chord.get(name); // Get full chord data
            return chordInfo.aliases[0] || name.replace(/M$/g, 'maj').replace(/m$/g, 'min'); // Use alias or simplify common patterns
        }).slice(0,7); // Ensure exactly 7 chords are returned
    }

    /**
     * Generates a 4-bar chord progression based on the current key, scale, and common patterns.
     * Uses Tonal.js for music theory calculations (getting chord notes, transposing).
     * Includes logic for adjusting chord qualities (e.g., V in harmonic minor).
     * @returns {Array<Object>} The generated progression array.
     */
    function generateProgression() {
        const diatonicChordsForScale = getScaleChords(currentKey, currentScale);
        const defaultChordOctave = "3"; // Base octave for notes in chords

        // Fallback if `getScaleChords` fails to provide enough chords
        if (!diatonicChordsForScale || diatonicChordsForScale.length < 4) {
            console.error("Insufficient diatonic chords for progression generation. Using basic I-IV-V-I fallback.");
            const rootNote = currentKey;
            const p4 = Tonal.transpose(rootNote, '4P');
            const p5 = Tonal.transpose(rootNote, '5P');
            const quality = (currentScale.toLowerCase().includes("minor")) ? "min" : "maj";
            const vQuality = (currentScale.toLowerCase().includes("harmonic") && currentScale.toLowerCase().includes("minor")) ? "maj" : quality;

            currentProgression = [
                { name: `${rootNote}${quality}`, notes: Tonal.Chord.get(`${rootNote}${quality}`).notes.map(n => Tonal.Note.simplify(n + defaultChordOctave)), time: "0:0:0", duration: "1m" },
                { name: `${p4}${quality}`, notes: Tonal.Chord.get(`${p4}${quality}`).notes.map(n => Tonal.Note.simplify(n + defaultChordOctave)), time: "1:0:0", duration: "1m" },
                { name: `${p5}${vQuality}`, notes: Tonal.Chord.get(`${p5}${vQuality}`).notes.map(n => Tonal.Note.simplify(n + defaultChordOctave)), time: "2:0:0", duration: "1m" },
                { name: `${rootNote}${quality}`, notes: Tonal.Chord.get(`${rootNote}${quality}`).notes.map(n => Tonal.Note.simplify(n + defaultChordOctave)), time: "3:0:0", duration: "1m" },
            ];
            // Ensure notes in fallback have valid octaves and are simplified
            currentProgression.forEach(c => {
                 c.notes = c.notes.map(n => Tonal.Note.pc(n) + defaultChordOctave);
                 if (!c.notes || c.notes.length === 0) { // Absolute fallback for notes
                    const base = Tonal.Note.pc(c.name);
                    c.notes = [base+defaultChordOctave, Tonal.transpose(base, "M3")+defaultChordOctave, Tonal.transpose(base, "P5")+defaultChordOctave];
                 }
            });
            return currentProgression;
        }

        const generatedProg = [];
        // Common diatonic chord progression patterns (0-indexed based on diatonicChordsForScale array)
        // I=0, ii=1, iii=2, IV=3, V=4, vi=5, vii°=6
        const patterns = [
            [0, 3, 4, 0], // I - IV - V - I
            [0, 4, 5, 3], // I - V - vi - IV
            [0, 5, 3, 4], // I - vi - IV - V
            [5, 3, 0, 4], // vi - IV - I - V
            [1, 4, 0, 0], // ii - V - I - I (Jazz cadence)
        ];
        let chosenPattern = patterns[Math.floor(Math.random() * patterns.length)];
        const isHarmonicMinor = currentScale.toLowerCase().includes("harmonic minor");

        for (let i = 0; i < 4; i++) { // Generate 4 chords
            let degreeIdx = chosenPattern[i];
            let chordName = diatonicChordsForScale[degreeIdx % diatonicChordsForScale.length]; // Base chord from scale

            // --- Adjust Chord Quality for Specific Musical Contexts ---
            // 1. V chord in minor scales (especially harmonic minor) often becomes Major or Dominant 7th.
            if (degreeIdx === 4 && (currentScale.toLowerCase().includes("minor") || isHarmonicMinor)) {
                const V_root = Tonal.Note.simplify(Tonal.transpose(currentKey, Tonal.Scale.get(currentScale).intervals[4]));
                chordName = isHarmonicMinor ? `${V_root}maj` : `${V_root}min`; // Major V in harmonic minor, minor v in natural minor
            }
            // 2. For ii-V-I, ensure ii is minor and V is major/dominant.
            if (JSON.stringify(chosenPattern) === JSON.stringify([1, 4, 0, 0])) { // If ii-V-I-I
                if (i === 0) { // Current chord is 'ii'
                    const ii_root = Tonal.Note.simplify(Tonal.transpose(currentKey, Tonal.Scale.get(currentScale).intervals[1]));
                    chordName = `${ii_root}min`;
                } else if (i === 1) { // Current chord is 'V'
                    const V_root = Tonal.Note.simplify(Tonal.transpose(currentKey, Tonal.Scale.get(currentScale).intervals[4]));
                    chordName = `${V_root}maj`; // Or V7: `${V_root}7`
                }
            }
            // --- End Adjustments ---

            let chordData = Tonal.Chord.get(chordName + defaultChordOctave);
            if (!chordData.notes || chordData.notes.length === 0) { // Fallback for getting chord notes
                const rootPc = Tonal.Note.pc(chordName); // Pitch class (e.g. "C" from "Cmaj")
                const qualityGuess = chordName.includes("min") ? "m" : (chordName.includes("dim") ? "dim" : "M");
                chordData = Tonal.Chord.get(`${rootPc}${qualityGuess}${defaultChordOctave}`);
                 if (!chordData.notes || chordData.notes.length === 0) { // Absolute fallback
                    chordData = { name: `${rootPc}${qualityGuess}`, symbol: `${rootPc}${qualityGuess}`, notes: [rootPc+defaultChordOctave, Tonal.transpose(rootPc,"M3")+defaultChordOctave, Tonal.transpose(rootPc,"P5")+defaultChordOctave] };
                 }
            }

            generatedProg.push({
                name: chordData.symbol || chordName, // Use symbol from Tonal.Chord (e.g., C, Dm)
                notes: chordData.notes.map(n => Tonal.Note.simplify(n)), // Ensure notes are simplified and have octave
                time: `${i}:0:0`, // Bar:Beat:Sixteenth format for Tone.js
                duration: "1m"    // Each chord lasts one measure
            });
        }
        currentProgression = generatedProg;
        console.log("Generated Progression:", currentProgression.map(c => c.name).join(" - "));
        return currentProgression;
    }

    /**
     * Updates the text content of the chord name display elements above the piano roll.
     * @param {Array<Object>} progression - The current chord progression.
     */
    function updateChordNameDisplay(progression) {
        progression.forEach((chord, index) => {
            if (chordNameSpans[index]) {
                chordNameSpans[index].textContent = chord.name || '-';
            }
        });
        // Clear remaining spans if progression is shorter than 4 (should not occur with current logic)
        for (let i = progression.length; i < 4; i++) {
            if (chordNameSpans[i]) chordNameSpans[i].textContent = '-';
        }
    }

    /**
     * The main animation loop using requestAnimationFrame.
     * Calls `drawAll()` to refresh canvas visuals (playhead, active notes on keyboard).
     * This loop runs when `isPlaying` is true or when playback is paused (`Tone.Transport.state === "started"`).
     */
    function animationLoop() {
        if (isPlaying || Tone.Transport.state === "started") {
            drawAll(); // Redraw the entire visual state
        }
        animationFrameId = requestAnimationFrame(animationLoop); // Request next frame
    }

    /**
     * Schedules the given chord progression for audio playback using `Tone.Part`.
     * Also sets up `Tone.Draw.schedule` events to update `currentlyPlayingNotes` for visual feedback on the side keyboard,
     * ensuring visual highlights are synchronized with audio events.
     * @param {Array<Object>} progression - The chord progression to schedule.
     */
    function scheduleProgressionAudio(progression) {
        if (part) { // Dispose of any existing Tone.Part to prevent overlapping audio
            part.dispose();
            part = null;
        }
        currentlyPlayingNotes = {}; // Reset visual highlights for the new progression

        const events = progression.map(chord => ({
            time: chord.time,
            notes: chord.notes,
            duration: chord.duration
        }));

        part = new Tone.Part((time, value) => { // Callback for each chord event in the part
            synth.triggerAttackRelease(value.notes, value.duration, time); // Play the chord

            // Use Tone.Draw.schedule to synchronize visual updates with audio events
            Tone.Draw.schedule(() => { // At the exact time the audio event occurs...
                value.notes.forEach(note => { // For each note in the current chord...
                    const simplifiedNote = Tonal.Note.pc(note) + Tonal.Note.octave(note); // Normalize (e.g., "C#4")
                    currentlyPlayingNotes[simplifiedNote] = true; // Mark as playing for side keyboard highlight
                });
            }, time);

            // Schedule removal of highlight slightly before the chord ends for smoother visual transition
            const releaseTime = time + Tone.Time(value.duration).toSeconds() * 0.95; // 95% of chord duration
            Tone.Draw.schedule(() => {
                 value.notes.forEach(note => {
                    const simplifiedNote = Tonal.Note.pc(note) + Tonal.Note.octave(note);
                    delete currentlyPlayingNotes[simplifiedNote]; // Remove from playing notes
                });
            }, releaseTime);
        }, events);

        // Configure looping for the part and the main Tone.Transport
        part.loop = loopEnabled;
        part.loopEnd = "4m"; // Progression is 4 bars long
        Tone.Transport.loop = loopEnabled;
        Tone.Transport.loopStart = 0;
        Tone.Transport.loopEnd = "4m";

        part.progressionData = progression; // Tag part with its data for later checks
        console.log("Progression scheduled for audio playback with synchronized visual cues.");
    }

    /**
     * Toggles audio playback (Play/Pause). Manages Tone.Transport state and the visual animation loop.
     */
    function togglePlayback() {
        if (!currentProgression || currentProgression.length === 0) {
            console.warn("No progression available to play.");
            // alert("Please generate a progression first!"); // Optional user feedback
            return;
        }

        if (Tone.Transport.state === "started") { // If playing, then pause
            Tone.Transport.pause();
            playPauseBtn.textContent = "Play";
            isPlaying = false;
            // Animation loop continues on pause to show current playhead and any held notes.
            console.log("Playback paused. Visual animation loop continues.");
        } else { // If paused or stopped, then start/resume playback
            Tone.start().then(() => { // Tone.start() is crucial: ensures AudioContext is running.
                // If part doesn't exist or progression changed, reschedule audio.
                if (!part || part.progressionData !== currentProgression) {
                    scheduleProgressionAudio(currentProgression);
                }
                Tone.Transport.start();
                playPauseBtn.textContent = "Pause";
                isPlaying = true;

                if (animationFrameId) cancelAnimationFrame(animationFrameId); // Clear any previous animation loop
                animationFrameId = requestAnimationFrame(animationLoop); // Start new animation loop
                console.log("Playback started/resumed. Visual animation loop initiated.");
            }).catch(e => console.error("Tone.start() failed. User interaction might be required to enable audio.", e));
        }
    }

    /**
     * Stops audio playback, resets Tone.Transport position to the beginning,
     * stops the visual animation loop, and clears visual highlights.
     */
    function stopPlayback() {
        Tone.Transport.stop();
        Tone.Transport.position = 0; // Reset to start

        playPauseBtn.textContent = "Play";
        isPlaying = false;
        currentlyPlayingNotes = {}; // Clear visual highlights

        if (animationFrameId) { // Stop the animation loop
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        drawAll(); // Redraw to show playhead at start and no active notes
        console.log("Playback stopped. Transport reset. Animation loop terminated. Visuals refreshed.");
    }

    // --- Export Functions ---
    /**
     * Exports the current chord progression as a MIDI file using midi-writer-js.
     */
    function exportMIDI() {
        if (!currentProgression || currentProgression.length === 0) {
            alert("Please generate a progression first to export as MIDI.");
            return;
        }
        console.log("Exporting MIDI file...");

        const track = new MidiWriter.Track();
        track.setTempo(currentTempo);

        // Our "1m" (one measure) duration translates to a whole note ('1') in midi-writer-js for 4/4 time.
        const midiNoteDuration = '1';

        currentProgression.forEach((chord) => {
            const notesForEvent = chord.notes.map(n => Tonal.Note.simplify(n)); // e.g., "C4", "Eb5"
            track.addEvent(new MidiWriter.NoteEvent({
                pitch: notesForEvent,
                duration: midiNoteDuration
            }));
        });

        const writer = new MidiWriter.Writer([track]);
        const blob = new Blob([writer.buildFile()], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Sanitize scale name for filename (replace spaces with underscores)
        const safeScaleName = currentScale.replace(/\s+/g, '_');
        a.download = `ChordFlow_${currentKey.replace("#","sharp")}_${safeScaleName}_${currentTempo}bpm.mid`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("MIDI file generated and download triggered.");
    }

    /**
     * Exports the current chord progression as a WAV audio file.
     * Uses Tone.Offline for rendering and a helper function to convert AudioBuffer to WAV.
     */
    async function exportWAV() {
        if (!currentProgression || currentProgression.length === 0) {
            alert("Please generate a progression first to export as WAV.");
            return;
        }
        if (Tone.context.state !== "running") await Tone.start(); // Ensure AudioContext is active

        console.log("Exporting WAV file... This may take a moment.");
        exportWavBtn.textContent = "Rendering...";
        exportWavBtn.disabled = true;

        try {
            const durationSeconds = Tone.Time("4m").toSeconds(); // Duration of one 4-bar loop

            const buffer = await Tone.Offline(async (offlineTransport) => {
                const offlineSynth = new Tone.PolySynth(Tone.Synth, { // Use same synth settings
                    oscillator: { type: "fmsine" },
                    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
                    volume: -10
                }).toDestination();

                const offlineEvents = currentProgression.map(c => ({ time: c.time, notes: c.notes, duration: c.duration }));
                new Tone.Part((time, val) => offlineSynth.triggerAttackRelease(val.notes, val.duration, time), offlineEvents).start(0);

                offlineTransport.bpm.value = currentTempo;
                offlineTransport.start();
            }, durationSeconds);

            const wavBlob = audioBufferToWAV(buffer); // Convert buffer to WAV
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            const safeScaleName = currentScale.replace(/\s+/g, '_');
            a.download = `ChordFlow_${currentKey.replace("#","sharp")}_${safeScaleName}_${currentTempo}bpm.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log("WAV file generated and download triggered.");

        } catch (error) {
            console.error("Error during WAV export:", error);
            alert("An error occurred during WAV export. See console for details.");
        } finally {
            exportWavBtn.textContent = "Export WAV"; // Restore button state
            exportWavBtn.disabled = false;
        }
    }

    /**
     * Helper function to convert a Web Audio API AudioBuffer to a WAV file Blob.
     * Standard implementation found in many online examples.
     * @param {AudioBuffer} buffer - The AudioBuffer to convert.
     * @returns {Blob} A Blob representing the WAV file.
     */
    function audioBufferToWAV(buffer) {
        let numOfChan = buffer.numberOfChannels,
            length = buffer.length * numOfChan * 2 + 44, // Total length: (samples * channels * bytes/sample) + header
            arrBuffer = new ArrayBuffer(length),
            view = new DataView(arrBuffer),
            channels = [],
            i, sample, offset = 0, pos = 0;

        function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
        function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

        // WAV Header
        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // File length - 8
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // PCM chunk size = 16
        setUint16(1); // AudioFormat = 1 (PCM)
        setUint16(numOfChan); // Number of channels
        setUint32(buffer.sampleRate); // Sample rate
        setUint32(buffer.sampleRate * numOfChan * 2); // Byte rate = SampleRate * NumChannels * BitsPerSample/8 (2 bytes for 16-bit)
        setUint16(numOfChan * 2); // Block align = NumChannels * BitsPerSample/8
        setUint16(16); // Bits per sample
        setUint32(0x61746164); // "data" chunk
        setUint32(length - pos - 4); // Data chunk size = Total length - current header position - 4 bytes for this field itself
                                     // More robust: buffer.length * numOfChan * 2

        // Write PCM data
        for (i = 0; i < buffer.numberOfChannels; i++)
            channels.push(buffer.getChannelData(i));

        // Interleave channels and convert to 16-bit PCM
        // pos is now used as frame counter, offset for byte position in DataView
        pos = 0;
        while (pos < buffer.length) { // Iterate over sample frames
            for (i = 0; i < numOfChan; i++) { // Iterate over channels
                sample = Math.max(-1, Math.min(1, channels[i][pos])); // Clamp to [-1, 1]
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF; // Scale to 16-bit integer range
                view.setInt16(offset, Math.round(sample), true); // Write as 16-bit signed integer (little-endian)
                offset += 2;
            }
            pos++; // Next sample frame
        }
        return new Blob([arrBuffer], { type: "audio/wav" });
    }

    // --- Canvas Drawing Functions ---
    /**
     * Sets up canvas dimensions, calculates drawing parameters (key heights, bar widths),
     * and initializes the note hover tooltip. Called on initial load and window resize.
     */
    function setupCanvases() {
        const lowestMidi = Tonal.Note.midi(LOWEST_NOTE_NAME);
        if (lowestMidi === undefined) {
            console.error("Invalid LOWEST_NOTE_NAME for canvas setup:", LOWEST_NOTE_NAME); return;
        }
        TOTAL_PITCHES_DISPLAYED = OCTAVE_COUNT * 12;
        HIGHEST_NOTE_NAME = Tonal.Note.fromMidi(lowestMidi + TOTAL_PITCHES_DISPLAYED - 1);

        const prContainer = pianoRollCanvas.parentElement;
        let prWidth = prContainer.clientWidth - (parseInt(getComputedStyle(prContainer).paddingLeft) || 0) - (parseInt(getComputedStyle(prContainer).paddingRight) || 0);
        pianoRollCanvas.width = Math.max(prWidth, 300);
        pianoRollCanvas.height = 300;

        const skContainer = sideKeyboardCanvas.parentElement;
        let skWidth = skContainer.clientWidth - (parseInt(getComputedStyle(skContainer).paddingLeft) || 0) - (parseInt(getComputedStyle(skContainer).paddingRight) || 0);
        sideKeyboardCanvas.width = Math.max(skWidth, 50);
        sideKeyboardCanvas.height = pianoRollCanvas.height;

        keyHeightPianoRoll = pianoRollCanvas.height / TOTAL_PITCHES_DISPLAYED;
        barWidth = pianoRollCanvas.width / 4;
        beatWidth = barWidth / 4;

        if (!tooltipElement) {
            tooltipElement = document.createElement('div');
            tooltipElement.className = 'tooltip';
            document.body.appendChild(tooltipElement);
            pianoRollCanvas.addEventListener('mousemove', handlePianoRollHover);
            pianoRollCanvas.addEventListener('mouseout', () => { if (tooltipElement) tooltipElement.style.opacity = '0'; });
        }
        console.log(`Canvases setup/resized. Piano Roll: ${pianoRollCanvas.width}x${pianoRollCanvas.height}. Displaying ${TOTAL_PITCHES_DISPLAYED} pitches from ${LOWEST_NOTE_NAME} to ${HIGHEST_NOTE_NAME}.`);
    }

    /**
     * Main drawing coordinator. Clears canvases and calls specific drawing functions
     * for the side keyboard, piano roll grid, notes, and playhead.
     */
    function drawAll() {
        if (!pianoRollCtx || !sideKeyboardCtx) { console.warn("Canvas contexts not ready for drawing."); return; }
        clearCanvases();
        drawSideKeyboard();
        drawPianoRollGrid();
        if (currentProgression && currentProgression.length > 0) {
            drawNotesOnPianoRoll(currentProgression);
        }
        drawPlayhead(); // Draw playhead last so it's on top
    }

    /** Clears both piano roll and side keyboard canvases. */
    function clearCanvases() {
        pianoRollCtx.clearRect(0, 0, pianoRollCanvas.width, pianoRollCanvas.height);
        sideKeyboardCtx.clearRect(0, 0, sideKeyboardCanvas.width, sideKeyboardCanvas.height);
    }

    /**
     * Draws the interactive side piano keyboard, highlighting currently playing notes and labeling 'C' notes.
     */
    function drawSideKeyboard() {
        const whiteKeyCol = getComputedStyle(document.documentElement).getPropertyValue('--white-key-color').trim();
        const blackKeyCol = getComputedStyle(document.documentElement).getPropertyValue('--black-key-color').trim();
        const activeCol = getComputedStyle(document.documentElement).getPropertyValue('--key-active-color').trim();
        const borderCol = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();

        for (let i = 0; i < TOTAL_PITCHES_DISPLAYED; i++) {
            const currentMidi = Tonal.Note.midi(HIGHEST_NOTE_NAME) - i; // Draw from top (highest pitch) down
            const note = Tonal.Note.get(currentMidi); // Use Tonal.Note.get for more info
            const y = i * keyHeightPianoRoll;
            const isBlack = note.acc !== ""; // Check for accidentals
            const simpleName = note.pc + note.oct; // e.g., "C#4"

            sideKeyboardCtx.fillStyle = isBlack ? blackKeyCol : whiteKeyCol;
            if (currentlyPlayingNotes[simpleName]) sideKeyboardCtx.fillStyle = activeCol;

            const keyW = isBlack ? sideKeyboardCanvas.width * 0.65 : sideKeyboardCanvas.width;
            const keyX = isBlack ? sideKeyboardCanvas.width * (1 - 0.65) : 0;

            sideKeyboardCtx.fillRect(keyX, y, keyW, keyHeightPianoRoll);
            sideKeyboardCtx.strokeStyle = borderCol;
            sideKeyboardCtx.strokeRect(keyX, y, keyW, keyHeightPianoRoll);

            if (note.letter === 'C') { // Label 'C' notes
                sideKeyboardCtx.fillStyle = isBlack ? whiteKeyCol : blackKeyCol; // Contrast text color
                sideKeyboardCtx.font = `${Math.max(8, keyHeightPianoRoll * 0.5)}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-family')}`;
                sideKeyboardCtx.textAlign = "left";
                sideKeyboardCtx.fillText(simpleName, 3, y + keyHeightPianoRoll * 0.7);
            }
        }
    }

    /**
     * Draws grid lines (bars and beats) on the piano roll canvas.
     */
    function drawPianoRollGrid() {
        const gridCol = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
        const beatCol = "#444"; // Lighter color for beat lines
        pianoRollCtx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) { // 5 lines for 4 bars
            const x = i * barWidth;
            pianoRollCtx.strokeStyle = gridCol;
            pianoRollCtx.beginPath(); pianoRollCtx.moveTo(x, 0); pianoRollCtx.lineTo(x, pianoRollCanvas.height); pianoRollCtx.stroke();
            if (i < 4) { // Beat lines within bars
                for (let j = 1; j < 4; j++) {
                    const bx = x + j * beatWidth;
                    pianoRollCtx.strokeStyle = beatCol;
                    pianoRollCtx.beginPath(); pianoRollCtx.moveTo(bx, 0); pianoRollCtx.lineTo(bx, pianoRollCanvas.height); pianoRollCtx.stroke();
                }
            }
        }
    }

    /**
     * Calculates the Y-coordinate on the canvas for a given musical note name (with octave).
     * @param {string} noteNameWithOctave - e.g., "C4", "F#3".
     * @returns {number} The Y-coordinate on the canvas, or -1 if the note is invalid/out of display range.
     */
    function getNoteYPosition(noteNameWithOctave) {
        const noteMidi = Tonal.Note.midi(noteNameWithOctave);
        if (noteMidi === undefined) return -1;
        const highestMidi = Tonal.Note.midi(HIGHEST_NOTE_NAME);
        const pitchIdxFromTop = highestMidi - noteMidi;
        if (pitchIdxFromTop < 0 || pitchIdxFromTop >= TOTAL_PITCHES_DISPLAYED) return -1;
        return pitchIdxFromTop * keyHeightPianoRoll;
    }

    /**
     * Draws the notes of the current chord progression onto the piano roll.
     * @param {Array<Object>} progression - The current chord progression data.
     */
    function drawNotesOnPianoRoll(progression) {
        const noteCol = getComputedStyle(document.documentElement).getPropertyValue('--primary-accent-color').trim();
        pianoRollCtx.fillStyle = noteCol;

        progression.forEach((chord, barIdx) => {
            const x = barIdx * barWidth;
            const noteW = barWidth; // Assuming each chord fills one bar for drawing width

            chord.notes.forEach(noteName => {
                const y = getNoteYPosition(noteName);
                if (y === -1) return; // Skip if note out of range
                pianoRollCtx.fillRect(x, y, noteW - 1, keyHeightPianoRoll - 1); // -1 for slight gap
            });
        });
    }

    /**
     * Draws the playhead (current playback position indicator) on the piano roll.
     */
    function drawPlayhead() {
        if (Tone.Transport.state !== "started" && Tone.Transport.seconds === 0 && !isPlaying) return;

        const loopDurSec = Tone.Time(Tone.Transport.loopEnd).toSeconds();
        if (loopDurSec === 0) return;

        const currentTimeSec = Tone.Transport.seconds % loopDurSec;
        const progress = currentTimeSec / loopDurSec;
        const playheadX = progress * pianoRollCanvas.width;

        pianoRollCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-accent-color').trim();
        pianoRollCtx.lineWidth = 2;
        pianoRollCtx.beginPath(); pianoRollCtx.moveTo(playheadX, 0); pianoRollCtx.lineTo(playheadX, pianoRollCanvas.height); pianoRollCtx.stroke();
    }

    /**
     * Handles mouse hover events on the piano roll to display a tooltip with the note name.
     * @param {MouseEvent} event - The mousemove event object.
     */
    function handlePianoRollHover(event) {
        if (!currentProgression || !tooltipElement) return;
        const rect = pianoRollCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        let hoveredNote = null;

        const barIdx = Math.floor(x / barWidth);
        if (barIdx < 0 || barIdx >= currentProgression.length) { tooltipElement.style.opacity = '0'; return; }

        const chord = currentProgression[barIdx];
        if (!chord || !chord.notes) { tooltipElement.style.opacity = '0'; return; }

        for (const noteName of chord.notes) {
            const noteY = getNoteYPosition(noteName);
            if (noteY === -1) continue;
            const noteXStart = barIdx * barWidth;
            const noteVisualW = barWidth; // Assuming full bar width for hover

            if (y >= noteY && y <= noteY + keyHeightPianoRoll && x >= noteXStart && x <= noteXStart + noteVisualW) {
                hoveredNote = noteName; break;
            }
        }

        if (hoveredNote) {
            tooltipElement.textContent = hoveredNote;
            tooltipElement.style.left = `${event.pageX + 15}px`;
            tooltipElement.style.top = `${event.pageY + 15}px`;
            tooltipElement.style.opacity = '1';
        } else {
            tooltipElement.style.opacity = '0';
        }
    }

    // --- Application Start ---
    // init() is the first function called when the DOM is ready.
    // postInitSetup() then handles canvas setup and initial content generation.
    init();
    postInitSetup();
});
