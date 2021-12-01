#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

bool point_in_box(vec2 point, vec2 center, float hypolen) {
    float box_magnitude = hypolen / sqrt(1.0/2.0);

    // it took me way too long to do this correctly...
    return (center.x + box_magnitude >= point.x
            && center.x - box_magnitude <= point.x
            && center.y + box_magnitude >= point.y
            && center.y - box_magnitude <= point.y);
}

void main() {
    vec2 ap1 = vec2(0.15, 0.4);
    vec2 ap2 = vec2(0.45, 0.1);
    vec2 ap3 = vec2(0.8, 0.75);

    vec2 apl[3];
    apl[0] = ap1;
    apl[1] = ap2;
    apl[2] = ap3;

    float box_radius = 0.05;
    float alpha = 1.0;
    float tolerance = 0.00001;

    vec2 coord = gl_FragCoord.xy/u_resolution;
    for (int i = 0; i < 3; i++) {
        if (point_in_box(coord, apl[i], box_radius)) {
            // apl[i].x controls interval via shifted_time
            float shifted_time = u_time * apl[i].x;

            // alpha rises and falls smoothly relative to u_time
            if (mod(floor(shifted_time), 2.0) == 0.0) {
                alpha = 1.0 - mod(shifted_time, 1.0);
            } else {
                alpha = mod(shifted_time, 1.0);
            }
        }
    }
    gl_FragColor = vec4(alpha, alpha, alpha, 1.0);
}
