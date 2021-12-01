#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

bool values_match(float v1, float v2, float tolerance) {
    return v1 < v2 + tolerance && v2 > v2 - tolerance;
}

void main() {
    vec2 coord = gl_FragCoord.xy/u_resolution;
    //coord = vec2(coord.x*scale_factor, coord.y*scale_factor);
    float tolerance = 0.1;

    float r;
    if (coord.x < 0.95 && coord.y < 0.95 && coord.x > 0.1 && coord.y > 0.1) {
        r = rand(coord);
    } else {
        r = 0.0;
    }
    //float g = rand(coord.xy);
    //float b = rand(coord.yx);

    float alpha;
    // 0.78713
    if (r > 0.9993) {
        alpha = 1.0;
    } else {
        alpha = 0.0;
    }

    gl_FragColor = vec4(r, 0.0, 0.0, alpha);
}
