#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_date;

bool values_match(float v1, float v2, float tolerance) {
    return v1 < v2 + tolerance && v1 > v2 - tolerance;
}

float spike_gradient(float iterable, float max_value) {
    // returns gradient from 0 -> max_value
    float max_x2 = max_value * 2.0;
    float gradient_value = mod(iterable, max_x2);
    if (gradient_value > max_value) {
        gradient_value = max_x2 - gradient_value;
    }
    return gradient_value;
}

float sawtooth_gradient(float iterable, float max_value) {
    // returns gradient from 0 -> max_value
    return mod(iterable, max_value);
}

void main() {
    // constants for generating grid
    const float MAX_LEN = 0.1;
    const float MIN_LEN = 0.095;
    const int N_COLS = 5;

    // 2D prototype
    vec2 coord = gl_FragCoord.xy/u_resolution;

    // main logic
    const float ADJUST = 0.0001;
    const float TOLERANCE = 0.025;
    float COL_WIDTH = 1.0/float(N_COLS);
    float horizontal_offset = mod(u_time, 1.0);
    float color = 0.0;

    float scroll_gradient = sawtooth_gradient(u_time, 0.2);
    float mode_gradient = sawtooth_gradient(u_time, 2.0);
    bool render_vertical = mode_gradient > 1.0;
    if (mode_gradient > 1.0 && mod(coord.y-scroll_gradient, COL_WIDTH) <= TOLERANCE) {
        color = 1.0;
    }
    if (mode_gradient < 1.0 && mod(coord.x-scroll_gradient, COL_WIDTH) <= TOLERANCE) {
        color = 1.0;
    }

    gl_FragColor = vec4(color, color, color, 1.0);
}
