/**
 * @file audio.js
 * Handles all Web Audio API interactions for the Aura application.
 * This includes:
 * - Initialization of the AudioContext and master audio chain (gain, compressor, limiter, reverb).
 * - Placeholder functions for synthesizing various instrument sounds (Pads, Sub Bass, Arps, etc.).
 * - The core audio scheduling loop responsible for timing and sequencing musical events.
 * - Playback control functions (start, stop, pause, resume).
 * - Audio analysis using an AnalyserNode to provide data for visuals.
 */

console.log("audio.js loaded");

let audioContext;
let mainGainNode;
let reverbNode;
let compressorNode;
let limiterNode;

// To be loaded - path to a hall or cathedral impulse response
let impulseResponseBuffer = null;

/**
 * Initializes the AudioContext. Must be called after a user gesture (e.g., button click).
 * @returns {AudioContext|null} The initialized AudioContext or null if failed.
 */
export function initAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("AudioContext initialized successfully.");
        setupMasterChannel();
        initAudioAnalysisArrays(); // Initialize arrays after analyserNode is created
        return audioContext;
    } catch (e) {
        console.error("Error initializing AudioContext:", e);
        alert("Web Audio API is not supported in this browser or could not be initialized.");
        return null;
    }
}

/**
 * Sets up the master audio channel with gain, reverb, compressor, and limiter.
 */
function setupMasterChannel() {
    if (!audioContext) return;

    mainGainNode = audioContext.createGain();
    mainGainNode.gain.value = 0.7; // Default master volume

    // Reverb Bus (ConvolverNode)
    reverbNode = audioContext.createConvolver();
    // Impulse response will be loaded later

    // Compressor
    compressorNode = audioContext.createDynamicsCompressor();
    compressorNode.threshold.setValueAtTime(-20, audioContext.currentTime); // dB
    compressorNode.knee.setValueAtTime(30, audioContext.currentTime);      // dB
    compressorNode.ratio.setValueAtTime(6, audioContext.currentTime);      // Reduced ratio for gentler compression
    compressorNode.attack.setValueAtTime(0.003, audioContext.currentTime); // seconds
    compressorNode.release.setValueAtTime(0.4, audioContext.currentTime);  // Slightly longer release for smoothness

    // Limiter (using a simple DynamicsCompressor with high ratio)
    limiterNode = audioContext.createDynamicsCompressor();
    limiterNode.threshold.setValueAtTime(-0.5, audioContext.currentTime); // dB, slightly higher for more perceived loudness
    limiterNode.knee.setValueAtTime(0, audioContext.currentTime);        // dB (hard knee)
    limiterNode.ratio.setValueAtTime(20, audioContext.currentTime);      // High ratio for limiting
    limiterNode.attack.setValueAtTime(0.001, audioContext.currentTime);  // Fast attack
    limiterNode.release.setValueAtTime(0.1, audioContext.currentTime);   // Slightly slower release for smoother limiting

    // Connect the master chain:
    // Dry path: mainGainNode -> compressorNode
    // Wet path (Reverb): reverbNode -> compressorNode (so reverb is also compressed)
    // Then: compressorNode -> limiterNode -> audioContext.destination

    mainGainNode.connect(compressorNode);
    reverbNode.connect(compressorNode); // Reverb output also goes to the compressor

    // Analyser Node for visuals
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048; // Default is 2048. Larger values give more frequency resolution.
    // analyserNode.smoothingTimeConstant = 0.8; // Default 0.8. Smoothes changes over time.

    compressorNode.connect(analyserNode); // Feed compressed signal to analyser
    analyserNode.connect(limiterNode);    // Then analyser to limiter
    limiterNode.connect(audioContext.destination);

    console.log("Master audio channel configured with AnalyserNode. Main gain and Reverb -> Compressor -> Analyser -> Limiter -> Destination.");
}

let analyserNode;
let frequencyDataArray; // Uint8Array for frequency data
let timeDomainDataArray; // Uint8Array for waveform data

/**
 * Initializes the arrays for audio analysis data.
 * Must be called after analyserNode is created.
 */
function initAudioAnalysisArrays() {
    if (analyserNode) {
        frequencyDataArray = new Uint8Array(analyserNode.frequencyBinCount);
        timeDomainDataArray = new Uint8Array(analyserNode.fftSize); // or frequencyBinCount for waveform
        console.log(`Audio analysis arrays initialized. Frequency bins: ${analyserNode.frequencyBinCount}`);
    } else {
        console.error("AnalyserNode not ready for array initialization.");
    }
}


/**
 * Retrieves and processes audio analysis data.
 * @returns {object|null} An object with audio features (e.g., overallAmplitude, energies) or null.
 */
export function getAudioAnalysisData() {
    if (!analyserNode || !frequencyDataArray || !timeDomainDataArray) {
        // Attempt to initialize if not ready, happens if getAudioAnalysisData is called before first play
        if (analyserNode && (!frequencyDataArray || !timeDomainDataArray)) {
            initAudioAnalysisArrays();
            if (!frequencyDataArray) return null; // Still couldn't init
        } else {
            return null; // Analyser not even created
        }
    }

    analyserNode.getByteFrequencyData(frequencyDataArray);
    analyserNode.getByteTimeDomainData(timeDomainDataArray); // For waveform shape or more detailed amplitude

    // Calculate overall amplitude (RMS from time domain data)
    let sumSquares = 0.0;
    for (let i = 0; i < timeDomainDataArray.length; i++) {
        const normSample = (timeDomainDataArray[i] / 128.0) - 1.0; // Normalize to -1.0 to 1.0
        sumSquares += normSample * normSample;
    }
    const rms = Math.sqrt(sumSquares / timeDomainDataArray.length);
    const overallAmplitude = Math.min(1.0, rms * 2.5); // Amplify for better visual range, then clamp

    // Calculate energy in frequency bands (example: bass, mids, highs)
    const binCount = analyserNode.frequencyBinCount;
    const bassEndIndex = Math.floor(250 / (audioContext.sampleRate / 2) * binCount); // Up to 250Hz
    const midEndIndex = Math.floor(2000 / (audioContext.sampleRate / 2) * binCount); // 250Hz to 2000Hz

    let bassEnergy = 0;
    for (let i = 0; i < bassEndIndex; i++) {
        bassEnergy += frequencyDataArray[i];
    }
    bassEnergy = (bassEnergy / (bassEndIndex * 255)) * 2.0; // Normalize and boost
    bassEnergy = Math.min(1.0, bassEnergy);


    let midEnergy = 0;
    for (let i = bassEndIndex; i < midEndIndex; i++) {
        midEnergy += frequencyDataArray[i];
    }
    midEnergy = (midEnergy / ((midEndIndex - bassEndIndex) * 255)) * 1.5;
    midEnergy = Math.min(1.0, midEnergy);

    let highEnergy = 0;
    for (let i = midEndIndex; i < binCount; i++) {
        highEnergy += frequencyDataArray[i];
    }
    highEnergy = (highEnergy / ((binCount - midEndIndex) * 255)) * 1.5;
    highEnergy = Math.min(1.0, highEnergy);

    return {
        overallAmplitude: parseFloat(overallAmplitude.toFixed(3)),
        lowBandEnergy: parseFloat(bassEnergy.toFixed(3)),
        midBandEnergy: parseFloat(midEnergy.toFixed(3)),
        highBandEnergy: parseFloat(highEnergy.toFixed(3)),
        // rawFrequencyData: frequencyDataArray, // Optionally pass raw data
        // rawTimeDomainData: timeDomainDataArray
    };
}

/**
 * Loads an impulse response for the ConvolverNode.
 * @param {string} url Path to the impulse response audio file.
 */
export async function loadImpulseResponse(url) {
    if (!audioContext || !reverbNode) {
        console.error("AudioContext or ReverbNode not initialized.");
        return;
    }
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
            impulseResponseBuffer = buffer;
            reverbNode.buffer = impulseResponseBuffer;
            console.log("Impulse response loaded and set for ReverbNode:", url);
        }, (e) => {
            console.error("Error decoding impulse response data:", e);
        });
    } catch (e) {
        console.error("Error fetching impulse response:", e);
    }
}


// --- Instrument Creation Functions (Placeholders) ---

/**
 * Creates a lush pad sound.
 * @param {object} params - Pad parameters (oscillators, filter, envelope).
 * @returns {AudioNode} - The output node for the pad instrument.
 */
export function createPad(params) {
    if (!audioContext) return null;
    // Logic for creating pad sound (multiple oscillators, filter, LFO, slow attack/release)
    // Connect to mainGainNode for dry signal.
    // Connect to reverbNode via a send gain node for wet signal (subtle reverb).
    // Example:
    // const dryGain = audioContext.createGain();
    // const wetGain = audioContext.createGain(); wetGain.gain.value = 0.2; // Subtle reverb
    // mainOscillatorOutput.connect(dryGain); dryGain.connect(mainGainNode);
    // mainOscillatorOutput.connect(wetGain); wetGain.connect(reverbNode);
    // Return an object { input: mainOscillatorInput, output: dryGain (or a master gain for the pad) }
    console.log("createPad called with params:", params);
    // Placeholder:
    const gain = audioContext.createGain();
    // gain.connect(mainGainNode); // Example direct connection
    return gain;
}

/**
 * Creates a sub bass sound.
 * @param {object} params - Sub bass parameters (frequency, envelope).
 * @returns {AudioNode} - The output node for the sub bass.
 */
export function createSubBass(params) {
    if (!audioContext) return null;
    // Logic for sine wave sub bass.
    // Connect directly to mainGainNode. Keep Sub Bass DRY (no reverb).
    console.log("createSubBass called with params:", params);
    // Placeholder:
    const gain = audioContext.createGain();
    // gain.connect(mainGainNode); // Example direct connection
    return gain;
}

/**
 * Creates an arpeggiator.
 * @param {object} params - Arpeggiator parameters (waveform, pattern, delay, reverb).
 * @returns {AudioNode} - The output node for the arpeggiator.
 */
export function createArpeggiator(params) {
    if (!audioContext) return null;
    // Logic for arpeggiator (soft waveform, randomized velocity, ping-pong delay, heavy reverb).
    // Connect to mainGainNode for dry signal (can be low or off if delay/reverb is 100% wet).
    // Connect to reverbNode via a send gain node (generous reverb).
    // Ping-pong delay would be part of this instrument's internal chain before its output.
    console.log("createArpeggiator called with params:", params);
    // Placeholder:
    const gain = audioContext.createGain();
    // gain.connect(mainGainNode);
    // const reverbSendGain = audioContext.createGain(); reverbSendGain.gain.value = 0.8;
    // gain.connect(reverbSendGain); reverbSendGain.connect(reverbNode);
    return gain;
}

/**
 * Creates a lead melody voice.
 * @param {object} params - Melody parameters (waveform, vibrato, envelope).
 * @returns {AudioNode} - The output node for the lead.
 */
export function createLeadMelody(params) {
    if (!audioContext) return null;
    // Logic for lead melody (sine wave, vibrato, simple, slow, infrequent).
    // Connect to mainGainNode for dry signal.
    // Connect to reverbNode via a send gain node (generous reverb).
    console.log("createLeadMelody called with params:", params);
    // Placeholder:
    const gain = audioContext.createGain();
    // gain.connect(mainGainNode);
    // const reverbSendGain = audioContext.createGain(); reverbSendGain.gain.value = 0.7;
    // gain.connect(reverbSendGain); reverbSendGain.connect(reverbNode);
    return gain;
}

/**
 * Creates tonal percussion sounds.
 * @param {object} params - Percussion parameters (waveform, envelope, reverb).
 * @returns {AudioNode} - The output node for tonal percussion.
 */
export function createTonalPercussion(params) {
    if (!audioContext) return null;
    // Logic for bell-like plucks (triangle wave, fast-decaying envelope, drenched in reverb).
    // Connect to mainGainNode for dry signal (likely very low or off).
    // Connect to reverbNode via a send gain node (heavy reverb - "drenched").
    console.log("createTonalPercussion called with params:", params);
    // Placeholder:
    const gain = audioContext.createGain();
    // gain.connect(mainGainNode); mainGainNode.gain.value = 0.1; // very low dry
    // const reverbSendGain = audioContext.createGain(); reverbSendGain.gain.value = 1.0; // max send
    // gain.connect(reverbSendGain); reverbSendGain.connect(reverbNode);
    return gain;
}

/**
 * Creates an atmospheric texture (e.g., filtered noise).
 * @param {object} params - Texture parameters.
 * @returns {AudioNode} - The output node for the atmospheric texture.
 */
export function createAtmosphericTexture(params) {
    if (!audioContext) return null;
    // Logic for filtered pink/brown noise (constant, low-volume bed).
    // Connect directly to mainGainNode. Generally kept dry or with its own subtle reverb if desired,
    // but the prompt implies it's more of a foundational texture, so dry into main mix is fine.
    console.log("createAtmosphericTexture called with params:", params);
    // Placeholder:
    const gain = audioContext.createGain();
    // gain.connect(mainGainNode);
    return gain;
}

// --- Playback Control & Scheduling ---

let schedulerTimer = null;
let nextNoteTime = 0.0;         // AudioContext time for the next event batch
const scheduleAheadTime = 0.2;  // How far ahead to schedule audio events (seconds)
const lookaheadInterval = 50.0; // How often the scheduler wakes up (ms)

let currentSongParameters = null;
let activeInstruments = {}; // { pad: padNode, bass: bassNode, ... }
let isSchedulerRunning = false;

// Musical time tracking
let currentBar = 0;
let currentBeat = 0; // Assuming 4/4 time for now for beat calculations
let currentChordIndex = 0;
let currentSectionIndex = 0;
let timePerBeat = 0;
let timePerBar = 0;
let nextSectionTime = Infinity;
let nextChordTime = 0;


function scheduleNote(instrument, noteTime, duration, pitch, velocity) {
    // Placeholder: In a real scenario, this would interact with instrument-specific
    // methods to play a note.
    // e.g., instrument.playNote(noteTime, duration, pitch, velocity);
    console.log(`SCHED: ${instrument} note at ${noteTime.toFixed(3)}s, pitch ${pitch}, vel ${velocity}, dur ${duration.toFixed(3)}s`);

    // Example of how an instrument might handle this (conceptual)
    // if (activeInstruments[instrument] && activeInstruments[instrument].play) {
    //     activeInstruments[instrument].play(pitch, velocity, noteTime, duration);
    // }
}

function scheduler() {
    if (!isSchedulerRunning) return;

    const now = audioContext.currentTime;

    // Schedule events that fall within the scheduleAheadTime window
    while (nextNoteTime < now + scheduleAheadTime) {
        // --- Section Transition Logic ---
        if (nextNoteTime >= nextSectionTime && currentSongParameters) {
            currentSectionIndex++;
            if (currentSectionIndex < currentSongParameters.songStructure.length) {
                const newSection = currentSongParameters.songStructure[currentSectionIndex];
                console.log(`SCHED: Transitioning to section ${newSection.name} at ${nextNoteTime.toFixed(3)}s`);
                // TODO: Implement logic to adjust instrument gains/presence based on newSection.intensity
                // This involves long crossfades - will need careful management of gain nodes.
                nextSectionTime = nextNoteTime + (newSection.durationBars * timePerBar);
            } else {
                console.log("SCHED: End of song structure reached.");
                // TODO: Handle song end (e.g., fade out, schedule next song)
                stopPlayback(); // Simple stop for now
                return; // Exit scheduler
            }
        }

        // --- Chord Progression Logic ---
        if (nextNoteTime >= nextChordTime && currentSongParameters) {
            currentChordIndex = (currentChordIndex + 1) % currentSongParameters.chordProgression.length;
            const currentChord = currentSongParameters.chordProgression[currentChordIndex];
            console.log(`SCHED: Next chord ${currentChord.qualityName} (root MIDI: ${currentChord.rootNoteMidi}) at ${nextNoteTime.toFixed(3)}s`);
            // TODO: Update instruments with the new chord context.
            // For now, assume chords last 1 bar. This needs to be more flexible.
            nextChordTime = nextNoteTime + timePerBar;
        }

        // --- Note Generation Logic (Highly Simplified Placeholder) ---
        // This is where each instrument's logic would come into play,
        // interpreting the rhythmicDNA, current chord, section intensity, etc.

        // Example: Play a pad note at the start of each beat
        if (activeInstruments.pad) {
            // Determine pitch, velocity, duration based on currentChord, section, rhythmicDNA
            // scheduleNote('pad', nextNoteTime, timePerBeat, currentSongParameters.chordProgression[currentChordIndex].rootNoteMidi, 0.5);
        }
        // Example: Play a sub bass note at the start of each chord change
        if (activeInstruments.subBass && nextNoteTime === (nextChordTime - timePerBar) ) { // If it's the start of a new chord
             // scheduleNote('subBass', nextNoteTime, timePerBar, currentSongParameters.chordProgression[currentChordIndex].rootNoteMidi, 0.7);
        }


        // Advance musical time by one beat (simplification)
        currentBeat++;
        if (currentBeat >= 4) { // Assuming 4 beats per bar
            currentBeat = 0;
            currentBar++;
        }
        nextNoteTime += timePerBeat;
    }

    schedulerTimer = setTimeout(scheduler, lookaheadInterval);
}

export function startPlayback(songParams) {
    if (!audioContext) {
        console.error("AudioContext not initialized. Cannot start playback.");
        return;
    }
    if (!songParams) {
        console.error("No song parameters provided to startPlayback.");
        return;
    }

    stopPlayback(); // Clear any previous state

    currentSongParameters = songParams;
    console.log(`Starting playback for song with seed: ${currentSongParameters.seed}, Tempo: ${currentSongParameters.tempo} BPM`);

    // Calculate time conversions
    timePerBeat = 60.0 / currentSongParameters.tempo;
    timePerBar = timePerBeat * 4; // Assuming 4/4 time for now

    // Initialize instruments (placeholder connections)
    // TODO: Implement actual instrument creation and connection to mainGainNode and/or reverbNode
    // activeInstruments.pad = createPad({});
    // if(activeInstruments.pad) activeInstruments.pad.connect(mainGainNode);
    // activeInstruments.subBass = createSubBass({});
    // if(activeInstruments.subBass) activeInstruments.subBass.connect(mainGainNode);
    // ... and so on for arpeggio, lead, bells, atmosphere

    // Reset playback state
    currentBar = 0;
    currentBeat = 0;
    currentChordIndex = -1; // Will be incremented to 0 on first chord event
    currentSectionIndex = 0;

    const firstSection = currentSongParameters.songStructure[0];
    nextSectionTime = audioContext.currentTime + (firstSection.durationBars * timePerBar);
    nextChordTime = audioContext.currentTime; // First chord change happens immediately

    nextNoteTime = audioContext.currentTime + 0.05; // Start scheduling slightly ahead

    isSchedulerRunning = true;
    scheduler(); // Start the scheduling loop

    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => console.log("AudioContext resumed for playback."));
    }
    console.log("Playback setup complete. Scheduler running.");
    // Fade in master volume
    if (mainGainNode) {
        mainGainNode.gain.cancelScheduledValues(audioContext.currentTime);
        mainGainNode.gain.setValueAtTime(0, audioContext.currentTime); // Start from 0
        mainGainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.5); // Fade to target volume (0.7 default) in 0.5s
    }
}

export function pausePlayback() {
    if (!audioContext || !isSchedulerRunning) return;
    console.log("Pausing playback.");
    isSchedulerRunning = false;
    if (schedulerTimer) {
        clearTimeout(schedulerTimer);
        schedulerTimer = null;
    }

    if (mainGainNode && audioContext.state === 'running') {
        // Store current gain before suspending, to restore it on resume
        // This is a simplified approach. A more robust way would be to also track scheduled ramps.
        // For now, just ramp down.
        mainGainNode.gain.cancelScheduledValues(audioContext.currentTime);
        mainGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2); // Quick fade out before suspend
    }

    // Suspend after a short delay to allow fade out to complete
    setTimeout(() => {
        if (audioContext.state === 'running') {
            audioContext.suspend().then(() => {
                console.log("AudioContext suspended after fade out.");
                timeAtPause = audioContext.currentTime; // Store precise time of suspension
                // Calculate musical beat at pause time.
                // This requires knowing how many beats have elapsed since song start.
                // currentBar * 4 + currentBeat gives beats in current scheduler cycle,
                // but scheduler's nextNoteTime is what we need.
                // This is still an approximation.
                if (timePerBeat > 0) {
                    const beatsSinceScheduledStart = (timeAtPause - (nextNoteTime - timePerBeat) ) / timePerBeat;
                    pausedBeat = currentBeat + beatsSinceScheduledStart; // This needs more robust calculation
                } else {
                    pausedBeat = currentBeat;
                }

            });
        }
    }, 250); // Must be > fade out time
}

// Store the musical time (in beats) when paused
let pausedBeat = 0; // The beat number within the song when pause occurred
let timeAtPause = 0; // audioContext.currentTime when pause occurred (or suspend completed)

export function resumePlayback() {
    if (!audioContext) return;
    console.log("Resuming playback.");

    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log("AudioContext resumed.");
            if (mainGainNode) {
                mainGainNode.gain.cancelScheduledValues(audioContext.currentTime);
                mainGainNode.gain.setValueAtTime(0, audioContext.currentTime); // Start from 0 after resume
                mainGainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.5); // Fade in
            }

            if (currentSongParameters && !isSchedulerRunning) {
                // Try to resynchronize timing based on how long we were paused
                const timeSincePause = audioContext.currentTime - timeAtPause;
                const beatsElapsedDuringPause = timeSincePause / timePerBeat;
                let newCurrentBeat = (pausedBeat + beatsElapsedDuringPause);

                // Adjust nextNoteTime: it should be the time of the beat we are resuming at.
                // This requires knowing the absolute start time of the song or bar.
                // This is a simplified resync:
                nextNoteTime = audioContext.currentTime + ( (1 - (newCurrentBeat % 1) ) * timePerBeat );
                currentBeat = Math.floor(newCurrentBeat % 4); // Assuming 4 beats per bar
                // currentBar needs more careful calculation based on total elapsed beats.

                // For a simpler, but potentially less accurate resume:
                // nextNoteTime = audioContext.currentTime + 0.05; // Small lookahead

                isSchedulerRunning = true;
                scheduler();
                console.log("Scheduler restarted on resume.");
            }
        });
    } else if (currentSongParameters && !isSchedulerRunning) {
        // Context was running, but scheduler wasn't (e.g., after skip while paused)
        if (mainGainNode) { // Also fade in if we are starting scheduler
            mainGainNode.gain.cancelScheduledValues(audioContext.currentTime);
            mainGainNode.gain.setValueAtTime(0, audioContext.currentTime);
            mainGainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.5);
        }
        nextNoteTime = audioContext.currentTime + 0.05;
        isSchedulerRunning = true;
        scheduler();
        console.log("Scheduler restarted (context was already running).");
    }
}

const FADE_TIME = 0.5; // seconds for fade out

export function stopPlayback() {
    if (!audioContext) return;
    console.log("Stopping playback and clearing scheduled events.");

    isSchedulerRunning = false;
    if (schedulerTimer) {
        clearTimeout(schedulerTimer);
        schedulerTimer = null;
    }

    if (mainGainNode) {
        mainGainNode.gain.cancelScheduledValues(audioContext.currentTime);
        mainGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + FADE_TIME);
    }

    // After fade out, properly stop and disconnect all active instrument nodes
    setTimeout(() => {
        Object.values(activeInstruments).forEach(inst => {
            // This assumes instruments have a general 'stop' or 'disconnect' method.
            // For Web Audio nodes, it means calling .stop() on sources and .disconnect() on nodes.
            // This part needs to be implemented robustly when instruments are defined.
            if (inst && typeof inst.stop === 'function') {
                inst.stop(audioContext.currentTime); // Stop any internal sources
            }
            if (inst && typeof inst.disconnect === 'function') {
                inst.disconnect(); // Disconnect from audio graph
            }
        });
        activeInstruments = {}; // Clear active instruments
        console.log("Instruments stopped and disconnected after fade.");
    }, FADE_TIME * 1000 + 50); // Delay a bit longer than fade time


    currentSongParameters = null; // Clear current song
    // Reset musical time variables
    nextNoteTime = 0.0;
    currentBar = 0;
    currentBeat = 0;
    currentChordIndex = 0;
    currentSectionIndex = 0;
    nextSectionTime = Infinity;
    nextChordTime = 0;

    // It's good practice to also cancel any scheduled AudioParam changes if possible,
    // though this is harder if they are already in flight. Stopping gain nodes is effective.
    console.log("Playback stopped, state reset.");
}

/**
 * Prepares a track based on song parameters without starting playback immediately.
 * Useful for when the player is paused and user hits "skip".
 * @param {object} songParams - The parameters for the song to prepare.
 */
export function prepareTrack(songParams) {
    if (!audioContext) return;
    if (!songParams) {
        console.error("No song parameters provided to prepareTrack.");
        return;
    }
    console.log(`Preparing track for seed: ${songParams.seed} (not starting playback)`);

    stopPlayback(); // Clear previous state first

    currentSongParameters = songParams;
    timePerBeat = 60.0 / currentSongParameters.tempo;
    timePerBar = timePerBeat * 4; // Assuming 4/4

    // Initialize instruments (but don't start them playing)
    // activeInstruments.pad = createPad({});
    // ... etc.
    // This part is mostly about having currentSongParameters ready.
    // The actual scheduling will only happen if/when playback is (re)started.

    // Reset playback state variables as in startPlayback, but don't start scheduler
    currentBar = 0;
    currentBeat = 0;
    currentChordIndex = -1;
    currentSectionIndex = 0;

    const firstSection = currentSongParameters.songStructure[0];
    // These times would be relative to a future audioContext.currentTime if playback starts
    // For now, can set them conceptually or based on a hypothetical start time of 0.
    // When resumePlayback or startPlayback is called, these will be anchored to actual audioContext.currentTime.
    nextSectionTime = (firstSection.durationBars * timePerBar); // Relative duration
    nextChordTime = 0; // Relative duration

    console.log("Track prepared. Instruments would be set up here if not for placeholders.");
}

// --- Utility Functions ---
/**
 * Returns the current AudioContext.
 * @returns {AudioContext}
 */
export function getAudioContext() {
    return audioContext;
}

/**
 * Returns the main gain node.
 * @returns {GainNode}
 */
export function getMainGainNode() {
    return mainGainNode;
}

/**
 * Returns the reverb node (ConvolverNode).
 * @returns {ConvolverNode}
 */
export function getReverbNode() {
    return reverbNode;
}

// Add other necessary audio utility functions here (e.g., noteToFrequency, envelope controls)
