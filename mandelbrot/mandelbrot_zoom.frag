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

vec2 mandelbrot_fn(vec2 z) {
    return vec2((z.x*z.x) - (z.y*z.y), 2.0*z.x*z.y);
}

void main() {
    vec2 coord = gl_FragCoord.xy/u_resolution;
    //float zoom = cos(spike_gradient(u_time/10.0, 1.5, 2.5)) * (1.0 + (u_time/1000.0));
    //float shift = mod(u_time/3.0, 2.5)/9.0;
    //float zoom = 2.5 - mod(u_time/3.0, 2.5);
    float zoom = 1.0 / (10000.0*spike_gradient(u_time/20.0, 0.0, 1.0));
    //float zoom = 1.0 / 10000.0;
    const float MAX_ITER = 200.0;

    // see the entire shape
    vec2 shift = vec2(0.8, 0.49);
    vec2 center_c = (coord - shift) * 2.5;
    //vec2 c = (coord - shift) * zoom; // visible
    vec2 center = vec2(-.65, 0.45);
    vec2 c = center + (coord*zoom);
    float iterations;
    vec2 z = c;
    for (iterations = 0.0; iterations < MAX_ITER && length(z) < 2.0; iterations++) {
        // apply mandelbrot function
        z = mandelbrot_fn(z) + c;
    }
    float f = iterations/MAX_ITER;

    float g = 0.0;
    if (distance(c, shift) < 0.1) {
        g = 1.0;
    }

    gl_FragColor = vec4(z.x, g, z.y, 1.0);
}
