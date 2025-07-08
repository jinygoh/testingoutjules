// Vertex Shader

attribute vec2 aVertexPosition; // Now vec2 since we are primarily 2D for the plane

uniform float u_time; // Time uniform for animation

// Basic pseudo-random number generator
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Basic 2D noise function (Value Noise)
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth interpolation (smoothstep)
    vec2 u = f * f * (3.0 - 2.0 * f);
    // vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0); // Perlin's improved smoothstep

    return mix(a, b, u.x) +
           (c - a)* u.y * (1.0 - u.x) +
           (d - b) * u.y * u.x;
}

varying float v_height; // Pass height to fragment shader for coloring

void main() {
  vec2 basePos = aVertexPosition;
  vec2 pos = basePos;

  // More complex landscape deformation
  // Noise for general height/main structure
  float mainNoiseVal = noise(basePos * 2.0 + u_time * 0.05); // Slower, larger features

  // Noise for distortion/flow field - apply to x and y
  float flowXNoise = noise(basePos * 1.5 + u_time * 0.1 + 10.0); // Offset to get different noise pattern
  float flowYNoise = noise(basePos * 1.5 + u_time * 0.1 + 20.0); // Offset further

  v_height = mainNoiseVal; // Pass the main structural noise for coloring

  // Displace x and y for a more liquid/warping effect
  // The displacement is influenced by the main noise value as well, making higher areas potentially move differently
  pos.x += (flowXNoise - 0.5) * 0.3 * (1.0 + mainNoiseVal * 0.5); // flowXNoise is 0-1, center it; 0.3 strength
  pos.y += (flowYNoise - 0.5) * 0.3 * (1.0 + mainNoiseVal * 0.5); // mainNoiseVal adds some height-based distortion strength

  // Add some of the main noise to y for undulation as well
  pos.y += mainNoiseVal * 0.15; // Reduced strength compared to previous simple y displacement

  // Ensure positions stay somewhat within clip space, though some clipping is fine for effect
  pos = clamp(pos, -1.0, 1.0);

  gl_Position = vec4(pos, 0.0, 1.0); // z = 0, w = 1
}
