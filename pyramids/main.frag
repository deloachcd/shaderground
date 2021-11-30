#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

bool point_in_box(vec2 point, vec2 center, float hypolen) {
    float box_magnitude = hypolen / sqrt(1.0/2.0);

    return (center.x + box_magnitude < point.x
            || center.x - box_magnitude > point.x
            || center.y + box_magnitude < point.y
            || center.y - box_magnitude > point.y);
}

void main() {
    vec2 ap1 = vec2(  0.6,  0.4);
    vec2 ap2 = vec2(-0.25,  0.1);
    vec2 ap3 = vec2(  0.4, -0.6);
    float alpha;

    vec2 coord = gl_FragCoord.xy/u_resolution;
    if (point_in_box(coord, ap1, 0.1)) {
        alpha = 1.0;
    } else {
        alpha = 0.0;
    }
    gl_FragColor = vec4(alpha, alpha, alpha, 1.0);
}
