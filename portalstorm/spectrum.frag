#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float spike_gradient(float iterable, float max_value) {
    // returns gradient from 0 -> max_value
    float max_x2 = max_value * 2.0;
    float gradient_value = mod(iterable, max_x2);
    if (gradient_value > max_value) {
        gradient_value = max_x2 - gradient_value;
    }
    return gradient_value;
}

float sawtooth_gradient(float iterable, float min_value, float max_value) {
    float gradient_value = mod(iterable, max_value-min_value);
    return min_value + gradient_value;

}

void main() {
    vec2 coord = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(103.0/255.0, 216.0/255.0, 244.0/255.0);

    float t_sawtooth = sawtooth_gradient(u_time/2.0, 0.0, 1.2);
    float c_dist = distance(coord, vec2(0.5, 0.5))-t_sawtooth;
    float colorshift = spike_gradient(c_dist, 152.0/255.0);
    color.x = clamp(color.x+colorshift, 0.0, 1.0);
    color.y = clamp(color.y+colorshift, 0.0, 1.0);
    color.z = clamp(color.z+colorshift, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
}
