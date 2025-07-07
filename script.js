document.addEventListener('DOMContentLoaded', async () => { // Added async for Tone.start()
    // DOM Elements
    const moodSelector = document.getElementById('mood-selector');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const tempoSlider = document.getElementById('tempo-slider');
    const tempoDisplay = document.getElementById('tempo-display');
    const recordBtn = document.getElementById('record-btn');
    const downloadMidiBtn = document.getElementById('download-midi-btn');
    const downloadWavBtn = document.getElementById('download-wav-btn');
    const visualizerContainer = document.querySelector('.visualizer-container');
    const pianoKeyboardContainer = document.querySelector('.piano-keyboard');

    // --- Piano Keyboard Generation ---
    const TOTAL_KEYS = 61; // 5 Octaves, C2 to C7
    const MIDI_NOTE_START = 36; // C2 MIDI note number
    const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const pianoKeys = []; // To store references to key elements for highlighting

    function getNoteDetails(midiNote) {
        const octave = Math.floor(midiNote / 12) - 1;
        const noteIndex = midiNote % 12;
        const noteName = NOTE_NAMES[noteIndex];
        const isBlackKey = noteName.includes("#");
        return { midiNote, octave, noteName, isBlackKey };
    }

    function createPianoKeyboard() {
        pianoKeyboardContainer.innerHTML = ''; // Clear existing (if any)
        const whiteKeyWidthPercent = 100 / 36; // 36 white keys for 61 total keys (C2-C7)

        for (let i = 0; i < TOTAL_KEYS; i++) {
            const midiNote = MIDI_NOTE_START + i;
            const details = getNoteDetails(midiNote);

            const keyElement = document.createElement('div');
            keyElement.classList.add('piano-key');
            keyElement.dataset.midiNote = midiNote;
            keyElement.dataset.noteName = details.noteName;

            if (details.isBlackKey) {
                keyElement.classList.add('black');
                // Precise positioning for black keys relative to the keyboard container
                // Each white key is roughly 2.77% width (100/36)
                // Black keys are narrower and positioned over the cracks
                const previousWhiteKeyIndex = getWhiteKeyIndex(midiNote -1);
                const leftOffset = (previousWhiteKeyIndex * whiteKeyWidthPercent) + (whiteKeyWidthPercent * 0.65);
                keyElement.style.left = `${leftOffset}%`;
                keyElement.style.width = `${whiteKeyWidthPercent * 0.6}%`; // Black keys are narrower
                keyElement.style.height = '60%';
                keyElement.style.position = 'absolute'; // Absolute position
                keyElement.style.zIndex = '2';


            } else {
                keyElement.classList.add('white');
                const whiteKeyIndex = getWhiteKeyIndex(midiNote);
                keyElement.style.left = `${whiteKeyIndex * whiteKeyWidthPercent}%`;
                keyElement.style.width = `${whiteKeyWidthPercent}%`;
                keyElement.style.height = '100%';
                keyElement.style.position = 'absolute'; // Absolute position
                keyElement.style.zIndex = '1';
            }
            pianoKeyboardContainer.appendChild(keyElement);
            pianoKeys.push(keyElement);
        }
    }

    // Helper to find the index of a white key (0-35)
    function getWhiteKeyIndex(midiNote) {
        let whiteKeyCount = 0;
        for(let k=MIDI_NOTE_START; k <= midiNote; k++) {
            if (!getNoteDetails(k).isBlackKey) {
                if (k === midiNote) return whiteKeyCount;
                whiteKeyCount++;
            }
        }
        return whiteKeyCount; // Should be found in loop
    }


    // --- UI Event Listeners ---
    playPauseBtn.addEventListener('click', () => {
        // Placeholder for Tone.js start/stop
        if (Tone.context.state !== 'running') {
            Tone.start(); // Start audio context on user gesture
        }
        // Toggle play/pause state
        if (playPauseBtn.textContent === 'Play') {
            playPauseBtn.textContent = 'Pause';
            // Start music generation and playback (to be implemented)
            console.log("Playback started (placeholder)");
        } else {
            playPauseBtn.textContent = 'Play';
            // Pause music generation and playback (to be implemented)
            console.log("Playback paused (placeholder)");
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        const volumeValue = parseFloat(e.target.value);
        // Set master volume in Tone.js (to be implemented)
        console.log(`Volume set to: ${volumeValue}`);
        if (Tone.Destination) { // Check if Tone is initialized
            Tone.Destination.volume.value = Tone.gainToDb(volumeValue);
        }
    });

    tempoSlider.addEventListener('input', (e) => {
        const tempo = parseInt(e.target.value);
        tempoDisplay.textContent = `${tempo} BPM`;
        // Set tempo in Tone.js (to be implemented)
        console.log(`Tempo set to: ${tempo} BPM`);
        if (Tone.Transport) { // Check if Tone is initialized
             Tone.Transport.bpm.value = tempo;
        }
    });
    // Initialize tempo display
    tempoDisplay.textContent = `${tempoSlider.value} BPM`;


    recordBtn.addEventListener('click', () => {
        if (recordBtn.classList.contains('recording')) {
            recordBtn.classList.remove('recording');
            recordBtn.textContent = 'Record';
            downloadMidiBtn.disabled = false;
            downloadWavBtn.disabled = false;
            // Stop recording (to be implemented)
            console.log("Recording stopped");
        } else {
            recordBtn.classList.add('recording');
            recordBtn.textContent = 'Stop';
            downloadMidiBtn.disabled = true;
            downloadWavBtn.disabled = true;
            // Start recording (to be implemented)
            console.log("Recording started");
        }
    });

    downloadMidiBtn.addEventListener('click', () => {
        // MIDI download logic (to be implemented)
        console.log("Download MIDI clicked");
    });

    downloadWavBtn.addEventListener('click', () => {
        // WAV download logic (to be implemented)
        console.log("Download WAV clicked");
    });

    moodSelector.addEventListener('change', (e) => {
        const selectedMood = e.target.value;
        // Update music generation parameters based on mood (to be implemented)
        console.log(`Mood changed to: ${selectedMood}`);
    });

    // --- Piano Key Highlighting ---
    function highlightKey(midiNote, durationMs = 300) {
        const keyElement = pianoKeys.find(key => parseInt(key.dataset.midiNote) === midiNote);
        if (keyElement) {
            keyElement.classList.add('highlighted');
            setTimeout(() => {
                keyElement.classList.remove('highlighted');
            }, durationMs);
        }
    }

    // --- MIDI Note Visualization (Placeholder) ---
    const PITCH_CLASS_COLORS = [
        'pitch-c', 'pitch-csharp', 'pitch-d', 'pitch-dsharp', 'pitch-e', 'pitch-f',
        'pitch-fsharp', 'pitch-g', 'pitch-gsharp', 'pitch-a', 'pitch-asharp', 'pitch-b'
    ];

    function visualizeNote(midiNote, durationSeconds) {
        const keyElement = pianoKeys.find(key => parseInt(key.dataset.midiNote) === midiNote);
        if (!keyElement) return;

        const noteParticle = document.createElement('div');
        noteParticle.classList.add('midi-note-particle');

        const noteDetails = getNoteDetails(midiNote);
        const pitchClass = NOTE_NAMES.indexOf(noteDetails.noteName.replace(/\d+/, '')); // Get C, C#, D etc.
        if(pitchClass !== -1) {
            noteParticle.classList.add(PITCH_CLASS_COLORS[pitchClass % 12]);
        }


        // Set particle width and initial position based on the key
        const keyRect = keyElement.getBoundingClientRect();
        const visualizerRect = visualizerContainer.getBoundingClientRect();

        noteParticle.style.width = `${keyRect.width}px`;
        noteParticle.style.left = `${keyRect.left - visualizerRect.left}px`;

        // Height based on duration (e.g., 50px per second)
        const particleHeight = Math.max(20, durationSeconds * 100); // Min height 20px, 100px per second
        noteParticle.style.height = `${particleHeight}px`;

        // Position it at the bottom of the visualizer, aligned with the key
        noteParticle.style.bottom = `0px`;

        visualizerContainer.appendChild(noteParticle);

        // Animate upwards
        // The animation speed should be independent of note duration for consistent scroll
        const visualizerHeight = visualizerContainer.clientHeight;
        const travelDistance = visualizerHeight + particleHeight; // Travel full height + its own height
        const animationDuration = 5; // seconds to cross the screen

        noteParticle.animate([
            { transform: `translateY(0px)` },
            { transform: `translateY(-${travelDistance}px)` }
        ], {
            duration: animationDuration * 1000,
            easing: 'linear'
        });

        // Remove particle after it has finished its animation + note duration
        setTimeout(() => {
            if (noteParticle.parentElement) {
                visualizerContainer.removeChild(noteParticle);
            }
        }, animationDuration * 1000); // Remove after animation finishes
    }

    // --- Tone.js Setup ---
    let leftHandSynth, rightHandSynth;
    let leftPanner, rightPanner;
    let reverb, compressor, limiter;
    let musicPlaying = false;

    async function setupAudio() {
        // Synths
        leftHandSynth = new Tone.Synth({
            oscillator: { type: 'triangle8' }, // A softer tone for harmony
            envelope: {
                attack: 0.02,
                decay: 0.1,
                sustain: 0.3,
                release: 0.5
            },
            volume: -8 // Slightly lower volume for left hand by default
        }).toDestination(); // Placeholder, will connect to panner

        rightHandSynth = new Tone.Synth({
            oscillator: { type: 'sine' }, // Clear tone for melody
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.4,
                release: 0.3
            },
            volume: -5 // Slightly higher volume for right hand
        }).toDestination(); // Placeholder, will connect to panner

        // Panners
        leftPanner = new Tone.Panner(-0.3).toDestination();
        rightPanner = new Tone.Panner(0.3).toDestination();

        // Effects Chain on Master Output (Tone.Destination)
        reverb = new Tone.Reverb({
            decay: 1.5, // seconds
            wet: 0.2
        }).toDestination();

        compressor = new Tone.Compressor({
            threshold: -12, // dB
            ratio: 3, // 3:1
            attack: 0.01, // seconds
            release: 0.1 // seconds
        }).toDestination();

        limiter = new Tone.Limiter(-0.1).toDestination(); // Prevent clipping, -0.1dB ceiling

        // Connect the audio graph
        // Synths -> Panners
        leftHandSynth.disconnect();
        leftHandSynth.connect(leftPanner);
        rightHandSynth.disconnect();
        rightHandSynth.connect(rightPanner);

        // Panners -> Effects Chain -> Master Output (Tone.Destination)
        // Master output is Tone.Destination by default for effects
        // We need to chain them: Panners -> Reverb -> Compressor -> Limiter -> Tone.Destination

        // Disconnect panners from direct destination
        leftPanner.disconnect(Tone.Destination);
        rightPanner.disconnect(Tone.Destination);

        // Chain: Panners -> Reverb
        leftPanner.connect(reverb);
        rightPanner.connect(reverb);

        // Reverb -> Compressor
        reverb.disconnect(Tone.Destination);
        reverb.connect(compressor);

        // Compressor -> Limiter
        compressor.disconnect(Tone.Destination);
        compressor.connect(limiter);

        // Limiter is already connected to Tone.Destination by its constructor if no argument is passed.
        // If it was .toDestination(), it's fine. If it was new Tone.Limiter().chain(reverb, compressor, Tone.Destination)
        // then we need to make sure the final connection is to Tone.Destination.
        // Since Limiter(-0.1) creates it and .toDestination() connects it, it's on the master chain.

        // Set initial volume from slider
        Tone.Destination.volume.value = Tone.gainToDb(parseFloat(volumeSlider.value));
        // Set initial tempo from slider
        Tone.Transport.bpm.value = parseInt(tempoSlider.value);

        console.log("Tone.js audio pipeline configured.");
    }


    // --- UI Event Listeners Update (for Tone.js integration) ---
    playPauseBtn.addEventListener('click', async () => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
            console.log("AudioContext started!");
            // It's good practice to set up or re-confirm audio components after Tone.start()
            // if they weren't created in a user gesture context.
            // However, our setupAudio is called on DOMContentLoaded, which should be fine.
        }

        if (!musicPlaying) {
            playPauseBtn.textContent = 'Pause';
            Tone.Transport.start();
            musicPlaying = true;
            // Start music generation (to be implemented in Part 3)
            console.log("Tone.Transport started");
        } else {
            playPauseBtn.textContent = 'Play';
            Tone.Transport.pause(); // Use pause to allow resume from the same point
            musicPlaying = false;
            console.log("Tone.Transport paused");
        }
    });

    // Volume slider already correctly updates Tone.Destination.volume in the previous snippet.
    // Tempo slider already correctly updates Tone.Transport.bpm in the previous snippet.

    // --- Initializations ---
    createPianoKeyboard();
    setupAudio(); // Call Tone.js setup

    // --- Music Generation Engine ---
    let currentMood = 'happy';
    let currentKeySignature; // e.g., { key: "C", type: "major", scale: ["C", "D", "E", "F", "G", "A", "B"] }
    let currentChordProgression; // Array of chord names, e.g., ["CMajor", "GMajor", "AMinor", "FMajor"]
    let currentTempo;
    let generationChunkBars = 4; // Generate 4 bars at a time
    let currentBar = 0;
    let mainMusicLoop;
    let recordedNotes = [];
    let isRecording = false;
    let recordingStartTime = 0;

    const SCALE_PRESETS = { // Using basic diatonic scales
        major: [0, 2, 4, 5, 7, 9, 11], // W-W-H-W-W-W-H
        minor: [0, 2, 3, 5, 7, 8, 10]  // W-H-W-W-H-W-W (natural minor)
    };

    const MOOD_PARAMS = {
        happy: {
            keys: [ {key: "C", type: "major"}, {key: "G", type: "major"}, {key: "F", type: "major"}, {key: "D", type: "major"} ],
            tempoRange: [120, 140],
            chordProgressions: [ // Roman numerals relative to the key
                ["I", "V", "vi", "IV"],
                ["I", "IV", "V", "I"],
                ["vi", "IV", "I", "V"]
            ],
            leftHandOctave: 3, // Bass note around C3
            rightHandOctave: 4, // Melody around C4-C5
            melodicDensity: 0.7, // 0 to 1, higher means more notes
            rhythmicVariety: ['4n', '8n', '8n.', '16n']
        },
        calm: {
            keys: [ {key: "C", type: "major"}, {key: "G", type: "major"}, {key: "F", type: "major"} ],
            tempoRange: [60, 80],
            chordProgressions: [
                ["I", "IV", "V", "I"],
                ["I", "ii", "V", "I"],
                ["I", "vi", "IV", "V"]
            ],
            leftHandOctave: 2,
            rightHandOctave: 4,
            melodicDensity: 0.4,
            rhythmicVariety: ['2n', '4n', '4n.']
        },
        sad: {
            keys: [ {key: "A", type: "minor"}, {key: "E", type: "minor"}, {key: "D", type: "minor"}, {key: "C", type: "minor"} ],
            tempoRange: [55, 75],
            chordProgressions: [
                ["i", "VI", "III", "VII"], // Natural minor chords
                ["i", "iv", "v", "i"], // Using minor v for natural minor feel
                ["i", "iv", "VII", "III"]
            ],
            leftHandOctave: 2,
            rightHandOctave: 3, // Lower melody
            melodicDensity: 0.5,
            rhythmicVariety: ['2n', '4n', '8n']
        },
        mysterious: {
            keys: [ {key: "A", type: "minor"}, {key: "E", type: "minor"}, {key: "C", type: "minor"} ], // Could add Phrygian or other modes later
            tempoRange: [70, 90],
            chordProgressions: [ // More ambiguous progressions
                ["i", "bII", "v", "i"], // Using bII (Neapolitan hint)
                ["i", "iv", "bVII", "i"],
                ["i", "ii°", "v", "i"] // Diminished ii for tension
            ],
            leftHandOctave: 3,
            rightHandOctave: 4,
            melodicDensity: 0.6,
            rhythmicVariety: ['4n', '8n', '8t', '16n'] // Adding triplets
        }
    };

    // Helper: Convert note name (e.g., "C#") to MIDI number
    function noteNameToMidi(noteName, octave) {
        const baseMidi = NOTE_NAMES.indexOf(noteName.toUpperCase());
        if (baseMidi === -1) throw new Error(`Invalid note name: ${noteName}`);
        return baseMidi + (octave + 1) * 12; // MIDI octaves are -1 to 9, C4 is 60
    }

    // Helper: Get MIDI number from scientific pitch notation (e.g., "C4")
    function scientificToMidi(noteString) {
        const match = noteString.match(/([A-G]#?b?)(-?\d+)/i);
        if (!match) throw new Error(`Invalid scientific notation: ${noteString}`);
        const noteName = match[1];
        const octave = parseInt(match[2]);
        return noteNameToMidi(noteName, octave);
    }

    // Helper: Get scale notes for a given key
    function getScaleForKey(keyName, scaleType) {
        const rootMidi = NOTE_NAMES.indexOf(keyName);
        const scaleIntervals = SCALE_PRESETS[scaleType];
        if (!scaleIntervals) throw new Error(`Unknown scale type: ${scaleType}`);

        return scaleIntervals.map(interval => {
            const noteIndex = (rootMidi + interval) % 12;
            return NOTE_NAMES[noteIndex];
        });
    }

    // Helper: Get chord tones for a given chord name and key context
    // Chord name e.g. "CMajor", "Aminor"
    // For simplicity, triads for now.
    function getChordTones(chordRootNote, chordType, keyScale) {
        const rootIndex = keyScale.indexOf(chordRootNote);
        if (rootIndex === -1) {
            console.warn(`Chord root ${chordRootNote} not in key scale ${keyScale}. This might be intentional for borrowed chords.`);
            // Fallback: find root in NOTE_NAMES if not in scale (for chromatic chords)
            const absoluteRootIndex = NOTE_NAMES.indexOf(chordRootNote);
            if (absoluteRootIndex === -1) throw new Error(`Invalid chord root: ${chordRootNote}`);

            let intervals;
            if (chordType.toLowerCase().includes('major') || chordType.toLowerCase() === 'maj' || chordType === "I" || chordType === "IV" || chordType === "V" || chordType === "III" || chordType === "VI" || chordType === "VII") { // Assuming major if not minor or dim
                intervals = [0, 4, 7]; // Major triad
            } else if (chordType.toLowerCase().includes('minor') || chordType.toLowerCase() === 'min' || chordType === "i" || chordType === "ii" || chordType === "iii" || chordType === "iv" || chordType === "v" || chordType === "vi") {
                intervals = [0, 3, 7]; // Minor triad
            } else if (chordType.toLowerCase().includes('dim')) {
                intervals = [0, 3, 6]; // Diminished triad
            } else { // Default to major
                 intervals = [0, 4, 7];
            }
            return intervals.map(interval => NOTE_NAMES[(absoluteRootIndex + interval) % 12]);
        }

        let intervals; // Relative to root of chord
        if (chordType.toLowerCase().includes('major') || chordType.toLowerCase() === 'maj') {
            intervals = [0, 4, 7]; // Major triad
        } else if (chordType.toLowerCase().includes('minor') || chordType.toLowerCase() === 'min') {
            intervals = [0, 3, 7]; // Minor triad
        } else if (chordType.toLowerCase().includes('diminished') || chordType.toLowerCase().includes('dim')) {
            intervals = [0, 3, 6]; // Diminished triad
        } else { // Default to major if type is unclear (e.g. just "C")
            intervals = [0, 4, 7];
        }

        // Get absolute note names for chord tones
        return intervals.map(interval => NOTE_NAMES[(NOTE_NAMES.indexOf(chordRootNote) + interval) % 12]);
    }

    // Helper: Convert Roman numeral to actual chord name in the key
    function romanToChord(roman, keyDetails) {
        const scale = keyDetails.scale;
        const romanUpper = roman.toUpperCase();
        let degree; // 0-indexed degree in scale
        let quality = "major"; // Default quality

        if (romanUpper.startsWith("BII")) degree = 1; // Special for bII
        else if (romanUpper.startsWith("VII")) degree = 6;
        else if (romanUpper.startsWith("VI")) degree = 5;
        else if (romanUpper.startsWith("IV")) degree = 3;
        else if (romanUpper.startsWith("V")) degree = 4;
        else if (romanUpper.startsWith("II")) degree = 1;
        else if (romanUpper.startsWith("III")) degree = 2;
        else if (romanUpper.startsWith("I")) degree = 0;
        else throw new Error("Invalid Roman numeral: " + roman);

        const rootNote = scale[degree];

        // Determine quality from Roman numeral case and key type
        if (keyDetails.type === "major") {
            if (["I", "IV", "V"].includes(romanUpper)) quality = "major";
            else if (["II", "III", "VI"].includes(romanUpper)) quality = "minor";
            else if (romanUpper === "VII") quality = "diminished"; // vii° in major
        } else { // minor key
            if (["I", "IV", "V"].includes(romanUpper)) quality = "minor"; // i, iv, v in natural minor
            else if (["III", "VI", "VII"].includes(romanUpper)) quality = "major"; // III, VI, VII in natural minor
            else if (romanUpper === "II") quality = "diminished"; // ii° in minor

            // Harmonic/Melodic minor adjustments (simplified: V is often major)
            if (roman === "V") quality = "major"; // Often V is major in minor key for stronger resolution
        }

        // Overrides for specific roman numeral syntax
        if (roman.endsWith("°") || roman.includes("dim")) quality = "diminished";
        else if (roman.toLowerCase() === roman && !roman.endsWith("°")) quality = "minor"; // e.g. "vi" is minor
        else if (roman.toUpperCase() === roman && !roman.endsWith("°")) quality = "major"; // e.g. "V" is major

        // Special handling for bII (Neapolitan) - always major
        if (romanUpper.startsWith("BII")) {
            const neapolitanRootIndex = (NOTE_NAMES.indexOf(keyDetails.scale[0]) + 1) % 12; // Root of bII
            return { root: NOTE_NAMES[neapolitanRootIndex], quality: "major", name: `${NOTE_NAMES[neapolitanRootIndex]}major` };
        }

        return { root: rootNote, quality: quality, name: `${rootNote}${quality}` };
    }


    function initializeMusicParameters() {
        const params = MOOD_PARAMS[currentMood];

        // Select Key
        const keyChoice = params.keys[Math.floor(Math.random() * params.keys.length)];
        currentKeySignature = {
            key: keyChoice.key,
            type: keyChoice.type,
            scale: getScaleForKey(keyChoice.key, keyChoice.type)
        };
        console.log(`Selected Key: ${currentKeySignature.key} ${currentKeySignature.type}`);
        console.log(`Scale: ${currentKeySignature.scale.join(", ")}`);

        // Select Chord Progression
        const progressionTemplate = params.chordProgressions[Math.floor(Math.random() * params.chordProgressions.length)];
        currentChordProgression = progressionTemplate.map(r => romanToChord(r, currentKeySignature));
        console.log("Chord Progression:", currentChordProgression.map(c => c.name));

        // Select Tempo
        currentTempo = params.tempoRange[0] + Math.random() * (params.tempoRange[1] - params.tempoRange[0]);
        Tone.Transport.bpm.value = currentTempo;
        tempoSlider.value = currentTempo; // Update slider
        tempoDisplay.textContent = `${Math.round(currentTempo)} BPM`;

        currentBar = 0; // Reset bar count
        // Cancel any previous loop
        if (mainMusicLoop) {
            mainMusicLoop.dispose();
        }
        mainMusicLoop = new Tone.Loop(time => generateAndPlayMusicChunk(time), `${generationChunkBars}m`).start(0);
        Tone.Transport.scheduleRepeat(time => {
            currentBar = (currentBar + 1) % (currentChordProgression.length * generationChunkBars) // Assuming 1 chord per bar for now for simplicity
        }, "1m", "0m"); // Increment bar counter every measure
    }

    function generateAndPlayMusicChunk(time) {
        console.log(`Generating chunk at time: ${time}, Current Bar: ${currentBar}`);
        const params = MOOD_PARAMS[currentMood];
        const measuresPerChord = generationChunkBars / currentChordProgression.length; // How many measures each chord lasts

        for (let i = 0; i < generationChunkBars; i++) {
            const barTime = time + i * Tone.Time("1m").toSeconds();
            const chordIndex = Math.floor(currentBar / measuresPerChord) % currentChordProgression.length;
            const currentChord = currentChordProgression[chordIndex];
            const chordTones = getChordTones(currentChord.root, currentChord.quality, currentKeySignature.scale);

            // --- Left Hand (Harmony) ---
            // Play root note of the chord as a whole note for simplicity
            const bassNoteOctave = params.leftHandOctave;
            const bassNoteMidi = noteNameToMidi(currentChord.root, bassNoteOctave);
            const bassNoteName = `${currentChord.root}${bassNoteOctave}`;
            const bassDuration = "1m"; // Whole note for each bar
            const bassDurationSec = Tone.Time(bassDuration).toSeconds();

            leftHandSynth.triggerAttackRelease(bassNoteName, bassDurationSec, barTime);
            // Schedule visualization for left hand
            Tone.Draw.schedule(() => {
                highlightKey(bassNoteMidi, bassDurationSec * 1000 * 0.9);
                visualizeNote(bassNoteMidi, bassDurationSec);
            }, barTime);

            if (isRecording) {
                recordedNotes.push({
                    hand: 'left',
                    pitch: bassNoteMidi,
                    time: barTime - recordingStartTime, // Time relative to recording start
                    duration: bassDurationSec,
                    velocity: 0.8 // Default velocity
                });
            }


            // --- Right Hand (Melody) ---
            // Simple melody: pick chord tones, occasional scale tones.
            let currentTimeInBar = 0;
            const beatsInBar = 4; // Assuming 4/4 time
            let beatsFilled = 0;

            while(beatsFilled < beatsInBar) {
                if (Math.random() > params.melodicDensity && beatsFilled > 0) { // Chance to rest if not first beat
                    const restDuration = Tone.Time("8n").toSeconds(); // Rest for an eighth note
                    beatsFilled += 0.5; // 8n is half a beat
                    currentTimeInBar += restDuration;
                    if(beatsFilled >= beatsInBar) break;
                    continue;
                }

                let melodyNoteName;
                if (Math.random() < 0.75) { // 75% chance for a chord tone
                    melodyNoteName = chordTones[Math.floor(Math.random() * chordTones.length)];
                } else { // 25% chance for any scale tone (passing tone)
                    melodyNoteName = currentKeySignature.scale[Math.floor(Math.random() * currentKeySignature.scale.length)];
                }

                const melodyOctave = params.rightHandOctave + (Math.random() > 0.6 ? 1 : 0); // Vary octave slightly
                const melodyNoteFull = `${melodyNoteName}${melodyOctave}`;
                const melodyNoteMidi = scientificToMidi(melodyNoteFull);

                // Rhythmic variety
                const rhythmChoice = params.rhythmicVariety[Math.floor(Math.random() * params.rhythmicVariety.length)];
                const noteDurationTone = Tone.Time(rhythmChoice);
                const noteDurationSec = noteDurationTone.toSeconds();

                if (beatsFilled + noteDurationTone.toNotation().replace('n', '') / 4 > beatsInBar) { // Avoid overfilling bar
                    // If overflows, try shorter note or skip
                    if (beatsFilled < beatsInBar) {
                        const remainingBeatFraction = beatsInBar - beatsFilled;
                        let fillDuration = "16n"; // Smallest unit
                        if (remainingBeatFraction >= 0.5) fillDuration = "8n";
                        if (remainingBeatFraction >= 1) fillDuration = "4n";

                        const fillDurationSec = Tone.Time(fillDuration).toSeconds();
                        rightHandSynth.triggerAttackRelease(melodyNoteFull, fillDuration, barTime + currentTimeInBar);
                        Tone.Draw.schedule(() => {
                            highlightKey(melodyNoteMidi, fillDurationSec * 1000 * 0.9);
                            visualizeNote(melodyNoteMidi, fillDurationSec);
                        }, barTime + currentTimeInBar);
                        if (isRecording) {
                            recordedNotes.push({
                                hand: 'right',
                                pitch: melodyNoteMidi,
                                time: (barTime + currentTimeInBar) - recordingStartTime,
                                duration: fillDurationSec,
                                velocity: 0.9
                            });
                        }
                        beatsFilled += Tone.Time(fillDuration).toNotation().replace('n', '') / 4;
                    }
                    break;
                }

                rightHandSynth.triggerAttackRelease(melodyNoteFull, noteDurationSec, barTime + currentTimeInBar);
                Tone.Draw.schedule(() => {
                    highlightKey(melodyNoteMidi, noteDurationSec * 1000 * 0.9); // Highlight slightly less than full duration
                    visualizeNote(melodyNoteMidi, noteDurationSec);
                }, barTime + currentTimeInBar);
                 if (isRecording) {
                    recordedNotes.push({
                        hand: 'right',
                        pitch: melodyNoteMidi,
                        time: (barTime + currentTimeInBar) - recordingStartTime,
                        duration: noteDurationSec,
                        velocity: 0.9 // Default velocity for melody
                    });
                }

                currentTimeInBar += noteDurationSec;
                beatsFilled += parseFloat(noteDurationTone.toNotation().replace('n','').replace('t','')) / (noteDurationTone.toNotation().includes('t') ? 6 : 4); // Approximation for beats
            }
            // currentBar is incremented by the global Tone.Transport.scheduleRepeat
            // Do not increment it here per bar, but use the global currentBar to determine chord for this bar 'i' of the chunk.
            // The `currentBar` used in `chordIndex` calculation at the start of the inner loop should be `(globalCurrentBar + i)`
            // Let's adjust how chordIndex is picked.
        }
        // The global currentBar will be updated by scheduleRepeat.
        // The loop itself handles 'generationChunkBars' starting from the time 'time'
        // and the global currentBar value when this function was invoked.
    }

    // Renaming this global currentBar to avoid confusion with loop iterators
    let globalCurrentMusicBar = 0;


    function initializeMusicParameters() {
        const params = MOOD_PARAMS[currentMood];

        // Select Key
        const keyChoice = params.keys[Math.floor(Math.random() * params.keys.length)];
        currentKeySignature = {
            key: keyChoice.key,
            type: keyChoice.type,
            scale: getScaleForKey(keyChoice.key, keyChoice.type)
        };
        console.log(`Selected Key: ${currentKeySignature.key} ${currentKeySignature.type}`);
        console.log(`Scale: ${currentKeySignature.scale.join(", ")}`);

        // Select Chord Progression
        const progressionTemplate = params.chordProgressions[Math.floor(Math.random() * params.chordProgressions.length)];
        currentChordProgression = progressionTemplate.map(r => romanToChord(r, currentKeySignature));
        console.log("Chord Progression:", currentChordProgression.map(c => c.name));

        // Select Tempo
        currentTempo = params.tempoRange[0] + Math.random() * (params.tempoRange[1] - params.tempoRange[0]);
        Tone.Transport.bpm.value = currentTempo;
        tempoSlider.value = currentTempo; // Update slider
        tempoDisplay.textContent = `${Math.round(currentTempo)} BPM`;

        globalCurrentMusicBar = 0; // Reset bar count
        // Cancel any previous loop
        if (mainMusicLoop) {
            mainMusicLoop.dispose();
        }
        //This loop generates a chunk of music. 'time' is the Tone.js scheduled time for the start of this chunk.
        mainMusicLoop = new Tone.Loop(time => generateAndPlayMusicChunk(time, globalCurrentMusicBar), `${generationChunkBars}m`).start(0);

        // This schedules the increment of our global bar counter.
        Tone.Transport.clear(barIncrementEventId); // Clear previous event if any
        barIncrementEventId = Tone.Transport.scheduleRepeat(time => {
            globalCurrentMusicBar = (globalCurrentMusicBar + 1);
            // console.log("Global Bar: ", globalCurrentMusicBar);
        }, "1m", "0m");
    }
    let barIncrementEventId = null; // To keep track of the bar increment event

    // generateAndPlayMusicChunk now takes the starting bar of the chunk as an argument
    function generateAndPlayMusicChunk(scheduledTime, chunkStartBarGlobal) {
        // console.log(`Generating chunk at time: ${scheduledTime}, Chunk Start Bar (Global): ${chunkStartBarGlobal}`);
        const params = MOOD_PARAMS[currentMood];
        // measuresPerChord was defined but not used. Let's assume 1 chord per bar for simplicity or make it configurable.
        // For now, each chord in currentChordProgression lasts for 1 bar, and the progression repeats.
        // The number of bars in one full cycle of the chord progression:
        const barsInProgressionCycle = currentChordProgression.length;

        for (let i = 0; i < generationChunkBars; i++) { // 'i' is the bar offset within the current chunk
            const currentGlobalBarNumber = chunkStartBarGlobal + i;
            const barTime = scheduledTime + i * Tone.Time("1m").toSeconds();

            // Determine which chord to play based on the current global bar number
            const chordIndex = (currentGlobalBarNumber % barsInProgressionCycle);
            const currentChord = currentChordProgression[chordIndex];
            const chordTones = getChordTones(currentChord.root, currentChord.quality, currentKeySignature.scale);

            // --- Left Hand (Harmony) ---
            const bassNoteOctave = params.leftHandOctave;
            const bassNoteMidi = noteNameToMidi(currentChord.root, bassNoteOctave);
            const bassNoteName = `${currentChord.root}${bassNoteOctave}`;
            const bassDuration = "1m";
            const bassDurationSec = Tone.Time(bassDuration).toSeconds();

            leftHandSynth.triggerAttackRelease(bassNoteName, bassDurationSec, barTime);
            Tone.Draw.schedule(() => {
                highlightKey(bassNoteMidi, bassDurationSec * 1000 * 0.9);
                visualizeNote(bassNoteMidi, bassDurationSec);
            }, barTime);

            if (isRecording) {
                recordedNotes.push({
                    hand: 'left',
                    pitch: bassNoteMidi,
                    time: barTime - recordingStartTime,
                    duration: bassDurationSec,
                    velocity: 0.8
                });
            }

            // --- Right Hand (Melody) ---
            let currentTimeInBar = 0;
            const beatsInBar = 4;
            let beatsFilled = 0;

            while(beatsFilled < beatsInBar) {
                if (Math.random() > params.melodicDensity && beatsFilled > 0) {
                    const restDuration = Tone.Time("8n").toSeconds();
                    beatsFilled += 0.5;
                    currentTimeInBar += restDuration;
                    if(beatsFilled >= beatsInBar) break;
                    continue;
                }

                let melodyNoteName;
                if (Math.random() < 0.75) {
                    melodyNoteName = chordTones[Math.floor(Math.random() * chordTones.length)];
                } else {
                    melodyNoteName = currentKeySignature.scale[Math.floor(Math.random() * currentKeySignature.scale.length)];
                }

                const melodyOctave = params.rightHandOctave + (Math.random() > 0.6 ? 1 : 0);
                const melodyNoteFull = `${melodyNoteName}${melodyOctave}`;
                const melodyNoteMidi = scientificToMidi(melodyNoteFull);

                const rhythmChoice = params.rhythmicVariety[Math.floor(Math.random() * params.rhythmicVariety.length)];
                const noteDurationTone = Tone.Time(rhythmChoice);
                const noteDurationSec = noteDurationTone.toSeconds();

                // Calculate beats for the chosen rhythmChoice
                let rhythmBeats = 0;
                const notation = noteDurationTone.toNotation();
                if (notation.includes('t')) { // triplet
                    rhythmBeats = (parseFloat(notation.replace('n', '').replace('t', '')) / 3) * 2 / 4; // e.g. 8t is 1/3 beat
                } else {
                    rhythmBeats = parseFloat(notation.replace('n', '')) / 4; // e.g. 4n is 1 beat, 8n is 0.5 beat
                }


                if (beatsFilled + rhythmBeats > beatsInBar + 0.01) { // Add small tolerance for float issues
                    if (beatsFilled < beatsInBar) {
                        const remainingBeatFraction = beatsInBar - beatsFilled;
                        let fillDurationNotation = "16n";
                        if (remainingBeatFraction >= 0.5) fillDurationNotation = "8n";
                        if (remainingBeatFraction >= 0.25) fillDurationNotation = "4n"; // Mistake: Should be 1 for 4n
                        if (remainingBeatFraction >= 1) fillDurationNotation = "4n";


                        // Corrected logic for choosing fillDurationNotation based on remaining beats
                        if (remainingBeatFraction >= 1) fillDurationNotation = "4n";
                        else if (remainingBeatFraction >= 0.5) fillDurationNotation = "8n";
                        else if (remainingBeatFraction >= 0.25) fillDurationNotation = "16n";
                        else break; // Not enough space for even a 16th note

                        const fillDurationSec = Tone.Time(fillDurationNotation).toSeconds();
                        rightHandSynth.triggerAttackRelease(melodyNoteFull, fillDurationSec, barTime + currentTimeInBar);
                        Tone.Draw.schedule(() => {
                            highlightKey(melodyNoteMidi, fillDurationSec * 1000 * 0.9);
                            visualizeNote(melodyNoteMidi, fillDurationSec);
                        }, barTime + currentTimeInBar);
                        if (isRecording) {
                            recordedNotes.push({
                                hand: 'right',
                                pitch: melodyNoteMidi,
                                time: (barTime + currentTimeInBar) - recordingStartTime,
                                duration: fillDurationSec,
                                velocity: 0.9
                            });
                        }
                        // Calculate beats for fillDurationNotation
                        let fillBeats = 0;
                        if (fillDurationNotation.includes('t')) {
                           fillBeats = (parseFloat(fillDurationNotation.replace('n', '').replace('t', '')) / 3) * 2 / 4;
                        } else {
                           fillBeats = parseFloat(fillDurationNotation.replace('n', '')) / 4;
                        }
                        beatsFilled += fillBeats;
                    }
                    break;
                }

                rightHandSynth.triggerAttackRelease(melodyNoteFull, noteDurationSec, barTime + currentTimeInBar);
                Tone.Draw.schedule(() => {
                    highlightKey(melodyNoteMidi, noteDurationSec * 1000 * 0.9);
                    visualizeNote(melodyNoteMidi, noteDurationSec);
                }, barTime + currentTimeInBar);
                 if (isRecording) {
                    recordedNotes.push({
                        hand: 'right',
                        pitch: melodyNoteMidi,
                        time: (barTime + currentTimeInBar) - recordingStartTime,
                        duration: noteDurationSec,
                        velocity: 0.9
                    });
                }

                currentTimeInBar += noteDurationSec;
                beatsFilled += rhythmBeats;
            }
        }
    }


    // --- Recording and Export ---
    recordBtn.addEventListener('click', () => {
        if (!isRecording) {
            // Start recording
            isRecording = true;
            recordedNotes = [];
            recordingStartTime = Tone.now(); // Use Tone.now() for precise start time in the transport's context

            // If music is not playing, and user hits record, should it start playing?
            // For now, assume recording can happen whether music is playing or paused, capturing what's generated.
            // If transport is stopped, recording will capture from the moment play is next hit.
            // If transport is paused, it will capture from resume.
            // If transport is playing, it captures immediately.
            // A more user-friendly approach might be to ensure transport is running or prompt user.
            // For this implementation, we'll make sure recording starts relative to when music *actually* plays.
            // This means `recordingStartTime` should ideally be `Tone.Transport.seconds` if playing, or set when play starts.
            // Let's adjust: if transport is playing, use its current time.
            if (Tone.Transport.state === "started") {
                 recordingStartTime = Tone.Transport.seconds;
            } else {
                // If not started, recordingStartTime will be relative to when transport eventually starts.
                // This means note times might be negative if generation happens before transport start.
                // Simpler: only allow recording if transport is playing.
                // Or, if record is hit, ensure transport starts.
                // Let's take the latter: if record is hit, ensure music is playing.
                if (!musicPlaying) {
                     playPauseBtn.click(); // Simulate a click to start playing
                }
                recordingStartTime = Tone.Transport.seconds; // Now it should be 0 or very close
            }


            recordBtn.classList.add('recording');
            recordBtn.textContent = 'Stop';
            downloadMidiBtn.disabled = true;
            downloadWavBtn.disabled = true;
            console.log("Recording started. Start time:", recordingStartTime);
        } else {
            // Stop recording
            isRecording = false;
            recordBtn.classList.remove('recording');
            recordBtn.textContent = 'Record';
            if (recordedNotes.length > 0) {
                downloadMidiBtn.disabled = false;
                downloadWavBtn.disabled = false;
            }
            console.log("Recording stopped. Notes captured:", recordedNotes.length);
        }
    });

    downloadMidiBtn.addEventListener('click', () => {
        if (recordedNotes.length === 0) {
            alert("No notes recorded to export.");
            return;
        }
        const writer = new MidiWriter.Writer();

        const leftTrack = new MidiWriter.Track();
        leftTrack.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1})); // Acoustic Grand Piano
        writer.addTrack(leftTrack);

        const rightTrack = new MidiWriter.Track();
        rightTrack.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1})); // Acoustic Grand Piano
        writer.addTrack(rightTrack);

        // Sort notes by time, just in case
        recordedNotes.sort((a, b) => a.time - b.time);

        let lastLeftTimeTicks = 0;
        let lastRightTimeTicks = 0;

        recordedNotes.forEach(note => {
            const startTick = MidiWriter.Utils.secondsToTicks(note.time, writer.header.getTicksPerBeat());
            const durationTicks = MidiWriter.Utils.secondsToTicks(note.duration, writer.header.getTicksPerBeat());

            const midiEvent = new MidiWriter.NoteEvent({
                pitch: [note.pitch], // MidiWriter expects array of pitches
                duration: `T${Math.max(1, Math.round(durationTicks))}`, // Use tick duration, ensure minimum 1 tick
                velocity: Math.round(note.velocity * 100), // MIDI velocity 0-100 for MidiWriter
            });

            if (note.hand === 'left') {
                midiEvent.wait = `T${Math.max(0, startTick - lastLeftTimeTicks)}`; // Delta time in ticks
                leftTrack.addEvent(midiEvent);
                lastLeftTimeTicks = startTick;
            } else {
                midiEvent.wait = `T${Math.max(0, startTick - lastRightTimeTicks)}`;
                rightTrack.addEvent(midiEvent);
                lastRightTimeTicks = startTick;
            }
        });

        const dataUri = writer.dataUri();
        const a = document.createElement('a');
        a.href = dataUri;
        a.download = `endless_piano_export_${new Date().toISOString().slice(0,10)}.mid`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log("MIDI file generated and download triggered.");
    });

    // WAV Export Helper: AudioBuffer to WAV
    function bufferToWave(abuffer, len) {
        var numOfChan = abuffer.numberOfChannels,
            length = len * numOfChan * 2 + 44, // Include header
            buffer = new ArrayBuffer(length),
            view = new DataView(buffer),
            channels = [], i, sample,
            offset = 0,
            pos = 0;

        // Write WAVE header
        setUint32(0x46464952);                         // "RIFF"
        setUint32(length - 8);                       // file length - 8
        setUint32(0x45564157);                         // "WAVE"

        setUint32(0x20746d66);                         // "fmt " chunk
        setUint32(16);                                 // length = 16
        setUint16(1);                                  // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2);                      // block-align
        setUint16(16);                                 // 16-bit (hardcoded in this version)

        setUint32(0x61746164);                         // "data" - chunk
        setUint32(length - pos - 4);                   // chunk length

        // Write interleaved data
        for (i = 0; i < abuffer.numberOfChannels; i++)
            channels.push(abuffer.getChannelData(i));

        while (pos < length) {
            for (i = 0; i < numOfChan; i++) {             // interleave channels
                sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767); // scale to 16-bit signed int
                view.setInt16(pos, sample, true);          // write 16-bit sample
                pos += 2;
            }
            offset++;                                     // next source sample
        }

        return new Blob([buffer], {type: "audio/wav"});

        function setUint16(data) {
            view.setUint16(pos, data, true);
            pos += 2;
        }

        function setUint32(data) {
            view.setUint32(pos, data, true);
            pos += 4;
        }
    }


    downloadWavBtn.addEventListener('click', async () => {
        if (recordedNotes.length === 0) {
            alert("No notes recorded to export.");
            return;
        }
        console.log("Starting WAV export...");
        downloadWavBtn.disabled = true;
        downloadWavBtn.textContent = "Rendering...";

        try {
            // Determine total duration of the recording
            let maxTime = 0;
            recordedNotes.forEach(note => {
                if (note.time + note.duration > maxTime) {
                    maxTime = note.time + note.duration;
                }
            });
            const totalDurationSeconds = Math.ceil(maxTime) + 1; // Add a little buffer

            // Offline rendering context
            const offlineContext = new Tone.OfflineContext(2, totalDurationSeconds, Tone.context.sampleRate);

            // Create synths and effects for the offline context
            // Important: Use the same settings as the live synths/effects
            const offlineLeftSynth = new Tone.Synth({ context: offlineContext, ...leftHandSynth.get() }).toDestination();
            const offlineRightSynth = new Tone.Synth({ context: offlineContext, ...rightHandSynth.get() }).toDestination();

            const offlineLeftPanner = new Tone.Panner(-0.3, {context: offlineContext});
            const offlineRightPanner = new Tone.Panner(0.3, {context: offlineContext});

            const offlineReverb = new Tone.Reverb({context: offlineContext, ...reverb.get()});
            const offlineCompressor = new Tone.Compressor({context: offlineContext, ...compressor.get()});
            const offlineLimiter = new Tone.Limiter(-0.1, {context: offlineContext});

            // Connect offline graph: Synths -> Panners -> Reverb -> Compressor -> Limiter -> OfflineContext.destination
            offlineLeftSynth.connect(offlineLeftPanner);
            offlineRightSynth.connect(offlineRightPanner);

            offlineLeftPanner.connect(offlineReverb);
            offlineRightPanner.connect(offlineReverb);

            offlineReverb.connect(offlineCompressor);
            offlineCompressor.connect(offlineLimiter);
            offlineLimiter.connect(offlineContext.destination);


            // Schedule notes
            recordedNotes.forEach(note => {
                const pitchName = Tone.Frequency(note.pitch, "midi").toNote();
                if (note.hand === 'left') {
                    offlineLeftSynth.triggerAttackRelease(pitchName, note.duration, note.time, note.velocity);
                } else {
                    offlineRightSynth.triggerAttackRelease(pitchName, note.duration, note.time, note.velocity);
                }
            });

            // Render the audio
            const buffer = await offlineContext.render();

            // Convert to WAV and trigger download
            const wavBlob = bufferToWave(buffer, buffer.length);
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `endless_piano_export_${new Date().toISOString().slice(0,10)}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log("WAV file rendered and download triggered.");

        } catch (error) {
            console.error("Error rendering WAV:", error);
            alert("Error rendering WAV file. Check console for details.");
        } finally {
            downloadWavBtn.disabled = false;
            downloadWavBtn.textContent = "Download WAV";
            if (recordedNotes.length > 0) { // Re-enable if there's still data
                 downloadWavBtn.disabled = false;
            }
        }
    });


    moodSelector.addEventListener('change', (e) => {
        currentMood = e.target.value;
        console.log(`Mood changed to: ${currentMood}`);
        if (musicPlaying) { // If music is playing, re-initialize and continue
            Tone.Transport.stop(); // Stop to clear previous events
            Tone.Transport.cancel(); // Cancel all scheduled events
            initializeMusicParameters();
            Tone.Transport.start();
        } else {
            // If paused, just update params. They will be used when play is pressed.
            // Or, optionally, re-initialize now if you want changes to apply even if paused.
            // For now, let's re-initialize so the next play starts with the new mood.
            initializeMusicParameters();
        }
    });

    // Update Play/Pause to use the generation logic
    playPauseBtn.addEventListener('click', async () => {
        if (Tone.context.state !== 'running') {
            await Tone.start();
            console.log("AudioContext started!");
            // Re-initialize audio components if they depend on user gesture context for creation,
            // or ensure they are robust to being created before Tone.start(). Our setupAudio should be fine.
        }

        if (!musicPlaying) {
            if(Tone.Transport.state === "stopped" || !mainMusicLoop) { // If first play or after a full stop
                initializeMusicParameters(); // Setup music params and loop
            }
            playPauseBtn.textContent = 'Pause';
            Tone.Transport.start();
            musicPlaying = true;
            console.log("Tone.Transport started with music generation loop.");
        } else {
            playPauseBtn.textContent = 'Play';
            Tone.Transport.pause();
            musicPlaying = false;
            console.log("Tone.Transport paused.");
        }
    });


    // --- Initializations ---
    createPianoKeyboard();
    setupAudio(); // Call Tone.js setup
    // initializeMusicParameters(); // Don't auto-start, wait for play
    // Set initial mood from selector
    currentMood = moodSelector.value;
    // Initialize params for the first play, but don't start transport yet
    initializeMusicParameters();
    Tone.Transport.pause(); // Ensure it's paused initially after setup


});
