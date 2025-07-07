/**
 * @file visuals.js
 * Manages the WebGL-based visual generation for the Aura application using Three.js.
 * Key functions include:
 * - Initializing the Three.js scene, camera, and renderer.
 * - Running the main render loop (requestAnimationFrame).
 * - Updating shader uniforms based on time and audio analysis data.
 * - Placeholder for loading and managing GLSL shaders for different visual concepts.
 * - Handling window resize events to adjust camera and renderer.
 * Receives audio analysis data from app.js (originating from audio.js) to drive audio-reactive visuals.
 */

console.log("visuals.js loaded");

let scene, camera, renderer;
let canvasElement;
// Shader materials will be defined here later
// let fluidMaterial, fractalMaterial, reactionDiffusionMaterial;

// Audio analysis data (to be updated from audio.js or app.js)
let audioFeatures = {
    overallAmplitude: 0,
    lowBandEnergy: 0,
    midBandEnergy: 0,
    highBandEnergy: 0,
};

let isVisualsRunning = false;

/**
 * Initializes the visual engine (e.g., Three.js).
 * @param {HTMLCanvasElement} canvas - The canvas element to render on.
 */
export function init(canvas) {
    canvasElement = canvas;
    console.log("Initializing visuals on canvas:", canvasElement);

    // Basic Three.js setup (example)
    try {
        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Example: Add a simple cube to verify setup
        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // const cube = new THREE.Mesh(geometry, material);
        // scene.add(cube);

        // Placeholder for shader-based plane
        const planeGeometry = new THREE.PlaneGeometry(window.innerWidth / 100, window.innerHeight / 100, 1, 1); // Adjust size as needed
        // A very basic shader material
        const basicShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec2 uResolution;
                uniform float uAmplitude;
                uniform float uLowEnergy;
                uniform float uMidEnergy;
                uniform float uHighEnergy;

                void main() {
                    vec2 uv = gl_FragCoord.xy / uResolution.xy;
                    float basePattern = 0.5 + 0.5 * sin(uv.x * (5.0 + uLowEnergy * 5.0) + uTime + uAmplitude * 5.0 + uv.y * (3.0 + uMidEnergy * 5.0));

                    vec3 color = vec3(
                        basePattern * (0.5 + uLowEnergy * 0.5),  // Red channel influenced by low energy
                        basePattern * (0.5 + uMidEnergy * 0.5), // Green channel by mid
                        basePattern * (0.5 + uHighEnergy * 0.5) // Blue channel by high
                    );
                    // Add some overall brightness based on amplitude
                    color *= (0.7 + uAmplitude * 0.3);

                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            uniforms: {
                uTime: { value: 0.0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uAmplitude: { value: 0.0 }, // Overall loudness
                uLowEnergy: { value: 0.0 },  // Bass frequencies
                uMidEnergy: { value: 0.0 },  // Mid frequencies
                uHighEnergy: { value: 0.0 } // High frequencies
            }
        });
        const shaderPlane = new THREE.Mesh(planeGeometry, basicShaderMaterial);
        scene.add(shaderPlane);


        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);

        console.log("Three.js initialized.");
        // Start the render loop if not already started by play button
        // if (isVisualsRunning) {
        //    render();
        //}

    } catch (e) {
        console.error("Error initializing Three.js:", e);
        if (e.message.includes("WebGLRenderer")) {
             alert("Could not initialize WebGL. Your browser or graphics card may not support it.");
        } else if (typeof THREE === 'undefined') {
            alert("Three.js library not found. Make sure it's included in your HTML.");
        } else {
            alert("An error occurred setting up the visuals.");
        }
    }
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Update shader resolution uniform if materials are set up
        scene.traverse(child => {
            if (child.material && child.material.uniforms && child.material.uniforms.uResolution) {
                child.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
            }
        });
        console.log("Visuals resized.");
    }
}

/**
 * The main render loop.
 */
function render() {
    if (!isVisualsRunning || !renderer || !scene || !camera) return;

    requestAnimationFrame(render);

    const time = performance.now() * 0.001; // Current time in seconds

    // Update shader uniforms
    scene.traverse(child => {
        if (child.isMesh && child.material && child.material.uniforms) {
            if (child.material.uniforms.uTime) {
                child.material.uniforms.uTime.value = time;
            }
            if (child.material.uniforms.uAmplitude) {
                child.material.uniforms.uAmplitude.value = audioFeatures.overallAmplitude;
            }
            if (child.material.uniforms.uLowEnergy) {
                child.material.uniforms.uLowEnergy.value = audioFeatures.lowBandEnergy;
            }
            if (child.material.uniforms.uMidEnergy) {
                child.material.uniforms.uMidEnergy.value = audioFeatures.midBandEnergy;
            }
            if (child.material.uniforms.uHighEnergy) {
                child.material.uniforms.uHighEnergy.value = audioFeatures.highBandEnergy;
            }
        }
    });

    // Example: Rotate the cube (if it exists)
    // scene.traverse(child => {
    //     if (child.isMesh && child.geometry.type === "BoxGeometry") {
    //         child.rotation.x += 0.01 * (1.0 + audioFeatures.lowBandEnergy * 2.0);
    //         child.rotation.y += 0.005 * (1.0 + audioFeatures.midBandEnergy * 2.0);
    //     }
    // });

    renderer.render(scene, camera);
}

/**
 * Starts the visual rendering loop.
 */
export function start() {
    if (!isVisualsRunning) {
        isVisualsRunning = true;
        console.log("Visuals started.");
        if (renderer) { // Check if Three.js is initialized
             render(); // Start the loop
        } else {
            console.warn("Renderer not ready, visuals will start once init completes.");
        }
    }
}

/**
 * Pauses the visual rendering loop.
 */
export function pause() {
    if (isVisualsRunning) {
        isVisualsRunning = false;
        console.log("Visuals paused.");
    }
}

/**
 * Updates the audio features used by the visuals.
 * This function should be called by the audio engine or main app
 * with data from an AnalyserNode.
 * @param {object} features - Object containing audio analysis data.
 * e.g., { overallAmplitude: 0-1, lowBandEnergy: 0-1, ... }
 */
export function updateAudioFeatures(features) {
    if (features) {
        audioFeatures.overallAmplitude = features.overallAmplitude !== undefined ? features.overallAmplitude : audioFeatures.overallAmplitude;
        audioFeatures.lowBandEnergy = features.lowBandEnergy !== undefined ? features.lowBandEnergy : audioFeatures.lowBandEnergy;
        audioFeatures.midBandEnergy = features.midBandEnergy !== undefined ? features.midBandEnergy : audioFeatures.midBandEnergy;
        audioFeatures.highBandEnergy = features.highBandEnergy !== undefined ? features.highBandEnergy : audioFeatures.highBandEnergy;
    }
}


// --- Placeholder for GLSL Shaders ---
// These will be large strings or loaded from separate .glsl files in a real setup.

const SHADER_FLUID_DYNAMICS = {
    vertex: `
        void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragment: `
        uniform float uTime;
        uniform vec2 uResolution;
        // Add more uniforms for audio reactivity, colors etc.
        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            float c = smoothstep(0.4, 0.6, sin(uv.x * 10.0 + uTime + sin(uv.y * 5.0 + uTime * 0.5)));
            gl_FragColor = vec4(c * uv.x, c * uv.y, c, 1.0);
        }
    `
};

// TODO:
// - Load Three.js library (e.g., via CDN in index.html or by bundling)
// - Implement actual shader code for fluid dynamics, fractals, reaction-diffusion.
// - Create materials using these shaders.
// - Add logic to switch or blend between different visual scenes/shaders.
// - Derive color palettes from song key/mode.
// - More sophisticated audio feature extraction and mapping to visual parameters.

// Make sure Three.js is loaded before calling init.
// A common pattern is to put the Three.js CDN script in the <head> of index.html.
// Example: <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
// Ensure this is present in index.html for the current init function to work.
// For this step, we'll assume it will be added or handle the error gracefully.

// Check if THREE is available
if (typeof THREE === 'undefined') {
    console.warn("THREE.js library not detected. Visuals will not initialize until it's loaded.");
    // Optionally, could try to load it dynamically here, but CDN in HTML is simpler for now.
}
