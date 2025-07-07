// Procedural Drum Pattern Generator

const INSTRUMENTS = ['kick', 'snare', 'hiHat', 'crash', 'tom'];
const STEPS_PER_BAR = 16;

// Helper function to create an empty pattern for one instrument
function createEmptyInstrumentPattern() {
    return Array(STEPS_PER_BAR).fill(0);
}

// Helper function to create a full empty pattern
function createEmptyPattern() {
    const pattern = {};
    INSTRUMENTS.forEach(inst => {
        pattern[inst] = createEmptyInstrumentPattern();
    });
    return pattern;
}

// --- Genre Specific Generation Logics ---

// House: Four-on-the-floor kick, snare on 2 & 4, off-beat 16th-note hi-hats.
function generateHousePattern(pattern) {
    // Kick: 1, 5, 9, 13 (four on the floor)
    for (let i = 0; i < STEPS_PER_BAR; i += 4) {
        pattern.kick[i] = 1;
    }

    // Snare: 5, 13 (on 2 and 4)
    pattern.snare[4] = 1;
    pattern.snare[12] = 1;

    // Hi-Hat: Off-beat 16ths (e.g., 3, 7, 11, 15) or every 8th/16th
    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (i % 2 !== 0) { // Off-beat 8ths
             if (Math.random() < 0.8) pattern.hiHat[i] = 1;
        }
        // Add some 16ths for variation
        if (i % 2 === 0 && Math.random() < 0.2) { // On-beat 8ths, less likely
            pattern.hiHat[i] = 1;
        }
    }

    // Crash: Occasionally on the 1
    if (Math.random() < 0.25) pattern.crash[0] = 1;

    // Toms: Sparse fills
    if (Math.random() < 0.2) {
        const tomPlacement = Math.floor(Math.random() * 3) + 12; // last quarter bar
        pattern.tom[tomPlacement] = 1;
        if (Math.random() < 0.5 && tomPlacement < 15) pattern.tom[tomPlacement + 1] = (Math.random() < 0.7 ? 1:0);
    }
    return pattern;
}

// Techno: Similar to House but often faster, more driving.
function generateTechnoPattern(pattern) {
    // Kick: Almost always four on the floor, very consistent
    for (let i = 0; i < STEPS_PER_BAR; i += 4) {
        pattern.kick[i] = 1;
    }
    // Sometimes a syncopated kick
    if (Math.random() < 0.15) {
        pattern.kick[Math.random() < 0.5 ? 6 : 14] = 1;
    }


    // Snare: Usually on 2 & 4, sometimes with off-beat accents
    pattern.snare[4] = 1;
    pattern.snare[12] = 1;
    if (Math.random() < 0.1) pattern.snare[Math.random() < 0.5 ? 7 : 15] =1;


    // Hi-Hat: Consistent 16ths or driving 8ths.
    const hiHatMode = Math.random();
    if (hiHatMode < 0.6) { // Consistent 16ths
        for (let i = 0; i < STEPS_PER_BAR; i++) {
            if (Math.random() < 0.85) pattern.hiHat[i] = 1;
        }
    } else { // Driving 8ths (on beats or off-beats)
        const offBeat = Math.random() < 0.5;
        for (let i = offBeat ? 1 : 0; i < STEPS_PER_BAR; i += 2) {
             if (Math.random() < 0.9) pattern.hiHat[i] = 1;
        }
    }

    // Crash: Rarely, maybe on the 1 every few bars (simulated with low probability)
    if (Math.random() < 0.15) pattern.crash[0] = 1;

    // Toms: Minimal, often single hits for accents
    if (Math.random() < 0.15) {
        pattern.tom[Math.floor(Math.random() * STEPS_PER_BAR)] = 1;
    }
    return pattern;
}

// Hip-Hop (90s Boom Bap): Syncopated, often swung kick/snare patterns.
function generateHipHopPattern(pattern) {
    // Kick: Syncopated, not strictly on grid. Common on 1, and various 8th/16th offbeats.
    pattern.kick[0] = 1; // Usually a kick on 1
    if (Math.random() < 0.7) pattern.kick[Math.random() < 0.5 ? 3:2] = 1; // e.g., 1_e, 1_a
    if (Math.random() < 0.6) pattern.kick[Math.random() < 0.5 ? 5:6] = 1; // near the 2
    if (Math.random() < 0.8) pattern.kick[8] = 1; // Often a kick on 3
    if (Math.random() < 0.5) pattern.kick[Math.random() < 0.5 ? 10:11] = 1;
    if (Math.random() < 0.7) pattern.kick[Math.random() < 0.5 ? 13:14] = 1;


    // Snare: Typically on 2 and 4, but can have ghost notes or slight pushes/pulls.
    pattern.snare[4] = 1;
    pattern.snare[12] = 1;
    if (Math.random() < 0.3) pattern.snare[Math.random() < 0.5 ? 11 : 13] = (Math.random() < 0.5 ? 1:0); // Ghost before/after main snare

    // Hi-Hat: Often straight 8ths or 16ths, sometimes with swing. Can be sparse.
    const hiHatDensity = Math.random();
    if (hiHatDensity < 0.4) { // Sparse 8ths
        for (let i = 0; i < STEPS_PER_BAR; i += 2) {
            if (Math.random() < 0.6) pattern.hiHat[i] = 1;
        }
    } else if (hiHatDensity < 0.8) { // Fuller 8ths/16ths
        for (let i = 0; i < STEPS_PER_BAR; i++) {
            if (i % 2 === 0 && Math.random() < 0.7) pattern.hiHat[i] = 1; // 8ths
            else if (i % 2 !== 0 && Math.random() < 0.3) pattern.hiHat[i] = 1; // 16th fills
        }
    } // Else, very sparse or no hi-hats

    // Crash: Infrequent, for emphasis.
    if (Math.random() < 0.2) pattern.crash[0] = 1;

    // Toms: Rare, simple fills.
    if (Math.random() < 0.1) {
        const tomStart = Math.floor(Math.random() * 12);
        pattern.tom[tomStart] = 1;
        if (Math.random() < 0.5) pattern.tom[tomStart + 2] = 1;
    }
    return pattern;
}

// Trap: Sparse, heavy kick, syncopated snares/claps, complex hi-hats.
function generateTrapPattern(pattern) {
    // Kick: Sparse, syncopated, often an 808 sound. Focus on beats 1 and offbeats.
    pattern.kick[0] = 1; // Strong kick on 1
    if (Math.random() < 0.6) pattern.kick[6] = 1; // e.g., before the snare on 2
    if (Math.random() < 0.4) pattern.kick[7] = 1;
    if (Math.random() < 0.7) pattern.kick[10] = 1; // Syncopated kick after 3
    if (Math.random() < 0.5) pattern.kick[14] = 1;

    // Snare/Clap: Often on 3, or syncopated around 2 and 4.
    if (Math.random() < 0.8) pattern.snare[4] = 1; // Traditional spot
    else pattern.snare[6] = 1; // Syncopated
    pattern.snare[12] = 1; // Usually a strong one on 4 (equivalent of 3 in double time)
    if (Math.random() < 0.3) pattern.snare[Math.floor(Math.random()*3) + 13] = 1; // Syncopated end of bar

    // Hi-Hat: Complex patterns - 8ths, 16ths, triplets, 32nds.
    // Simplified here: mix of 8ths and 16ths, with occasional faster bursts.
    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (i % 2 === 0 && Math.random() < 0.7) pattern.hiHat[i] = 1; // 8th notes
        else if (Math.random() < 0.5) pattern.hiHat[i] = 1; // 16th notes

        // Simulate occasional fast rolls (e.g., two 32nds = one 16th slot)
        if (Math.random() < 0.15 && i < STEPS_PER_BAR -1) {
            pattern.hiHat[i] = 1;
            pattern.hiHat[i+1] = (Math.random() < 0.8 ? 1:0) ; // Could be a 32nd, or just a dense 16th
            i++; // Skip next step as it's part of the "roll"
        }
    }
    // Ensure some gaps for breathing room
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(Math.random() < 0.1) pattern.hiHat[i] = 0;
    }


    // Crash: Infrequent, often at start or major transitions.
    if (Math.random() < 0.15) pattern.crash[0] = 1;

    // Toms: Very rare in typical trap, more common in subgenres.
    if (Math.random() < 0.05) pattern.tom[Math.floor(Math.random() * STEPS_PER_BAR)] = 1;

    return pattern;
}

// Rock: Kick on 1 & 3, snare on 2 & 4, steady 8th-note hi-hats.
function generateRockPattern(pattern) {
    // Kick: 1 & 3, sometimes with variations.
    pattern.kick[0] = 1;
    pattern.kick[8] = 1;
    if (Math.random() < 0.3) pattern.kick[2] = 1; // "and" of 1
    if (Math.random() < 0.2) pattern.kick[6] = 1; // before 3
    if (Math.random() < 0.2) pattern.kick[10] = 1; // "and" of 3
    if (Math.random() < 0.1) pattern.kick[14] = 1; // before 1 of next bar

    // Snare: Solid 2 & 4.
    pattern.snare[4] = 1;
    pattern.snare[12] = 1;

    // Hi-Hat: Steady 8th notes.
    for (let i = 0; i < STEPS_PER_BAR; i += 2) {
        if (Math.random() < 0.9) pattern.hiHat[i] = 1;
    }
    // Occasional open hi-hat or slightly more complex rhythm
    if (Math.random() < 0.2) {
        const openHatPos = (Math.floor(Math.random()*4) * 2) + 1; // Off-beat 8th
        if(openHatPos < STEPS_PER_BAR) pattern.hiHat[openHatPos] = 1; // Represent as closed for now
    }

    // Crash: Often on 1, sometimes at the end of fills.
    if (Math.random() < 0.3) pattern.crash[0] = 1;

    // Toms: Used for fills, often at the end of a phrase (bar).
    if (Math.random() < 0.3) {
        const fillStart = Math.random() < 0.5 ? 12 : 14;
        for (let i = fillStart; i < STEPS_PER_BAR; i++) {
            if (Math.random() < 0.6) pattern.tom[i] = 1;
        }
    }
    return pattern;
}

// Funk: Highly syncopated kick and snare, groovy 16th-note hi-hats.
function generateFunkPattern(pattern) {
    // Kick: Highly syncopated. Focus on 16th note grooves.
    pattern.kick[0] = 1; // Often on 1
    for (let i = 1; i < STEPS_PER_BAR; i++) {
        if (Math.random() < 0.25) pattern.kick[i] = 1; // Higher chance for syncopation
    }
    // Ensure some common funk anchor points
    if (Math.random() < 0.6) pattern.kick[6] = 1; // e.g., "e of 2"
    if (Math.random() < 0.5) pattern.kick[10] = 1; // e.g., "e of 3"

    // Snare: Syncopated, ghost notes common. Standard 2 & 4 are anchors.
    pattern.snare[4] = 1;
    pattern.snare[12] = 1;
    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (i !== 4 && i !== 12 && Math.random() < 0.15) { // Ghost notes
            pattern.snare[i] = 1;
        }
    }

    // Hi-Hat: Busy 16th notes, sometimes with accents or openings.
    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (Math.random() < 0.75) pattern.hiHat[i] = 1;
    }
    // Create some gaps for groove
    if(Math.random() < 0.5) pattern.hiHat[Math.floor(Math.random()*STEPS_PER_BAR)] = 0;
    if(Math.random() < 0.5) pattern.hiHat[Math.floor(Math.random()*STEPS_PER_BAR)] = 0;


    // Crash: Used for accents, not too frequent.
    if (Math.random() < 0.2) pattern.crash[Math.random() < 0.5 ? 0 : Math.floor(Math.random()*STEPS_PER_BAR)] = 1;

    // Toms: Short, syncopated fills.
    if (Math.random() < 0.25) {
        const tomStart = Math.floor(Math.random() * (STEPS_PER_BAR - 3));
        pattern.tom[tomStart] = 1;
        if (Math.random() < 0.7) pattern.tom[tomStart + (Math.random() < 0.5 ? 1:2)] = 1;
    }
    return pattern;
}

// Reggaeton: Dembow rhythm (kick: 1, 2+, 3, 4+; snare: 2, 3+, 4).
function generateReggaetonPattern(pattern) {
    // Kick: Classic Dembow kick pattern
    pattern.kick[0] = 1; // 1
    // pattern.kick[3] = 1; // "a" of 1 (optional variation)
    pattern.kick[4] = 1; // 2 (often, or implied by snare) - variation: kick on 2+, snare on 2
    pattern.kick[6] = 1; // "and" of 2 (2+)
    pattern.kick[8] = 1; // 3
    pattern.kick[10] = 1; // "and" of 3 (3+) - variation: kick on 3, snare on 3+
    // pattern.kick[12] = 1; // 4 (often, or implied by snare)
    pattern.kick[14] = 1; // "and" of 4 (4+)


    // Snare: Classic Dembow snare/rimshot pattern
    // Standard: Snare on 2, 3+, 4
    // Variation 1: Snare on 2, + of 2, + of 3, + of 4
    // Variation 2 (common): Snare on 2, 3+, 4
    // Let's go with a common one: snare on beats 2 and 4, with an accent on the 'and' of beat 2 or 3.
    // Simplified Dembow: Kick on 1, x, x, x, Snare on x, 2, x, 4
    // Kick: 1, 2+, 3, 4+ (0, 6, 8, 14)
    // Snare: 2, 3+, 4 (4, 10, 12) - this is a common variant

    // Let's try the "tumpa-tumpa" feel:
    // Kick on all quarter notes is foundational
    for(let i=0; i<STEPS_PER_BAR; i+=4) pattern.kick[i] = 1;

    // Snare provides the characteristic syncopation
    pattern.snare[3] = 1; // "a" of 1
    pattern.snare[7] = 1; // "a" of 2
    pattern.snare[11] = 1; // "a" of 3
    pattern.snare[14] = 1; // "e" of 4 (or 15 for "a" of 4)

    // Hi-Hat: Usually straight 8ths or 16ths.
    for (let i = 0; i < STEPS_PER_BAR; i += 2) { // 8th notes
        if (Math.random() < 0.8) pattern.hiHat[i] = 1;
    }

    // Crash: Rarely.
    if (Math.random() < 0.1) pattern.crash[0] = 1;

    // Toms: Can be used for small fills, often syncopated.
    if (Math.random() < 0.15) {
        pattern.tom[Math.random() < 0.5 ? 5:7] = 1;
        pattern.tom[Math.random() < 0.5 ? 13:15] = 1;
    }
    return pattern;
}

// Jazz (Swing): Sparse ride/hihat, kick "feathering", snare "comping".
// Note: Actual swing feel is applied by Tone.Transport.swing, this generates placement.
function generateJazzPattern(pattern) {
    // Kick: Light accents ("feathering"), often not on main beats.
    // Typically very sparse.
    if (Math.random() < 0.3) pattern.kick[0] = 1; // Sometimes on 1
    const kick placements = [3, 7, 10, 11, 14, 15]; // Possible off-beats for feathering
    kick placements.forEach(p => {
        if (Math.random() < 0.15) pattern.kick[p] = 1;
    });

    // Snare: Accents ("comping"), irregular and syncopated.
    const snarePlacements = [2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15];
    snarePlacements.forEach(p => {
        if (Math.random() < 0.12) pattern.snare[p] = 1; // Low probability for sparse comping
    });
    if(pattern.snare.every(s => s === 0) && Math.random() < 0.5) { // Ensure at least one snare hit sometimes
        pattern.snare[Math.random() < 0.5 ? 4 : 12] = 1; // Default to 2 or 4 if totally empty
    }


    // Hi-Hat: Simulating ride cymbal pattern (e.g., "ching-chicka-ching").
    // Basic swing ride: 1, 2+, 3, 4+ (0, 3, 4, 7, 8, 11, 12, 15 in 8th notes if straight)
    // In 16ths: 0, (2), 3, 4, (6), 7, 8, (10), 11, 12, (14), 15
    // Let's simplify to main beats and their upbeats for swing feel
    pattern.hiHat[0] = 1; // Beat 1
    if (Math.random() < 0.8) pattern.hiHat[3] = 1; // Upbeat of 1 (will be swung)
    pattern.hiHat[4] = 1; // Beat 2
    if (Math.random() < 0.8) pattern.hiHat[7] = 1; // Upbeat of 2
    pattern.hiHat[8] = 1; // Beat 3
    if (Math.random() < 0.8) pattern.hiHat[11] = 1; // Upbeat of 3
    pattern.hiHat[12] = 1; // Beat 4
    if (Math.random() < 0.8) pattern.hiHat[15] = 1; // Upbeat of 4
    // Sometimes hi-hat on 2 and 4 (pedal)
    if(Math.random() < 0.4) {
        pattern.hiHat[4] = 1;
        pattern.hiHat[12] = 1;
    }


    // Crash: Very rare, usually for specific accents.
    if (Math.random() < 0.05) pattern.crash[0] = 1;

    // Toms: Almost never in traditional swing comping, more in fills between sections.
    // For a one-bar pattern, keep it minimal or none.
    if (Math.random() < 0.05) pattern.tom[Math.floor(Math.random() * STEPS_PER_BAR)] = 1;
    return pattern;
}

// Bossa Nova: Clave-based, syncopated.
function generateBossaNovaPattern(pattern) {
    // Kick: Often syncopated, based on surdo pattern.
    // Common: 1, + of 2, (3), + of 4  (0, 7, (8), 15)
    pattern.kick[0] = 1;
    if (Math.random() < 0.7) pattern.kick[7] = 1; // "and" of 2
    if (Math.random() < 0.4) pattern.kick[8] = 1; // on 3
    if (Math.random() < 0.7) pattern.kick[15] = 1; // "and" of 4 (or 14 for "e")

    // Snare: Often rim clicks, follows clave or side-stick pattern.
    // 3-2 clave on side stick: 0, 3, 6, 10, 14 (as 8th notes)
    // In 16ths: 0, 2, 4, 6, 7, 10, 11, 14, 15 (approx)
    // Let's use a simplified cross-stick pattern: typically on 2 and 4, or syncopated.
    // A common bossa snare/rim pattern:
    pattern.snare[2] = 1;
    pattern.snare[5] = 1;
    pattern.snare[8] = 1;
    pattern.snare[11] = 1;
    pattern.snare[14] = 1;


    // Hi-Hat: Continuous 8th notes, sometimes with slight accents.
    for (let i = 0; i < STEPS_PER_BAR; i += 2) {
        if (Math.random() < 0.9) pattern.hiHat[i] = 1;
    }
    // Add some 16th flavour
    if(Math.random() < 0.3) pattern.hiHat[3] = 1;
    if(Math.random() < 0.3) pattern.hiHat[7] = 1;
    if(Math.random() < 0.3) pattern.hiHat[11] = 1;
    if(Math.random() < 0.3) pattern.hiHat[15] = 1;


    // Crash: Very rarely used.
    if (Math.random() < 0.05) pattern.crash[0] = 1;

    // Toms: Not typical for core Bossa Nova rhythm.
    return pattern;
}

// Experimental (No Rules): Creative chaos.
function generateExperimentalPattern(pattern) {
    INSTRUMENTS.forEach(inst => {
        for (let i = 0; i < STEPS_PER_BAR; i++) {
            // Higher probability for notes, more syncopation, polyrhythms.
            // Each instrument has a different random threshold.
            const threshold = 0.1 + Math.random() * 0.4; // Varies from 0.1 to 0.5
            if (Math.random() < threshold) {
                pattern[inst][i] = 1;
            }
        }
    });
    // Ensure it's not *too* dense or *too* sparse by randomly adding/removing a few more
    for(let k=0; k<5; k++){
        let inst = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
        let step = Math.floor(Math.random() * STEPS_PER_BAR);
        pattern[inst][step] = Math.random() < 0.6 ? 1:0; // 60% chance to set, 40% to clear
    }
    return pattern;
}


// --- Main Generator Function ---
export function generatePattern(genre, fusionGenres = []) {
    let pattern = createEmptyPattern();

    // Base pattern generation based on genre
    let basePatternSource = genre;
    if (genre === "genre-fusion" && fusionGenres.length === 2) {
        basePatternSource = fusionGenres[0]; // Kick/Snare from first fusion genre
    }

    switch (basePatternSource) {
        case 'house':
            generateHousePattern(pattern);
            break;
        case 'techno':
            generateTechnoPattern(pattern);
            break;
        case 'hiphop':
            generateHipHopPattern(pattern);
            break;
        case 'trap':
            generateTrapPattern(pattern);
            break;
        case 'rock':
            generateRockPattern(pattern);
            break;
        case 'funk':
            generateFunkPattern(pattern);
            break;
        case 'reggaeton':
            generateReggaetonPattern(pattern);
            break;
        case 'jazz':
            generateJazzPattern(pattern);
            break;
        case 'bossa-nova':
            generateBossaNovaPattern(pattern);
            break;
        case 'experimental':
            generateExperimentalPattern(pattern);
            break;
        // Default to house if genre is unknown (should not happen with dropdown)
        default:
            console.warn(`Unknown base genre: ${basePatternSource}, defaulting to House.`);
            generateHousePattern(pattern);
    }

    // If Genre Fusion, apply hi-hat, cymbal, tom rules from the second genre
    if (genre === "genre-fusion" && fusionGenres.length === 2) {
        const secondaryGenre = fusionGenres[1];
        // Create a temporary pattern for secondary elements
        let secondaryPattern = createEmptyPattern();
        switch (secondaryGenre) {
            case 'house':
                generateHousePattern(secondaryPattern);
                break;
            case 'techno':
                generateTechnoPattern(secondaryPattern);
                break;
            case 'hiphop':
                generateHipHopPattern(secondaryPattern);
                break;
            case 'trap':
                generateTrapPattern(secondaryPattern);
                break;
            case 'rock':
                generateRockPattern(secondaryPattern);
                break;
            case 'funk':
                generateFunkPattern(secondaryPattern);
                break;
            case 'reggaeton':
                generateReggaetonPattern(secondaryPattern);
                break;
            case 'jazz':
                generateJazzPattern(secondaryPattern); // hihats will be swing-like
                break;
            case 'bossa-nova':
                generateBossaNovaPattern(secondaryPattern);
                break;
            case 'experimental': // Allow experimental secondary elements
                 generateExperimentalPattern(secondaryPattern);
                 break;
            default:
                console.warn(`Unknown secondary fusion genre: ${secondaryGenre}, using House for secondary elements.`);
                generateHousePattern(secondaryPattern);
        }
        // Copy only the hi-hat, crash, and tom from the secondary pattern
        pattern.hiHat = secondaryPattern.hiHat;
        pattern.crash = secondaryPattern.crash;
        pattern.tom = secondaryPattern.tom;
    } else if (genre === "experimental") {
        // If the main genre is experimental, it already handled all instruments.
        // No further action needed here.
    }


    // Final check: ensure Experimental isn't *completely* silent if it's the primary genre
    if (genre === "experimental") {
        let totalHits = 0;
        INSTRUMENTS.forEach(inst => {
            totalHits += pattern[inst].reduce((sum, hit) => sum + hit, 0);
        });
        if (totalHits < 2) { // If extremely sparse, regenerate for more chaos
            console.log("Experimental pattern too sparse, regenerating for more chaos...");
            pattern = createEmptyPattern(); // Reset
            generateExperimentalPattern(pattern); // Regenerate experimental part
        }
    }


    return pattern;
}

// For "Genre Fusion", app.js will need to pick two random genres (excluding "Genre Fusion" itself and "Experimental")
// and pass their string names as the `fusionGenres` array.
// Example: generatePattern("genre-fusion", ["hiphop", "techno"])
// This would use hiphop for kick/snare, and techno for hihat/crash/tom.
// If "Experimental" is one of the chosen fusion genres, its rules will apply to its designated part.
// For example, ["rock", "experimental"] would be rock kick/snare, experimental hihats/toms/crash.
// ["experimental", "house"] would be experimental kick/snare, house hihats/toms/crash.

export const GENRE_LIST = [
    "house", "techno", "hiphop", "trap", "rock", "funk", "reggaeton", "jazz", "bossa-nova"
]; // For fusion mode to pick from these standard ones. Experimental is not included here for fusion base.

export const ALL_GENRES_INCLUDING_SPECIAL = [
    ...GENRE_LIST, "experimental", "genre-fusion"
];

// Simple test (run in browser console if testing this file standalone for basic output)
// setTimeout(() => {
//     console.log("House Pattern:", generatePattern("house"));
//     console.log("Experimental Pattern:", generatePattern("experimental"));
//     console.log("Genre Fusion (HipHop Kick/Snare, Techno HH/Crash/Tom):", generatePattern("genre-fusion", ["hiphop", "techno"]));
//     console.log("Genre Fusion (Rock Kick/Snare, Experimental HH/Crash/Tom):", generatePattern("genre-fusion", ["rock", "experimental"]));
// }, 100);
