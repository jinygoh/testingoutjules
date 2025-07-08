// Fragment Shader

precision highp float;

varying float v_height; // Received from vertex shader, typically -0.5 to 0.5 from noise
uniform float u_time;   // Time for animation

// Function to convert HSL to RGB
// H, S, L values are assumed to be in [0, 1]
// Returns a vec3 containing R, G, B values in [0, 1]
vec3 hslToRgb(float h, float s, float l) {
    float r, g, b;

    if (s == 0.0) {
        r = g = b = l; // achromatic
    } else {
        float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
        float p = 2.0 * l - q;
        r = hueToRgb(p, q, h + 1.0/3.0);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1.0/3.0);
    }
    return vec3(r, g, b);
}

float hueToRgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0/2.0) return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
}

void main() {
  // Normalize v_height a bit more if needed, though our noise is somewhat in -0.5 to 0.5
  // For more predictable HSL, let's try to map it to 0-1
  float normalized_height = v_height + 0.5; // Assuming noise is -0.5 to 0.5

  // Psychedelic color cycling with HSL
  // Hue cycles with time, creating a rainbow shift.
  // Slower base cycle for hypnotic feel, more influence from height for detail.
  float hue = fract(u_time * 0.03 + normalized_height * 0.5);

  // Saturation: Keep it high and vibrant. Modulate slightly for a "breathing" effect.
  float saturation = 0.85 + 0.15 * sin(u_time * 0.2 + normalized_height * 3.0);
  saturation = clamp(saturation, 0.7, 1.0); // Keep saturation generally high

  // Lightness: More dynamic range, can create deeper valleys and brighter peaks.
  // Using v_height directly (which is -0.5 to 0.5) can give interesting effects.
  // Adding a slower overall pulse to lightness.
  float baseLightness = 0.5 + 0.2 * cos(u_time * 0.1);
  float heightInfluenceOnLightness = v_height * 0.3; // v_height is pre-normalization, so -0.5 to 0.5
  float lightness = baseLightness + heightInfluenceOnLightness;
  lightness = clamp(lightness, 0.2, 0.8); // Avoid pure black or white, keep it surreal.

  vec3 color = hslToRgb(hue, saturation, lightness);

  // Optional: Add a subtle overlay or effect, like a faint "energy" glow based on time
  // For example, slightly boost a channel based on time
  // color.rb += 0.05 * sin(u_time * 0.5 + v_height * 10.0); // Pulsate red/blue channels slightly

  gl_FragColor = vec4(color, 1.0);
}
