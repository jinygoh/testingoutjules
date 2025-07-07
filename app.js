import { generatePattern, GENRE_LIST, INSTRUMENTS as INSTRUMENT_NAMES } from './generator.js';

// --- Tone.js Synthesizer Setup ---
const synths = {
    kick: new Tone.MembraneSynth({
        pitchDecay: 0.03,
        octaves: 6,
        oscillator: { type: 'fmsine' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.2 }
    }).toDestination(),
    snare: {
        noise: new Tone.NoiseSynth({
            noise: { type: 'pink' },
            envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 }
        }).toDestination(),
        membrane: new Tone.MembraneSynth({ // Adds body to the snare
            pitchDecay: 0.08,
            octaves: 5,
            oscillator: {type: "sine"},
            envelope: {attack: 0.002, decay: 0.1, sustain: 0, release: 0.05}
        }).toDestination()
    },
    hiHat: new Tone.NoiseSynth({ // Closed Hi-Hat
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.03 },
        filter: new Tone.Filter(8000, "highpass"), // High-pass filter for crispness
    }).toDestination(),
    crash: new Tone.MetalSynth({ // Crash Cymbal
        frequency: 150,
        envelope: { attack: 0.002, decay: 1.5, release: 2 },
        harmonicity: 4.1,
        modulationIndex: 20,
        resonance: 3000,
        octaves: 1.2
    }).toDestination(),
    tom: new Tone.MembraneSynth({ // Tom
        pitchDecay: 0.08,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.25, sustain: 0.01, release: 0.1 },
        volume: -6 // Toms can be loud
    }).toDestination()
};
// Connect snare components (noise synth already connected)
synths.snare.noise.connect(synths.snare.membrane); // Noise triggers membrane slightly for body
synths.snare.membrane.volume.value = -12; // Membrane is more subtle
synths.snare.noise.volume.value = -6;


// --- DOM Element References ---
const generateButton = document.getElementById('generate-all');
const genreSelect = document.getElementById('genre-select');
const bpmInput = document.getElementById('bpm-input');
const playStopButton = document.getElementById('play-stop');
const exportMidiButton = document.getElementById('export-midi');
const exportWavButton = document.getElementById('export-wav');
const midiGridDiv = document.getElementById('midi-grid');
const playheadDiv = document.getElementById('playhead');

// --- Application State ---
let currentPattern = null;
let isPlaying = false;
const STEPS = 16;
const instrumentParts = {}; // To hold Tone.Part for each instrument

// --- MIDI Grid Creation ---
function createMidiGrid() {
    midiGridDiv.innerHTML = ''; // Clear existing grid
    INSTRUMENT_NAMES.forEach(instrumentName => {
        const labelDiv = document.createElement('div');
        labelDiv.classList.add('instrument-label');
        labelDiv.textContent = instrumentName.charAt(0).toUpperCase() + instrumentName.slice(1);
        midiGridDiv.appendChild(labelDiv);

        for (let step = 0; step < STEPS; step++) {
            const stepDiv = document.createElement('div');
            stepDiv.classList.add('step');
            stepDiv.dataset.instrument = instrumentName;
            stepDiv.dataset.step = step;
            // Allow toggling steps manually (optional, but good for interaction)
            stepDiv.addEventListener('click', () => {
                if (currentPattern) {
                    currentPattern[instrumentName][step] = currentPattern[instrumentName][step] === 1 ? 0 : 1;
                    stepDiv.classList.toggle('active');
                    updateToneParts(); // Re-sync Tone.js if manually changed
                }
            });
            midiGridDiv.appendChild(stepDiv);
        }
    });
    // Calculate playhead width per step
    const firstStepCell = midiGridDiv.querySelector('.step');
    if (firstStepCell) {
        playheadDiv.style.width = `${firstStepCell.offsetWidth}px`;
        playheadDiv.style.opacity = '0.5'; // Make it a bit transparent
    }
}

// --- Update Visual Grid from Pattern Data ---
function updateVisualGrid() {
    if (!currentPattern) return;
    INSTRUMENT_NAMES.forEach(instrumentName => {
        currentPattern[instrumentName].forEach((isActive, step) => {
            const cell = midiGridDiv.querySelector(`.step[data-instrument='${instrumentName}'][data-step='${step}']`);
            if (cell) {
                if (isActive) cell.classList.add('active');
                else cell.classList.remove('active');
            }
        });
    });
}

// --- Tone.js Playback Setup ---
function updateToneParts() {
    if (!currentPattern) return;

    // Clear existing parts
    Object.values(instrumentParts).forEach(part => part.dispose());
    Tone.Transport.cancel(0); // Clear any scheduled events

    INSTRUMENT_NAMES.forEach(instrumentName => {
        const partData = [];
        currentPattern[instrumentName].forEach((isActive, step) => {
            if (isActive) {
                partData.push({ time: `0:0:${step}` }); // Time as Bars:Beats:Sixteenths
            }
        });

        instrumentParts[instrumentName] = new Tone.Part((time) => {
            if (instrumentName === 'snare') {
                synths.snare.noise.triggerAttackRelease(time);
                synths.snare.membrane.triggerAttackRelease("C2", "16n", time + 0.001); // membrane slightly delayed
            } else {
                // Default trigger for MembraneSynths (kick, tom)
                let note = 'C2'; // Default kick/tom pitch
                let duration = '16n';
                if(instrumentName === 'tom') note = 'G2'; // Higher pitch for tom
                if(instrumentName === 'crash') duration = '1n'; // Longer release for crash

                if (synths[instrumentName] instanceof Tone.MembraneSynth || synths[instrumentName] instanceof Tone.MetalSynth) {
                     synths[instrumentName].triggerAttackRelease(note, duration, time);
                } else if (synths[instrumentName] instanceof Tone.NoiseSynth) { // hiHat
                     synths[instrumentName].triggerAttackRelease(time);
                }
            }
        }, partData).start(0);
        instrumentParts[instrumentName].loop = true;
        instrumentParts[instrumentName].loopEnd = '1m'; // Loop for one measure
    });
}


// --- Playhead Visualization ---
let playheadEventId = null;
function setupPlayhead() {
    const stepWidth = midiGridDiv.querySelector('.step')?.offsetWidth || 30; // Fallback width
    const labelWidth = midiGridDiv.querySelector('.instrument-label')?.offsetWidth || 100;

    if (playheadEventId !== null) {
        Tone.Transport.clear(playheadEventId);
    }

    playheadEventId = Tone.Transport.scheduleRepeat(time => {
        Tone.Draw.schedule(() => {
            const currentTick = Tone.Transport.ticks;
            const ticksPerBar = Tone.Transport.PPQ * 4; // PPQ = pulses (ticks) per quarter note
            const progress = (currentTick % ticksPerBar) / ticksPerBar;
            const playheadX = labelWidth + (progress * (stepWidth * STEPS));
            playheadDiv.style.transform = `translateX(${playheadX}px)`;

            // Highlight playing cells
            const currentStep = Math.floor(progress * STEPS);
            document.querySelectorAll('.step.playing').forEach(cell => cell.classList.remove('playing'));
            document.querySelectorAll(`.step[data-step='${currentStep}']`).forEach(cell => {
                if (cell.classList.contains('active')) { // Only highlight if it's an active note
                    cell.classList.add('playing');
                }
            });

        }, time);
    }, '16n'); // Update every 16th note
}


// --- Event Handlers ---
async function handleGenerate() {
    await Tone.start(); // Ensure AudioContext is running

    const selectedGenre = genreSelect.value;
    let fusionPair = [];

    if (selectedGenre === "genre-fusion") {
        // Randomly select two different base genres
        let genre1 = GENRE_LIST[Math.floor(Math.random() * GENRE_LIST.length)];
        let genre2 = GENRE_LIST[Math.floor(Math.random() * GENRE_LIST.length)];
        while (genre2 === genre1) { // Ensure they are different
            genre2 = GENRE_LIST[Math.floor(Math.random() * GENRE_LIST.length)];
        }
        fusionPair = [genre1, genre2];
        console.log(`Genre Fusion: ${genre1} (Kick/Snare) + ${genre2} (Hats/Cymb/Toms)`);
    }

    currentPattern = generatePattern(selectedGenre, fusionPair);
    updateVisualGrid();
    updateToneParts();
}

function handlePlayStop() {
    if (!currentPattern) { // Generate a pattern first if none exists
        handleGenerate().then(() => {
             if (currentPattern) togglePlayback(); // Then toggle
        });
    } else {
        togglePlayback();
    }
}

function togglePlayback() {
    if (isPlaying) {
        Tone.Transport.stop();
        playStopButton.textContent = 'Play';
        playheadDiv.style.opacity = '0'; // Hide playhead when stopped
        document.querySelectorAll('.step.playing').forEach(cell => cell.classList.remove('playing'));
    } else {
        Tone.Transport.start();
        playStopButton.textContent = 'Stop';
        playheadDiv.style.opacity = '0.5'; // Show playhead
        setupPlayhead(); // Restart playhead scheduling
    }
    isPlaying = !isPlaying;
}


function handleBpmChange() {
    Tone.Transport.bpm.value = parseInt(bpmInput.value, 10);
}

function handleGenreChange() {
    const selectedGenre = genreSelect.value;
    if (selectedGenre === 'jazz') {
        Tone.Transport.swing = 0.5; // Apply swing for Jazz
    } else {
        Tone.Transport.swing = 0; // No swing for others
    }
    handleGenerate(); // Generate a new pattern for the selected genre
}

// --- Export Functions ---
function exportMIDI() {
    if (!currentPattern) {
        alert("Please generate a pattern first.");
        return;
    }

    const track = new MidiWriter.Track();
    track.setTempo(Tone.Transport.bpm.value);

    // MIDI instrument mapping (General MIDI Percussion Key Map)
    // Using channel 10 (usually percussion channel)
    const instrumentMidiNotes = {
        kick: 36,   // Acoustic Bass Drum
        snare: 38,  // Acoustic Snare
        hiHat: 42,  // Closed Hi-Hat
        crash: 49,  // Crash Cymbal 1
        tom: 45     // Low Tom
    };

    INSTRUMENT_NAMES.forEach(instrumentName => {
        const midiNote = instrumentMidiNotes[instrumentName];
        if(midiNote === undefined) return; // Skip if no MIDI note defined

        const events = [];
        currentPattern[instrumentName].forEach((isActive, step) => {
            if (isActive) {
                const startTimeTicks = (step / STEPS) * Tone.Transport.PPQ * 4; // Calculate ticks
                 events.push(new MidiWriter.NoteEvent({
                    pitch: [midiNote],
                    duration: '16', // 16th note duration (MidiWriter format)
                    startTick: startTimeTicks,
                    channel: 10 // Percussion channel
                }));
            }
        });
        track.addEvent(events, (event, index) => ({
            sequential: false // Add events based on their startTick
        }));
    });

    const write = new MidiWriter.Writer([track]);
    const blob = new Blob([write.buildFile()], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drum-pattern-${genreSelect.value}-${bpmInput.value}bpm.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function exportWAV() {
    if (!currentPattern) {
        alert("Please generate a pattern first.");
        return;
    }
    if (isPlaying) {
        alert("Please stop playback before exporting WAV.");
        return;
    }

    playStopButton.disabled = true; // Disable controls during render
    exportWavButton.textContent = "Rendering...";

    try {
        const buffer = await Tone.Offline(async (offlineTransport) => {
            // Setup synths and parts within the offline context
            const offlineSynths = { // Recreate synths for offline context
                kick: new Tone.MembraneSynth().toDestination(),
                snare: {
                    noise: new Tone.NoiseSynth({envelope: {decay:0.15}}).toDestination(),
                    membrane: new Tone.MembraneSynth({envelope: {decay:0.1}}).toDestination()
                },
                hiHat: new Tone.NoiseSynth({envelope: {decay:0.05}, filter: new Tone.Filter(8000, "highpass")}).toDestination(),
                crash: new Tone.MetalSynth({envelope: {decay:1.5}}).toDestination(),
                tom: new Tone.MembraneSynth({envelope: {decay:0.25}}).toDestination()
            };
            offlineSynths.snare.noise.connect(offlineSynths.snare.membrane);
            offlineSynths.snare.membrane.volume.value = -12;
            offlineSynths.snare.noise.volume.value = -6;


            INSTRUMENT_NAMES.forEach(instrumentName => {
                const partData = [];
                currentPattern[instrumentName].forEach((isActive, step) => {
                    if (isActive) partData.push(`0:0:${step}`);
                });

                new Tone.Part((time) => {
                     if (instrumentName === 'snare') {
                        offlineSynths.snare.noise.triggerAttackRelease(time);
                        offlineSynths.snare.membrane.triggerAttackRelease("C2", "16n", time + 0.001);
                    } else {
                        let note = 'C2'; let duration = '16n';
                        if(instrumentName === 'tom') note = 'G2';
                        if(instrumentName === 'crash') duration = '1n';
                        if (offlineSynths[instrumentName] instanceof Tone.MembraneSynth || offlineSynths[instrumentName] instanceof Tone.MetalSynth) {
                             offlineSynths[instrumentName].triggerAttackRelease(note, duration, time);
                        } else if (offlineSynths[instrumentName] instanceof Tone.NoiseSynth) {
                             offlineSynths[instrumentName].triggerAttackRelease(time);
                        }
                    }
                }, partData).start(0).loop = false; // No loop for offline render of one bar
            });
            offlineTransport.bpm.value = Tone.Transport.bpm.value;
            offlineTransport.swing = Tone.Transport.swing; // Apply swing if active
            offlineTransport.start();
        }, Tone.Time('1m').toSeconds()); // Render for the duration of one measure

        // Convert AudioBuffer to WAV
        const wavBlob = audioBufferToWav(buffer);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drum-pattern-${genreSelect.value}-${bpmInput.value}bpm.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (e) {
        console.error("Error rendering WAV:", e);
        alert("Could not export WAV. See console for details.");
    } finally {
        playStopButton.disabled = false;
        exportWavButton.textContent = "Export WAV";
    }
}

// Helper function: AudioBuffer to WAV (from standard web examples)
function audioBufferToWav(buffer) {
    let numOfChan = buffer.numberOfChannels,
        len = buffer.length * numOfChan * 2 + 44,
        abuffer = new ArrayBuffer(len),
        view = new DataView(abuffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    // write WAV container
    setUint32(0x46464952); // "RIFF"
    setUint32(len - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit track

    setUint32(0x61746164); // "data" - chunk
    setUint32(len - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
        channels.push(buffer.getChannelData(i));

    while (pos < len) {
        for (i = 0; i < numOfChan; i++) { // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true); // write 16-bit sample
            pos += 2;
        }
        offset++; // next source sample
        if (offset >= buffer.length) break; // Check to prevent reading past buffer length
    }

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
    return new Blob([view], {type: 'audio/wav'});
}


// --- Initialization ---
function init() {
    createMidiGrid();
    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = '1m';
    Tone.Transport.bpm.value = parseInt(bpmInput.value, 10);

    generateButton.addEventListener('click', handleGenerate);
    playStopButton.addEventListener('click', handlePlayStop);
    bpmInput.addEventListener('change', handleBpmChange);
    bpmInput.addEventListener('input', handleBpmChange); // For more responsive BPM update
    genreSelect.addEventListener('change', handleGenreChange);
    exportMidiButton.addEventListener('click', exportMIDI);
    exportWavButton.addEventListener('click', exportWAV);

    // Generate an initial pattern on load
    handleGenreChange(); // This will call handleGenerate

    // Adjust playhead on window resize
    window.addEventListener('resize', () => {
        const firstStepCell = midiGridDiv.querySelector('.step');
        if (firstStepCell) {
            playheadDiv.style.width = `${firstStepCell.offsetWidth}px`;
        }
        // If playing, re-setup playhead to correctly calculate positions with new widths
        if (isPlaying) {
            setupPlayhead();
        }
    });
    console.log("Drum Machine Initialized. Tone.js version:", Tone.version);
}

// Start the application after DOM is ready
document.addEventListener('DOMContentLoaded', init);
