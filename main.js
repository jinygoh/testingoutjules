window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('glCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser or machine may not support it.");
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Set the viewport to cover the entire canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Basic clear to test
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clear(gl.COLOR_BUFFER_BIT);

    console.log("WebGL initialized successfully.");

    // --- Shader Compilation and Linking ---

    let shaderProgram;

    // Function to load a shader from a URL
    async function loadShaderSource(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch shader: ${url} ${response.statusText}`);
        }
        return response.text();
    }

    // Function to create and compile a shader
    function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const errorMsg = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compilation failed: ${errorMsg}`);
        }
        return shader;
    }

    // Function to create, link, and use the shader program
    async function setupShaderProgram(gl) {
        let vsSource, fsSource;
        try {
            vsSource = await loadShaderSource('vertexShader.glsl');
            fsSource = await loadShaderSource('fragmentShader.glsl');
        } catch (error) {
            console.error(error);
            alert(`Error loading shaders: ${error.message}`);
            return null;
        }

        let vertexShader, fragmentShader;
        try {
            vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
            fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
        } catch (error) {
            console.error(error);
            alert(`Error compiling shaders: ${error.message}`);
            return null;
        }

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            const errorMsg = gl.getProgramInfoLog(shaderProgram);
            gl.deleteProgram(shaderProgram); // Clean up
            gl.deleteShader(vertexShader); // Clean up
            gl.deleteShader(fragmentShader); // Clean up
            throw new Error(`Shader program linking failed: ${errorMsg}`);
        }

        console.log("Shader program compiled and linked successfully.");
        return shaderProgram;
    }

    let buffers; // To store buffer info

    // Initialize shaders
    setupShaderProgram(gl).then(program => {
        if (program) {
            shaderProgram = program;
            buffers = initBuffers(gl, shaderProgram); // Store returned buffer info
            if (buffers) {
                console.log("Shader program is ready and buffers initialized.");
                requestAnimationFrame(render); // Start the render loop
            } else {
                console.error("Buffer initialization failed. Cannot start render loop.");
            }
        } else {
            console.error("Failed to initialize shader program.");
        }
    }).catch(error => {
        console.error("Error in shader program setup:", error);
        alert(`Critical error setting up shaders: ${error.message}`);
    });

    // --- Buffer Initialization ---
    function initBuffers(gl, program) {
        // A simple square plane (2 triangles)
        // X, Y coordinates. Z is 0 for a 2D plane on screen.
        const positions = [
            // Triangle 1
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            // Triangle 2
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0,
        ];

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Get the attribute location
        const positionAttributeLocation = gl.getAttribLocation(program, 'aVertexPosition');
        if (positionAttributeLocation === -1) {
            console.error("Attribute 'aVertexPosition' not found in shader program.");
            return;
        }

        // Point an attribute to the currently bound VBO
        gl.vertexAttribPointer(
            positionAttributeLocation,
            2, // 2 components per iteration (x, y)
            gl.FLOAT, // type of data
            false, // normalize
            0, // stride (0 = use type and numComponents above)
            0 // offset (0 = start at the beginning of the buffer)
        );
        gl.enableVertexAttribArray(positionAttributeLocation);

        console.log("Buffers initialized and attribute linked.");
        return {
            position: positionBuffer,
            vertexCount: positions.length / 2, // 2 components per vertex
        };
    }

    // --- Render Loop ---
    let then = 0;
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        // --- Drawing ---
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // Ensure viewport is set correctly
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear color and depth buffers

        // Tell WebGL to use our program
        gl.useProgram(shaderProgram);

        // Set time uniform
        const timeUniformLocation = gl.getUniformLocation(shaderProgram, "u_time");
        gl.uniform1f(timeUniformLocation, now);

        // Bind the attribute/buffer set we want.
        // (We only have one set of buffers for now, but this would be where you switch them)
        // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position); // Already bound from initBuffers and attribute pointer set

        // Draw the geometry
        const primitiveType = gl.TRIANGLES;
        const offset = 0;
        gl.drawArrays(primitiveType, offset, buffers.vertexCount);

        requestAnimationFrame(render); // Request the next frame
    }
});
