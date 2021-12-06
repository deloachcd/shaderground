#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_date;


float rand(vec2 co) {
    // generate a random value based on the seconds in the day that have
    // passed when loading the shader
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * (u_date.z * 3674.2));
}

bool values_match(float v1, float v2, float tolerance) {
    return v1 < v2 + tolerance && v1 > v2 - tolerance;
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
    const float TOLERANCE = 0.001;
    float COL_WIDTH = 1.0/float(N_COLS);
    float horizontal_offset = (mod(floor(coord.y*MAX_LEN*100),2)/2.0)*COL_WIDTH;
    float r = 0.0;
    if (values_match((floor((coord.x+ADJUST)/COL_WIDTH)*COL_WIDTH) + horizontal_offset,
                     coord.x, TOLERANCE)) {
        r = 1.0;
    }

    //float r = rand(coord);

    gl_FragColor = vec4(r, 0.0, 0.0, 1.0);
}
