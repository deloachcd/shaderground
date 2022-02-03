#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec4 u_date;
uniform float u_time;

float spike_gradient(float iterable, float min_value, float max_value) {
    float half_value_range = max_value - min_value;
    float value_range = half_value_range * 2.0;
    float gradient_value = mod(iterable, value_range);
    if (gradient_value > half_value_range) {
        gradient_value = value_range - gradient_value;
    }
    return gradient_value;
}

float sawtooth_gradient(float iterable, float min_value, float max_value) {
    float gradient_value = mod(iterable, max_value-min_value);
    return min_value + gradient_value;

}

float square(float value) {
    return value * value;
}

void main() {
    vec2 coord = gl_FragCoord.xy/u_resolution;
    float r_min = 103.0/255.0;
    float g_min = 216.0/255.0;
    float b_min = 244.0/255.0;
    vec3 initial_color = vec3(r_min, g_min, b_min);
    vec3 color = vec3(r_min, g_min, b_min);

    float t_sawtooth = sawtooth_gradient(u_time/2.0, 0.0, 1.2);
    float t_curve = 3.9 * square(mod(u_time/10.0, 0.5));
    // NOTE if you divide 1.0 by distance, you can get an interesting tunnel
    // effect that may be worth exploring for another purpose
    //
    // e.x. starfield, second reality tunnel dots
    float c_dist = distance(coord, vec2(0.5, 0.5));
    float colorshift = 1.0 - (5.0 * square(spike_gradient(c_dist, 0.0, 152.0/255.0)));
    color.x = clamp(color.x+colorshift, r_min, 1.0);
    color.y = clamp(color.y+colorshift, g_min, 1.0);
    color.z = clamp(color.z+colorshift, b_min, 1.0);

    gl_FragColor = vec4(color, 1.0);
}
