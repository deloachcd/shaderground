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
    coord -= vec2(1.4, 0.4);

    float zoom = cos(spike_gradient(u_time/10.0, 1.5, 2.5)) * (1.0 + (u_time/1000.0));
    coord /= zoom;
    const float MAX_ITER = 100.0;

    vec2 z = coord;
    float iterations = 0.0;
    while (iterations < MAX_ITER && length(z) < 2.0) {
        // apply mandelbrot function
        z = mandelbrot_fn(z) + coord;
        iterations += 1.0;
    }
    float f = iterations/MAX_ITER;
    vec3 color;
    if (iterations <= 256.0) {
        color = vec3(iterations/256.0, 0.0, 0.0);
    } else if (iterations > 256.0 && iterations <= 512.0) {
        color = vec3(256.0, mod(iterations,256.0), 0.0);
    } else {
        color = vec3(256.0, 256.0, mod(iterations,256.0));
    }

    gl_FragColor = vec4(z.x, 0.0, z.y, 1.0);
}
