#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main() {
    vec2 c = ((gl_FragCoord.xy/u_resolution) - vec2(0.8, 0.49)) * 2.5;
    vec2 z = c;
    for (float i = 0.0; i < 700.0 && length(z) < 2.0; i++) {
        z = vec2((z.x*z.x) - (z.y*z.y), 2.0*z.x*z.y) + c;  // mandelbrot function
    }

    gl_FragColor = vec4(z.x, (z.x+z.y)/2.0, z.y, 1.0);
}
